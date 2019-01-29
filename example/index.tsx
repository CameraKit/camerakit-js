import * as React from "react";
import * as ReactDOM from "react-dom";
import Example from "./pages/example";

let rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}
ReactDOM.render(<Example />, rootEl);
