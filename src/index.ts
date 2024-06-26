import Path from "path";
import { writePage } from "./utils/stream.utils";
import { deleteFolder } from "./utils/files.utils";
import { stringIsFilled } from "./utils/string.utils";
import { injectComponent } from "./utils/component.utils";
import { getPagesOutDir, replaceTags } from "./utils/page.utils";
import { copyAssets, readFolders, readPages } from "./utils/reader.utils";

const staticReactPlugin = (options: PluginOpts) => {
  return {
    name: "staticReactPlugin",
    setup: (build: any) => {
      const CURRENT_DIR = process.cwd();

      const store = options.store || null;
      const components = options.components || [];
      const pagesDir = buildPath(options.pagesDir);
      const srcDir = buildPath(options.srcDir, CURRENT_DIR);
      const assetsDir = Path.basename(build.initialOptions.outdir);
      const outDir = buildPath(options.outDir || "build", CURRENT_DIR);

      let pages: Page[] = [];

      build.onStart(async () => {
        await deleteFolder(outDir);
        pages = await readPages(Path.resolve(srcDir, pagesDir));
        await copyAssets(assetsDir, srcDir, outDir);
      });

      build.onEnd(async () => {
        const logs: string[] = [];

        const folders = await readFolders(outDir, srcDir, assetsDir);

        const toWrite = pages.map((page) => {
          for (let component of components) {
            const pageName = Path.basename(page.path);
            const { html, log } = injectComponent(component, page.content, pageName, store);
            if (stringIsFilled(log)) logs.push(log);
            page.content = html;
          }
          const pageSrcPath = page.path;
          page.path = getPagesOutDir(outDir, pagesDir, page.path);
          page.content = replaceTags(page, pageSrcPath, folders);
          return writePage(page);
        });

        const log = !logs.length
          ? "No component injected"
          : logs.reduce(
              (prev, l, i) => (i === 0 ? `${prev} ${l}` : `${prev}, ${l}`),
              `Injected components:`
            );

        console.log(`${log}`);
        console.log("");

        console.log("Creating optimized html...");
        console.time("Html files wrote in");
        await Promise.all(toWrite);
        console.timeEnd("Html files wrote in");
        console.log("");
      });
    },
  };
};

const buildPath = (path: string, currentDir: string | null = null) => {
  if (!stringIsFilled(path)) throw new Error(`Path must be a valid string`);
  return !currentDir ? path : Path.resolve(currentDir, path);
};

export default staticReactPlugin;
