import Prism from "prismjs";

// Import required Prism language components in dependency order
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

// Configure Prism markup to support Vue SFCs: TypeScript inlined in script tags,
// Vue template directives (@click, :prop, v-model, etc.), and {{ interpolation }}
const markupGrammar = Prism.languages.markup as any;
if (markupGrammar && markupGrammar.tag) {
  // Inlined script tags highlighted with typescript grammar
  markupGrammar.tag.addInlined("script", "typescript");
  markupGrammar.tag.addInlined("style", "css");

  // Vue directive attributes (@click, :prop, v-model, v-if, etc.)
  markupGrammar.tag.addAttribute(/(?:@|:|v-)[^\s=]+/.source, "typescript");

  // Template interpolation {{ expression }}
  Prism.languages.insertBefore("markup", "tag", {
    "template-interpolation": {
      pattern: /\{\{[\s\S]*?\}\}/,
      inside: {
        "interpolation-punctuation": {
          pattern: /^\{\{|\}\}$/,
          alias: "punctuation",
        },
        expression: {
          pattern: /[\s\S]+/,
          inside: Prism.languages.typescript,
        },
      },
    },
  });

  Prism.languages.vue = Prism.languages.markup;
}

export type SupportedLanguage =
  | "typescript"
  | "ts"
  | "tsx"
  | "javascript"
  | "js"
  | "jsx"
  | "vue"
  | "html"
  | "markup"
  | "bash"
  | "sh"
  | "shell"
  | "json";

const languageMap: Record<string, string> = {
  ts: "typescript",
  typescript: "typescript",
  tsx: "tsx",
  js: "javascript",
  javascript: "javascript",
  jsx: "jsx",
  vue: "vue",
  html: "markup",
  markup: "markup",
  xml: "markup",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  json: "json",
};

/**
 * Highlights a given code string into HTML containing Prism token classes.
 */
export function highlightCode(code: string, language = "typescript"): string {
  if (!code) return "";
  const normalizedLang = languageMap[language.toLowerCase()] || "typescript";
  const grammar = Prism.languages[normalizedLang] || Prism.languages.typescript || Prism.languages.javascript;

  if (!grammar) {
    // Fallback: escape basic HTML characters
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return Prism.highlight(code, grammar, normalizedLang);
}
