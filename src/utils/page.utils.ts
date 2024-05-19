import Path from "path";
import { Dirent } from "fs";

export const getPagesOutDir = (outDir: string, pagesDir: string, pagePath: string) => {
  const pagesIndex = pagePath.indexOf(pagesDir);
  const sliced = pagePath.slice(pagesIndex + pagesDir.length);
  return Path.join(outDir, sliced);
};

const getRelativePath = (url1: string, url2: string) => {
  const relativePath = Path.relative(Path.dirname(url1), Path.dirname(url2));
  return `${relativePath}/${Path.basename(url2)}`;
};

const replaceAssetsPaths = (
    content: string,
    pageSrcPath: string,
    pageOutPath: string,
    assetsSrcFolder: Dirent[],
    assetsOutFolder: Dirent[],
) => {
  let updatedContent = content;

  for (let i = 0; i < assetsSrcFolder.length; i++) {
    const assetSrc = assetsSrcFolder[i];
    const fileName = assetSrc.name;
    const copiedAsset = assetsOutFolder.find((a) => a.name === fileName);

    if (!!copiedAsset && fileName.includes(".") && updatedContent.includes(fileName)) {
      const assetSrcPath = Path.resolve(assetSrc.parentPath || assetSrc.path, assetSrc.name);
      const assetOutPath = Path.resolve(copiedAsset.parentPath || copiedAsset.path, copiedAsset.name);

      const relSrcPath = getRelativePath(pageSrcPath, assetSrcPath);
      const relOutPath = getRelativePath(pageOutPath, assetOutPath);

      updatedContent = updatedContent.replace(relSrcPath, relOutPath);
    }
  }

  return updatedContent;
};

export const replaceTags = (page: Page, pageSrcPath: string, folders: Folders) => {
  const { content, path } = page;
  const { assetsSrcFolder, assetsOutFolder } = folders;

  let updatedContent = removeScriptsAndLinks(content);

  const scripts = assetsOutFolder.reduce(buildScripts(path), "");
  const links = assetsOutFolder.reduce(buildLinks(path), "");

  updatedContent = updatedContent.replace(" </head>", `${links}</head>`);
  updatedContent = updatedContent.replace(" </body>", `${scripts}</body>`);

  return replaceAssetsPaths(updatedContent, pageSrcPath, path, assetsSrcFolder, assetsOutFolder);
};

const removeScriptsAndLinks = (content: string) => {
  const regex =
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<link\b[^>]*?rel="stylesheet"[^>]*?>/gi;
  return content.replace(regex, "");
};

const buildScripts = (pagePath: string) => (prev: string, d: Dirent) => {
  if (!d.name.includes(".js")) return prev;
  const relPath = Path.relative(Path.dirname(pagePath), d.parentPath || d.path);
  const finalPath = Path.join(relPath, d.name);
  const script = `<script defer async src="${finalPath}"></script>`;
  return `${prev}${script} `;
};

const buildLinks = (pagePath: string) => (prev: string, d: Dirent) => {
  if (!d.name.includes(".css")) return prev;
  const relPath = Path.relative(Path.dirname(pagePath), d.parentPath || d.path);
  const finalPath = Path.join(relPath, d.name);
  const link = `<link rel="stylesheet" href="${finalPath}">`;
  return `${prev}${link} `;
};
