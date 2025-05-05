import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { UPLOAD_FOLDER } from '../constants';


const SERVER_URL = process.env.SOCKET_SERVER || 'http://localhost:5000';
async function getPdfFromUrl(uuid: string): Promise<string> {
  try {
    console.log(`Downloading UUID: ${uuid}`);
    
    const basePath = path.join(process.cwd(), UPLOAD_FOLDER);
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }
    
    const outputPath = path.join(basePath, `${uuid}.pdf`);
    
    const response = await axios({
      method: 'GET',
      url: `${SERVER_URL}/uploads/${uuid}.pdf`,
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'Accept': 'application/pdf'
      }
    });
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`PDF downloaded and saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error downloading PDF: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

export default getPdfFromUrl;
