import type { XYPosition } from "@xyflow/react";

/** 教学案例中的节点；需水量为正，水源供水量为负。 */
export interface NetworkNode {
  id: string;
  name: string;
  demand: number;
  position: XYPosition;
  kind: "source" | "junction";
}

/** 管段的几何参数和初始假定流量。 */
export interface NetworkPipe {
  id: string;
  name: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  /** 标签相对管段几何中点的偏移，用于避免与节点或相邻标签重叠。 */
  labelOffset: XYPosition;
  length: number;
  diameter: number;
  hazenWilliamsC: number;
  resistance: number;
  initialFlow: number;
}

/** direction 表示环路遍历方向与管段假定方向是否一致。 */
export interface LoopPipeReference {
  pipeId: string;
  direction: 1 | -1;
}

export interface NetworkLoop {
  id: string;
  name: string;
  pipes: LoopPipeReference[];
}

export interface NetworkCase {
  id: string;
  name: string;
  description: string;
  flowUnit: "L/s";
  headLossUnit: "m";
  nodes: NetworkNode[];
  pipes: NetworkPipe[];
  loops: NetworkLoop[];
}
