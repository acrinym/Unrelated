import random

BOARD_WIDTH = 8
BOARD_HEIGHT = 8
NUM_GEMS = 7

class Board:
    def __init__(self):
        self.grid = [[-1 for _ in range(BOARD_HEIGHT)] for _ in range(BOARD_WIDTH)]
        self.score = 0
        self.fill_new_board()
        self.game_over = False

    def fill_new_board(self):
        # Fill with random gems
        for x in range(BOARD_WIDTH):
            for y in range(BOARD_HEIGHT):
                self.grid[x][y] = random.randint(0, NUM_GEMS - 1)
        
        # Remove initial matches without scoring
        while True:
            match_groups = self.find_matches()
            if not match_groups:
                break
            for group in match_groups:
                for (x, y) in group:
                    self.grid[x][y] = -1
            self.refill_board_instant()
        
        self.score = 0
        self.game_over = False
        
        # If no moves possible at start, try again
        if not self.has_possible_moves():
            self.fill_new_board()

    def get_gem(self, x, y):
        if 0 <= x < BOARD_WIDTH and 0 <= y < BOARD_HEIGHT:
            return self.grid[x][y]
        return -1

    def swap_gems(self, x1, y1, x2, y2):
        if (0 <= x1 < BOARD_WIDTH and 0 <= y1 < BOARD_HEIGHT and
            0 <= x2 < BOARD_WIDTH and 0 <= y2 < BOARD_HEIGHT):
            self.grid[x1][y1], self.grid[x2][y2] = self.grid[x2][y2], self.grid[x1][y1]
            return True
        return False

    def is_adjacent(self, x1, y1, x2, y2):
        return (abs(x1 - x2) + abs(y1 - y2)) == 1

    def find_matches(self):
        match_groups = []
        
        # Horizontal matches
        for y in range(BOARD_HEIGHT):
            x = 0
            while x < BOARD_WIDTH - 2:
                gem_type = self.grid[x][y]
                if gem_type == -1:
                    x += 1
                    continue
                
                length = 1
                while x + length < BOARD_WIDTH and self.grid[x + length][y] == gem_type:
                    length += 1
                
                if length >= 3:
                    match_group = []
                    for k in range(length):
                        match_group.append((x + k, y))
                    match_groups.append(match_group)
                    x += length
                else:
                    x += 1

        # Vertical matches
        for x in range(BOARD_WIDTH):
            y = 0
            while y < BOARD_HEIGHT - 2:
                gem_type = self.grid[x][y]
                if gem_type == -1:
                    y += 1
                    continue
                
                length = 1
                while y + length < BOARD_HEIGHT and self.grid[x][y + length] == gem_type:
                    length += 1
                
                if length >= 3:
                    match_group = []
                    for k in range(length):
                        match_group.append((x, y + k))
                    match_groups.append(match_group)
                    y += length
                else:
                    y += 1
        
        return match_groups

    def remove_matches(self, match_groups, combo_multiplier=1):
        if not match_groups:
            return 0
            
        gems_to_remove = set()
        
        for group in match_groups:
            for gem in group:
                gems_to_remove.add(gem)
        
        final_score = len(gems_to_remove) * 10 * combo_multiplier
        self.score += final_score
        
        for (x, y) in gems_to_remove:
            self.grid[x][y] = -1
            
        return final_score

    def get_hint(self):
        # Returns (x1, y1, x2, y2) of a valid move, or None
        # Check horizontal swaps
        for y in range(BOARD_HEIGHT):
            for x in range(BOARD_WIDTH - 1):
                if self.is_valid_move(x, y, x+1, y):
                    return (x, y, x+1, y)
        # Check vertical swaps
        for x in range(BOARD_WIDTH):
            for y in range(BOARD_HEIGHT - 1):
                if self.is_valid_move(x, y, x, y+1):
                    return (x, y, x, y+1)
        return None

    def refill_board_instant(self):
        # Gravity
        for x in range(BOARD_WIDTH):
            empty_slots = 0
            for y in range(BOARD_HEIGHT - 1, -1, -1):
                if self.grid[x][y] == -1:
                    empty_slots += 1
                elif empty_slots > 0:
                    self.grid[x][y + empty_slots] = self.grid[x][y]
                    self.grid[x][y] = -1
            
            # Fill top
            for y in range(empty_slots):
                self.grid[x][y] = random.randint(0, NUM_GEMS - 1)

    def apply_gravity(self):
        # Returns a list of moves: (x, start_y, end_y) for animation
        # And fills top with new gems (marked as 'new')
        # This function updates the logical grid but returns info for animation
        moves = [] # list of {'x': x, 'y_start': y, 'y_end': new_y, 'val': gem_type}
        new_gems = [] # list of {'x': x, 'y_end': y, 'val': gem_type}
        
        for x in range(BOARD_WIDTH):
            write_y = BOARD_HEIGHT - 1
            for read_y in range(BOARD_HEIGHT - 1, -1, -1):
                if self.grid[x][read_y] != -1:
                    if read_y != write_y:
                        moves.append({
                            'x': x,
                            'y_start': read_y,
                            'y_end': write_y,
                            'val': self.grid[x][read_y]
                        })
                        self.grid[x][write_y] = self.grid[x][read_y]
                        self.grid[x][read_y] = -1
                    write_y -= 1
            
            # Fill the rest with new gems
            for y in range(write_y, -1, -1):
                val = random.randint(0, NUM_GEMS - 1)
                self.grid[x][y] = val
                new_gems.append({
                    'x': x,
                    'y_end': y,
                    'val': val
                })
                
        return moves, new_gems

    def is_valid_move(self, x1, y1, x2, y2):
        if not self.is_adjacent(x1, y1, x2, y2):
            return False
        self.swap_gems(x1, y1, x2, y2)
        matches = self.find_matches()
        self.swap_gems(x1, y1, x2, y2)
        return len(matches) > 0

    def has_possible_moves(self):
        # Check horizontal swaps
        for y in range(BOARD_HEIGHT):
            for x in range(BOARD_WIDTH - 1):
                if self.is_valid_move(x, y, x+1, y):
                    return True
        # Check vertical swaps
        for x in range(BOARD_WIDTH):
            for y in range(BOARD_HEIGHT - 1):
                if self.is_valid_move(x, y, x, y+1):
                    return True
        return False
