import { Provider } from "react-redux";
import { renderToString } from "react-dom/server";

export const injectComponent = (component: Component, page: string, store: any) => {
  const { id, Content } = component;

  const htmlId = `id="${id}"`;
  const htmlData = `data-${id}=`;
  if (!page.includes(htmlId)) return page;

  const idIndex = page.indexOf(htmlId);
  const data = getComponentData(page, htmlData, idIndex);

  const jsx = !store ? (
    <Content {...data} />
  ) : (
    <Provider store={store}>
      <Content {...data} />
    </Provider>
  );

  const htmlComponent = renderToString(jsx);

  return getInjectedHtml(htmlComponent, page, idIndex, htmlId.length + 1);
};

const getComponentData = (htmlContent: string, htmlData: string, idIndex: number) => {
  if (!htmlContent.includes(htmlData)) return {};
  const dataStartAt = htmlContent.indexOf(htmlData) + htmlData.length + 1;
  const dataEndAt = idIndex - 2;
  const data = htmlContent.substring(dataStartAt, dataEndAt);
  try {
    const parsed = JSON.parse(data);
    console.log(`${htmlData}`, parsed);
    return parsed;
  } catch (e: any) {
    console.error(`getComponentData - cannot parse ${data} from html:`, e.message);
    return {};
  }
};

const getInjectedHtml = (component: string, page: string, idLocation: number, idSize: number) => {
  const beforeId = page.substring(0, idLocation + idSize);
  const afterId = page.substring(idLocation + idSize);
  return `${beforeId}${component}${afterId}`;
};
