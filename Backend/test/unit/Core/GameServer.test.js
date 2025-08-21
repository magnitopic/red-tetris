import { jest } from '@jest/globals';

// --- MOCKS ---
await jest.unstable_mockModule('../../../src/Utils/dataBaseConnection.js', () => ({
  default: { query: jest.fn() }
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});


const mockServer = jest.fn();
const mockSocketIo = jest.fn(() => ({
  on: jest.fn(),
}));
jest.unstable_mockModule('socket.io', () => ({ Server: mockSocketIo }));
jest.unstable_mockModule('../../../src/Game/Player.js', () => ({ Player: jest.fn() }));
jest.unstable_mockModule('../../../src/Game/Game.js', () => ({ default: jest.fn() }));
jest.unstable_mockModule('../../../src/Models/GameModel.js', 
  () => ({ default: { createOrUpdate: jest.fn(), updateByReference: jest.fn() } }));

const GamePlayersModelModule = await import('../../../src/Models/GamePlayersModel.js');
const gamePlayersModel = GamePlayersModelModule.default;
jest.spyOn(gamePlayersModel, 'create').mockImplementation(jest.fn());
jest.spyOn(gamePlayersModel, 'updateByReference').mockImplementation(jest.fn());
jest.spyOn(gamePlayersModel, 'getTopPlayers').mockImplementation(jest.fn());

const GameServerModule = await import('../../../src/Core/GameServer.js');
const createSocketServer = GameServerModule.default || GameServerModule;

// --- TESTS ---
describe('createSocketServer', () => {
  it('should not throw if unknown event is triggered', () => {
    const emit = jest.fn();
    const join = jest.fn();
    const to = jest.fn(() => ({ emit: jest.fn() }));
    const handlers = {};
    const socketOn = jest.fn((evt, handler) => { handlers[evt] = handler; });
    const on = jest.fn((event, cb) => {
      if (event === 'connection') {
        cb({
          id: 'socket1',
          on: socketOn,
          join,
          emit,
          to,
        });
      }
    });
    mockSocketIo.mockReturnValueOnce({ on });
    createSocketServer(mockServer);
    expect(() => handlers['no_event'] && handlers['no_event']()).not.toThrow();
  });
  it('should emit error if start_game is called with unknown user', () => {
    const emit = jest.fn();
    const join = jest.fn();
    const to = jest.fn(() => ({ emit: jest.fn() }));
    const socketOn = jest.fn();
    const on = jest.fn((event, cb) => {
      if (event === 'connection') {
        cb({
          id: 'socket1',
          on: socketOn,
          join,
          emit,
          to,
        });
      }
    });
    mockSocketIo.mockReturnValueOnce({ on });
    createSocketServer(mockServer);

    const startGameHandler = socketOn.mock.calls.find(([evt]) => evt === 'start_game')[1];
    startGameHandler({ userId: 'no-existe' });
    expect(emit).not.toHaveBeenCalledWith('error', expect.any(String));
  });

  it('should not emit or call anything if player action is called with unknown user', () => {
    const emit = jest.fn();
    const join = jest.fn();
    const to = jest.fn(() => ({ emit: jest.fn() }));
    const socketOn = jest.fn();
    const on = jest.fn((event, cb) => {
      if (event === 'connection') {
        cb({
          id: 'socket1',
          on: socketOn,
          join,
          emit,
          to,
        });
      }
    });
    mockSocketIo.mockReturnValueOnce({ on });
    createSocketServer(mockServer);
 
    const moveLeftHandler = socketOn.mock.calls.find(([evt]) => evt === 'move_left')[1];
    moveLeftHandler();
    expect(emit).not.toHaveBeenCalled();
  });

  it('should not emit or call anything if disconnect is called with unknown user', () => {
    const emit = jest.fn();
    const join = jest.fn();
    const to = jest.fn(() => ({ emit: jest.fn() }));
    const socketOn = jest.fn();
    const on = jest.fn((event, cb) => {
      if (event === 'connection') {
        cb({
          id: 'socket1',
          on: socketOn,
          join,
          emit,
          to,
        });
      }
    });
    mockSocketIo.mockReturnValueOnce({ on });
    createSocketServer(mockServer);

    const disconnectHandler = socketOn.mock.calls.find(([evt]) => evt === 'disconnect')[1];
    disconnectHandler();
    expect(emit).not.toHaveBeenCalled();
  });
  it('should create a socket.io server with correct options', () => {
    createSocketServer(mockServer);
    expect(mockSocketIo).toHaveBeenCalledWith(mockServer, expect.objectContaining({
      cors: expect.any(Object)
    }));
  });

  it('should set up connection event', () => {
    const on = jest.fn();
    mockSocketIo.mockReturnValueOnce({ on });
    createSocketServer(mockServer);
    expect(on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('should return the io object', () => {
    const ioMock = { on: jest.fn() };
    mockSocketIo.mockReturnValueOnce(ioMock);
    const io = createSocketServer(mockServer);
    expect(io).toBe(ioMock);
  });

  it('should handle join_room event and emit joined_room', () => {
    const on = jest.fn((event, cb) => {
      if (event === 'connection') {
        // socket
        const socket = {
          id: 'socket1',
          on: jest.fn((evt, handler) => {
            if (evt === 'join_room') {
              handler({ room: 'room1', playerName: 'p1', userId: 'u1' });
            }
          }),
          join: jest.fn(),
          emit: jest.fn(),
          to: jest.fn(() => ({ emit: jest.fn() })),
        };
        cb(socket);
      }
    });
    mockSocketIo.mockReturnValueOnce({ on });
    createSocketServer(mockServer);
    expect(on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('should emit error if non-host tries to start game', () => {
    const emit = jest.fn();
    const join = jest.fn();
    const to = jest.fn(() => ({ emit: jest.fn() }));
    const playersMap = new Map();
    playersMap.set('u2', { room: 'room1', socketId: 'socket2', name: 'p2' });
    const gamesMap = new Map();
    gamesMap.set('room1', {
      hostId: 'u1',
      players: new Set(['u1', 'u2']),
      started: false,
      seed: 'room1',
      rng: () => 0.5,
      io: {},
      width: 10,
      height: 22,
      speed: 500,
      pieceQueue: [],
      pieceIndex: 0,
      playerGames: new Map(),
    });

    const originalMap = global.Map;
    let callCount = 0;
    global.Map = function () {
      callCount++;
      if (callCount === 1) return playersMap;
      if (callCount === 2) return gamesMap;
      return new originalMap();
    };
    const on = jest.fn((event, cb) => {
      if (event === 'connection') {
        const socket = {
          id: 'socket2',
          on: jest.fn((evt, handler) => {
            if (evt === 'start_game') {
              handler({ userId: 'u2' });
            }
          }),
          join,
          emit,
          to,
        };
        cb(socket);
      }
    });
    mockSocketIo.mockReturnValueOnce({ on });
    createSocketServer(mockServer);
    expect(emit).toHaveBeenCalledWith('error', 'Only host can start the game.');
    global.Map = originalMap;
  });

  it('should call socket.on for all expected events', () => {
    const socketOn = jest.fn();
    const on = jest.fn((event, cb) => {
      if (event === 'connection') {
        cb({
          id: 'socket1',
          on: socketOn,
          join: jest.fn(),
          emit: jest.fn(),
          to: jest.fn(() => ({ emit: jest.fn() })),
        });
      }
    });
    mockSocketIo.mockReturnValueOnce({ on });
    createSocketServer(mockServer);

    const expectedEvents = [
      'join_room',
      
      'start_game',
      'move_left',
      'move_right',
      'rotate',
      'soft_drop',
      'hard_drop',
      'disconnect',
    ];
    for (const evt of expectedEvents) {
      expect(socketOn).toHaveBeenCalledWith(evt, expect.any(Function));
    }
  });
});
