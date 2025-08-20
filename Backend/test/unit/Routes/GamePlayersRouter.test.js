import { jest } from '@jest/globals';

const mockGetTopPlayers = jest.fn();
const mockGetPlayersInGame = jest.fn();
const mockGetPlayerInGame = jest.fn();
const mockCreateGamePlayer = jest.fn();
const mockUpdateGamePlayer = jest.fn();
await jest.unstable_mockModule('../../../src/Controllers/GamePlayersController.js', () => ({
  default: {
    getTopPlayers: mockGetTopPlayers,
    getPlayersInGame: mockGetPlayersInGame,
    getPlayerInGame: mockGetPlayerInGame,
    createGamePlayer: mockCreateGamePlayer,
    updateGamePlayer: mockUpdateGamePlayer,
  },
}));

const GamePlayersRouterModule = await import('../../../src/Routes/GamePlayersRouter.js');
const GamePlayersRouter = GamePlayersRouterModule.default;

describe('GamePlayersRouter', () => {
  it('should create router with correct routes', () => {
    const router = GamePlayersRouter.createRouter();
    const stack = router.stack.map(l => l.route && l.route.path);
    expect(stack).toContain('/top-players');
    expect(stack).toContain('/:gameId');
    expect(stack).toContain('/:gameId/:userId');
    expect(stack).toContain('/');
  });
});
