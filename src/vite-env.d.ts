/// <reference types="vite/client" />

declare module "*.svg?raw" {
  const content: string;
  export default content;
}

interface Window {
  ym?: (counterId: number, method: string, ...args: unknown[]) => void;
}
