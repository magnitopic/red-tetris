import { jest } from '@jest/globals';
import { TETROMINOES } from '../src/Game/Tetrominoes.js'; 

// Declare mocks
jest.unstable_mockModule('../src/Game/Board.js', () => ({
  Board: jest.fn()
}));

jest.unstable_mockModule('../src/Game/Piece.js', () => ({
  Piece: { spawn: jest.fn() }
}));

// Import modules
let Game, Board, Piece;
beforeAll(async () => {
  ({ Board } = await import('../src/Game/Board.js'));
  ({ Piece } = await import('../src/Game/Piece.js'));
  ({ default: Game } = await import('../src/Game/Game.js'));
});

// mockPiece using TETROMINOES
function getMockPiece(nameOrId) {
  const template = TETROMINOES.find(
    t => t.id === nameOrId || t.name === nameOrId
  );

  if (!template) throw new Error("Tetrominoe not found");

  return {
    x: 0,
    y: 0,
    rotation: 0,
    template,
    shape: template.rotations[0]
  };
}

describe('Game class', () => {
  let mockRoom;
  let mockBoardInstance;
  let mockPiece;

  beforeEach(() => {
    mockRoom = {
      pieceQueue: ['I'],
      rng: jest.fn(() => 0.5),
      io: { to: jest.fn().mockReturnThis(), emit: jest.fn() },
      playerGames: new Map()
    };

    mockBoardInstance = {
      isValidPosition: jest.fn(() => true),
      getState: jest.fn(() => []),
      lockPiece: jest.fn(() => 0),
      addGarbageLines: jest.fn()
    };

    mockPiece = getMockPiece('I'); 

    Board.mockImplementation(() => mockBoardInstance);
    Piece.spawn.mockReturnValue(mockPiece);
  });

  test('spawnNextPiece should add new pieces to queue', () => {
    const game = new Game(10, 22, jest.fn(), jest.fn(), mockRoom, 'u1', 's1');
    game.spawnNextPiece();
    expect(mockRoom.pieceQueue.length).toBeGreaterThan(0);
  });

   test('moveLeft should decrement x if position is valid', () => {
    const game = new Game(10, 22, jest.fn(), jest.fn(), mockRoom, 'u1', 's1');
    game.currentPiece.x = 5;
    game.moveLeft();
    expect(game.currentPiece.x).toBe(4);
  });

  test('moveRight should increment x if position is valid', () => {
    const game = new Game(10, 22, jest.fn(), jest.fn(), mockRoom, 'u1', 's1');
    game.currentPiece.x = 3;
    game.moveRight();
    expect(game.currentPiece.x).toBe(4);
  });

  test('softDrop should increment y if valid', () => {
    const game = new Game(10, 22, jest.fn(), jest.fn(), mockRoom, 'u1', 's1');
    game.currentPiece.y = 0;
    game.softDrop();
    expect(game.currentPiece.y).toBe(1);
  });

  test('softDrop should lock piece and spawn new if not valid', () => {
    mockBoardInstance.isValidPosition.mockReturnValueOnce(false);
    mockBoardInstance.lockPiece.mockReturnValue(2);
    const onStateChange = jest.fn();
    const game = new Game(10, 22, onStateChange, jest.fn(), mockRoom, 'u1', 's1');
    game.softDrop();
    expect(mockBoardInstance.lockPiece).toHaveBeenCalledWith(mockPiece);
    expect(game.score).toBe(game.getPoints(2));
  });

  test('rotate should change rotation if valid', () => {
    const game = new Game(10, 22, jest.fn(), jest.fn(), mockRoom, 'u1', 's1');
		expect(game.currentPiece.rotation).toBe(0);
		game.rotate();
    expect(game.currentPiece.rotation).toBe(1);

		game.rotate();
    expect(game.currentPiece.rotation).toBe(2);

    game.rotate();
    expect(game.currentPiece.rotation).toBe(3);

    game.rotate();
    expect(game.currentPiece.rotation).toBe(0);
  });

  test('sendGarbageToOthers should add lines to other players', () => {
    const otherGame = {
      board: { addGarbageLines: jest.fn() },
      socketId: 's2',
      getState: jest.fn(() => ({ gameOver: false })),
      onStateChange: jest.fn()
    };
    mockRoom.playerGames.set('p2', otherGame);
    const game = new Game(10, 22, jest.fn(), jest.fn(), mockRoom, 'u1', 's1');
    game.sendGarbageToOthers(3);
    expect(otherGame.board.addGarbageLines).toHaveBeenCalledWith(2);
  });

  test('getPoints returns correct values', () => {
    const game = new Game(10, 22, jest.fn(), jest.fn(), mockRoom, 'u1', 's1');
    expect(game.getPoints(1)).toBe(100);
    expect(game.getPoints(4)).toBe(800);
    expect(game.getPoints(10)).toBe(0);
  });

  test('startGravity should call softDrop periodically', () => {
    jest.useFakeTimers();
    const game = new Game(10, 22, jest.fn(), jest.fn(), mockRoom, 'u1', 's1');
    const spy = jest.spyOn(game, 'softDrop');
    game.startGravity(100);
    jest.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
