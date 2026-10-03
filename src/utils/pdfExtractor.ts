/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentModel, PDFPageModel, PDFTextItem } from '../types/pdf';

// Dynamically use the correct version from pdfjs-dist for the worker src
// This guarantees that the worker and core library versions match perfectly.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Extracts raw text items with precise page coordinate mappings from any uploaded PDF file.
 */
export async function extractPDFMetadata(file: File): Promise<PDFDocumentModel> {
  const startTime = performance.now();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    
    const pages: PDFPageModel[] = [];
    let totalItemsCount = 0;
    
    // Extract metadata page-by-page
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const items: PDFTextItem[] = textContent.items.map((item: any) => {
        // transform array format: [a, b, c, d, tx, ty]
        // tx = horizontal translation (x coordinate)
        // ty = vertical translation (y coordinate)
        // d = vertical scaling (font height/size)
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4] || 0;
        const y = transform[5] || 0;
        const fontSize = Math.abs(transform[3]) || 12;
        
        return {
          text: item.str || '',
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          width: Number((item.width || 0).toFixed(2)),
          height: Number((item.height || 0).toFixed(2)),
          font: item.fontName || 'Unknown',
          fontSize: Number(fontSize.toFixed(2)),
          transform: transform.map((num: number) => Number(num.toFixed(4)))
        };
      });
      
      totalItemsCount += items.length;
      
      pages.push({
        number: pageNum,
        items
      });
    }
    
    const endTime = performance.now();
    const parsingTimeMs = Number((endTime - startTime).toFixed(2));
    
    return {
      pages,
      pageCount: pdfDoc.numPages,
      itemCount: totalItemsCount,
      parsingTimeMs
    };
  } catch (error: any) {
    console.error('PDF extraction pipeline failed:', error);
    throw new Error(error.message || 'Unknown PDF extraction error');
  }
}
