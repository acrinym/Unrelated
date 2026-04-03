"""Quick probe of download pages to find ISO links."""
import aiohttp, asyncio, re

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

async def main():
    async with aiohttp.ClientSession() as s:
        # TinyCore
        print("=== TinyCore ===")
        async with s.get("http://tinycorelinux.net/downloads.html", headers=HEADERS) as r:
            html = await r.text()
        # Look for any href with .iso
        links = re.findall(r'href="([^"]*\.iso[^"]*)"', html, re.IGNORECASE)
        for l in links[:10]:
            print(f"  {l}")

        # Linux Mint
        print("\n=== Linux Mint ===")
        async with s.get("https://www.linuxmint.com/download.php", headers=HEADERS) as r:
            html = await r.text()
        iso_links = re.findall(r'href="([^"]*\.iso[^"]*)"', html, re.IGNORECASE)
        edition_links = re.findall(r'href="([^"]*edition[^"]*)"', html, re.IGNORECASE)
        print(f"  ISO links: {iso_links[:5]}")
        print(f"  Edition links: {edition_links[:5]}")

        # If Mint has edition pages, follow one
        if edition_links:
            url = edition_links[0]
            if not url.startswith("http"):
                url = "https://www.linuxmint.com/" + url
            print(f"\n  Following: {url}")
            async with s.get(url, headers=HEADERS) as r:
                html2 = await r.text()
            iso_links2 = re.findall(r'href="([^"]*\.iso[^"]*)"', html2, re.IGNORECASE)
            for l in iso_links2[:10]:
                print(f"  {l}")

asyncio.run(main())
