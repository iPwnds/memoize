declare module "react-syntax-highlighter/dist/esm/prism-light" {
  import type { ComponentType } from "react";
  import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps> & {
    registerLanguage: (name: string, lang: unknown) => void;
  };
  export default SyntaxHighlighter;
}

declare module "react-syntax-highlighter/dist/esm/languages/prism/python" {
  const python: unknown;
  export default python;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  const oneDark: Record<string, Record<string, unknown>>;
  export { oneDark };
}
