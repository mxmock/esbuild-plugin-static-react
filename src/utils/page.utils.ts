import Path from "path";
import { Dirent } from "fs";

export const getPagesOutDir = (outDir: string, pagesDir: string, pagePath: string) => {
  const pagesIndex = pagePath.indexOf(pagesDir);
  const sliced = pagePath.slice(pagesIndex + pagesDir.length);
  return Path.join(outDir, sliced);
};

export const replaceTags = (page: Page, folders: { jsFolder: Dirent[]; cssFolder: Dirent[] }) => {
  const { content, path } = page;
  const { jsFolder, cssFolder } = folders;

  let updatedContent = removeScriptsAndLinks(content);

  const scripts = jsFolder.reduce(buildScripts(path), "");
  const links = cssFolder.reduce(buildLinks(path), "");

  updatedContent = updatedContent.replace(" </head>", `${links}</head>`);
  return updatedContent.replace(" </body>", `${scripts}</body>`);
};

const removeScriptsAndLinks = (content: string) => {
  const regex =
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<link\b[^>]*?rel="stylesheet"[^>]*?>/gi;
  return content.replace(regex, "");
};

const buildScripts = (pagePath: string) => (prev: string, d: Dirent) => {
  const relPath = Path.relative(Path.dirname(pagePath), d.path);
  const finalPath = Path.join(relPath, d.name);
  const script = `<script defer async src="${finalPath}"></script>`;
  return `${prev}${script} `;
};

const buildLinks = (pagePath: string) => (prev: string, d: Dirent) => {
  const relPath = Path.relative(Path.dirname(pagePath), d.path);
  const finalPath = Path.join(relPath, d.name);
  const link = `<link rel="stylesheet" href="${finalPath}">`;
  return `${prev}${link} `;
};
