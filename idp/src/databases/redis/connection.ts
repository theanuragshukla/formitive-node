import * as redis from "redis";

class RedisClient {
  client: redis.RedisClientType;
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URI || "redis://localhost:6379",
      socket: {
         reconnectStrategy: (retries) => {
          console.log(`Reconnecting attempt #${retries}`);
          return Math.min(retries * 500, 5000);
        },
      }
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
