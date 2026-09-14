// 10 levels, gently harder. Coordinates are [col, row], row 0 at the top.
// `solution` is a known winning plan — tested, and shown after 3 failed tries.
// `tiles` limits the palette early so the first levels can't be gotten lost in.

export const MAZE_LEVELS = [
  { id: 1, cols: 3, rows: 3, start: [0, 1], goal: [1, 1], obstacles: [],
    slots: 2, tiles: ['R'], solution: ['R'] },

  { id: 2, cols: 3, rows: 3, start: [0, 1], goal: [2, 1], obstacles: [],
    slots: 3, tiles: ['R'], solution: ['R', 'R'] },

  { id: 3, cols: 3, rows: 3, start: [0, 0], goal: [1, 1], obstacles: [],
    slots: 3, tiles: ['R', 'D'], solution: ['R', 'D'] },

  { id: 4, cols: 3, rows: 3, start: [0, 0], goal: [2, 1], obstacles: [],
    slots: 4, tiles: ['R', 'D'], solution: ['R', 'R', 'D'] },

  { id: 5, cols: 3, rows: 3, start: [0, 1], goal: [2, 1], obstacles: [[1, 1]],
    slots: 5, tiles: ['U', 'D', 'L', 'R'], solution: ['U', 'R', 'R', 'D'] },

  { id: 6, cols: 4, rows: 3, start: [0, 2], goal: [3, 0],
    obstacles: [[1, 2], [2, 1]],
    slots: 6, tiles: ['U', 'D', 'L', 'R'], solution: ['U', 'R', 'U', 'R', 'R'] },

  { id: 7, cols: 4, rows: 4, start: [0, 3], goal: [3, 3],
    obstacles: [[1, 3], [2, 3]],
    slots: 6, tiles: ['U', 'D', 'L', 'R'], solution: ['U', 'R', 'R', 'R', 'D'] },

  { id: 8, cols: 4, rows: 4, start: [0, 0], goal: [3, 3],
    obstacles: [[1, 0], [0, 2], [2, 2]],
    slots: 7, tiles: ['U', 'D', 'L', 'R'],
    solution: ['D', 'R', 'R', 'R', 'D', 'D'] },

  { id: 9, cols: 5, rows: 3, start: [0, 1], goal: [4, 2], obstacles: [],
    slots: 6, tiles: ['U', 'D', 'L', 'R', 'X2'],
    solution: ['R', 'X2', 'X2', 'X2', 'D'] },

  { id: 10, cols: 5, rows: 5, start: [0, 4], goal: [4, 0],
    obstacles: [[1, 4], [2, 3], [3, 1], [1, 1]],
    slots: 8, tiles: ['U', 'D', 'L', 'R', 'X2'],
    solution: ['U', 'X2', 'X2', 'X2', 'R', 'X2', 'X2', 'X2'] },
];
