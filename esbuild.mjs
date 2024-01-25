import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: [`./src/index.ts`],
  outfile: `./index.js`,
  bundle: true,
  jsx: "automatic",
  loader: { ".js": "jsx" },
  platform: "node",
  packages: "external",
  minify: true,
  legalComments: "none",
  pure: ["console"],
});
