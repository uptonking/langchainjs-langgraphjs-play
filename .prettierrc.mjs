/** @type {import("prettier").Config} */
const prettierConfig = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  // Line Feed only (\n), common on Linux and macOS as well as inside git repos
  endOfLine: 'lf',
  // Prettier automatically infers the parser from the input file path
  // parser: 'typescript',
};

export default prettierConfig;
