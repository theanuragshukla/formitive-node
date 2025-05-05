import { JSON_CHANNEL, PDF_CHANNEL, STATUS_KEY } from "../constants";
import Redis from "../databases/redis/connection";
import { generateJson, generatePdf } from "../utils/extract_formfields";
import { updateStatus } from "../utils/ActivityHelper";

export const pdfConsumer = (io: any) => {
  console.log("PDF Consumer started");
  const MAX_CONCURRENT = 3; // Increased for PDF processing
  
  // Launch multiple independent workers
  for (let i = 0; i < MAX_CONCURRENT; i++) {
    const redisClient = Redis.newClient();
    const workerId = `pdf-worker-${i}`;
    
    console.log(`Starting ${workerId}`);
    
    const processMessages = async () => {
      while (true) {
        try {
          // Block until we get a message from the queue
          const key = await redisClient.brPop(PDF_CHANNEL, 0);
          const uid = key?.element || "null";
          
          if (!uid) continue;
          
          const startTime = Date.now();
          console.log(`${workerId} processing PDF for UID: ${uid}`);
          await updateStatus(uid, STATUS_KEY.PDF, "IN_PROGRESS");
          
          const generated = await generatePdf(uid);
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.log(`${workerId} completed PDF for ${uid} in ${duration}ms`);
          
          const status = generated ? "SUCCESS" : "FAILURE";
          await updateStatus(uid, STATUS_KEY.PDF, status);
          io.to(uid).emit("status", { 
            uid, 
            status, 
            type: STATUS_KEY.PDF 
          });
        } catch (error) {
          console.error(`${workerId} error:`, error);
          // Brief pause before retrying after an error
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };
    
    // Start the worker with error recovery
    processMessages().catch(error => {
      console.error(`${workerId} fatal error:`, error);
      setTimeout(() => processMessages(), 5000);
    });
  }
};

export const jsonConsumer = (io: any) => {
  console.log("JSON Consumer started");
  const MAX_CONCURRENT = 2;
  
  // Launch multiple independent workers
  for (let i = 0; i < MAX_CONCURRENT; i++) {
    const redisClient = Redis.newClient();
    const workerId = `json-worker-${i}`;
    
    console.log(`Starting ${workerId}`);
    
    const processMessages = async () => {
      while (true) {
        try {
          // Block until we get a message from the queue
          const key = await redisClient.brPop(JSON_CHANNEL, 0);
          const uid = key?.element || "null";
          
          if (!uid) continue;
          
          const startTime = Date.now();
          console.log(`${workerId} processing JSON for UID: ${uid}`);
          await updateStatus(uid, STATUS_KEY.JSON, "IN_PROGRESS");
          
          const generated = await generateJson(uid);
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.log(`${workerId} completed JSON for ${uid} in ${duration}ms`);
          
          const status = generated ? "SUCCESS" : "FAILURE";
          await updateStatus(uid, STATUS_KEY.JSON, status);
          io.to(uid).emit("status", { 
            uid, 
            status, 
            type: STATUS_KEY.JSON 
          });
        } catch (error) {
          console.error(`${workerId} error:`, error);
          // Brief pause before retrying after an error
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };
    
    // Start the worker with error recovery
    processMessages().catch(error => {
      console.error(`${workerId} fatal error:`, error);
      setTimeout(() => processMessages(), 5000);
    });
  }
};

// Export a coordinated starter function
export const startConsumers = (io: any) => {
  // Start PDF processor first
  pdfConsumer(io);
  
  // Slight delay before starting JSON workers to give PDF a head start
  setTimeout(() => {
    jsonConsumer(io);
  }, 100);
};
