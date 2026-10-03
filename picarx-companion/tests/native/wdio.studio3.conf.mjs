import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const data=fs.realpathSync(process.env.PICAR_M3_TEST_DATA_DIR??'');
if(!data.startsWith(fs.realpathSync(os.tmpdir())+path.sep)||!path.basename(data).startsWith('picar-m3-native-'))throw Error('ISOLATED_TEST_DATA_REQUIRED');
const binary=process.env.PICAR_M3_TEST_BINARY;
if(!binary||!fs.existsSync(binary))throw Error('TEST_BINARY_REQUIRED');
export const config={runner:'local',specs:[new URL('./studio3.spec.mjs',import.meta.url).pathname],maxInstances:1,framework:'mocha',mochaOpts:{timeout:360000},reporters:['spec'],logLevel:'warn',services:[['@wdio/tauri-service',{appBinaryPath:binary,driverProvider:'embedded',startTimeout:60000,commandTimeout:180000,captureBackendLogs:true}]],capabilities:[{browserName:'tauri','tauri:options':{application:binary}}],connectionRetryCount:0,connectionRetryTimeout:180000};
