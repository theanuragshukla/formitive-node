import fs from 'fs';
import path from 'path';
import { PDFNet } from '@pdftron/pdfnet-node'; 
import { UPLOAD_FOLDER } from '../constants';
import getPdfFromUrl from './getPdfFromUrl';
import parseKv from './parseKv';

export const downloadPDF = async (uuid: string): Promise<boolean> => {
  try {
    await getPdfFromUrl(uuid);
    return true;
  } catch (error) {
    console.error(`Failed to download PDF: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

export async function generatePdf(uuid: string): Promise<boolean> {
  try {
    console.log(`Generating PDF for ${uuid}`);
    const basePath = path.join(process.cwd(), UPLOAD_FOLDER);
    const fname = path.join(basePath, `${uuid}.pdf`);
    const outPdf = path.join(basePath, `${uuid}_out.pdf`);
    const outJson = path.join(basePath, `${uuid}.json`);
    console.log(`PDF: ${fname}`);
    console.log(`JSON: ${outJson}`);
    console.log(`OUT PDF: ${outPdf}`);
    console.debug("Extracting Coords for form fields");
    await PDFNet.DataExtractionModule.extractData(fname, outJson, PDFNet.DataExtractionModule.DataExtractionEngine.e_Form)
    const doc = await PDFNet.PDFDoc.createFromFilePath(fname);
    await PDFNet.DataExtractionModule.detectAndAddFormFieldsToPDF(doc)
    doc.save(outPdf, PDFNet.SDFDoc.SaveOptions.e_linearized)
    console.info(`PDF generated for ${uuid}`);
    return true;
  } catch (e) {
    console.log(JSON.stringify(e));
    console.error(`Error generating PDF: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

export async function generateJson(uuid: string): Promise<boolean> {
  try {
    console.log(`Generating JSON for ${uuid}`);
    const basePath = path.join(process.cwd(), UPLOAD_FOLDER);
    const fname = path.join(basePath, `${uuid}.pdf`);
    const kvJson = path.join(basePath, `${uuid}_kv.json`);
    const parsedJson = path.join(basePath, `${uuid}_parsed.json`);
    console.log(`PDF: ${fname}`);
    console.log(`JSON: ${kvJson}`);
    console.log(`Parsed JSON: ${parsedJson}`);
    console.debug("Extracting key-value pairs from JSON");
    await PDFNet.DataExtractionModule.extractData(fname, kvJson, PDFNet.DataExtractionModule.DataExtractionEngine.e_FormKeyValue);
    
    console.debug("Parsing key-value pairs");
    const parsed = parseKv(kvJson);
    
    fs.writeFileSync(parsedJson, JSON.stringify(parsed));
    
    console.info(`JSON generated for ${uuid}`);
    return true;
  } catch (e) {
    console.log(JSON.stringify(e));
    console.error(`Error generating JSON: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}
