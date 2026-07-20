import { TooltipProvider } from "@radix-ui/react-tooltip";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { SimulationProvider } from "@/features/simulation/simulation-provider";

import { App } from "./App";
import "@xyflow/react/dist/style.css";
import "./react-flow-theme.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider delayDuration={250} skipDelayDuration={100}>
      <SimulationProvider>
        <App />
      </SimulationProvider>
    </TooltipProvider>
  </StrictMode>,
);
