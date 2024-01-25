import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: [`./docker/dev.js`],
  outfile: `./docker/main.js`,
  bundle: true,
});

await ctx.watch();
console.log("Esbuild is watching for changes. Press Ctrl-C to stop.");
