declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string;
        NODE_ENV: string;
        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
    }
}
