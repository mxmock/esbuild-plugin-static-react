# esbuild-plugin-react-hydration

An esbuild plugin to generate react components html and insert it in an existing html file.
The goal of this plugin is to build an app with react components in SSR style, but without server, just static files.

## Features

- Transform react components into html
- Retrieve all html files from a specified directory
- Inject the component's html into html files which has an id corresponding with component's name
- Get a new minified html file from it
- Can send props to component from html file
- Can use redux to share a store by using the Provider component
- Update all paths of scripts and css links

## Before installation

You must install `esbuild@0.19`, `React@18.2` and `ReactDOM@18.2`.

## Installation

Install the plugin with npm

```bash
  npm i esbuild-plugin-static-react
```

## Usage

Begin by adding the plugin to `esbuild` config:

### Example for prod

You must export an array of components linked with ids like this:

```js
import Component1 from "./components/Component1";
import Component2 from "./components/Component2";

export default [
  { id: "component1", Content: Component1 },
  { id: "component2", Content: Component2 },
];
```

Then the esbuild config:

```js
import * as esbuild from "esbuild";
import store from "./src/redux/store.js";
import components from "./src/components.js";
import staticReact from "esbuild-plugin-static-react";

const SRC = "src";
const OUT = "build";

const build = async () => {
  await esbuild.build({
    entryPoints: [`${SRC}/index.js`],
    outfile: `${BUILD}/js/index.js`,
    bundle: true,
    jsx: "automatic",
    loader: { ".js": "jsx" },
    plugins: [
      staticReact({
        store,
        components,
        srcDir: SRC,
        outDir: BUILD,
        pagesDir: `pages`,
        jsOutDir: "js",
        css: { dir: "styles", name: "index.scss" },
      }),
    ],
  });
};

build()
  .then(async () => {
    console.log("Successfully built");
  })
  .catch((err) => {
    console.error("Something goes wrong:", err.message);
  });
```

### Entry point config

Now, in a main js file, hydrate react components with html files.

```js
// index.js

import store from "../redux/store";
import components from "./components";
import { Provider } from "react-redux";
import { hydrateRoot } from "react-dom/client";

const main = () => {
  for (let { id, Content } of components) {
    const html = document.getElementById(id);

    if (html) {
      const data = getHtmlData(html, id);

      const jsx = (
        <Provider store={store}>
          <Content {...data} />
        </Provider>
      );

      hydrateRoot(html, jsx);
    }
  }
};

const getHtmlData = (domEl, id) => {
  const json = domEl.getAttribute(`data-${id}`);
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error(`Can't parse ${json}`, e.message);
    return null;
  }
};

window.addEventListener("load", main);
```

## Build

To build a static version of your project, run:

```bash
  npx esbuild-plugin-static-react /path/of/esbuild-config-file.js | node
```

## Rules

- The `id` corresponding in html file must be the name of the component in camelCase. _(MyComponent.jsx ===> `<div id="myComponent"></div>`)_
- You must declare the `id` attribute as the last attribute of the html element.
- In your html files, you must set your `<link rel="stylesheet" href=""` tags just before `</head>`, and your `<script src=""></script>` tags just before `</body>`

## With props to add

### In html file

If you want to pass some props to a component injected in html, you can do it by adding a data attribute.

```html
<div
  data-myComponent='{"someData":3242, "someOtherData":"My data"}'
  id="myComponent"
></div>
```

- The format of the attribute is `data-COMPONENT_ID`.
- The format of the value must be a litteral object stringified (like a JSON.stringify).
- The `data` attribute must be placed just before the `id` attribute.

### In js file

Retrieve data from html in your main js file:

```js
// index.js

import { hydrateRoot } from "react-dom/client";
import MyComponent from "./components/MyComponent.static";

const component = document.getElementById("myComponent");
if (component) {
  const json = component.getAttribute("data-myComponent");
  const data = JSON.parse(json);
  hydrateRoot(component, React.createElement(MyComponent, { ...data }) />);
}
```

You can now retrieve data via props in your component.

```js
const MyComponent = ({ someOtherData }) => {
  return <p>{someOtherData}</p>;
};
```

That's all ! And you can do it for every component you want.

---

---

## 🚀 About Me

I'm just a javascript and light weight app lover

## 🛠 Skills

Javascript, ReactJS, NodeJS, Redux, Angular, NextJS, Esbuild, Postgres, MongoDB, Wordpress...

## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
