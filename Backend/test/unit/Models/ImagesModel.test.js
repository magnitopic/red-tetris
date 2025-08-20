import { jest } from '@jest/globals';

let imagesModel;

beforeAll(async () => {
  await jest.unstable_mockModule('../../../src/Utils/dataBaseConnection.js', () => ({
    default: { query: jest.fn() }
  }));
  imagesModel = (await import('../../../src/Models/ImagesModel.js')).default;
});

describe('ImagesModel', () => {
  it('should be an instance of ImagesModel and Model', () => {
    expect(imagesModel).toBeDefined();
    expect(imagesModel.constructor.name).toBe('ImagesModel');
    expect(Object.getPrototypeOf(imagesModel).constructor.name).toBe('ImagesModel');
    expect(imagesModel.table).toBe('images');
  });
});
