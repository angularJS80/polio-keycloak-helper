type Config = {
    apiBaseUrl: string;
  };
  
  let config: Config = {
    apiBaseUrl: 'http://localhost:8080', // 기본값 제공
  };
  
  export const initConfig = (custom?: Partial<Config>) => {
    config = { ...config, ...custom };
  };
  
  export const getConfig = () => config;
  