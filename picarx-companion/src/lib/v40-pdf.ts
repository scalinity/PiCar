// The locked V40 assembly booklet, loaded once and only when its bytes are the verified ones. Shared by the Setup
// reference viewer and the Assembly Studio manual panel; it imports no persistence, so the Studio can use it.
import { bytesToHex } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { V40_PDF_SHA256, V40_PDF_URL } from './v40-pdf-identity';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export { V40_PDF_SHA256, V40_PDF_URL };

// Lazy per-URL document cache; loading starts on first use, not at module import.
const docCache = new Map<string, Promise<PDFDocumentProxy>>();
export const loadV40Pdf = (url: string = V40_PDF_URL): Promise<PDFDocumentProxy> => {
  let p = docCache.get(url);
  if (!p) {
    p = (async () => {
      if (url !== V40_PDF_URL) throw Error('UNLOCKED_PDF');
      const response = await fetch(url); if (!response.ok) throw Error('PDF_UNAVAILABLE');
      const data = new Uint8Array(await response.arrayBuffer());
      if (bytesToHex(sha256(data)) !== V40_PDF_SHA256) throw Error('V40_PDF_HASH');
      return pdfjs.getDocument({ data }).promise;
    })();
    docCache.set(url, p);
  }
  return p;
};
export const forgetV40Pdf = (url: string = V40_PDF_URL): void => { docCache.delete(url); };
