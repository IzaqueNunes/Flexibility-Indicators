import * as pdfjs from 'pdfjs-dist';

// Set worker source
// Note: In typical Vite setups, we might need to copy the worker or use a CDN.
// For simplicity in this environment, we'll try to use the build's worker if it's bundled correctly.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
    
    // Safety break for very long articles to avoid token limits or memory issues
    if (fullText.length > 50000) break; 
  }
  
  return fullText;
}
