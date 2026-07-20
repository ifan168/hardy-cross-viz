import { createContext } from "react";

import type {
  HardyCrossResult,
  IterationState,
  LoopCalculation,
} from "@/features/hardy-cross/hardy-cross";
import type { NetworkCase } from "@/features/network/network-types";

export type SimulationPhase = "idle" | "running" | "completed";

export interface SimulationContextValue {
  network: NetworkCase;
  result: HardyCrossResult;
  phase: SimulationPhase;
  stepIndex: number;
  currentStep: LoopCalculation | null;
  currentIteration: IterationState | null;
  currentFlows: Record<string, number>;
  executedSteps: LoopCalculation[];
  selectedPipeId: string | null;
  progress: number;
  start: () => void;
  next: () => void;
  showResult: () => void;
  reset: () => void;
  selectPipe: (pipeId: string | null) => void;
}

export const SimulationContext = createContext<SimulationContextValue | null>(null);
