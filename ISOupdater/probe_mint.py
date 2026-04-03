import aiohttp, asyncio, re
async def test():
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    async with aiohttp.ClientSession() as s:
        async with s.get("https://www.linuxmint.com/edition.php?id=326", headers=headers) as r:
            html = await r.text()
        links = re.findall(r"""href=["']([^"']*\.iso)["']""", html, re.IGNORECASE)
        direct = [l for l in links if l.startswith("http") and not l.endswith(".torrent")]
        print(f"Found {len(direct)} direct links")
        for l in direct[:3]:
            print(f"  {l}")
asyncio.run(test())
