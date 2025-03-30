require("dotenv").config();
const redis = require("redis");
const clc = require("cli-color");

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  retry_strategy: (options) => {
    console.log(clc.yellowBright(`🔄 Redis reconnecting...`));
    return Math.min(options.attempt * 100, 3000);
  },
});

const connectRedis = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
      console.log(clc.greenBright("✅ Redis Connected!"));
    }

    client.on("error", (error) => {
      console.error(
        clc.redBright(`❌ Redis Connection Error: ${error.message}`)
      );
    });

    client.on("end", () => {
      console.warn(clc.yellowBright("⚠️ Redis connection closed."));
    });

    client.on("reconnecting", () => {
      console.log(clc.blueBright("🔄 Redis is reconnecting..."));
    });

    client.on("ready", () => {
      console.log(clc.greenBright("🚀 Redis is ready for use."));
    });
  } catch (error) {
    console.error(clc.redBright(`❌ Redis Connection Error: ${error.message}`));
  }
};

module.exports = { client, connectRedis };
