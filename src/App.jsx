import { useState } from "react";
import router from "./routes";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import store, { persistor } from "./app/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import SuccessMessage from "./components/SuccessMessage/SuccessMessage";
import LoadingAnimation from "./components/LoadingAnimation/LoadingAnimation";
import ThemeProvider from "./theme";

function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <SuccessMessage />
            <LoadingAnimation />
            <RouterProvider router={router} />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;
