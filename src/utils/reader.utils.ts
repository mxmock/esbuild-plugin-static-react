import Path from "path";
import { Dirent, readdir } from "fs";
import { streamPage } from "./stream.utils";

export const readFolder = (dirPath: string): Promise<Dirent[]> => {
  return new Promise((resolve, reject) => {
    readdir(dirPath, { recursive: true, withFileTypes: true }, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
};

export const readFolders = async (jsOutDir: string, cssOutDir: string) => {
  const jsFolder = await readFolder(jsOutDir);
  const cssFolder = await readFolder(cssOutDir);
  return { jsFolder, cssFolder };
};

export const readPages = async (pagesPath: string) => {
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
  } catch (e) {
    console.error(e);
  } finally {
    return pages;
  }
};
