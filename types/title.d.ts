/**
 * Overridden types for vercel/title, because the ones on DefinitelyTyped don't work.
 */
interface TitleOptions {
  special: string[];
}

declare module 'title' {
  function Title(newtitle: string, options?: TitleOptions): string;
  namespace Title {
    function reset(): void;
  }
  export = Title;
}
