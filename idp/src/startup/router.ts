import { Express, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { UPLOAD_FOLDER } from '../constants';

function getDocJsonStatus(id: string): string {
  return "SUCCESS";
}

const readParsed = async (req: Request, res: Response): Promise<void> => {
  const uid = req.params.uid;
  console.debug(`Reading parsed JSON for ${uid}`);
  
  const id = uid.split('.')[0].split('_')[0];
  
  const jsonPath = path.join(process.cwd(), UPLOAD_FOLDER, `${id}_parsed.json`);
  
  if (!fs.existsSync(jsonPath)) {
    res.status(400).json({
      status: false,
      data: null,
      error: "Invalid UID"
    });
    return;
  }
  
  const jsonStatus = getDocJsonStatus(id);
  if (jsonStatus === "FAILURE") {
    res.status(200).json({
      status: false,
      data: null,
      error: "FAILURE"
    });
    return;
  } else if (jsonStatus !== "SUCCESS") {
    res.status(200).json({
      status: false,
      data: null,
      error: "IN_PROGRESS"
    });
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error reading parsed JSON: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      status: false,
      data: null,
      error: "Error reading JSON file"
    });
  }
};

const routerSetup = (app: Express) => {
  app
    .get("/", async (_: Request, res: Response) => {
      res.json({ status: true, msg: "Alive!" });
    })
    .get("/form_fields/:uid", readParsed);
};

export default routerSetup;
