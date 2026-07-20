import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { runHardyCross } from "@/features/hardy-cross/hardy-cross";
import { doubleLoopCase } from "@/features/network/double-loop-case";

import {
  SimulationContext,
  type SimulationContextValue,
  type SimulationPhase,
} from "./simulation-context";

const simulationResult = runHardyCross(doubleLoopCase, {
  tolerance: 0.001,
  maxIterations: 50,
});

export function SimulationProvider({ children }: PropsWithChildren) {
  const [phase, setPhase] = useState<SimulationPhase>("idle");
  const [stepIndex, setStepIndex] = useState(-1);
  const [selectedPipeId, setSelectedPipeId] = useState<string | null>("P3");

  const start = useCallback(() => {
    setPhase("running");
    setStepIndex(-1);
  }, []);

  const next = useCallback(() => {
    if (phase !== "running") return;

    const nextIndex = Math.min(stepIndex + 1, simulationResult.steps.length - 1);
    setStepIndex(nextIndex);
    if (nextIndex === simulationResult.steps.length - 1) {
      setPhase("completed");
    }
  }, [phase, stepIndex]);

  const showResult = useCallback(() => {
    setStepIndex(simulationResult.steps.length - 1);
    setPhase("completed");
  }, []);

  const reset = useCallback(() => {
    setStepIndex(-1);
    setPhase("idle");
    setSelectedPipeId("P3");
  }, []);

  const value = useMemo<SimulationContextValue>(() => {
    const currentStep = stepIndex >= 0 ? (simulationResult.steps[stepIndex] ?? null) : null;
    const currentIteration = currentStep
      ? (simulationResult.iterations[currentStep.iteration - 1] ?? null)
      : null;
    const currentFlows = currentStep
      ? currentStep.flowsAfter
      : simulationResult.initialFlows;
    const executedSteps = stepIndex >= 0
      ? simulationResult.steps.slice(0, stepIndex + 1)
      : [];
    const progress = phase === "idle"
      ? 0
      : ((stepIndex + 1) / simulationResult.steps.length) * 100;

    return {
      network: doubleLoopCase,
      result: simulationResult,
      phase,
      stepIndex,
      currentStep,
      currentIteration,
      currentFlows,
      executedSteps,
      selectedPipeId,
      progress,
      start,
      next,
      showResult,
      reset,
      selectPipe: setSelectedPipeId,
    };
  }, [phase, stepIndex, selectedPipeId, start, next, showResult, reset]);

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}
