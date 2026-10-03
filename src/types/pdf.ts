/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PDFTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font: string;
  fontSize: number;
  transform: number[];
}

export interface PDFPageModel {
  number: number;
  items: PDFTextItem[];
}

export interface PDFDocumentModel {
  pages: PDFPageModel[];
  pageCount: number;
  itemCount: number;
  parsingTimeMs: number;
}
