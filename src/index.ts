import Path from "path";
import { buildCss } from "./utils/css.utils";
import { writePage } from "./utils/stream.utils";
import { deleteFolder } from "./utils/files.utils";
import { stringIsFilled } from "./utils/string.utils";
import { injectComponent } from "./utils/component.utils";
import { readFolders, readPages } from "./utils/reader.utils";
import { getPagesOutDir, replaceTags } from "./utils/page.utils";

const staticReactPlugin = (options: any = {}) => {
  return {
    name: "staticReactPlugin",
    setup: (build: any) => {
      const CURRENT_DIR = process.cwd();

      const cssDir = options.css?.dir;
      const store = options.store || null;
      const cssFilename = options.css?.name;
      const pagesDir = buildPath(options.pagesDir);
      const jsOutDir = buildPath(options.jsOutDir);
      const srcDir = buildPath(options.srcDir, CURRENT_DIR);
      const components: Component[] = options.components || [];
      const outDir = buildPath(options.outDir || "build", CURRENT_DIR);

      build.onStart(async () => {
        await deleteFolder(outDir);
        console.log("Create optimized css...");
        await buildCss(cssFilename, cssDir, srcDir, outDir);
      });

      build.onEnd(async () => {
        console.log("Reading pages...");
        const pages = await readPages(Path.resolve(srcDir, pagesDir));

        const folders = await readFolders(
          Path.resolve(outDir, jsOutDir),
          Path.resolve(outDir, cssDir)
        );

        const logs: string[] = [];

        const toWrite = pages.map((page) => {
          for (let component of components) {
            const pageName = Path.basename(page.path);
            const { html, log } = injectComponent(component, page.content, pageName, store);
            if (stringIsFilled(log)) logs.push(log);
            page.content = html;
          }
          page.path = getPagesOutDir(outDir, pagesDir, page.path);
          page.content = replaceTags(page, folders);
          return writePage(page);
        });

        const log = logs.reduce(
          (prev, l, i) => (i === 0 ? l : `${prev}, ${l}`),
          `Injected components:`
        );

        console.log(`${log}`);
        console.log("Creating optimized html...");
        await Promise.all(toWrite);
      });
    },
  };
};

const buildPath = (path: string, currentDir: string | null = null) => {
  if (!stringIsFilled(path)) throw new Error(`Path must be a valid string`);
  return !currentDir ? path : Path.resolve(currentDir, path);
};

export default staticReactPlugin;
