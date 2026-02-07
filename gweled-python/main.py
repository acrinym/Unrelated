import pygame
import sys
import random
from board import Board, BOARD_WIDTH, BOARD_HEIGHT, NUM_GEMS

# Constants
TILE_SIZE = 64
MARGIN_TOP = 60
SCREEN_WIDTH = BOARD_WIDTH * TILE_SIZE
SCREEN_HEIGHT = BOARD_HEIGHT * TILE_SIZE + MARGIN_TOP

# Colors
BACKGROUND_COLOR = (40, 40, 50)
GRID_COLOR = (60, 60, 70)
HIGHLIGHT_COLOR = (255, 255, 255)
TEXT_COLOR = (240, 240, 240)
GAME_OVER_COLOR = (20, 20, 20, 200)

GEM_COLORS = [
    (230, 50, 50),    # Red
    (50, 230, 50),    # Green
    (50, 50, 230),    # Blue
    (230, 230, 50),   # Yellow
    (200, 50, 200),   # Purple
    (50, 230, 230),   # Cyan
    (230, 150, 50)    # Orange
]

# States
STATE_IDLE = 0
STATE_SWAP_ANIM = 1
STATE_CHECK_MATCH = 2
STATE_REVERSE_SWAP_ANIM = 3
STATE_MATCH_ANIM = 4
STATE_FALL_ANIM = 5
STATE_GAME_OVER = 6

ANIM_SWAP_DURATION = 250 # ms
ANIM_MATCH_DURATION = 300 # ms
FALL_SPEED = 15 # pixels per frame

class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Gweled Python")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.large_font = pygame.font.Font(None, 72)
        
        self.board = Board()
        
        self.state = STATE_IDLE
        self.selected_gem = None # (x, y)
        self.swap_target = None # (x, y)
        
        # Animation data
        self.anim_start_time = 0
        self.anim_gems = [] # List of {'gem_type', 'start_pos', 'end_pos', 'start_time', 'duration'}
        self.falling_gems = [] # List of {'x', 'y', 'target_y', 'gem_type'}
        
        self.combo_multiplier = 1
        
        self.running = True

    def run(self):
        while self.running:
            dt = self.clock.tick(60)
            self.handle_events()
            self.update(dt)
            self.draw()
        
        pygame.quit()
        sys.exit()

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1: # Left click
                    self.handle_click(event.pos)
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r and self.state == STATE_GAME_OVER:
                    self.board.fill_new_board()
                    self.state = STATE_IDLE
                    self.combo_multiplier = 1

    def handle_click(self, pos):
        if self.state != STATE_IDLE:
            return

        x, y = pos
        # Convert to grid coords
        grid_x = x // TILE_SIZE
        grid_y = (y - MARGIN_TOP) // TILE_SIZE
        
        # Check bounds
        if not (0 <= grid_x < BOARD_WIDTH and 0 <= grid_y < BOARD_HEIGHT):
            return

        if self.selected_gem:
            sel_x, sel_y = self.selected_gem
            
            if (sel_x, sel_y) == (grid_x, grid_y):
                # Deselect
                self.selected_gem = None
            elif self.board.is_adjacent(sel_x, sel_y, grid_x, grid_y):
                # Start Swap
                self.swap_target = (grid_x, grid_y)
                self.start_swap_animation(self.selected_gem, self.swap_target)
                self.state = STATE_SWAP_ANIM
                self.selected_gem = None
            else:
                # Select new
                self.selected_gem = (grid_x, grid_y)
        else:
            self.selected_gem = (grid_x, grid_y)

    def start_swap_animation(self, pos1, pos2):
        self.anim_start_time = pygame.time.get_ticks()
        x1, y1 = pos1
        x2, y2 = pos2
        
        # Create animation entries
        # Positions are in pixels relative to (0,0) of grid (excluding margin for now, handled in draw)
        self.anim_gems = [
            {
                'gem_type': self.board.get_gem(x1, y1),
                'start_pos': (x1 * TILE_SIZE, y1 * TILE_SIZE),
                'end_pos': (x2 * TILE_SIZE, y2 * TILE_SIZE),
                'duration': ANIM_SWAP_DURATION
            },
            {
                'gem_type': self.board.get_gem(x2, y2),
                'start_pos': (x2 * TILE_SIZE, y2 * TILE_SIZE),
                'end_pos': (x1 * TILE_SIZE, y1 * TILE_SIZE),
                'duration': ANIM_SWAP_DURATION
            }
        ]
        
        # Temporarily hide gems on board
        # We handle this by not drawing them if they are in anim_gems (or just drawing over)
        # But we need to know which grid cells are animating.
        # Simple hack: The draw loop will check if state is SWAP/REVERSE and skip drawing the specific cells being swapped.

    def update(self, dt):
        current_time = pygame.time.get_ticks()
        
        if self.state == STATE_SWAP_ANIM:
            if current_time - self.anim_start_time >= ANIM_SWAP_DURATION:
                # Animation done, check logic
                x1, y1 = self.selected_gem if self.selected_gem else self.anim_gems[1]['end_pos'] # wait, selected_gem is None
                # Retrieve coords from swap
                # Actually, let's store swap coords in self.swap_pair
                # For now, reconstruct from anim_gems logic is messy.
                # Let's rely on self.swap_target which we set in handle_click
                # But wait, self.selected_gem was cleared.
                # I need to store the FROM gem.
                pass 
                # Re-logic:
                # In handle_click: self.swap_src = self.selected_gem, self.swap_tgt = ...
                # But I didn't save swap_src. 
                # Let's fix handle_click logic implicitly by using anim data or storing it.
                
                # Let's just assume the swap animation finishes visually.
                # Now perform logical swap.
                # We need the coordinates.
                # Let's store them in the class when starting swap.
                pass
        
        # ... logic continues in detailed implementation below ...
        
        # I'll implement a proper state update method here.
        pass

    def draw(self):
        self.screen.fill(BACKGROUND_COLOR)
        
        # Draw UI
        score_text = self.font.render(f"Score: {self.board.score}", True, TEXT_COLOR)
        self.screen.blit(score_text, (10, 20))
        
        if self.state == STATE_GAME_OVER:
             status_text = self.font.render("GAME OVER - Press R to Restart", True, (255, 100, 100))
             self.screen.blit(status_text, (SCREEN_WIDTH//2 - status_text.get_width()//2, 20))

        # Draw Grid Background
        for x in range(BOARD_WIDTH):
            for y in range(BOARD_HEIGHT):
                rect = pygame.Rect(x * TILE_SIZE, y * TILE_SIZE + MARGIN_TOP, TILE_SIZE, TILE_SIZE)
                pygame.draw.rect(self.screen, GRID_COLOR, rect, 1)

        # Draw Gems
        for x in range(BOARD_WIDTH):
            for y in range(BOARD_HEIGHT):
                # Skip drawing if this gem is animating (handled separately)
                if self.is_animating(x, y):
                    continue
                
                gem_type = self.board.get_gem(x, y)
                if gem_type != -1:
                    self.draw_gem(x * TILE_SIZE, y * TILE_SIZE, gem_type)

        # Draw Animating Gems
        current_time = pygame.time.get_ticks()
        
        if self.state in [STATE_SWAP_ANIM, STATE_REVERSE_SWAP_ANIM]:
            progress = (current_time - self.anim_start_time) / ANIM_SWAP_DURATION
            progress = min(max(progress, 0), 1)
            # Smooth step
            t = progress * progress * (3 - 2 * progress)
            
            for anim in self.anim_gems:
                start_x, start_y = anim['start_pos']
                end_x, end_y = anim['end_pos']
                curr_x = start_x + (end_x - start_x) * t
                curr_y = start_y + (end_y - start_y) * t
                self.draw_gem(curr_x, curr_y, anim['gem_type'])

        elif self.state == STATE_FALL_ANIM:
            for gem in self.falling_gems:
                self.draw_gem(gem['x'] * TILE_SIZE, gem['y'], gem['gem_type'])

        elif self.state == STATE_MATCH_ANIM:
            # Blink effect
            if (current_time // 100) % 2 == 0:
                for (x, y) in self.matched_gems:
                    gem_type = self.board.get_gem(x, y) # Wait, we haven't removed them yet?
                    # In logic, we should remove them AFTER animation.
                    if gem_type != -1:
                         self.draw_gem(x * TILE_SIZE, y * TILE_SIZE, gem_type, highlight=True)

        # Draw Selection
        if self.selected_gem and self.state == STATE_IDLE:
            x, y = self.selected_gem
            rect = pygame.Rect(x * TILE_SIZE, y * TILE_SIZE + MARGIN_TOP, TILE_SIZE, TILE_SIZE)
            pygame.draw.rect(self.screen, HIGHLIGHT_COLOR, rect, 3)

        pygame.display.flip()

    def is_animating(self, x, y):
        if self.state in [STATE_SWAP_ANIM, STATE_REVERSE_SWAP_ANIM]:
             # Check if (x,y) corresponds to start or end of any anim
             px, py = x * TILE_SIZE, y * TILE_SIZE
             for anim in self.anim_gems:
                 if anim['start_pos'] == (px, py) or anim['end_pos'] == (px, py):
                     return True
        elif self.state == STATE_MATCH_ANIM:
            # Don't hide them, just draw them blinking
            return False
        elif self.state == STATE_FALL_ANIM:
            # Check if x,y is destination of any falling gem
            # We want to hide the grid cell until the gem lands?
            # Actually, falling gems are "floating". The grid cell should be empty (-1) or contain the destination gem?
            # In my board logic, gravity fills the grid INSTANTLY.
            # So the grid HAS the gem. We should NOT draw it if a falling gem is targeting it.
            for gem in self.falling_gems:
                if gem['target_y'] == y and gem['x'] == x:
                    return True
        return False

    def draw_gem(self, px, py, gem_type, highlight=False):
        center_x = px + TILE_SIZE // 2
        center_y = py + MARGIN_TOP + TILE_SIZE // 2
        radius = TILE_SIZE // 2 - 4
        
        color = GEM_COLORS[gem_type]
        if highlight:
            color = (min(color[0]+50, 255), min(color[1]+50, 255), min(color[2]+50, 255))
        
        pygame.draw.circle(self.screen, color, (center_x, center_y), radius)
        # Shine
        pygame.draw.circle(self.screen, (255, 255, 255), (center_x - radius//3, center_y - radius//3), radius//4)

    # --- Logic Implementation ---

    def update_logic(self):
        # Called from update() with access to self
        current_time = pygame.time.get_ticks()
        
        if self.state == STATE_SWAP_ANIM:
            if current_time - self.anim_start_time >= ANIM_SWAP_DURATION:
                # Finish Swap
                self.board.swap_gems(self.swap_src[0], self.swap_src[1], self.swap_tgt[0], self.swap_tgt[1])
                self.state = STATE_CHECK_MATCH
        
        elif self.state == STATE_CHECK_MATCH:
            matches = self.board.find_matches()
            if matches:
                self.matched_gems = matches
                self.state = STATE_MATCH_ANIM
                self.anim_start_time = current_time
                self.combo_multiplier = 1 # Reset combo? No, if this was a swap, start at 1.
            else:
                # Invalid move, swap back
                self.state = STATE_REVERSE_SWAP_ANIM
                self.start_swap_animation(self.swap_tgt, self.swap_src)
                
        elif self.state == STATE_REVERSE_SWAP_ANIM:
            if current_time - self.anim_start_time >= ANIM_SWAP_DURATION:
                # Undo swap in board logic
                self.board.swap_gems(self.swap_src[0], self.swap_src[1], self.swap_tgt[0], self.swap_tgt[1])
                self.state = STATE_IDLE
                self.selected_gem = None
        
        elif self.state == STATE_MATCH_ANIM:
            if current_time - self.anim_start_time >= ANIM_MATCH_DURATION:
                # Remove gems
                self.board.remove_matches(self.matched_gems, self.combo_multiplier)
                self.matched_gems = []
                self.combo_multiplier += 1
                
                # Setup Gravity
                moves, new_gems = self.board.apply_gravity()
                
                # Convert moves to falling gems
                self.falling_gems = []
                for m in moves:
                    self.falling_gems.append({
                        'x': m['x'],
                        'y': m['y_start'] * TILE_SIZE, # Current pixel y
                        'target_y': m['y_end'],
                        'gem_type': m['val']
                    })
                
                # Add new gems spawning from above
                for ng in new_gems:
                     self.falling_gems.append({
                        'x': ng['x'],
                        'y': (ng['y_end'] - BOARD_HEIGHT) * TILE_SIZE, # Start above screen? Or just above board.
                        # Actually let's start them at -1 * TILE_SIZE * (order)
                        # Simplified: start at -TILE_SIZE
                        'target_y': ng['y_end'],
                        'gem_type': ng['val']
                    })
                     # Fix Y for new gems to stack properly above
                     # This is a bit complex to do perfectly without more tracking.
                     # Let's just spawn them at -TILE_SIZE for now, they will overlap if multiple in same col.
                     # Better: spawn at (ng['y_end'] - BOARD_HEIGHT) * TILE_SIZE might be too high.
                     # Let's spawn at -1 * TILE_SIZE * (dist from top).
                     # Actually, `apply_gravity` returns `new_gems` with `y_end`.
                     # The number of empty slots in that column determines height.
                     pass 

                # Adjust spawn Y for new gems to prevent overlap
                cols_spawn_count = [0] * BOARD_WIDTH
                for ng in new_gems:
                    cols_spawn_count[ng['x']] += 1
                
                # We need to assign start Y based on index
                # Let's re-process new_gems
                # We need to know which ones are "higher".
                # The board logic fills from bottom up in `refill_board_instant` logic?
                # No, `fill top` loop fills `0` to `empty_slots`.
                # So y=0 is top.
                # `y` in new_gems is the grid index.
                # Smaller y = higher up.
                # So if we have new gems at y=0 and y=1.
                # y=1 should spawn at -1 * TILE_SIZE.
                # y=0 should spawn at -2 * TILE_SIZE.
                
                # Sort new_gems by y descending (bottom first)? No, we want to calculate start Y.
                
                self.falling_gems = []
                # Re-add moves
                for m in moves:
                    self.falling_gems.append({
                        'x': m['x'],
                        'y': m['y_start'] * TILE_SIZE,
                        'target_y': m['y_end'],
                        'gem_type': m['val']
                    })
                
                # Add new gems
                for ng in new_gems:
                     # Calculate how many new gems are BELOW this one in the same column?
                     # Actually, just use (ng['y_end'] + 1) * -TILE_SIZE?
                     # If y_end is 0 (top), start at -64.
                     # If y_end is 1, start at -64? No, y=1 is below y=0.
                     # New gems fill 0..N.
                     # So y=0 is the highest new gem.
                     # y=N is the lowest new gem.
                     # Wait, gravity fills 0..empty_slots.
                     # So if we have 3 empty slots, they are at 0, 1, 2.
                     # 2 is the bottom-most new gem.
                     # 0 is the top-most.
                     # We want 2 to be at -64.
                     # 1 to be at -128.
                     # 0 to be at -192.
                     # Formula: start_y = (ng['y_end'] - (max_new_y_in_col + 1)) * TILE_SIZE
                     pass

                col_max_y = {}
                for ng in new_gems:
                    col_max_y[ng['x']] = max(col_max_y.get(ng['x'], -1), ng['y_end'])
                
                for ng in new_gems:
                     max_y = col_max_y[ng['x']]
                     # relative_index = max_y - ng['y_end'] (0 for bottom-most, 1 for next...)
                     dist_up = (max_y - ng['y_end']) + 1
                     start_y = -dist_up * TILE_SIZE
                     
                     self.falling_gems.append({
                        'x': ng['x'],
                        'y': start_y,
                        'target_y': ng['y_end'],
                        'gem_type': ng['val']
                    })

                self.state = STATE_FALL_ANIM
        
        elif self.state == STATE_FALL_ANIM:
            finished = True
            for gem in self.falling_gems:
                target_px = gem['target_y'] * TILE_SIZE
                if gem['y'] < target_px:
                    gem['y'] += FALL_SPEED
                    if gem['y'] > target_px:
                        gem['y'] = target_px
                    finished = False
            
            if finished:
                # Check for matches again
                matches = self.board.find_matches()
                if matches:
                    self.matched_gems = matches
                    self.state = STATE_MATCH_ANIM
                    self.anim_start_time = current_time
                else:
                    # Turn finished
                    if not self.board.has_possible_moves():
                        self.state = STATE_GAME_OVER
                    else:
                        self.state = STATE_IDLE
                        self.combo_multiplier = 1

    # Overwriting update
    def update(self, dt):
        if self.state == STATE_SWAP_ANIM and self.anim_gems:
             # Just waiting for time
             pass
             
        self.update_logic()

if __name__ == "__main__":
    game = Game()
    # Patch start_swap_animation to save coords
    orig_start_swap = game.start_swap_animation
    def patched_start_swap(pos1, pos2):
        game.swap_src = pos1
        game.swap_tgt = pos2
        orig_start_swap(pos1, pos2)
    game.start_swap_animation = patched_start_swap
    
    game.run()
