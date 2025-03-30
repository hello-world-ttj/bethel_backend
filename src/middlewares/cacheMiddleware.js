const { client } = require("../config/redisClient");
const clc = require("cli-color");

const cacheMiddleware = async (req, res, next) => {
  try {
    const key = req.originalUrl;
    const cacheData = await client.get(key);

    if (cacheData) {
      console.log(clc.yellowBright(`⚡ Cache Hit: ${key}`));
      res.set("X-Cache-Status", "HIT");
      return res.status(200).json(JSON.parse(cacheData));
    }

    console.log(clc.redBright(`❌ Cache Miss: ${key}`));
    res.set("X-Cache-Status", "MISS");

    res.sendResponse = res.json;
    res.json = async (body) => {
      await client.setEx(key, 3600, JSON.stringify(body));
      res.sendResponse(body);
    };

    next();
  } catch (error) {
    console.error(clc.redBright("❌ Redis Middleware Error:", error));
    next();
  }
};

module.exports = cacheMiddleware;
