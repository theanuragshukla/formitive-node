import fs from 'fs';

interface Word {
  content: string;
}

interface FieldKey {
  words: Word[];
}

interface FormElement {
  fieldKey?: FieldKey;
  words?: Word[];
  rect?: number[];
}

interface Page {
  formElements: FormElement[];
}

interface Data {
  pages: Page[];
}

interface ParsedElement {
  id: string;
  key: string;
  data: string;
  rect: number[];
}

function parseKv(jsonPath: string): ParsedElement[][] {
  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const data: Data = JSON.parse(fileData);
  
  const result: ParsedElement[][] = [];
  
  for (let idx = 0; idx < data.pages?.length || 0; idx++) {
    const page = data.pages[idx];
    const pageResult: ParsedElement[] = [];
    
    for (let elemIdx = 0; elemIdx < page.formElements?.length || 0; elemIdx++) {
      const element = page.formElements[elemIdx];
      
      if (element.fieldKey) {
        const key = element.fieldKey.words
          ?.map(word => word.content)
          .join(" ") || "";
        
        const dataContent = element.words
          ?.map(word => word.content)
          .join(" ") || "";
        
        const rect = element.rect || [];
        
        pageResult.push({
          id: `p${idx}_${elemIdx}`,
          key: key,
          data: dataContent,
          rect: rect
        });
      }
    }
    
    result.push(pageResult);
  }
  
  return result;
}
export default parseKv;
