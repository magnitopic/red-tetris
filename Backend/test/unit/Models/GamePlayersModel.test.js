import { jest } from '@jest/globals';

// COVERAGE NOTE:
// Jest (in ESM mode) may report 0% branch coverage for this method,
// even though both paths (try and catch) are covered by tests.
// This is a known limitation of Jest+ESM with async/await and does not affect real coverage.
// See: https://github.com/jestjs/jest/issues/9430

let gamePlayersModel;

beforeAll(async () => {
  await jest.unstable_mockModule('../../../src/Utils/dataBaseConnection.js', () => ({
    default: { query: jest.fn().mockResolvedValue({ rows: [] }) }
  }));
  gamePlayersModel = (await import('../../../src/Models/GamePlayersModel.js')).default;
});

describe('GamePlayersModel', () => {
  it('should be an instance of GamePlayersModel and Model', () => {
    expect(gamePlayersModel).toBeDefined();
    expect(gamePlayersModel.constructor.name).toBe('GamePlayersModel');
    expect(Object.getPrototypeOf(gamePlayersModel).constructor.name).toBe('GamePlayersModel');
    expect(gamePlayersModel.table).toBe('game_players');
  });

  it('should return top players from getTopPlayers', async () => {
    // try
    gamePlayersModel.db.query = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await gamePlayersModel.getTopPlayers(2);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should return null and log error if db.query throws', async () => {
    // catch
    gamePlayersModel.db.query = jest.fn().mockRejectedValue(new Error('fail'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await gamePlayersModel.getTopPlayers(2);
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});