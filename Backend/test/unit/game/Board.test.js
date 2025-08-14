import { Board } from '../../../src/Game/Board.js';

describe('Board class', () => {
  let board;

  beforeEach(() => {
    board = new Board(10, 22);
  });

  test('constructor should create empty board with correct dimensions', () => {
    expect(board.width).toBe(10);
    expect(board.height).toBe(22);
    expect(board.grid.length).toBe(22);
    expect(board.grid[0].length).toBe(10);
    expect(board.grid.every(row => row.every(cell => cell === 0))).toBe(true);
  });

  test('reset should clear the board', () => {
    board.grid[0][0] = 1;
    board.reset();
    expect(board.grid[0][0]).toBe(0);
    expect(board.grid.every(row => row.every(cell => cell === 0))).toBe(true);
  });

  describe('isValidPosition', () => {
    const pieceShape = [
      [1, 1],
      [1, 0]
    ];

    test('returns true for valid position within bounds', () => {
      expect(board.isValidPosition(0, 0, pieceShape)).toBe(true);
      expect(board.isValidPosition(8, 20, pieceShape)).toBe(true); // bottom-right valid
    });

    test('returns false if piece goes out of bounds', () => {
      expect(board.isValidPosition(-1, 0, pieceShape)).toBe(false); // left
      expect(board.isValidPosition(0, -1, pieceShape)).toBe(true); // negative y is allowed (spawn above)
      expect(board.isValidPosition(9, 21, pieceShape)).toBe(false); // right-bottom overflow
      expect(board.isValidPosition(8, 21, pieceShape)).toBe(false); // bottom overflow
    });

    test('returns false if piece overlaps non-zero cells', () => {
      board.grid[1][0] = 2;
      expect(board.isValidPosition(0, 0, pieceShape)).toBe(false);
    });
  });

  describe('lockPiece', () => {
    const piece = {
      x: 0,
      y: 0,
      shape: [
        [1, 1],
        [1, 0]
      ]
    };

    test('should write piece into grid', () => {
      board.lockPiece(piece);
      expect(board.grid[0][0]).toBe(1);
      expect(board.grid[0][1]).toBe(1);
      expect(board.grid[1][0]).toBe(1);
    });

    test('should return number of cleared lines', () => {
      // Fill one line
      board.grid[21] = new Array(10).fill(1);
      const lines = board.lockPiece(piece);
      expect(lines).toBe(1);
      expect(board.grid[21].every(cell => cell === 0)).toBe(true);
    });
  });

  describe('clearLines', () => {
    test('should remove completely filled lines', () => {
      board.grid[21] = new Array(10).fill(1);
      board.grid[20] = new Array(10).fill(1);
      const cleared = board.clearLines();
      expect(cleared).toBe(2);
      expect(board.grid[21].every(cell => cell === 0)).toBe(true);
      expect(board.grid[20].every(cell => cell === 0)).toBe(true);
    });

    test('should ignore partially filled lines', () => {
      board.grid[21] = [1,0,1,1,1,1,1,1,1,1];
      const cleared = board.clearLines();
      expect(cleared).toBe(0);
      expect(board.grid[21][1]).toBe(0);
    });
  });

  describe('addGarbageLines', () => {
    test('should add garbage lines to bottom', () => {
      board.addGarbageLines(2);
      expect(board.grid[21].every(cell => cell === 8)).toBe(true);
      expect(board.grid[20].every(cell => cell === 8)).toBe(true);
    });

    test('should remove top rows when adding garbage', () => {
      board.grid[0][0] = 1;
      board.addGarbageLines(1);
      expect(board.grid[0][0]).toBe(0); // top row removed
      expect(board.grid[21].every(cell => cell === 8)).toBe(true);
    });
  });

  test('getState should return current grid', () => {
    const state = board.getState();
    expect(state).toBe(board.grid);
  });
});
