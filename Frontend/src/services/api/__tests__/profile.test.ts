import { profileApi } from '../profile';
import apiRequest, { fileUploadRequest } from '../config';

// Mock the config module
jest.mock('../config', () => ({
  __esModule: true,
  default: jest.fn(),
  fileUploadRequest: jest.fn(),
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockFileUploadRequest = fileUploadRequest as jest.MockedFunction<typeof fileUploadRequest>;

describe('profileApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrivateProfile', () => {
    it('should fetch private profile data successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'user123',
          username: 'testuser',
          email: 'test@example.com',
          profile_picture: 'https://example.com/profile.jpg',
        },
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await profileApi.getPrivateProfile('user123');

      expect(mockApiRequest).toHaveBeenCalledWith('users/me');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors when fetching private profile', async () => {
      const mockError = new Error('Network error');
      mockApiRequest.mockRejectedValue(mockError);

      await expect(profileApi.getPrivateProfile('user123')).rejects.toThrow('Network error');
      expect(mockApiRequest).toHaveBeenCalledWith('users/me');
    });

    it('should call correct endpoint regardless of userId parameter', async () => {
      const mockResponse = { success: true, data: {} };
      mockApiRequest.mockResolvedValue(mockResponse);

      // Test with different userIds to ensure endpoint is always 'users/me'
      await profileApi.getPrivateProfile('user123');
      expect(mockApiRequest).toHaveBeenCalledWith('users/me');

      await profileApi.getPrivateProfile('user456');
      expect(mockApiRequest).toHaveBeenCalledWith('users/me');

      await profileApi.getPrivateProfile('');
      expect(mockApiRequest).toHaveBeenCalledWith('users/me');
    });

    it('should handle empty response', async () => {
      mockApiRequest.mockResolvedValue(null);

      const result = await profileApi.getPrivateProfile('user123');

      expect(result).toBeNull();
      expect(mockApiRequest).toHaveBeenCalledWith('users/me');
    });

    it('should handle response without data field', async () => {
      const mockResponse = { success: true };
      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await profileApi.getPrivateProfile('user123');

      expect(result).toEqual(mockResponse);
      expect(mockApiRequest).toHaveBeenCalledWith('users/me');
    });

    it('should handle malformed response', async () => {
      const mockResponse = { unexpected: 'format' };
      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await profileApi.getPrivateProfile('user123');

      expect(result).toEqual(mockResponse);
    });

    it('should handle different error types', async () => {
      // Test with string error
      mockApiRequest.mockRejectedValue('String error');
      await expect(profileApi.getPrivateProfile('user123')).rejects.toBe('String error');

      // Test with object error
      const objectError = { message: 'Object error', code: 500 };
      mockApiRequest.mockRejectedValue(objectError);
      await expect(profileApi.getPrivateProfile('user123')).rejects.toBe(objectError);

      // Test with undefined error
      mockApiRequest.mockRejectedValue(undefined);
      await expect(profileApi.getPrivateProfile('user123')).rejects.toBeUndefined();
    });
  });

  describe('uploadProfilePicture', () => {
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    it('should upload profile picture successfully', async () => {
      const mockResponse = {
        success: true,
        msg: 'Profile picture updated successfully',
        data: {
          profile_picture: 'https://example.com/new-profile.jpg',
        },
      };

      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const result = await profileApi.uploadProfilePicture('user123', mockFile);

      expect(mockFileUploadRequest).toHaveBeenCalledWith(
        'users/user123/profile-picture',
        expect.any(FormData),
        'PUT'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create correct FormData for file upload', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      await profileApi.uploadProfilePicture('user123', mockFile);

      const callArgs = mockFileUploadRequest.mock.calls[0];
      const formData = callArgs[1] as FormData;
      
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('files')).toBe(mockFile);
    });

    it('should use correct endpoint URL with userId', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      await profileApi.uploadProfilePicture('user456', mockFile);

      expect(mockFileUploadRequest).toHaveBeenCalledWith(
        'users/user456/profile-picture',
        expect.any(FormData),
        'PUT'
      );
    });

    it('should use PUT method for upload', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      await profileApi.uploadProfilePicture('user123', mockFile);

      const callArgs = mockFileUploadRequest.mock.calls[0];
      expect(callArgs[2]).toBe('PUT');
    });

    it('should handle upload errors', async () => {
      const mockError = new Error('Upload failed');
      mockFileUploadRequest.mockRejectedValue(mockError);

      await expect(profileApi.uploadProfilePicture('user123', mockFile)).rejects.toThrow('Upload failed');
      
      expect(mockFileUploadRequest).toHaveBeenCalledWith(
        'users/user123/profile-picture',
        expect.any(FormData),
        'PUT'
      );
    });

    it('should handle different file types', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const pngFile = new File(['png content'], 'test.png', { type: 'image/png' });
      const gifFile = new File(['gif content'], 'test.gif', { type: 'image/gif' });

      await profileApi.uploadProfilePicture('user123', pngFile);
      await profileApi.uploadProfilePicture('user123', gifFile);

      expect(mockFileUploadRequest).toHaveBeenCalledTimes(2);
      
      // Check that the correct files were passed
      const firstCall = mockFileUploadRequest.mock.calls[0][1] as FormData;
      const secondCall = mockFileUploadRequest.mock.calls[1][1] as FormData;
      
      expect(firstCall.get('files')).toBe(pngFile);
      expect(secondCall.get('files')).toBe(gifFile);
    });

    it('should handle large files', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const largeFile = new File(['x'.repeat(1000000)], 'large.jpg', { type: 'image/jpeg' });

      await profileApi.uploadProfilePicture('user123', largeFile);

      const callArgs = mockFileUploadRequest.mock.calls[0];
      const formData = callArgs[1] as FormData;
      
      expect(formData.get('files')).toBe(largeFile);
    });

    it('should handle special characters in userId', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const specialUserId = 'user@123_test!';

      await profileApi.uploadProfilePicture(specialUserId, mockFile);

      expect(mockFileUploadRequest).toHaveBeenCalledWith(
        'users/user@123_test!/profile-picture',
        expect.any(FormData),
        'PUT'
      );
    });

    it('should handle empty userId', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      await profileApi.uploadProfilePicture('', mockFile);

      expect(mockFileUploadRequest).toHaveBeenCalledWith(
        'users//profile-picture',
        expect.any(FormData),
        'PUT'
      );
    });

    it('should handle server error responses', async () => {
      const serverError = {
        response: {
          status: 413,
          data: { message: 'File too large' }
        }
      };

      mockFileUploadRequest.mockRejectedValue(serverError);

      await expect(profileApi.uploadProfilePicture('user123', mockFile)).rejects.toBe(serverError);
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockFileUploadRequest.mockRejectedValue(timeoutError);

      await expect(profileApi.uploadProfilePicture('user123', mockFile)).rejects.toThrow('Request timeout');
    });

    it('should handle API response without success field', async () => {
      const mockResponse = { msg: 'Profile updated' };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const result = await profileApi.uploadProfilePicture('user123', mockFile);

      expect(result).toEqual(mockResponse);
    });

    it('should handle null response from upload', async () => {
      mockFileUploadRequest.mockResolvedValue(null);

      const result = await profileApi.uploadProfilePicture('user123', mockFile);

      expect(result).toBeNull();
    });
  });

  describe('FormData handling', () => {
    it('should append file with correct key name', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      await profileApi.uploadProfilePicture('user123', testFile);

      const callArgs = mockFileUploadRequest.mock.calls[0];
      const formData = callArgs[1] as FormData;
      
      // Verify the file is appended with the key 'files'
      expect(formData.get('files')).toBe(testFile);
      expect(formData.get('file')).toBeNull(); // Should not be 'file'
    });

    it('should create new FormData instance for each call', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      await profileApi.uploadProfilePicture('user123', file1);
      await profileApi.uploadProfilePicture('user456', file2);

      expect(mockFileUploadRequest).toHaveBeenCalledTimes(2);

      const firstFormData = mockFileUploadRequest.mock.calls[0][1] as FormData;
      const secondFormData = mockFileUploadRequest.mock.calls[1][1] as FormData;

      expect(firstFormData.get('files')).toBe(file1);
      expect(secondFormData.get('files')).toBe(file2);
      expect(firstFormData).not.toBe(secondFormData); // Different instances
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined file', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      // TypeScript would prevent this, but testing runtime behavior
      await profileApi.uploadProfilePicture('user123', undefined as any);

      const callArgs = mockFileUploadRequest.mock.calls[0];
      const formData = callArgs[1] as FormData;
      
      // FormData converts undefined to string "undefined"
      expect(formData.get('files')).toBe('undefined');
    });

    it('should handle concurrent uploads', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      const promise1 = profileApi.uploadProfilePicture('user123', file1);
      const promise2 = profileApi.uploadProfilePicture('user456', file2);

      await Promise.all([promise1, promise2]);

      expect(mockFileUploadRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle very long userIds', async () => {
      const mockResponse = { success: true };
      mockFileUploadRequest.mockResolvedValue(mockResponse);

      const longUserId = 'a'.repeat(1000);
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await profileApi.uploadProfilePicture(longUserId, testFile);

      expect(mockFileUploadRequest).toHaveBeenCalledWith(
        `users/${longUserId}/profile-picture`,
        expect.any(FormData),
        'PUT'
      );
    });
  });
});
