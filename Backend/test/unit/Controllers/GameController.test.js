import { jest } from '@jest/globals';

// --- MOCKS ---
const mockGameModel = {
  getAll: jest.fn(),
  createOrUpdate: jest.fn(),
  getByReference: jest.fn(),
};
await jest.unstable_mockModule('../../../src/Models/GameModel.js', () => ({
  default: mockGameModel,
}));

const StatusMessage = {
  QUERY_ERROR: 'Query error',
  UNEXPECTED_ERROR: 'Unexpected error',
};

await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: StatusMessage,
  ...StatusMessage,
}));

const GameControllerModule = await import('../../../src/Controllers/GameController.js');
const GameController = GameControllerModule.default || GameControllerModule;

describe('GameController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllGames', () => {
    it('should return 200 and games', async () => {
      mockGameModel.getAll.mockResolvedValue([{ id: 1 }]);
      await GameController.getAllGames(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }] });
    });

    it('should return 500 on error', async () => {
      mockGameModel.getAll.mockResolvedValue(null);
      await GameController.getAllGames(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.QUERY_ERROR });
    });
  });

  describe('createOrUpdateGame', () => {
    it('should return 200 and result', async () => {
      mockGameModel.createOrUpdate.mockResolvedValue({ id: 1 });
      req.body = { game_seed: 'abc' };
      await GameController.createOrUpdateGame(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 500 on error', async () => {
      mockGameModel.createOrUpdate.mockResolvedValue(null);
      await GameController.createOrUpdateGame(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error saving game.' });
    });
  });

  describe('getGame', () => {
    it('should return game if found', async () => {
      req.params.seed = 'abc';
      mockGameModel.getByReference.mockResolvedValue({ game_seed: 'abc' });
      await GameController.getGame(req, res);
      expect(res.json).toHaveBeenCalledWith({ game_seed: 'abc' });
    });

    it('should return 404 if not found', async () => {
      req.params.seed = 'abc';
      mockGameModel.getByReference.mockResolvedValue(null);
      await GameController.getGame(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'No game found' });
    });
  });
});