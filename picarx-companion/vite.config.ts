import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { acquire, readJson, verifyGeneration } from './tools/content-pipeline/publication';
const appRoot=dirname(fileURLToPath(import.meta.url));
const readerPid=Number(process.env.PICAR_PUBLICATION_READER);
const readers=join(appRoot,'.content-publication/readers');
import { readdirSync } from 'node:fs';
if(!readerPid||!existsSync(readers)||!readdirSync(readers).some(n=>readJson(join(readers,n)).pid===readerPid))throw Error('Use the coordinated pnpm dev/build/preview entrypoint');
try {process.kill(readerPid,0);}catch{throw Error('Publication reader is not alive');}
const releaseViteReader=acquire(appRoot,'reader');
process.on('exit',releaseViteReader);
verifyGeneration(appRoot);

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  publicDir: join(appRoot, ".content-publication/safe-public"),

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
