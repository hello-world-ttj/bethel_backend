require("dotenv").config();
const redis = require("redis");
const clc = require("cli-color");

let isRedisConnected = false;

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 1000, 10000); // Max delay 10s
      console.log(
        clc.yellowBright(
          `🔄 Redis reconnect attempt #${retries}, next in ${delay}ms`
        )
      );
      return delay;
    },
  },
});

const connectRedis = async () => {
  while (true) {
    try {
      if (!client.isOpen) {
        console.log(clc.cyan("🔌 Attempting to connect to Redis..."));
        await client.connect();
        isRedisConnected = true;
        console.log(clc.greenBright("✅ Redis Connected Successfully!"));
        break;
      }
    } catch (error) {
      isRedisConnected = false;
      console.error(
        clc.redBright(`❌ Redis Connection Failed: ${error.message}`)
      );
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

client.on("error", (error) => {
  isRedisConnected = false;
  console.error(clc.redBright(`❌ Redis Error: ${error.message}`));
});

client.on("end", () => {
  isRedisConnected = false;
  console.warn(
    clc.yellowBright("⚠️ Redis connection closed. Trying to reconnect...")
  );
  connectRedis();
});

client.on("reconnecting", () => {
  isRedisConnected = false;
  console.log(clc.blueBright("🔄 Redis is reconnecting..."));
});

client.on("ready", () => {
  isRedisConnected = true;
  console.log(clc.greenBright("🚀 Redis is ready for use."));
});

module.exports = { client, connectRedis, isRedisConnected };
