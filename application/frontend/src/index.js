/*
  This file is used to render the React application onto the HTML web page.
*/

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { AppProvider } from "./context";

//tab title name
document.title = 'MyLibrary';

//query the HTML root element
const root = ReactDOM.createRoot(document.getElementById("root"));

//render React application onto the root element on the page
root.render(
  <React.StrictMode>
    <AppProvider>
      <Router>
        <App />
      </Router>
    </AppProvider>
  </React.StrictMode>
);
