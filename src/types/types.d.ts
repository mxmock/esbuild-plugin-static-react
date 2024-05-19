interface PluginOpts {
  store: any;
  srcDir: string;
  outDir?: string;
  pagesDir: string;
  components?: Component[];
}

interface Page {
  path: string;
  content: string;
}

interface Component {
  id: string;
  Content: function;
}

interface Folders {
  assetsSrcFolder: Dirent[];
  assetsOutFolder: Dirent[];
}
