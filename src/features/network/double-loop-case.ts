import type { NetworkCase } from "./network-types";

/**
 * 经典双环教学案例。
 *
 * 初始流量满足所有节点的连续性方程，便于把教学重点放在环路能量平衡上。
 * S 为根据管长、管径及海森-威廉系数在初始工况附近折算的二次阻力系数，
 * 算法采用 h = S·q·|q|，因此负流量会自然产生反向水头损失。
 */
export const doubleLoopCase: NetworkCase = {
  id: "classic-double-loop",
  name: "经典双环管网",
  description: "1 个水源、5 个用水节点、7 条管段和 2 个相邻环路",
  flowUnit: "L/s",
  headLossUnit: "m",
  nodes: [
    { id: "R", name: "水源 R", demand: -90, position: { x: 20, y: 240 }, kind: "source" },
    { id: "A", name: "节点 A", demand: 10, position: { x: 250, y: 240 }, kind: "junction" },
    { id: "B", name: "节点 B", demand: 5, position: { x: 540, y: 45 }, kind: "junction" },
    { id: "C", name: "节点 C", demand: 50, position: { x: 540, y: 435 }, kind: "junction" },
    { id: "D", name: "节点 D", demand: 15, position: { x: 880, y: 45 }, kind: "junction" },
    { id: "E", name: "节点 E", demand: 10, position: { x: 880, y: 435 }, kind: "junction" },
  ],
  pipes: [
    {
      id: "P1",
      name: "干管 P1",
      source: "R",
      target: "A",
      sourceHandle: "right-source",
      targetHandle: "left-target",
      labelOffset: { x: 0, y: -28 },
      length: 500,
      diameter: 300,
      hazenWilliamsC: 120,
      resistance: 0.0008,
      initialFlow: 90,
    },
    {
      id: "P2",
      name: "管段 P2",
      source: "A",
      target: "B",
      sourceHandle: "right-source",
      targetHandle: "left-target",
      labelOffset: { x: -24, y: -24 },
      length: 800,
      diameter: 250,
      hazenWilliamsC: 120,
      resistance: 0.0016,
      initialFlow: 50,
    },
    {
      id: "P3",
      name: "共用管 P3",
      source: "B",
      target: "C",
      sourceHandle: "bottom-source",
      targetHandle: "top-target",
      labelOffset: { x: 58, y: 0 },
      length: 600,
      diameter: 200,
      hazenWilliamsC: 120,
      resistance: 0.0045,
      initialFlow: 10,
    },
    {
      id: "P4",
      name: "管段 P4",
      source: "A",
      target: "C",
      sourceHandle: "right-source",
      targetHandle: "left-target",
      labelOffset: { x: -24, y: 24 },
      length: 900,
      diameter: 250,
      hazenWilliamsC: 120,
      resistance: 0.0019,
      initialFlow: 30,
    },
    {
      id: "P5",
      name: "管段 P5",
      source: "B",
      target: "D",
      sourceHandle: "right-source",
      targetHandle: "left-target",
      labelOffset: { x: 0, y: -28 },
      length: 800,
      diameter: 250,
      hazenWilliamsC: 120,
      resistance: 0.0019,
      initialFlow: 35,
    },
    {
      id: "P6",
      name: "管段 P6",
      source: "D",
      target: "E",
      sourceHandle: "bottom-source",
      targetHandle: "top-target",
      labelOffset: { x: -58, y: 0 },
      length: 600,
      diameter: 200,
      hazenWilliamsC: 120,
      resistance: 0.0041,
      initialFlow: 20,
    },
    {
      id: "P7",
      name: "管段 P7",
      source: "E",
      target: "C",
      sourceHandle: "left-source",
      targetHandle: "right-target",
      labelOffset: { x: 0, y: 28 },
      length: 900,
      diameter: 200,
      hazenWilliamsC: 120,
      resistance: 0.0068,
      initialFlow: 10,
    },
  ],
  loops: [
    {
      id: "L1",
      name: "左环 L1",
      pipes: [
        { pipeId: "P2", direction: 1 },
        { pipeId: "P3", direction: 1 },
        { pipeId: "P4", direction: -1 },
      ],
    },
    {
      id: "L2",
      name: "右环 L2",
      pipes: [
        { pipeId: "P5", direction: 1 },
        { pipeId: "P6", direction: 1 },
        { pipeId: "P7", direction: 1 },
        { pipeId: "P3", direction: -1 },
      ],
    },
  ],
};

export function getInitialFlows(network: NetworkCase): Record<string, number> {
  return Object.fromEntries(network.pipes.map((pipe) => [pipe.id, pipe.initialFlow]));
}
