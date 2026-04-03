import aiohttp, asyncio, re
async def test():
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    async with aiohttp.ClientSession() as s:
        async with s.get("https://www.linuxmint.com/download.php", headers=headers) as r:
            html = await r.text()
        subs = re.findall(r"""href=["']([^"']*(?:edition|download|release)[^"']*)["']""", html, re.IGNORECASE)
        print(f"Sub-links found: {len(subs)}")
        for s2 in subs[:5]:
            print(f"  {s2}")
asyncio.run(test())
