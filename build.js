#!/usr/bin/env node
const esbuild = require("esbuild");

const [path] = process.argv.slice(2);

const build = async (path) => {
  const r = await esbuild.build({
    entryPoints: [path],
    bundle: true,
    outdir: "./",
    jsx: "automatic",
    loader: { ".js": "jsx" },
    platform: "node",
    packages: "external",
    format: "cjs",
    minify: true,
    legalComments: "none",
    pure: ["console"],
    write: false,
  });
  return String.fromCharCode.apply(null, r.outputFiles[0].contents);
};

build(path)
  .then((result) => {
    console.log(result);
  })
  .catch((e) => {
    console.log(e.message);
  });
