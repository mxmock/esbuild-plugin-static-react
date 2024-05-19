import Path from "path";
import { Dirent, readdir } from "fs";
import { copyFolder } from "./files.utils";
import { streamPage } from "./stream.utils";
import { stringIsFilled } from "./string.utils";

export const readFolder = (dirPath: string): Promise<Dirent[]> => {
  return new Promise((resolve, reject) => {
    readdir(dirPath, { recursive: true, withFileTypes: true }, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
};

export const readFolders = async (
    outDir: string,
    srcDir: string,
    assetsDir: string,
): Promise<Folders> => {
  console.log("Reading folders...");
  console.time("Folders read in");

  const assetsSrc = stringIsFilled(assetsDir) ? Path.resolve(srcDir, assetsDir) : null;
  const assetsOut = stringIsFilled(assetsDir) ? Path.resolve(outDir, assetsDir) : null;

  const assetsSrcFolder = assetsSrc ? await readFolder(assetsSrc) : [];
  const assetsOutFolder = assetsOut ? await readFolder(assetsOut) : [];

  console.timeEnd("Folders read in");
  console.log("");
  return { assetsSrcFolder, assetsOutFolder };
};

export const readPages = async (pagesPath: string) => {
  console.log("Reading pages...");
  console.time("Pages read in");
  let pages: Page[] = [];

  try {
    const dirPath = Path.resolve(pagesPath);

    const dirContent = await readFolder(dirPath);
    const pagesPromises = dirContent
        .filter((d) => d.name.includes(".html"))
        .map((d) => {
          const p = Path.resolve(d.path, d.name);
          return streamPage(p);
        });

    pages = await Promise.all(pagesPromises);
    console.timeEnd("Pages read in");
    console.log("");
  } catch (e) {
    console.error(e);
  }
  return pages;
};

export const copyAssets = async (assetsDir: string, srcDir: string, outDir: string) => {
  if (!stringIsFilled(assetsDir)) return;
  console.log("Copying assets...");
  console.time("Assets copied in");
  await copyFolder(Path.resolve(srcDir, assetsDir), Path.resolve(outDir, assetsDir));
  console.timeEnd("Assets copied in");
  console.log("");
};
