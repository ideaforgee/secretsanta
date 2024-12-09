import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LoadingProvider } from "./context/LoadingContext";
import "./styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <LoadingProvider>
        <App />
        </LoadingProvider>
    </React.StrictMode>
);
