const Token = require('../models/Token');

const cleanExpiredTokens = async () => {
  try {
    const result = await Token.deleteMany({ expiresAt: { $lt: new Date() } });
    if (result.deletedCount > 0) {
      console.log(` Cleaned ${result.deletedCount} expired tokens`);
    }
  } catch (err) {
    console.error('Token cleanup failed:', err.message);
  }
};

module.exports = cleanExpiredTokens;
