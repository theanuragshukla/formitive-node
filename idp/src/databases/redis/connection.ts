import * as redis from "redis";

class RedisClient {
  client: redis.RedisClientType;
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URI || "redis://localhost:6379",
    });
    this.client
      .connect()
      .then(() => {
        console.log("Connected to Redis");
      })
      .catch((err) => {
        console.log(err);
        console.log("Unable to connect to Redis");
      });
  }
}

class Redis {
  private static instance: RedisClient;

  constructor() {
    if (!Redis.instance) {
      Redis.instance = new RedisClient();
    }
  }

  public static getInstance() {
    if (!Redis.instance) Redis.instance = new RedisClient();
    return Redis.instance.client;
  }
  public static newClient() {
    return new RedisClient().client;
  }
}

export default Redis;
