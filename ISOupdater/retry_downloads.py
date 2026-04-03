"""Retry failed downloads with auto-retry on connection drops."""
import sys, asyncio, aiohttp, os
sys.path.insert(0, os.path.dirname(__file__))
from iso_updater import ISODownloader, LocalISO, DistroEntry

MAX_RETRIES = 5
RETRY_DELAY = 10  # seconds between retries


async def download_with_retry(dl, iso, label):
    for attempt in range(1, MAX_RETRIES + 1):
        print(f"\n--- {label} (attempt {attempt}/{MAX_RETRIES}) ---")
        async with aiohttp.ClientSession() as session:
            success = await dl.download_one(session, iso)
        if success:
            return True
        if attempt < MAX_RETRIES:
            print(f"  [*] Waiting {RETRY_DELAY}s before retry...")
            await asyncio.sleep(RETRY_DELAY)
    print(f"  [X] {label} failed after {MAX_RETRIES} attempts")
    return False


async def main():
    dl = ISODownloader(r"I:\Linux_Live")

    finnix = LocalISO(
        filename="finnix-251.iso",
        filepath=r"I:\Linux_Live\finnix-251.iso",
        distro=DistroEntry("Finnix", "finnix*.iso", "", 
            "https://www.finnix.org/releases/251/finnix-251.iso",
            "NULL", "System-Tools", "https://www.finnix.org/", "Finnix"),
        current_version="123", latest_version="251",
        download_url="https://www.finnix.org/releases/251/finnix-251.iso",
    )

    mint = LocalISO(
        filename="linuxmint-22.3-cinnamon-64bit.iso",
        filepath=r"I:\Linux_Live\linuxmint-22.3-cinnamon-64bit.iso",
        distro=DistroEntry("Linux Mint", "linuxmint-*.iso", "",
            "https://pub.linuxmint.io/stable/22.3/linuxmint-22.3-cinnamon-64bit.iso",
            "casper", "Linux-ISOs", "https://www.linuxmint.com", "Linux Mint"),
        current_version="20.3", latest_version="22.3",
        download_url="https://pub.linuxmint.io/stable/22.3/linuxmint-22.3-cinnamon-64bit.iso",
    )

    await download_with_retry(dl, finnix, "Finnix 251")
    await download_with_retry(dl, mint, "Linux Mint 22.3")

asyncio.run(main())
