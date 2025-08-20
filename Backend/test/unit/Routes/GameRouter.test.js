import { jest } from '@jest/globals';

const mockGetAllGames = jest.fn();
const mockGetGame = jest.fn();
const mockCreateOrUpdateGame = jest.fn();
await jest.unstable_mockModule('../../../src/Controllers/GameController.js', () => ({
  default: {
    getAllGames: mockGetAllGames,
    getGame: mockGetGame,
    createOrUpdateGame: mockCreateOrUpdateGame,
  },
}));

const GameRouterModule = await import('../../../src/Routes/GameRouter.js');
const GameRouter = GameRouterModule.default;

describe('GameRouter', () => {
  it('should create router with correct routes', () => {
    const router = GameRouter.createRouter();
    const stack = router.stack.map(l => l.route && l.route.path);
    expect(stack).toContain('/');
    expect(stack).toContain('/:seed');
    expect(stack).toContain('/create');
  });
});
