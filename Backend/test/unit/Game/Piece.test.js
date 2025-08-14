import { jest } from '@jest/globals';
import { Piece } from '../../../src/Game/Piece.js';

describe('Piece class', () => {
  let mockBoard;
  let tetrominoTemplate;

  beforeEach(() => {
    // tetrominoe "I"
    tetrominoTemplate = {
      id: 1,
      name: 'I',
      rotations: [
        [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
        ],
      ],
    };

    mockBoard = {
      width: 10,
      height: 22,
      isValidPosition: jest.fn(() => true),
    };
  });

  test('constructor sets properties correctly', () => {
    const piece = new Piece(tetrominoTemplate, 0, [[1,1,1,1]], 3, 0);
    expect(piece.template).toBe(tetrominoTemplate);
    expect(piece.rotation).toBe(0);
    expect(piece.shape).toEqual([[1,1,1,1]]);
    expect(piece.x).toBe(3);
    expect(piece.y).toBe(0);
  });

  test('spawn returns a Piece instance if position is valid', () => {
    const piece = Piece.spawn(mockBoard, tetrominoTemplate);
    expect(piece).toBeInstanceOf(Piece);
    expect(piece.template).toBe(tetrominoTemplate);
    expect(piece.rotation).toBe(0);
    expect(piece.y).toBe(0);
    expect(piece.x).toBe(Math.floor((mockBoard.width - piece.shape[0].length) / 2));
  });

  test('spawn sets shape correctly based on template id', () => {
    const piece = Piece.spawn(mockBoard, tetrominoTemplate);
    const expectedShape = tetrominoTemplate.rotations[0].map(row =>
      row.map(cell => (cell ? tetrominoTemplate.id : 0))
    );
    expect(piece.shape).toEqual(expectedShape);
  });

  test('spawn returns null if initial position is invalid', () => {
    mockBoard.isValidPosition.mockReturnValue(false);
    const piece = Piece.spawn(mockBoard, tetrominoTemplate);
    expect(piece).toBeNull();
  });
});
