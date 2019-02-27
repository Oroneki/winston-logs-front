import React from "react";
import { hydrate, render } from "react-dom";
import App from "./App";
import "bulma";
import "./index.scss";

const rootElement = document.getElementById("root");

if ((rootElement as any).hasChildNodes()) {
  hydrate(<App />, rootElement);
} else {
  render(<App />, rootElement);
}
