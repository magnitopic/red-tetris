import { jest } from '@jest/globals';

// --- MOCKS ---
const mockGamePlayersModel = {
  getByReference: jest.fn(),
  create: jest.fn(),
  updateByReference: jest.fn(),
  getTopPlayers: jest.fn(),
};
await jest.unstable_mockModule('../../../src/Models/GamePlayersModel.js', () => ({
  default: mockGamePlayersModel,
}));

const GamePlayersControllerModule = await import('../../../src/Controllers/GamePlayersController.js');
const GamePlayersController = GamePlayersControllerModule.default || GamePlayersControllerModule;

describe('GamePlayersController', () => {
  describe('getTopPlayers', () => {
    it('should return 500 if model returns null', async () => {
      mockGamePlayersModel.getTopPlayers.mockResolvedValue(null);
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      await GamePlayersController.getTopPlayers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving Top Players' });
    });
  });
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getPlayerInGame', () => {
    it('should return player if found', async () => {
      req.params = { gameId: 1, userId: 2 };
      mockGamePlayersModel.getByReference.mockResolvedValue({ id: 1 });
      await GamePlayersController.getPlayerInGame(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 404 if not found', async () => {
      mockGamePlayersModel.getByReference.mockResolvedValue(null);
      await GamePlayersController.getPlayerInGame(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Player not found' });
    });
  });

  describe('getPlayersInGame', () => {
    it('should return players if found', async () => {
      req.params = { gameId: 1 };
      mockGamePlayersModel.getByReference.mockResolvedValue([{ id: 1 }]);
      await GamePlayersController.getPlayersInGame(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('should return 404 if not found', async () => {
      mockGamePlayersModel.getByReference.mockResolvedValue(null);
      await GamePlayersController.getPlayersInGame(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'No players found' });
    });
  });

  describe('createGamePlayer', () => {
    it('should return 400 if missing params', async () => {
      req.body = {};
      await GamePlayersController.createGamePlayer(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on error', async () => {
      req.body = { user_id: 1, game_id: 2, score: 100 };
      mockGamePlayersModel.create.mockResolvedValue(null);
      await GamePlayersController.createGamePlayer(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateGamePlayer', () => {
    it('should return 400 if missing params', async () => {
      req.body = {};
      await GamePlayersController.updateGamePlayer(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if not found', async () => {
      req.body = { user_id: 1, game_id: 2, score: 200 };
      mockGamePlayersModel.updateByReference.mockResolvedValue([]);
      await GamePlayersController.updateGamePlayer(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});