type Page = {
  path: string;
  content: string;
};

type Component = {
  id: string;
  Content: function;
};

type Folders = {
  jsFolder: Dirent[];
  cssFolder: Dirent[];
  assetsSrcFolder: Dirent[];
  assetsOutFolder: Dirent[];
};
