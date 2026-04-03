"""
YUMI ISO Batch Updater
======================
Parses YUMI's DistroList.nsh to build a distro catalog, scans a local ISO
directory for matches, checks remote repositories for newer versions, and
downloads updates with selectable execution modes.

Usage:
    python iso_updater.py --nsh DistroList.nsh --iso-dir E:\\ISOs
    python iso_updater.py --nsh DistroList.nsh --iso-dir E:\\ISOs --mode parallel --max-concurrent 3
"""

import os
import re
import sys
import asyncio
import argparse
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field

try:
    import aiohttp
    from tqdm.asyncio import tqdm as atqdm
    from tqdm import tqdm
except ImportError:
    print("[!] Missing dependencies. Run: pip install aiohttp tqdm")
    sys.exit(1)


# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class DistroEntry:
    """A distro definition parsed from the NSH file."""
    name: str
    file_pattern: str       # Original YUMI wildcard (e.g. ubuntu-*.iso)
    regex: str              # Compiled regex for matching local files
    url: str                # Landing/download page URL
    persistence: str        # YUMI persistence type (casper, live, NULL, etc.)
    category: str           # Distro path/category (Linux-ISOs, System-Tools, etc.)
    homepage: str           # Official homepage URL
    official_name: str      # Official distro name


@dataclass
class LocalISO:
    """A local ISO file matched against the distro catalog."""
    filename: str
    filepath: str
    distro: DistroEntry
    current_version: str
    latest_version: Optional[str] = None
    download_url: Optional[str] = None
    needs_update: bool = False


# ============================================================================
# NSH PARSER
# ============================================================================

class NSHParser:
    """Parses YUMI's DistroList.nsh to extract distro definitions."""

    @staticmethod
    def parse(nsh_path: str) -> Dict[str, DistroEntry]:
        """
        Parse YUMI NSH format:
        !insertmacro SetISOFileNames "Name" "pattern" "download_url" "persistence" "category" "homepage" "official_name"
        """
        distros = {}
        print(f"[*] Parsing {nsh_path}...")

        try:
            with open(nsh_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    stripped = line.strip()
                    # Skip comments
                    if stripped.startswith(';'):
                        continue
                    if '!insertmacro SetISOFileNames' not in stripped:
                        continue

                    parts = re.findall(r'"([^"]*)"', line)
                    if len(parts) < 7:
                        continue

                    name = parts[0]
                    file_pattern = parts[1]
                    url = parts[2]
                    persistence = parts[3]
                    category = parts[4]
                    homepage = parts[5]
                    official_name = parts[6]

                    # Skip category headers (--- Ubuntu ---) and empty entries
                    if name.startswith('---') or file_pattern == "":
                        continue
                    # Skip entries with no download URL
                    if url in ("NONE", ""):
                        continue
                    # Skip overly generic patterns that match too many things
                    if file_pattern in ("*.iso", "*.img", "*.iso;*.img"):
                        continue
                    # Skip single-letter wildcard patterns (G*.iso matches everything starting with G)
                    if re.match(r'^[A-Za-z]\*\.', file_pattern):
                        continue

                    # Convert YUMI wildcard to capturing regex
                    # e.g. 'ubuntu-*.iso' -> '^ubuntu-(.*)\.iso$'
                    regex_safe = file_pattern.replace('.', r'\.').replace('*', r'(.*)')
                    regex = f"^{regex_safe}$"

                    distros[name] = DistroEntry(
                        name=name,
                        file_pattern=file_pattern,
                        regex=regex,
                        url=url,
                        persistence=persistence,
                        category=category,
                        homepage=homepage,
                        official_name=official_name,
                    )

            print(f"[*] Loaded {len(distros)} distribution targets.")
        except Exception as e:
            print(f"[!] Failed to parse NSH file: {e}")

        return distros


# ============================================================================
# SCANNER — Match local ISOs against catalog + check for updates
# ============================================================================

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


class ISOScanner:
    """Scans local ISOs and checks remote repos for updates."""

    def __init__(self, distros: Dict[str, DistroEntry], iso_dir: str):
        self.distros = distros
        self.iso_dir = iso_dir

    @staticmethod
    def _extract_version(filename: str) -> str:
        """
        Extract a clean semantic version from a filename.
        e.g. 'linuxmint-20.3-cinnamon-64bit.iso' -> '20.3'
             'manjaro-xfce-21.0.7-210614-linux510.iso' -> '21.0.7'
             'finnix-123-x64.iso' -> '123'
             'ubuntu-22.04.3-desktop-amd64.iso' -> '22.04.3'
        """
        # Look for semantic versions (X.Y.Z, X.Y, or standalone release numbers)
        # Prefer the first version-like pattern found
        stem = Path(filename).stem

        # Try full semver first (22.04.3, 21.0.7, etc.)
        m = re.search(r'(\d+\.\d+(?:\.\d+)*)', stem)
        if m:
            return m.group(1)

        # Try standalone release number (finnix-123, CorePlus-11, etc.)
        m = re.search(r'[_-](\d{2,})[_\-.]', stem)
        if m:
            return m.group(1)

        # Last resort: first number sequence of 2+ digits
        m = re.search(r'(\d{2,})', stem)
        if m:
            return m.group(1)

        return "Unknown"

    def match_local_files(self) -> List[LocalISO]:
        """Match local ISO files against the distro catalog, picking most specific match."""
        print(f"\n[*] Scanning: {self.iso_dir}")
        matched = []

        local_files = [
            f for f in os.listdir(self.iso_dir)
            if os.path.isfile(os.path.join(self.iso_dir, f))
        ]

        # Sort distros by pattern specificity (longer pattern = more specific = checked first)
        sorted_distros = sorted(
            self.distros.items(),
            key=lambda x: len(x[1].file_pattern),
            reverse=True,
        )

        for filename in local_files:
            best_match = None
            best_specificity = 0

            for name, distro in sorted_distros:
                m = re.search(distro.regex, filename, re.IGNORECASE)
                if m:
                    # Specificity = length of the non-wildcard portion of the pattern
                    specificity = len(distro.file_pattern.replace('*', ''))
                    if specificity > best_specificity:
                        best_specificity = specificity
                        best_match = (name, distro, m)

            if best_match:
                name, distro, m = best_match
                version = self._extract_version(filename)
                matched.append(LocalISO(
                    filename=filename,
                    filepath=os.path.join(self.iso_dir, filename),
                    distro=distro,
                    current_version=version,
                ))
                print(f"  [>] {name} | File: {filename} | Version: {version}")

        if not matched:
            print("  [*] No supported ISOs found.")
        else:
            print(f"  [*] Matched {len(matched)} ISOs.")

        return matched

    async def resolve_download_urls(self, session: aiohttp.ClientSession, isos: List[LocalISO]) -> None:
        """Resolve landing page URLs to actual ISO download links."""
        print(f"\n[*] Resolving direct download URLs...")
        for iso in isos:
            url = await self._resolve_one(session, iso)
            if url:
                iso.download_url = url
                print(f"  [>] {iso.distro.name}: {url[:80]}...")
            else:
                print(f"  [?] {iso.distro.name}: manual download needed ({iso.distro.url})")

    async def _resolve_one(self, session: aiohttp.ClientSession, iso: LocalISO) -> Optional[str]:
        """Try to find a direct .iso/.img download link from the landing page."""
        url = iso.distro.url

        # SourceForge "latest/download" URLs are already direct (they redirect)
        if 'sourceforge.net' in url and '/latest/download' in url:
            return url
        # Direct ISO/IMG links are already good
        if url.lower().endswith(('.iso', '.img', '.zip')):
            return url

        try:
            async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                html = await resp.text()
                base_url = str(resp.url)

            # Build pattern from the distro's file pattern
            prefix = iso.distro.file_pattern.split('*')[0]
            suffix = iso.distro.file_pattern.split('*')[-1] if '*' in iso.distro.file_pattern else '.iso'

            # Find href links pointing to ISO files matching our pattern
            href_pattern = rf'href=["\']([^"\']*?{re.escape(suffix)})'
            all_links = re.findall(href_pattern, html, re.IGNORECASE)

            # Filter to links that contain the distro prefix
            if prefix:
                matching = [l for l in all_links if prefix.lower().rstrip('-_') in l.lower()]
            else:
                matching = all_links

            if not matching:
                # Broader search — any iso/img link on the page
                matching = [l for l in all_links if l.lower().endswith(('.iso', '.img'))]

            if matching:
                # Pick the one with the highest version
                best_link = None
                best_ver = (0,)
                for link in matching:
                    fname = link.split('/')[-1].split('?')[0]
                    ver_str = self._extract_version(fname)
                    if ver_str != "Unknown":
                        ver = _parse_version_tuple(ver_str)
                        if ver > best_ver:
                            best_ver = ver
                            best_link = link

                if best_link:
                    # Resolve relative URLs
                    if best_link.startswith('//'):
                        best_link = 'https:' + best_link
                    elif best_link.startswith('/'):
                        from urllib.parse import urlparse
                        parsed = urlparse(base_url)
                        best_link = f"{parsed.scheme}://{parsed.netloc}{best_link}"
                    elif not best_link.startswith('http'):
                        best_link = base_url.rstrip('/') + '/' + best_link
                    return best_link

        except Exception:
            pass

        # Strategy 2: Follow edition/download sub-pages (e.g. Linux Mint)
        try:
            async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                html = await resp.text()
                base_url = str(resp.url)

            # Find edition/download sub-pages
            from urllib.parse import urlparse, urljoin
            sub_links = re.findall(r'''href=["']([^"']*(?:edition|download|release)[^"']*)["']''', html, re.IGNORECASE)
            # Prioritize edition/release pages over generic download pages
            sub_links = sorted(set(sub_links), key=lambda x: (
                0 if 'edition' in x.lower() else
                1 if 'release' in x.lower() else 2
            ))
            for sub in sub_links[:5]:  # Check first few
                sub_url = urljoin(base_url, sub)
                try:
                    async with session.get(sub_url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=10)) as resp2:
                        html2 = await resp2.text()
                    iso_links = re.findall(r'''href=["']([^"']*\.iso)["']''', html2, re.IGNORECASE)
                    # Filter for http links (not torrents) with the distro prefix
                    direct = [l for l in iso_links if l.startswith('http') and not l.endswith('.torrent')]
                    if direct:
                        return direct[0]
                except Exception:
                    continue
        except Exception:
            pass

        # Strategy 3: Handle TinyCore-style relative paths with "current" in filename
        try:
            async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                html = await resp.text()
                base_url = str(resp.url)
            from urllib.parse import urljoin
            # Find links like "17.x/x86/release/CorePlus-current.iso"
            current_links = re.findall(r'href="([^"]*current[^"]*\.iso)"', html, re.IGNORECASE)
            if current_links:
                # Prefer one matching the original file prefix
                prefix = iso.distro.file_pattern.split('*')[0].rstrip('-_').lower()
                for link in current_links:
                    if prefix and prefix in link.lower():
                        return urljoin(base_url, link)
                return urljoin(base_url, current_links[0])
        except Exception:
            pass

        return None

    async def check_updates(self, isos: List[LocalISO]) -> List[LocalISO]:
        """Check remote repositories for newer versions."""
        if not isos:
            return []

        print(f"\n[*] Checking {len(isos)} repos for updates...")
        outdated = []

        async with aiohttp.ClientSession() as session:
            tasks = [self._check_one(session, iso) for iso in isos]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for iso, result in zip(isos, results):
                if isinstance(result, Exception):
                    print(f"  [?] {iso.distro.name}: check failed ({result})")
                    continue
                if result:
                    iso.latest_version = result
                    iso.needs_update = True
                    outdated.append(iso)
                    print(f"  [!] {iso.distro.name}: {iso.current_version} -> {result}")
                else:
                    print(f"  [OK] {iso.distro.name}: current ({iso.current_version})")

        return outdated

    async def _check_one(self, session: aiohttp.ClientSession, iso: LocalISO) -> Optional[str]:
        """Check a single distro's landing page for a newer version."""
        try:
            async with session.get(iso.distro.url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                html = await resp.text()
                return self._find_newer_version(html, iso)
        except Exception:
            pass
        return None

    @staticmethod
    def _find_newer_version(html: str, iso: LocalISO) -> Optional[str]:
        """
        Find a newer version on the download page using multiple strategies:
        1. Look for ISO/IMG filenames in links that match the distro pattern
        2. Extract versions from those filenames
        3. Compare against current version
        """
        current = iso.current_version

        # Strategy 1: Find ISO/IMG filenames in href/src attributes
        # These are the most reliable — actual download links
        file_pattern = iso.distro.file_pattern
        # Build a regex to find filenames like the pattern in HTML
        # e.g. pattern 'linuxmint-*.iso' -> find 'linuxmint-22.1-cinnamon-64bit.iso' in links
        prefix = file_pattern.split('*')[0]  # e.g. 'linuxmint-'
        suffix = file_pattern.split('*')[-1] if '*' in file_pattern else ''  # e.g. '.iso'

        if prefix:
            # Find filenames in href/src that match the distro pattern
            escaped_prefix = re.escape(prefix)
            escaped_suffix = re.escape(suffix)
            link_pattern = rf'(?:href|src)[=:]\s*["\']?[^"\'>\s]*({escaped_prefix}[^"\'>\s]*{escaped_suffix})'
            link_matches = re.findall(link_pattern, html, re.IGNORECASE)

            if link_matches:
                # Extract versions from found filenames
                found_versions = []
                for fname in link_matches:
                    v = ISOScanner._extract_version(fname)
                    if v and v != "Unknown" and v != current:
                        found_versions.append(v)

                if found_versions:
                    best = _best_version(found_versions)
                    if best and _version_newer(best, current):
                        return best

        # Strategy 2: Look for version numbers near the distro name on the page
        distro_name = iso.distro.official_name or iso.distro.name
        # Find "DistroName X.Y.Z" or "DistroName vX.Y.Z" patterns
        name_pattern = rf'{re.escape(distro_name)}\s+v?(\d+(?:\.\d+)+)'
        name_matches = re.findall(name_pattern, html, re.IGNORECASE)
        if name_matches:
            best = _best_version(name_matches)
            if best and _version_newer(best, current):
                return best

        # Strategy 3: Fallback — find semver near download/iso keywords
        # Only look in contexts that suggest a version number, not random page content
        download_context = re.findall(
            r'(?:download|release|version|latest|current|stable)[^<]{0,80}?(\d+(?:\.\d+)+)',
            html, re.IGNORECASE
        )
        if download_context:
            # Filter out obviously wrong versions (JS libs, CSS, etc.)
            plausible = [v for v in download_context if _is_plausible_version(v, current)]
            if plausible:
                best = _best_version(plausible)
                if best and _version_newer(best, current):
                    return best

        return None


def _parse_version_tuple(v: str) -> Tuple[int, ...]:
    """Parse '22.04.3' into (22, 4, 3) for proper numeric comparison."""
    try:
        return tuple(int(x) for x in v.split('.'))
    except ValueError:
        return (0,)


def _version_newer(candidate: str, current: str) -> bool:
    """Check if candidate version is actually newer than current."""
    return _parse_version_tuple(candidate) > _parse_version_tuple(current)


def _best_version(versions: List[str]) -> Optional[str]:
    """Return the highest version from a list using numeric comparison."""
    if not versions:
        return None
    return max(set(versions), key=_parse_version_tuple)


def _is_plausible_version(version: str, current: str) -> bool:
    """Filter out implausible version numbers."""
    parts = version.split('.')
    # Too many segments (probably an IP address or CSS version)
    if len(parts) > 4:
        return False
    # First segment too large (probably a date or random number)
    try:
        first = int(parts[0])
        if first > 1000:  # Probably a year-based thing like 20210614
            return False
    except ValueError:
        return False
    # Version should be in a reasonable range relative to current
    cur_tuple = _parse_version_tuple(current)
    cand_tuple = _parse_version_tuple(version)
    if cur_tuple and cur_tuple[0] > 0:
        # Candidate's major version shouldn't be wildly different
        ratio = cand_tuple[0] / max(cur_tuple[0], 1)
        if ratio > 3:  # e.g. current is 21.x, candidate is 72.x -> suspicious
            return False
    return True


# ============================================================================
# INTERACTIVE SELECTOR
# ============================================================================

def select_isos(outdated: List[LocalISO]) -> List[LocalISO]:
    """Interactive selection of which ISOs to update."""
    if not outdated:
        print("\n[*] Everything is up to date!")
        return []

    print(f"\n{'='*60}")
    print(f" OUTDATED ISOs ({len(outdated)} found)")
    print(f"{'='*60}")

    # Group by category
    categories = {}
    for iso in outdated:
        cat = iso.distro.category or "Other"
        categories.setdefault(cat, []).append(iso)

    idx = 0
    index_map = {}
    for cat, isos_in_cat in categories.items():
        print(f"  ── {cat} ──")
        for iso in isos_in_cat:
            idx += 1
            index_map[idx] = iso
            size = os.path.getsize(iso.filepath) / (1024 * 1024 * 1024)
            print(f"  [{idx}] {iso.distro.official_name or iso.distro.name}")
            print(f"      Current: {iso.current_version} -> Latest: {iso.latest_version}")
            print(f"      File: {iso.filename} ({size:.2f} GB)")
            print(f"      Home: {iso.distro.homepage or iso.distro.url}")
            print()

    print(f"  [A] Select ALL")
    print(f"  [Q] Quit")
    print()

    while True:
        choice = input("Select ISOs to update (e.g. 1,3,5 or A for all): ").strip().upper()

        if choice == 'Q':
            return []
        if choice == 'A':
            return outdated

        try:
            indices = [int(x.strip()) - 1 for x in choice.split(',')]
            selected = [outdated[i] for i in indices if 0 <= i < len(outdated)]
            if selected:
                return selected
            print("[!] No valid selections. Try again.")
        except (ValueError, IndexError):
            print("[!] Invalid input. Use numbers separated by commas, A, or Q.")


# ============================================================================
# DOWNLOADER
# ============================================================================

class ISODownloader:
    """Downloads ISO files with progress tracking and resume support."""

    def __init__(self, iso_dir: str, archive_dir: Optional[str] = None):
        self.iso_dir = iso_dir
        self.archive_dir = archive_dir or os.path.join(iso_dir, "_old")

    def _archive_old(self, iso: LocalISO):
        """Move old ISO to archive directory."""
        os.makedirs(self.archive_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d")
        archive_name = f"{Path(iso.filename).stem}_{timestamp}{Path(iso.filename).suffix}"
        dest = os.path.join(self.archive_dir, archive_name)
        print(f"  [>] Archiving: {iso.filename} → _old/{archive_name}")
        shutil.move(iso.filepath, dest)

    async def download_one(self, session: aiohttp.ClientSession, iso: LocalISO) -> bool:
        """Download a single ISO with progress bar and resume support."""
        url = iso.download_url or iso.distro.url
        dest = os.path.join(self.iso_dir, iso.filename)
        temp_dest = dest + ".part"

        # Check for partial download (resume)
        existing_size = 0
        if os.path.exists(temp_dest):
            existing_size = os.path.getsize(temp_dest)

        headers = dict(HEADERS)
        if existing_size > 0:
            headers["Range"] = f"bytes={existing_size}-"
            print(f"  [>] Resuming {iso.distro.name} from {existing_size / (1024*1024):.1f} MB")

        try:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=3600)) as resp:
                if resp.status not in (200, 206):
                    print(f"  [!] {iso.distro.name}: HTTP {resp.status} — skipping")
                    return False

                total_size = int(resp.headers.get('Content-Length', 0))
                if resp.status == 206:
                    total_size += existing_size

                # Archive old ISO before downloading
                if os.path.exists(iso.filepath) and existing_size == 0:
                    self._archive_old(iso)

                mode = 'ab' if existing_size > 0 else 'wb'
                with open(temp_dest, mode) as f:
                    with tqdm(
                        total=total_size,
                        initial=existing_size,
                        unit='B',
                        unit_scale=True,
                        desc=f"  {iso.distro.name}",
                        leave=True,
                    ) as pbar:
                        async for chunk in resp.content.iter_chunked(1024 * 64):
                            f.write(chunk)
                            pbar.update(len(chunk))

                # Rename .part to final filename
                if os.path.exists(dest):
                    os.remove(dest)
                os.rename(temp_dest, dest)
                print(f"  [✓] {iso.distro.name} updated successfully")
                return True

        except asyncio.CancelledError:
            print(f"  [!] {iso.distro.name}: download cancelled (partial saved)")
            return False
        except Exception as e:
            print(f"  [!] {iso.distro.name}: download failed — {e}")
            return False

    async def download_serial(self, isos: List[LocalISO]):
        """Download ISOs one at a time."""
        print(f"\n[*] Downloading {len(isos)} ISOs (serial mode)...")
        async with aiohttp.ClientSession() as session:
            for i, iso in enumerate(isos, 1):
                print(f"\n--- [{i}/{len(isos)}] {iso.distro.name} ---")
                await self.download_one(session, iso)

    async def download_parallel(self, isos: List[LocalISO], max_concurrent: int = 3):
        """Download ISOs in parallel with concurrency limit."""
        print(f"\n[*] Downloading {len(isos)} ISOs (parallel, max {max_concurrent})...")
        semaphore = asyncio.Semaphore(max_concurrent)

        async def limited_download(session, iso):
            async with semaphore:
                return await self.download_one(session, iso)

        async with aiohttp.ClientSession() as session:
            tasks = [limited_download(session, iso) for iso in isos]
            await asyncio.gather(*tasks)

    async def download_batch(self, isos: List[LocalISO], batch_size: int = 2):
        """Download ISOs in batches (finish one batch before starting next)."""
        print(f"\n[*] Downloading {len(isos)} ISOs (batch mode, size {batch_size})...")
        async with aiohttp.ClientSession() as session:
            for batch_start in range(0, len(isos), batch_size):
                batch = isos[batch_start:batch_start + batch_size]
                batch_num = (batch_start // batch_size) + 1
                total_batches = (len(isos) + batch_size - 1) // batch_size
                print(f"\n--- Batch {batch_num}/{total_batches} ---")
                tasks = [self.download_one(session, iso) for iso in batch]
                await asyncio.gather(*tasks)


# ============================================================================
# MAIN
# ============================================================================

def select_mode() -> Tuple[str, int]:
    """Interactive mode selection."""
    print(f"\n{'='*60}")
    print(" DOWNLOAD MODE")
    print(f"{'='*60}")
    print("  [1] Serial     — one at a time (safest, slowest)")
    print("  [2] Parallel   — all at once (fastest, heavy bandwidth)")
    print("  [3] Batch      — N at a time (balanced)")
    print()

    while True:
        choice = input("Select mode [1/2/3]: ").strip()
        if choice == '1':
            return 'serial', 1
        elif choice == '2':
            n = input("Max concurrent downloads [3]: ").strip()
            return 'parallel', int(n) if n.isdigit() else 3
        elif choice == '3':
            n = input("Batch size [2]: ").strip()
            return 'batch', int(n) if n.isdigit() else 2
        else:
            print("[!] Pick 1, 2, or 3.")


async def main():
    parser = argparse.ArgumentParser(description="YUMI ISO Batch Updater")
    parser.add_argument("--nsh", required=True, help="Path to YUMI DistroList.nsh")
    parser.add_argument("--iso-dir", required=True, help="Directory containing ISO files")
    parser.add_argument("--mode", choices=["serial", "parallel", "batch"],
                        help="Download mode (interactive if omitted)")
    parser.add_argument("--max-concurrent", type=int, default=3,
                        help="Max concurrent downloads for parallel/batch mode")
    parser.add_argument("--auto", action="store_true",
                        help="Non-interactive: update all outdated ISOs automatically")
    args = parser.parse_args()

    if not os.path.exists(args.nsh):
        print(f"[!] NSH file not found: {args.nsh}")
        return
    if not os.path.isdir(args.iso_dir):
        print(f"[!] ISO directory not found: {args.iso_dir}")
        return

    # 1. Parse NSH
    distros = NSHParser.parse(args.nsh)
    if not distros:
        return

    # 2. Match local files
    scanner = ISOScanner(distros, args.iso_dir)
    matched = scanner.match_local_files()
    if not matched:
        return

    # 3. Check for updates
    outdated = await scanner.check_updates(matched)
    if not outdated:
        print("\n[*] All ISOs are up to date!")
        return

    # 4. Select what to update
    if args.auto:
        selected = outdated
    else:
        selected = select_isos(outdated)
    if not selected:
        print("[*] Nothing selected. Exiting.")
        return

    # 5. Resolve actual download URLs
    async with aiohttp.ClientSession() as session:
        await scanner.resolve_download_urls(session, selected)

    # Filter out ones we can't download
    downloadable = [iso for iso in selected if iso.download_url]
    manual = [iso for iso in selected if not iso.download_url]
    if manual:
        print(f"\n[*] {len(manual)} ISOs need manual download:")
        for iso in manual:
            print(f"  - {iso.distro.name}: {iso.distro.url}")
    if not downloadable:
        print("[*] No ISOs with resolved download links. Download manually from the URLs above.")
        return
    selected = downloadable
    print(f"\n[*] {len(selected)} ISOs ready for download.")

    # 6. Pick download mode
    if args.mode:
        mode = args.mode
        concurrency = args.max_concurrent
    else:
        mode, concurrency = select_mode()

    # 7. Download
    downloader = ISODownloader(args.iso_dir)
    if mode == 'serial':
        await downloader.download_serial(selected)
    elif mode == 'parallel':
        await downloader.download_parallel(selected, max_concurrent=concurrency)
    elif mode == 'batch':
        await downloader.download_batch(selected, batch_size=concurrency)

    print(f"\n[*] Done. Old ISOs archived in: {downloader.archive_dir}")


if __name__ == "__main__":
    asyncio.run(main())
