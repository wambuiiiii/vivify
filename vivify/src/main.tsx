import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

// Import your global Tailwind CSS theme
import "./styles.css";

// Import the router engine from the file the AI generated
import { getRouter } from "./router";

// Initialize the router
const router = getRouter();

// Register the router instance for strict TypeScript type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Find the root HTML element
const rootElement = document.getElementById("root")!;

// Render the application
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}