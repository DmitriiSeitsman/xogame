/// <reference types="vite/client" />

declare module "*.svg?raw" {
  const content: string;
  export default content;
}

interface Window {
  ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  /** Defined inline in index.html; loads Metrika once consent is given. */
  __xoLoadMetrika?: () => void;
  __xoMetrikaLoaded?: boolean;
}
