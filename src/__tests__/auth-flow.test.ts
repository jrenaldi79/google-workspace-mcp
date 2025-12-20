import { runAuthFlow } from '../auth-flow';
import { AuthManager } from '../auth/AuthManager';

// Mock AuthManager
jest.mock('../auth/AuthManager');

// Mock console methods
const consoleMock = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

// Mock process.exit
const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('Process exited');
});

describe('Auth Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleMock.log.mockClear();
    consoleMock.error.mockClear();
    exitMock.mockClear();
  });

  afterAll(() => {
    consoleMock.log.mockRestore();
    consoleMock.error.mockRestore();
    exitMock.mockRestore();
  });

  describe('runAuthFlow()', () => {
    it('should print helpful message about OAuth Advanced button', async () => {
      const mockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
      mockAuthManager.prototype.clearAuth = jest.fn().mockResolvedValue(undefined);
      mockAuthManager.prototype.getAuthenticatedClient = jest.fn().mockResolvedValue({});

      try {
        await runAuthFlow();
      } catch (_) {
        // Process.exit throws, which is expected
        void _;
      }

      expect(consoleMock.log).toHaveBeenCalledWith(expect.stringContaining('Advanced'));
    });

    it('should clear cached credentials before attempting fresh auth', async () => {
      const mockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
      const clearAuthMock = jest.fn().mockResolvedValue(undefined);
      mockAuthManager.prototype.clearAuth = clearAuthMock;
      mockAuthManager.prototype.getAuthenticatedClient = jest.fn().mockResolvedValue({});

      try {
        await runAuthFlow();
      } catch (_) {
        // Process.exit throws, which is expected
        void _;
      }

      expect(clearAuthMock).toHaveBeenCalled();
    });

    it('should call getAuthenticatedClient after clearing cache', async () => {
      const mockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
      mockAuthManager.prototype.clearAuth = jest.fn().mockResolvedValue(undefined);
      const getClientMock = jest.fn().mockResolvedValue({});
      mockAuthManager.prototype.getAuthenticatedClient = getClientMock;

      try {
        await runAuthFlow();
      } catch (_) {
        // Process.exit throws, which is expected
        void _;
      }

      expect(getClientMock).toHaveBeenCalled();
    });

    it('should exit with code 0 on successful authentication', async () => {
      const mockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
      mockAuthManager.prototype.clearAuth = jest.fn().mockResolvedValue(undefined);
      mockAuthManager.prototype.getAuthenticatedClient = jest.fn().mockResolvedValue({});

      try {
        await runAuthFlow();
      } catch (_) {
        // Expected
        void _;
      }

      expect(exitMock).toHaveBeenCalledWith(0);
    });

    it('should handle null client from getAuthenticatedClient', async () => {
      const mockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
      mockAuthManager.prototype.clearAuth = jest.fn().mockResolvedValue(undefined);
      mockAuthManager.prototype.getAuthenticatedClient = jest.fn().mockResolvedValue(null);

      try {
        await runAuthFlow();
      } catch (_) {
        // Expected to throw
        void _;
      }

      expect(consoleMock.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to obtain authenticated client')
      );
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should exit with code 1 on authentication error', async () => {
      const mockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
      mockAuthManager.prototype.clearAuth = jest.fn().mockRejectedValue(new Error('Auth failed'));

      try {
        await runAuthFlow();
      } catch (_) {
        // Expected
        void _;
      }

      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should print success message on successful authentication', async () => {
      const mockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
      mockAuthManager.prototype.clearAuth = jest.fn().mockResolvedValue(undefined);
      mockAuthManager.prototype.getAuthenticatedClient = jest.fn().mockResolvedValue({});

      try {
        await runAuthFlow();
      } catch (_) {
        // Expected
        void _;
      }

      expect(consoleMock.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ Authentication successful')
      );
    });

    it('should print error message on failure', async () => {
      const mockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
      mockAuthManager.prototype.clearAuth = jest.fn().mockRejectedValue(new Error('OAuth failed'));

      try {
        await runAuthFlow();
      } catch (_) {
        // Expected
        void _;
      }

      expect(consoleMock.error).toHaveBeenCalledWith(
        expect.stringContaining('Authentication failed')
      );
    });
  });
});
