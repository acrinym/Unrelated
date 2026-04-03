import pygame
import os

pygame.init()
SCREEN = pygame.display.set_mode((100, 100)) # Dummy screen

ASSET_DIR = "assets"

def analyze():
    files = sorted([f for f in os.listdir(ASSET_DIR) if f.endswith(".jpg")], key=lambda x: int(x.split('_')[1].split('.')[0]))
    
    potential_gems = []
    backgrounds = []
    
    print(f"{'Filename':<20} {'Size':<10} {'Bytes':<10}")
    print("-" * 40)
    
    for f in files:
        path = os.path.join(ASSET_DIR, f)
        try:
            img = pygame.image.load(path)
            w, h = img.get_size()
            size_str = f"{w}x{h}"
            file_size = os.path.getsize(path)
            
            print(f"{f:<20} {size_str:<10} {file_size:<10}")
            
            # Heuristics
            if 40 <= w <= 150 and 40 <= h <= 150 and abs(w - h) < 10:
                potential_gems.append(f)
            elif w >= 600 and h >= 400:
                backgrounds.append(f)
                
        except Exception as e:
            print(f"{f:<20} Error: {e}")

    print("\nPotential Gems (Square-ish, 40-150px):")
    print(potential_gems)
    
    print("\nPotential Backgrounds (>600x400):")
    print(backgrounds)

if __name__ == "__main__":
    analyze()
