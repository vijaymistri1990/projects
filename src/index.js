import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./assets/css/app.css";
import "./assets/css/bootstrap-grid.min.css";
import "./assets/icons/boxicons-2/css/boxicons.min.css";
import '@shopify/polaris/build/esm/styles.css';
import { AppProvider, Frame } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AppProvider i18n={enTranslations}>
    <Frame>
      <App />
    </Frame>
  </AppProvider>
);
