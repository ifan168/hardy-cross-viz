import type {
  LoopPipeReference,
  NetworkCase,
  NetworkLoop,
  NetworkPipe,
} from "@/features/network/network-types";

export interface HardyCrossOptions {
  tolerance?: number;
  maxIterations?: number;
}

export interface PipeCalculationRow {
  pipeId: string;
  pipeName: string;
  direction: 1 | -1;
  flowBefore: number;
  loopOrientedFlow: number;
  resistance: number;
  signedHeadLoss: number;
  derivative: number;
  correctionContribution: number;
  flowAfter: number;
  reversed: boolean;
}

export interface LoopCalculation {
  iteration: number;
  loopId: string;
  loopName: string;
  headLossSum: number;
  derivativeSum: number;
  correction: number;
  rows: PipeCalculationRow[];
  flowsBefore: Record<string, number>;
  flowsAfter: Record<string, number>;
  reversedPipeIds: string[];
}

export interface IterationState {
  iteration: number;
  flowsBefore: Record<string, number>;
  flowsAfter: Record<string, number>;
  loopCalculations: LoopCalculation[];
  loopResiduals: Record<string, number>;
  maxLoopImbalance: number;
  converged: boolean;
}

export interface HardyCrossResult {
  initialFlows: Record<string, number>;
  iterations: IterationState[];
  steps: LoopCalculation[];
  finalFlows: Record<string, number>;
  tolerance: number;
  converged: boolean;
}

const DEFAULT_TOLERANCE = 0.001;
const DEFAULT_MAX_ITERATIONS = 50;
const MIN_DENOMINATOR = 1e-12;

/** 二次阻力模型：h = S·q·|q|，符号表示水头损失方向。 */
export function calculateSignedHeadLoss(resistance: number, flow: number): number {
  return resistance * flow * Math.abs(flow);
}

/** 计算某环在指定流量状态下的闭合差 Σh。 */
export function calculateLoopResidual(
  loop: NetworkLoop,
  pipeById: ReadonlyMap<string, NetworkPipe>,
  flows: Readonly<Record<string, number>>,
): number {
  return loop.pipes.reduce((sum, reference) => {
    const pipe = requirePipe(pipeById, reference);
    const flow = requireFlow(flows, pipe.id);
    return sum + reference.direction * calculateSignedHeadLoss(pipe.resistance, flow);
  }, 0);
}

/**
 * 使用顺序环校正的 Hardy Cross 法生成完整教学轨迹。
 *
 * 每个迭代内按环逐个计算并立即更新流量，共用管段会被两个环依次修正。
 * 这种记录方式既保留 IterationState，也能支持 UI 按“一个环校正”单步播放。
 */
export function runHardyCross(
  network: NetworkCase,
  options: HardyCrossOptions = {},
): HardyCrossResult {
  validateNetwork(network);

  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  validateOptions(tolerance, maxIterations);

  const pipeById = new Map(network.pipes.map((pipe) => [pipe.id, pipe]));
  const initialFlows = Object.fromEntries(
    network.pipes.map((pipe) => [pipe.id, pipe.initialFlow]),
  );
  let flows = { ...initialFlows };
  const iterations: IterationState[] = [];
  const steps: LoopCalculation[] = [];

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const iterationFlowsBefore = { ...flows };
    const loopCalculations: LoopCalculation[] = [];

    for (const loop of network.loops) {
      const calculation = calculateLoopCorrection(
        iteration,
        loop,
        pipeById,
        flows,
      );
      flows = { ...calculation.flowsAfter };
      loopCalculations.push(calculation);
      steps.push(calculation);
    }

    // 收敛判据必须在本轮全部环校正完成后重新计算，尤其要考虑共用管段。
    const loopResiduals = Object.fromEntries(
      network.loops.map((loop) => [
        loop.id,
        calculateLoopResidual(loop, pipeById, flows),
      ]),
    );
    const maxLoopImbalance = Math.max(
      ...Object.values(loopResiduals).map(Math.abs),
    );
    const converged = maxLoopImbalance <= tolerance;

    iterations.push({
      iteration,
      flowsBefore: iterationFlowsBefore,
      flowsAfter: { ...flows },
      loopCalculations,
      loopResiduals,
      maxLoopImbalance,
      converged,
    });

    if (converged) {
      break;
    }
  }

  return {
    initialFlows,
    iterations,
    steps,
    finalFlows: { ...flows },
    tolerance,
    converged: iterations.at(-1)?.converged ?? false,
  };
}

function calculateLoopCorrection(
  iteration: number,
  loop: NetworkLoop,
  pipeById: ReadonlyMap<string, NetworkPipe>,
  currentFlows: Readonly<Record<string, number>>,
): LoopCalculation {
  const flowsBefore = { ...currentFlows };

  const baseRows = loop.pipes.map((reference) => {
    const pipe = requirePipe(pipeById, reference);
    const flowBefore = requireFlow(flowsBefore, pipe.id);
    const loopOrientedFlow = reference.direction * flowBefore;

    return {
      pipe,
      reference,
      flowBefore,
      loopOrientedFlow,
      signedHeadLoss: calculateSignedHeadLoss(
        pipe.resistance,
        loopOrientedFlow,
      ),
      derivative: 2 * pipe.resistance * Math.abs(loopOrientedFlow),
    };
  });

  const headLossSum = baseRows.reduce(
    (sum, row) => sum + row.signedHeadLoss,
    0,
  );
  const derivativeSum = baseRows.reduce(
    (sum, row) => sum + row.derivative,
    0,
  );

  if (derivativeSum <= MIN_DENOMINATOR) {
    throw new Error(`环路 ${loop.id} 的校正分母为 0，无法继续平差。`);
  }

  // Hardy Cross 二次阻力公式：Δq = -Σh / Σ(2S|q|)。
  const correction = -headLossSum / derivativeSum;
  const flowsAfter = { ...flowsBefore };

  const rows: PipeCalculationRow[] = baseRows.map(
    ({ pipe, reference, flowBefore, loopOrientedFlow, signedHeadLoss, derivative }) => {
      const correctionContribution = reference.direction * correction;
      const flowAfter = flowBefore + correctionContribution;
      flowsAfter[pipe.id] = flowAfter;

      return {
        pipeId: pipe.id,
        pipeName: pipe.name,
        direction: reference.direction,
        flowBefore,
        loopOrientedFlow,
        resistance: pipe.resistance,
        signedHeadLoss,
        derivative,
        correctionContribution,
        flowAfter,
        reversed:
          flowBefore !== 0 && flowAfter !== 0 && Math.sign(flowBefore) !== Math.sign(flowAfter),
      };
    },
  );

  return {
    iteration,
    loopId: loop.id,
    loopName: loop.name,
    headLossSum,
    derivativeSum,
    correction,
    rows,
    flowsBefore,
    flowsAfter,
    reversedPipeIds: rows.filter((row) => row.reversed).map((row) => row.pipeId),
  };
}

function requirePipe(
  pipeById: ReadonlyMap<string, NetworkPipe>,
  reference: LoopPipeReference,
): NetworkPipe {
  const pipe = pipeById.get(reference.pipeId);
  if (!pipe) {
    throw new Error(`环路引用了不存在的管段：${reference.pipeId}`);
  }
  return pipe;
}

function requireFlow(
  flows: Readonly<Record<string, number>>,
  pipeId: string,
): number {
  const flow = flows[pipeId];
  if (flow === undefined || !Number.isFinite(flow)) {
    throw new Error(`管段 ${pipeId} 缺少有效流量。`);
  }
  return flow;
}

function validateNetwork(network: NetworkCase): void {
  if (network.nodes.length === 0 || network.pipes.length === 0 || network.loops.length === 0) {
    throw new Error("管网必须至少包含一个节点、一条管段和一个环路。");
  }

  const nodeIds = new Set(network.nodes.map((node) => node.id));
  const pipeIds = new Set<string>();

  for (const pipe of network.pipes) {
    if (pipeIds.has(pipe.id)) {
      throw new Error(`存在重复管段编号：${pipe.id}`);
    }
    pipeIds.add(pipe.id);
    if (!nodeIds.has(pipe.source) || !nodeIds.has(pipe.target)) {
      throw new Error(`管段 ${pipe.id} 连接了不存在的节点。`);
    }
    if (!(pipe.resistance > 0) || !Number.isFinite(pipe.initialFlow)) {
      throw new Error(`管段 ${pipe.id} 的阻力或初始流量无效。`);
    }
  }

  for (const loop of network.loops) {
    if (loop.pipes.length < 2) {
      throw new Error(`环路 ${loop.id} 至少需要两条管段。`);
    }
    for (const reference of loop.pipes) {
      if (!pipeIds.has(reference.pipeId)) {
        throw new Error(`环路 ${loop.id} 引用了不存在的管段 ${reference.pipeId}。`);
      }
    }
  }
}

function validateOptions(tolerance: number, maxIterations: number): void {
  if (!(tolerance > 0) || !Number.isFinite(tolerance)) {
    throw new Error("收敛精度必须是大于 0 的有限数。 ");
  }
  if (!Number.isInteger(maxIterations) || maxIterations <= 0) {
    throw new Error("最大迭代次数必须是正整数。");
  }
}
