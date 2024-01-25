import Path from "path";
import { minify } from "html-minifier-terser";
import { createFolder } from "./files.utils";
import { ReadStream, WriteStream, createReadStream, createWriteStream } from "fs";

export const readStream = (
  stream: ReadStream,
  encoding: BufferEncoding = "utf8"
): Promise<string> => {
  stream.setEncoding(encoding);
  return new Promise((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk) => {
      data += chunk;
      // console.log(`${data.length} octets read...`);
    });
    stream.on("end", () => resolve(data));
    stream.on("error", (e) => reject(e));
  });
};

export const writeStream = (stream: WriteStream, data: string): Promise<string> => {
  stream.write(data);
  stream.end();
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve("Write stream finish"));
    stream.on("error", (e) => reject(e.message));
  });
};

export const streamPage = async (path: string): Promise<Page> => {
  let content: string = "";

  try {
    const stream = createReadStream(path, { highWaterMark: 100 });
    const c = await readStream(stream);
    content = await minify(c, {
      caseSensitive: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
    });
  } catch (e: any) {
    console.error(e.message);
  } finally {
    return { path, content };
  }
};

export const writePage = async (page: Page) => {
  try {
    await createFolder(Path.dirname(page.path));
    const stream = createWriteStream(page.path);
    await writeStream(stream, page.content);
  } catch (e: any) {
    console.log(e);
  }
};

export const writeCss = async (path: string, data: string) => {
  try {
    await createFolder(Path.dirname(path));
    const stream = createWriteStream(path);
    await writeStream(stream, data);
  } catch (e) {
    console.log(e);
  }
};
