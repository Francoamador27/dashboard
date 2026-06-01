import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./Router";
import { Provider } from "./context/Provider";

import "./index.css";

// Fuentes
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import GTMBody from "./components/BodyVerification/GTMBody";

createRoot(document.getElementById("root")).render(
    <Provider>
      {/* GTM / scripts globales */}
      <GTMBody gtmId={"sadas"} />

      {/* App con router */}
      <RouterProvider router={router} />
    </Provider>
);