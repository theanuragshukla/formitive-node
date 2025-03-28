import { JSON_CHANNEL } from "../constants";
import Redis from "../databases/redis/connection";
import { Socket } from "socket.io-client";
import { downloadAndGenerateJson } from "../utils/extract_formfields";
import { updateStatus } from "../utils/ActivityHelper";
import Semaphore from "../utils/Semaphore";

const redis = Redis.newClient();

const eventConsumer = (socket: Socket) => {
  const MAX_CONCURRENT = 50;
  const semaphore = new Semaphore(MAX_CONCURRENT);
  
  const processMessage = async () => {
    try {
      await semaphore.acquire();
      
      while (true) {
        try {
          const key = await redis.brPop(JSON_CHANNEL, 0);
          const uid = key?.element || "null";
          
          if (!uid) continue;
          
          await updateStatus(uid, "json_status", "IN_PROGRESS");
          const generated = await downloadAndGenerateJson(uid);
          await updateStatus(uid, "json_status", generated ? "SUCCESS" : "FAILURE");
          socket.emit("status_update_from_idp", { 
            uid, 
            status: generated ? "SUCCESS" : "FAILURE", 
            type: "json_status" 
          });
        } catch (error) {
          await updateStatus("null", "json_status", "FAILURE");
          console.error("Error processing message:", error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      semaphore.release();
    }
  };

  for (let i = 0; i < MAX_CONCURRENT; i++) {
    processMessage().catch(error => {
      console.error("Worker error:", error);
      setTimeout(() => processMessage(), 5000);
    });
  }
};

export default eventConsumer;
