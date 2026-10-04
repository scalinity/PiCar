// The locked V40 assembly booklet's location and exact bytes (SHA-256), with no PDF library attached, so records and
// tests can name it without loading a renderer.
export const V40_PDF_URL = '/content/pdf/picar-x-assembly.pdf';
export const V40_PDF_SHA256 = '2f4ea3ae3729bfb6bc92f8fdba30f31937f9df2c3a80e5774ef03fb076f386ce';
// Every page in these exact locked bytes has this MediaBox (points).
export const V40_PDF_PAGE_SIZE = [1122.52, 793.701] as const;
