import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "./redux/store";



const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
