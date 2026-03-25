import React from "react";
import { Provider } from "react-redux";
import store from "../store";
import QueryForm from "./QueryForm";

export default function App() {
  return (
    <Provider store={store}>
      <div className="container d-flex flex-column" style={{ height: "100vh", paddingTop: "1.5rem" }}>
        <h1 className="mb-3">My AI Agent</h1>
        <QueryForm />
      </div>
    </Provider>
  );
}
