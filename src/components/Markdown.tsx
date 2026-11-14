import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import nasm from "react-syntax-highlighter/dist/esm/languages/prism/nasm";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useUiStore } from "../store/uiStore";

// prism-light only highlights languages registered here; any other
// `codeLang` (e.g. "text") still renders, just as plain unhighlighted code.
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("c", c);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("nasm", nasm);

// Card content writes display math as a `$$...$$` line inside a paragraph.
// remark-math only treats `$$` as display (block) math when the fences sit on
// their own lines separated by blank lines — otherwise it renders inline,
// cramming large expressions (e.g. matrices) into running text. Normalize
// such lines into proper display blocks, skipping fenced code.
function normalizeDisplayMath(md: string): string {
  return md
    .split("```")
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(
            /(^|\n)[ \t]*\$\$([\s\S]+?)\$\$[ \t]*(?=\n|$)/g,
            (_, pre: string, body: string) => `${pre}\n$$\n${body.trim()}\n$$\n`,
          ),
    )
    .join("```");
}

export function Markdown({ children }: { children: string }) {
  const dark = useUiStore((s) => s.dark);
  return (
    <div className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none prose-table:text-sm prose-th:bg-slate-100 dark:prose-th:bg-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code(props) {
            const { children, className, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style={oneDark as any}
                language={match[1]}
                PreTag="div"
                customStyle={{ borderRadius: 8, fontSize: "0.85em" }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                {...rest}
                className={`rounded px-1.5 py-0.5 text-[0.9em] ${
                  dark ? "bg-slate-800" : "bg-slate-200"
                }`}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {normalizeDisplayMath(children)}
      </ReactMarkdown>
    </div>
  );
}
