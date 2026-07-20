import { useContext } from "react";

import { SimulationContext } from "./simulation-context";

export function useSimulation() {
  const context = useContext(SimulationContext);

  if (!context) {
    throw new Error("useSimulation 必须在 SimulationProvider 内使用。");
  }

  return context;
}
