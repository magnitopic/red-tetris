import { jest } from '@jest/globals';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// --- MOCKS ---
const mockDb = { query: jest.fn() };
jest.unstable_mockModule('../../../src/Utils/dataBaseConnection.js', () => ({
  default: mockDb,
}));

const ModelModule = await import('../../../src/Core/Model.js');
const Model = ModelModule.default || ModelModule;

// --- TESTS ---
describe('Model', () => {
  let model;
  beforeEach(() => {
    model = new Model('test_table');
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all rows', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
      const result = await model.getAll();
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
    it('should return [] if no rows', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.getAll();
      expect(result).toEqual([]);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.getAll();
      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return row by id', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await model.getById({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });
    it('should return [] if not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.getById({ id: 1 });
      expect(result).toEqual([]);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.getById({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert and return row', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await model.create({ input: { name: 'foo' } });
      expect(result).toEqual({ id: 1 });
    });
    it('should return [] if no row returned', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.create({ input: { name: 'foo' } });
      expect(result).toEqual([]);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.create({ input: { name: 'foo' } });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return row', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await model.update({ input: { name: 'foo' }, id: 1 });
      expect(result).toEqual({ id: 1 });
    });
    it('should return [] if no row updated', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.update({ input: { name: 'foo' }, id: 1 });
      expect(result).toEqual([]);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.update({ input: { name: 'foo' }, id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('createOrUpdate', () => {
    it('should insert or update and return row', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await model.createOrUpdate({ input: { name: 'foo' }, keyName: 'name' });
      expect(result).toEqual({ id: 1 });
    });
    it('should return [] if no row returned', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.createOrUpdate({ input: { name: 'foo' }, keyName: 'name' });
      expect(result).toEqual([]);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.createOrUpdate({ input: { name: 'foo' }, keyName: 'name' });
      expect(result).toBeNull();
    });
  });

  describe('updateByReference', () => {
    it('should update and return rows', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await model.updateByReference({ name: 'foo' }, { id: 1 });
      expect(result).toEqual([{ id: 1 }]);
    });
    it('should return [] if no row updated', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.updateByReference({ name: 'foo' }, { id: 1 });
      expect(result).toEqual([]);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.updateByReference({ name: 'foo' }, { id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true if row deleted', async () => {
      mockDb.query.mockResolvedValue({ rows: [{}] });
      const result = await model.delete({ id: 1 });
      expect(result).toBe(true);
    });
    it('should return false if not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [undefined] });
      const result = await model.delete({ id: 1 });
      expect(result).toBe(false);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.delete({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('deleteByReference', () => {
    it('should return true if row deleted', async () => {
      mockDb.query.mockResolvedValue({ rows: [{}] });
      const result = await model.deleteByReference({ id: 1 });
      expect(result).toBe(true);
    });
    it('should return false if not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [undefined] });
      const result = await model.deleteByReference({ id: 1 });
      expect(result).toBe(false);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.deleteByReference({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('getByReference', () => {
    it('should return rows', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await model.getByReference({ id: 1 });
      expect(result).toEqual([{ id: 1 }]);
    });
    it('should return [] if not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.getByReference({ id: 1 });
      expect(result).toEqual([]);
    });
    it('should return only one record if onlyOneRecord is true', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await model.getByReference({ id: 1 }, true);
      expect(result).toEqual({ id: 1 });
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.getByReference({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return row if found', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await model.findOne({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });
    it('should return [] if not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.findOne({ id: 1 });
      expect(result).toEqual([]);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.findOne({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('countRecordsByReference', () => {
    it('should return count', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ matching_records: '3' }] });
      const result = await model.countRecordsByReference({ id: 1 });
      expect(result).toBe(3);
    });
    it('should return 0 if not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.countRecordsByReference({ id: 1 });
      expect(result).toBe(0);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.countRecordsByReference({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('countRecordsInTable', () => {
    it('should return count', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ count: '5' }] });
      const result = await model.countRecordsInTable();
      expect(result).toBe(5);
    });
    it('should return 0 if not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await model.countRecordsInTable();
      expect(result).toBe(0);
    });
    it('should return null on error', async () => {
      mockDb.query.mockRejectedValue(new Error('fail'));
      const result = await model.countRecordsInTable();
      expect(result).toBeNull();
    });
  });
});
