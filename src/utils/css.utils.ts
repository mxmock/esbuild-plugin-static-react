import Path from "path";
import * as sass from "sass";
import postcss from "postcss";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import { writeCss } from "./stream.utils";
import { stringIsFilled } from "./string.utils";
import defaultPreset from "cssnano-preset-default";

export const buildCss = async (
  cssFilename: string,
  cssDir: string,
  srcDir: string,
  outDir: string
) => {
  if (!stringIsFilled(cssFilename) || !stringIsFilled(cssDir)) return;
  console.log("Create optimized css...");
  console.time("Css created in");

  const preset = defaultPreset();
  const cssSrcPath = Path.join(srcDir, cssDir, cssFilename);

  try {
    const { css } = await sass.compileAsync(cssSrcPath);

    const optimized = await postcss([cssnano({ preset, plugins: [autoprefixer] })]).process(css, {
      from: undefined,
    });

    const scssToCss = `${Path.basename(cssFilename, ".scss")}.css`;
    const cssOutPath = Path.join(outDir, cssDir, scssToCss);

    await writeCss(cssOutPath, `${optimized.css}`);
    console.timeEnd("Css created in");
    console.log("");
  } catch (e: any) {
    console.error(e.message);
  }
};
