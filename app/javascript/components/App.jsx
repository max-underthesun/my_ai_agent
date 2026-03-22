import React from "react";
import { Provider } from "react-redux";
import store from "../store";
import QueryForm from "./QueryForm";

export default function App() {
  return (
    <Provider store={store}>
      <div className="container mt-5">
        <h1 className="mb-4">My AI Agent</h1>
        <QueryForm />
      </div>
    </Provider>
  );
}
