const { client } = require("../config/redisClient");
const clc = require("cli-color");

const clearCacheByPattern = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => client.del(key)));
      console.log(clc.greenBright(`🗑️ Cleared cache for pattern: ${pattern}`));
    } else {
      console.log(
        clc.yellowBright(`⚠️ No cache keys found for pattern: ${pattern}`)
      );
    }
  } catch (error) {
    console.error(clc.redBright("❌ Error clearing cache:", error));
  }
};

module.exports = { clearCacheByPattern };
