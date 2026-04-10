import ReactDOM from "react-dom/client";
import "@mini-erp/ui/styles.css";
import { MockAppProvider } from "./mock/state";
import { App } from "./app";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <MockAppProvider>
    <App />
  </MockAppProvider>,
);
