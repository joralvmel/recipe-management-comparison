declare global {
  interface Window {
    env: {
      USE_BACKEND: string;
      API_URL: string;
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      USE_BACKEND: string;
      API_URL: string;
    }
  }
}

export {};
