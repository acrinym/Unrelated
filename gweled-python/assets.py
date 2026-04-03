import pygame
import math

TILE_SIZE = 64

GEM_COLORS = [
    (230, 50, 50),    # Red - Square
    (230, 230, 230),  # White - Sphere/Pearl
    (230, 230, 50),   # Yellow - Hexagon
    (50, 50, 230),    # Blue - Diamond
    (200, 50, 200),   # Purple - Triangle
    (230, 150, 50),   # Orange - Gem
    (50, 230, 50)     # Green - Rect
]

def create_gem_surface(gem_type):
    surface = pygame.Surface((TILE_SIZE, TILE_SIZE), pygame.SRCALPHA)
    
    color = GEM_COLORS[gem_type]
    highlight = (min(color[0] + 100, 255), min(color[1] + 100, 255), min(color[2] + 100, 255))
    shadow = (max(color[0] - 100, 0), max(color[1] - 100, 0), max(color[2] - 100, 0))
    
    cx, cy = TILE_SIZE // 2, TILE_SIZE // 2
    radius = TILE_SIZE // 2 - 4
    
    if gem_type == 0: # Red Square
        rect = pygame.Rect(4, 4, TILE_SIZE-8, TILE_SIZE-8)
        pygame.draw.rect(surface, shadow, rect, border_radius=8)
        pygame.draw.rect(surface, color, rect.inflate(-4, -4), border_radius=8)
        pygame.draw.rect(surface, highlight, rect.inflate(-16, -16), border_radius=4)
        
    elif gem_type == 1: # White Sphere
        pygame.draw.circle(surface, shadow, (cx, cy), radius)
        pygame.draw.circle(surface, color, (cx, cy), radius - 2)
        # Shine
        pygame.draw.circle(surface, highlight, (cx - radius//3, cy - radius//3), radius//3)
        
    elif gem_type == 2: # Yellow Hexagon
        points = []
        for i in range(6):
            angle = math.radians(60 * i)
            px = cx + radius * math.cos(angle)
            py = cy + radius * math.sin(angle)
            points.append((px, py))
        pygame.draw.polygon(surface, shadow, points)
        pygame.draw.polygon(surface, color, [(p[0]*0.9 + cx*0.1, p[1]*0.9 + cy*0.1) for p in points])
        pygame.draw.polygon(surface, highlight, [(p[0]*0.6 + cx*0.4, p[1]*0.6 + cy*0.4) for p in points])

    elif gem_type == 3: # Blue Diamond
        points = [
            (cx, 4),
            (TILE_SIZE - 4, cy),
            (cx, TILE_SIZE - 4),
            (4, cy)
        ]
        pygame.draw.polygon(surface, shadow, points)
        pygame.draw.polygon(surface, color, [(p[0]*0.9 + cx*0.1, p[1]*0.9 + cy*0.1) for p in points])
        pygame.draw.polygon(surface, highlight, [(p[0]*0.5 + cx*0.5, p[1]*0.5 + cy*0.5) for p in points])

    elif gem_type == 4: # Purple Triangle
        points = [
            (cx, 4),
            (TILE_SIZE - 4, TILE_SIZE - 12),
            (4, TILE_SIZE - 12)
        ]
        pygame.draw.polygon(surface, shadow, points)
        pygame.draw.polygon(surface, color, [(p[0]*0.9 + cx*0.1, p[1]*0.9 + cy*0.1) for p in points])
        
    elif gem_type == 5: # Orange Octagon
        points = []
        for i in range(8):
            angle = math.radians(45 * i + 22.5)
            px = cx + radius * math.cos(angle)
            py = cy + radius * math.sin(angle)
            points.append((px, py))
        pygame.draw.polygon(surface, shadow, points)
        pygame.draw.polygon(surface, color, [(p[0]*0.9 + cx*0.1, p[1]*0.9 + cy*0.1) for p in points])
        
    elif gem_type == 6: # Green Rect (Rotated square? No we have diamond) -> Pentagon?
        # Let's do a Pentagon (House shape)
        points = []
        for i in range(5):
            angle = math.radians(72 * i - 90) # Start top
            px = cx + radius * math.cos(angle)
            py = cy + radius * math.sin(angle)
            points.append((px, py))
        pygame.draw.polygon(surface, shadow, points)
        pygame.draw.polygon(surface, color, [(p[0]*0.9 + cx*0.1, p[1]*0.9 + cy*0.1) for p in points])

    return surface

GEM_IMAGES = []

def load_assets():
    global GEM_IMAGES
    if not GEM_IMAGES:
        for i in range(7):
            GEM_IMAGES.append(create_gem_surface(i))
