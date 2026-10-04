import { config as accepted } from './wdio.studio3.conf.mjs';
export const config = { ...accepted, specs: [new URL('./studio35.spec.mjs', import.meta.url).pathname], mochaOpts: { timeout: 1800000 } };
