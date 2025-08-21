// Mock config module to avoid import.meta issues
const mockApiRequest = jest.fn();
const mockFileUploadRequest = jest.fn();

export default mockApiRequest;
export { mockFileUploadRequest as fileUploadRequest };
