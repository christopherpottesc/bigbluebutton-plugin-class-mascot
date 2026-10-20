import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import ClassMascot from './class-mascot/component';

const uuid = document.currentScript?.getAttribute('uuid') || 'root';

const pluginName = document.currentScript?.getAttribute('pluginName') || 'plugin';

// Images are served next to the bundle, so their URL is built from where the script came from.
const scriptSrc = (document.currentScript as HTMLScriptElement)?.src;
const assetsBaseUrl = scriptSrc ? scriptSrc.substring(0, scriptSrc.lastIndexOf('/')) : '';

const root = ReactDOM.createRoot(document.getElementById(uuid));
root.render(
  <ClassMascot
    {...{
      pluginUuid: uuid,
      pluginName,
      assetsBaseUrl,
    }}
  />
);
