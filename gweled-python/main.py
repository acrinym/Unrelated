import pygame
import sys
from board import Board, BOARD_WIDTH, BOARD_HEIGHT, NUM_GEMS
import assets

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

# States
STATE_IDLE = 0
STATE_SWAP_ANIM = 1
STATE_CHECK_MATCH = 2
STATE_REVERSE_SWAP_ANIM = 3
STATE_MATCH_ANIM = 4
STATE_FALL_ANIM = 5
STATE_GAME_OVER = 6
STATE_PAUSED = 7

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
        
        assets.load_assets()
        
        self.board = Board()
        
        self.state = STATE_IDLE
        self.selected_gem = None # (x, y)
        self.swap_target = None # (x, y)
        self.swap_src = None
        self.swap_tgt = None
        self.matched_gems = []
        self.match_groups = []
        
        # Animation data
        self.anim_start_time = 0
        self.anim_gems = [] # List of {'gem_type', 'start_pos', 'end_pos', 'start_time', 'duration'}
        self.falling_gems = [] # List of {'x', 'y', 'target_y', 'gem_type'}
        
        self.combo_multiplier = 1
        
        self.last_input_time = pygame.time.get_ticks()
        self.hint_move = None # (x1, y1, x2, y2)
        
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
                self.last_input_time = pygame.time.get_ticks()
                self.hint_move = None
                if event.button == 1: # Left click
                    self.handle_click(event.pos)
            elif event.type == pygame.KEYDOWN:
                self.last_input_time = pygame.time.get_ticks()
                self.hint_move = None
                if event.key == pygame.K_p:
                    if self.state == STATE_PAUSED:
                        self.state = STATE_IDLE
                    elif self.state == STATE_IDLE:
                        self.state = STATE_PAUSED
                elif event.key == pygame.K_r and self.state == STATE_GAME_OVER:
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
        self.swap_src = pos1
        self.swap_tgt = pos2
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

    def draw(self):
        self.screen.fill(BACKGROUND_COLOR)
        
        # Draw UI
        score_text = self.font.render(f"Score: {self.board.score}", True, TEXT_COLOR)
        self.screen.blit(score_text, (10, 20))
        
        if self.state == STATE_GAME_OVER:
             status_text = self.font.render("GAME OVER - Press R to Restart", True, (255, 100, 100))
             self.screen.blit(status_text, (SCREEN_WIDTH//2 - status_text.get_width()//2, 20))
        elif self.state == STATE_PAUSED:
             status_text = self.font.render("PAUSED", True, (255, 255, 100))
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
                    gem_type = self.board.get_gem(x, y)
                    if gem_type != -1:
                         self.draw_gem(x * TILE_SIZE, y * TILE_SIZE, gem_type, highlight=True)

        # Draw Selection
        if self.selected_gem and self.state == STATE_IDLE:
            x, y = self.selected_gem
            rect = pygame.Rect(x * TILE_SIZE, y * TILE_SIZE + MARGIN_TOP, TILE_SIZE, TILE_SIZE)
            pygame.draw.rect(self.screen, HIGHLIGHT_COLOR, rect, 3)

        # Draw Hint
        if self.hint_move and self.state == STATE_IDLE:
             # Blink hint
             if (current_time // 500) % 2 == 0:
                 x1, y1, x2, y2 = self.hint_move
                 rect1 = pygame.Rect(x1 * TILE_SIZE, y1 * TILE_SIZE + MARGIN_TOP, TILE_SIZE, TILE_SIZE)
                 rect2 = pygame.Rect(x2 * TILE_SIZE, y2 * TILE_SIZE + MARGIN_TOP, TILE_SIZE, TILE_SIZE)
                 pygame.draw.rect(self.screen, (255, 255, 100), rect1, 3)
                 pygame.draw.rect(self.screen, (255, 255, 100), rect2, 3)

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
        if highlight:
            # Scale up or brighten?
            # Let's draw a white glow behind
            center_x = px + TILE_SIZE // 2
            center_y = py + MARGIN_TOP + TILE_SIZE // 2
            pygame.draw.circle(self.screen, (255, 255, 255), (center_x, center_y), TILE_SIZE // 2)
            
        # Use assets
        if 0 <= gem_type < len(assets.GEM_IMAGES):
            self.screen.blit(assets.GEM_IMAGES[gem_type], (px, py + MARGIN_TOP))
        else:
            # Fallback
            center_x = px + TILE_SIZE // 2
            center_y = py + MARGIN_TOP + TILE_SIZE // 2
            pygame.draw.circle(self.screen, (100, 100, 100), (center_x, center_y), TILE_SIZE // 2 - 4)

    # --- Logic Implementation ---

    def update_logic(self):
        # Called from update() with access to self
        current_time = pygame.time.get_ticks()
        
        # Hint Logic
        if self.state == STATE_IDLE and not self.hint_move:
            if current_time - self.last_input_time > 5000: # 5 seconds
                self.hint_move = self.board.get_hint()
        
        if self.state == STATE_SWAP_ANIM:
            if current_time - self.anim_start_time >= ANIM_SWAP_DURATION:
                # Finish Swap
                self.board.swap_gems(self.swap_src[0], self.swap_src[1], self.swap_tgt[0], self.swap_tgt[1])
                self.state = STATE_CHECK_MATCH
        
        elif self.state == STATE_CHECK_MATCH:
            match_groups = self.board.find_matches()
            if match_groups:
                self.match_groups = match_groups
                # Flatten for animation
                self.matched_gems = []
                for group in match_groups:
                    self.matched_gems.extend(group)
                    
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
                self.board.remove_matches(self.match_groups, self.combo_multiplier)
                self.matched_gems = []
                self.match_groups = []
                self.combo_multiplier += 1
                
                moves, new_gems = self.board.apply_gravity()
                
                self.falling_gems = []
                for m in moves:
                    self.falling_gems.append({
                        'x': m['x'],
                        'y': m['y_start'] * TILE_SIZE, # Current pixel y
                        'target_y': m['y_end'],
                        'gem_type': m['val']
                    })
                
                col_max_y = {}
                for ng in new_gems:
                    col_max_y[ng['x']] = max(col_max_y.get(ng['x'], -1), ng['y_end'])
                
                for ng in new_gems:
                     max_y = col_max_y[ng['x']]
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
                match_groups = self.board.find_matches()
                if match_groups:
                    self.match_groups = match_groups
                    self.matched_gems = []
                    for group in match_groups:
                        self.matched_gems.extend(group)
                        
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
        if self.state == STATE_PAUSED:
            return
            
        if self.state == STATE_SWAP_ANIM and self.anim_gems:
             pass
             
        self.update_logic()

if __name__ == "__main__":
    game = Game()
    game.run()
