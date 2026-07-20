import { describe, expect, it } from "vitest";

import {
  calculateHazenWilliamsResistance,
  doubleLoopCase,
} from "@/features/network/double-loop-case";

import { calculateLoopResidual, runHardyCross } from "./hardy-cross";

function calculateNodeBalance(
  nodeId: string,
  flows: Readonly<Record<string, number>>,
): number {
  return doubleLoopCase.pipes.reduce((balance, pipe) => {
    const flow = flows[pipe.id] ?? 0;
    if (pipe.target === nodeId) return balance + flow;
    if (pipe.source === nodeId) return balance - flow;
    return balance;
  }, 0);
}

describe("runHardyCross", () => {
  it("使用海森-威廉流量指数 n = 1.852，并按 L/s 单位计算 S", () => {
    expect(doubleLoopCase.exponent).toBe(1.852);
    expect(calculateHazenWilliamsResistance(800, 250, 120)).toBeCloseTo(
      0.0028634112076864654,
      14,
    );
  });

  it("在指定精度内收敛，并为每个环保留逐步计算数据", () => {
    const result = runHardyCross(doubleLoopCase, {
      tolerance: 0.001,
      maxIterations: 50,
    });

    expect(result.converged).toBe(true);
    expect(result.iterations.at(-1)?.maxLoopImbalance).toBeLessThanOrEqual(0.001);
    expect(result.steps).toHaveLength(result.iterations.length * doubleLoopCase.loops.length);
    expect(result.iterations[0]?.loopCalculations[0]?.rows).toHaveLength(3);
  });

  it("每次环校正都保持节点连续性条件", () => {
    const result = runHardyCross(doubleLoopCase);

    for (const step of result.steps) {
      for (const node of doubleLoopCase.nodes) {
        const netInflow = calculateNodeBalance(node.id, step.flowsAfter);
        expect(netInflow).toBeCloseTo(node.demand, 8);
      }
    }
  });

  it("第一步各管分母项严格遵循 n·S·|q|^(n-1)", () => {
    const result = runHardyCross(doubleLoopCase);
    const firstStep = result.steps[0];

    expect(firstStep).toBeDefined();
    for (const row of firstStep!.rows) {
      expect(row.derivative).toBeCloseTo(
        doubleLoopCase.exponent
          * row.resistance
          * Math.abs(row.loopOrientedFlow) ** (doubleLoopCase.exponent - 1),
        12,
      );
    }
  });

  it("第一步校正值严格遵循 -Σh/Σ(nS|q|^(n-1))", () => {
    const result = runHardyCross(doubleLoopCase);
    const firstStep = result.steps[0];

    expect(firstStep).toBeDefined();
    expect(firstStep!.correction).toBeCloseTo(
      -firstStep!.headLossSum / firstStep!.derivativeSum,
      12,
    );
  });

  it("最终两个环的闭合差都满足收敛阈值", () => {
    const result = runHardyCross(doubleLoopCase);
    const pipeById = new Map(doubleLoopCase.pipes.map((pipe) => [pipe.id, pipe]));

    for (const loop of doubleLoopCase.loops) {
      expect(
        Math.abs(
          calculateLoopResidual(
            loop,
            pipeById,
            result.finalFlows,
            doubleLoopCase.exponent,
          ),
        ),
      ).toBeLessThanOrEqual(result.tolerance);
    }
  });
});
