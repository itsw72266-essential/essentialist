const originalWarn = console.warn.bind(console);

const ignoredWarnings = [
  "[baseline-browser-mapping] The data in this module is over two months old",
  "Browserslist: browsers data (caniuse-lite) is",
];

console.warn = (...args) => {
  const message = args
    .map((arg) => (arg instanceof Error ? arg.message : String(arg)))
    .join(" ");

  if (ignoredWarnings.some((warning) => message.includes(warning))) {
    return;
  }

  originalWarn(...args);
};
