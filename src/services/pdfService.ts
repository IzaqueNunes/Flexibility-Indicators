import * as pdfjs from 'pdfjs-dist';

// Use unpkg as it mirrors npm structure exactly and is more likely to have the latest version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .filter((item: any) => item.str !== undefined)
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
    
    // Safety break for very long articles to avoid token limits or memory issues
    if (fullText.length > 50000) break; 
  }
  
  return fullText;
}
