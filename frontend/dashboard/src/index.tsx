import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@orderportal/shared-store";
import DashboardApp from "./DashboardApp";
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
createRoot(root).render(
  <Provider store={store}>
    <DashboardApp />
  </Provider>,
);
