declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
  }
}