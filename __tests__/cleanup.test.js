// __tests__/cleanup.test.js
const Token = require('../models/Token');
const cleanup = require('../utils/cleanup');

jest.mock('../models/Token');

describe('Token Cleanup Utility', () => {
  it('should delete expired tokens', async () => {
    const now = new Date();
    const realDate = global.Date;
    global.Date = class extends Date {
      constructor() {
        return now;
      }
    };

    Token.deleteMany.mockResolvedValue({ deletedCount: 3 });

    await cleanup();

    expect(Token.deleteMany).toHaveBeenCalledWith({
      expiresAt: { $lt: now },
    });

    global.Date = realDate;
  });

  it('should handle errors during token cleanup', async () => {
    const error = new Error('DB Error');
    Token.deleteMany.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await cleanup();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Token cleanup failed:'),
      error.message
    );

    consoleSpy.mockRestore();
  });
});
