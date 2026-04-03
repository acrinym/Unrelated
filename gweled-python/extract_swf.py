import zlib
import os
import struct

SWF_PATH = r"C:\Users\User\Downloads\bejeweled-2-deluxe.swf"
OUTPUT_DIR = "assets"

def extract_images():
    if not os.path.exists(SWF_PATH):
        print(f"File not found: {SWF_PATH}")
        return

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    with open(SWF_PATH, 'rb') as f:
        header = f.read(8)
        signature = header[:3]
        version = header[3]
        length = struct.unpack('<I', header[4:])[0]

        print(f"Signature: {signature}")
        print(f"Version: {version}")
        print(f"File Length: {length}")

        if signature == b'CWS':
            print("Compressed SWF detected. Decompressing...")
            content = f.read()
            try:
                data = zlib.decompress(content)
            except Exception as e:
                print(f"Decompression failed: {e}")
                return
        elif signature == b'FWS':
            print("Uncompressed SWF detected.")
            data = f.read()
        else:
            print("Not a valid SWF file.")
            return

    # Naive JPEG extraction (looking for SOI and EOI markers)
    # JPEG: FF D8 ... FF D9
    # This is a very rough heuristic but might catch embedded JPEGs.
    
    offset = 0
    count = 0
    
    # SWF tags often embed JPEGs directly.
    # Tag format: RecordHeader (short or long)
    # Short: 2 bytes (TagCodeAndLength). Code = bits 6-15, Len = bits 0-5.
    # Long: 2 bytes + 4 bytes length.
    
    # We can try to just scan for FF D8.
    
    while True:
        start = data.find(b'\xFF\xD8', offset)
        if start == -1:
            break
            
        end = data.find(b'\xFF\xD9', start)
        if end == -1:
            break
            
        # Check validity/size (ignore tiny thumbnails or false positives)
        img_data = data[start:end+2]
        if len(img_data) > 1000: # Filter small noise
            filename = os.path.join(OUTPUT_DIR, f"extracted_{count}.jpg")
            with open(filename, 'wb') as img_f:
                img_f.write(img_data)
            print(f"Saved {filename} ({len(img_data)} bytes)")
            count += 1
            
        offset = end + 2

    print(f"Extraction complete. Found {count} potential images.")

if __name__ == "__main__":
    extract_images()
