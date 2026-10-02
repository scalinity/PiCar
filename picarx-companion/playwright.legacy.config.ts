import config from './playwright.config';
export default {...config,testMatch:['**/preservation.spec.ts','**/*.legacy.spec.ts'],testIgnore:[],webServer:{...config.webServer,env:{VITE_M3_ENABLED:'0'}}};
