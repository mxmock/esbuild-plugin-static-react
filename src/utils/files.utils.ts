import { rm, cp, mkdir } from "fs";

export const createFolder = (path: string) => {
  return new Promise((resolve, reject) => {
    mkdir(path, { recursive: true }, (err) => {
      if (err) reject(err.message);
      resolve("Create folder ok");
    });
  });
};

export const deleteFolder = (path: string) => {
  return new Promise((resolve, reject) => {
    rm(path, { recursive: true, force: true }, (err) => {
      if (err) reject(err.message);
      resolve("Delete ok");
    });
  });
};

export const copyFolder = (from: string, to: string) => {
  return new Promise((resolve, reject) => {
    cp(from, to, { recursive: true }, (err) => {
      if (err) reject(err.message);
      resolve("Copy ok");
    });
  });
};
