import { Express, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { JSON_CHANNEL, PDF_CHANNEL, SAMPLES_FOLDER, UPLOAD_FOLDER } from "../constants";
import multer from "multer";
import { randomUUID } from "crypto";
import Redis from "../databases/redis/connection";
import { getDocStatus } from "../utils/ActivityHelper";
import { useTypeORM } from "../databases/postgres/typeorm";
import { DocumentEntity } from "../databases/postgres/entity/document.entity";

const redis = Redis.newClient();

const upload = multer({
  dest: UPLOAD_FOLDER,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join(process.cwd(), UPLOAD_FOLDER);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const uid = randomUUID();
      const ext = path.extname(file.originalname);
      cb(null, `${uid}${ext}`);
    },
  }),
});

function getDocJsonStatus(id: string): string {
  return "SUCCESS";
}

const readParsed = async (req: Request, res: Response): Promise<void> => {
  const uid = req.params.uid;
  console.debug(`Reading parsed JSON for ${uid}`);

  const id = uid.split(".")[0].split("_")[0];

  const jsonPath = path.join(process.cwd(), UPLOAD_FOLDER, `${id}_parsed.json`);

  if (!fs.existsSync(jsonPath)) {
    res.status(400).json({
      status: false,
      data: null,
      error: "Invalid UID",
    });
    return;
  }

  const jsonStatus = getDocJsonStatus(id);
  if (jsonStatus === "FAILURE") {
    res.status(200).json({
      status: false,
      data: null,
      error: "FAILURE",
    });
    return;
  } else if (jsonStatus !== "SUCCESS") {
    res.status(200).json({
      status: false,
      data: null,
      error: "IN_PROGRESS",
    });
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    res.status(200).json({
      status: true,
      data: data, 
      error: null,
    });
  } catch (error) {
    console.error(
      `Error reading parsed JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    res.status(500).json({
      status: false,
      data: null,
      error: "Error reading JSON file",
    });
  }
};

const routerSetup = (app: Express) => {
  app
    .get("/", async (_: Request, res: Response) => {
      res.json({ status: true, msg: "Alive!" });
    })
    .post(
      "/upload",
      upload.single("file"),
      async (req: Request, res: Response) => {
        const fName = req.file?.filename;
        if (!fName) {
          return res.status(400).json({
            status: false,
            data: null,
            error: "File upload failed",
          });
        }
        const uid = fName.split(".")[0];
        await useTypeORM(DocumentEntity).insert({
          uid,
          original_name: req.file?.originalname,
        })
        await redis.lPush(PDF_CHANNEL, uid);
        await redis.lPush(JSON_CHANNEL, uid);
        res.status(200).json({
          status: true,
          data: { uid },
          error: null,
        });
      }
    )
    .get("/uploads/:uid", async (req: Request, res: Response) => {
      try {
        const uid = req.params.uid;
        console.log(`Reading PDF for ${uid}`);

        const id = uid.split(".")[0].split("_")[0];
        const filePath = path.join(process.cwd(), UPLOAD_FOLDER, `${id}.pdf`);

        console.log(`File path: ${filePath}`);

        if (!fs.existsSync(filePath)) {
          console.log(`File not found: ${filePath}`);
          return res
            .status(400)
            .json({ status: false, data: null, error: "Invalid UID" });
        }

        const { pdf_status, json_status } = await getDocStatus(id);

        if (pdf_status === "FAILURE") {
          return res
            .status(200)
            .json({ status: false, data: null, error: "Processing failed" });
        } else if (!["SUCCESS", "FAILURE"].includes(pdf_status)) {
          console.log(`Processing still in progress for ${id}`);
          return res.status(200).json({
            status: false,
            data: null,
            error: "Processing is still in progress",
          });
        }

        const dirPath = path.join(process.cwd(), UPLOAD_FOLDER);

        if (uid.includes(".")) {
          return res.sendFile(path.join(dirPath, uid));
        } else {
          return res.sendFile(path.join(dirPath, `${uid}.pdf`));
        }
      } catch (error) {
        console.error("Error processing request:", error);
        res
          .status(500)
          .json({ status: false, data: null, error: "Internal Server Error" });
      }
    })
    .get("/samples/:uid", async (req: Request, res: Response) => {
       try {
        const uid = req.params.uid;
        console.log(`Reading sample PDF for ${uid}`);
        
        const filePath = path.join(process.cwd(), UPLOAD_FOLDER, SAMPLES_FOLDER , uid);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return res.status(400).json({ status: false, data: null, error: 'Invalid UID' });
        }

        // Serve the file as an attachment
        return res.download(filePath, uid, (err) => {
            if (err) {
                console.error(`Error sending file: ${err.message}`);
                res.status(500).json({ status: false, data: null, error: 'Failed to send file' });
            }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ status: false, data: null, error: 'Internal Server Error' });
    }
    })
    .get("/form_fields/:uid", readParsed)
  .post("/feedback", async (req: Request, res: Response) => {
    return res.json({ status: true, msg: "Feedback received!", data: { original_name: "download"}});
  })
};

export default routerSetup;
