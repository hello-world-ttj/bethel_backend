require("dotenv").config();
const redis = require("redis");
const clc = require("cli-color");
let isRedisConnected = false;
const client = redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: (options) => {
    console.log(clc.yellowBright(`🔄 Redis reconnecting...`));
    return Math.min(options.attempt * 100, 3000);
  },
});

const connectRedis = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
      isRedisConnected = true;
      console.log(clc.greenBright("✅ Redis Connected!"));
    }

    client.on("error", (error) => {
      isRedisConnected = false;
      console.error(
        clc.redBright(`❌ Redis Connection Error: ${error.message}`)
      );
    });

    client.on("end", () => {
      isRedisConnected = false;
      console.warn(clc.yellowBright("⚠️ Redis connection closed."));
    });

    client.on("reconnecting", () => {
      isRedisConnected = false;
      console.log(clc.blueBright("🔄 Redis is reconnecting..."));
    });

    client.on("ready", () => {
      isRedisConnected = true;
      console.log(clc.greenBright("🚀 Redis is ready for use."));
    });
  } catch (error) {
    isRedisConnected = false;
    console.error(clc.redBright(`❌ Redis Connection Error: ${error.message}`));
  }
};

module.exports = { client, connectRedis, isRedisConnected };
