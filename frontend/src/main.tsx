import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./i18n";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";
const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element #root was not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <App />
          </BrowserRouter>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
