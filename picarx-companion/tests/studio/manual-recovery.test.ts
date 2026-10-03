import { beforeEach, expect, it, vi } from 'vitest';
import fs from 'node:fs';
const mocks = vi.hoisted(() => ({ decode: vi.fn(), verify: vi.fn() }));
vi.mock('pdfjs-dist', () => ({ GlobalWorkerOptions: {}, getDocument: (...args: unknown[]) => ({ promise: mocks.decode(...args) }) }));
vi.mock('@noble/hashes/sha256', async (original) => {
  const module = await original<typeof import('@noble/hashes/sha256')>();
  return { sha256: (bytes: Uint8Array) => { mocks.verify(); return module.sha256(bytes); } };
});
import { forgetV40Pdf, loadV40Pdf } from '../../src/lib/v40-pdf';
const bytes = new Uint8Array(fs.readFileSync('public/content/pdf/picar-x-assembly.pdf'));
beforeEach(() => { forgetV40Pdf(); mocks.decode.mockReset(); mocks.verify.mockClear(); });
it('recovers from a failed fetch only on an explicit next attempt, checking locked bytes', async () => {
  const fetch = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  vi.stubGlobal('fetch', fetch);
  mocks.decode.mockResolvedValue({ numPages: 2 });
  await expect(loadV40Pdf()).rejects.toThrow('PDF_UNAVAILABLE');
  expect(fetch).toHaveBeenCalledTimes(1);
  await expect(loadV40Pdf()).resolves.toEqual({ numPages: 2 });
  expect(mocks.verify).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledTimes(2);
  vi.unstubAllGlobals();
});
it('recovers after decode failure and performs SHA verification again', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  vi.stubGlobal('fetch', fetch);
  mocks.decode.mockRejectedValueOnce(Error('decode failed')).mockResolvedValue({ numPages: 2 });
  await expect(loadV40Pdf()).rejects.toThrow('decode failed');
  await expect(loadV40Pdf()).resolves.toEqual({ numPages: 2 });
  expect(mocks.verify).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenCalledTimes(2);
  vi.unstubAllGlobals();
});
it('rejects wrong bytes on retry instead of bypassing SHA verification', async () => {
  const fetch = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer });
  vi.stubGlobal('fetch', fetch);
  await expect(loadV40Pdf()).rejects.toThrow('PDF_UNAVAILABLE');
  await expect(loadV40Pdf()).rejects.toThrow('V40_PDF_HASH');
  expect(mocks.decode).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});
