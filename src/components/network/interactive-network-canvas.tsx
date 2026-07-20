import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import { Network } from "lucide-react";
import { useCallback, useMemo } from "react";

import { EducationalTooltip } from "@/components/ui/educational-tooltip";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PipeEdge, type PipeEdgeType } from "@/features/network/pipe-edge";
import { WaterNode, type WaterNodeType } from "@/features/network/water-node";
import { useSimulation } from "@/features/simulation/use-simulation";

const nodeTypes: NodeTypes = { waterNode: WaterNode };
const edgeTypes: EdgeTypes = { pipeEdge: PipeEdge };
const fitViewOptions = { padding: 0.2, minZoom: 0.24, maxZoom: 1.2 };
const proOptions = { hideAttribution: true };

function getFlowColor(flow: number, maxFlow: number): string {
  if (flow < 0) return "#e11d48";
  const ratio = Math.min(Math.abs(flow) / Math.max(maxFlow, 1), 1);
  const lightness = 70 - ratio * 35;
  return `hsl(199 88% ${lightness}%)`;
}

export function InteractiveNetworkCanvas() {
  const {
    network,
    currentFlows,
    currentStep,
    selectedPipeId,
    selectPipe,
    phase,
  } = useSimulation();

  const maxFlow = Math.max(...Object.values(currentFlows).map(Math.abs));
  const selectedPipe = network.pipes.find((pipe) => pipe.id === selectedPipeId) ?? null;
  const handlePaneClick = useCallback(() => selectPipe(null), [selectPipe]);

  const nodes = useMemo<WaterNodeType[]>(
    () =>
      network.nodes.map((node) => ({
        id: node.id,
        type: "waterNode",
        position: node.position,
        draggable: false,
        selectable: false,
        data: {
          name: node.name,
          demand: node.demand,
          kind: node.kind,
          flowUnit: network.flowUnit,
        },
      })),
    [network],
  );

  const edges = useMemo<PipeEdgeType[]>(
    () =>
      network.pipes.map((pipe) => {
        const flow = currentFlows[pipe.id] ?? pipe.initialFlow;
        const currentRow = currentStep?.rows.find((row) => row.pipeId === pipe.id) ?? null;
        const color = getFlowColor(flow, maxFlow);
        const marker = {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color,
        };

        return {
          id: pipe.id,
          type: "pipeEdge",
          source: pipe.source,
          target: pipe.target,
          sourceHandle: pipe.sourceHandle,
          targetHandle: pipe.targetHandle,
          markerStart: flow < 0 ? marker : undefined,
          markerEnd: flow >= 0 ? marker : undefined,
          selected: pipe.id === selectedPipeId,
          zIndex: pipe.id === selectedPipeId || currentRow ? 8 : 1,
          data: {
            pipeName: pipe.name,
            flow,
            flowBefore: currentRow?.flowBefore ?? null,
            flowChange: currentRow?.correctionContribution ?? null,
            flowUnit: network.flowUnit,
            color,
            selected: pipe.id === selectedPipeId,
            hasCurrentStep: currentStep !== null,
            isInCurrentStep: currentRow !== null,
            labelOffsetX: pipe.labelOffset.x,
            labelOffsetY: pipe.labelOffset.y,
            onSelect: selectPipe,
          },
        };
      }),
    [network, currentFlows, currentStep, maxFlow, selectedPipeId, selectPipe],
  );

  return (
    <Panel className="flex min-h-[640px] flex-col overflow-hidden">
      <PanelHeader className="flex-col items-stretch sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Network className="size-4 text-sky-600" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900">管网拓扑画布</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {network.name} · 箭头表示当前实际流向
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-x-3 gap-y-1.5 text-[11px] text-slate-500 sm:max-w-xl sm:justify-end">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-sky-300 to-sky-800" />
            流量大小
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-700">本步</span>
            参与校正
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700">＋</span>
            增加
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700">−</span>
            减少
          </span>
        </div>
      </PanelHeader>

      <div className="relative h-[460px] w-full shrink-0 bg-slate-50/70 sm:h-[560px]">
        <ReactFlow<WaterNodeType, PipeEdgeType>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={fitViewOptions}
          minZoom={0.2}
          maxZoom={1.8}
          nodesConnectable={false}
          elementsSelectable
          onPaneClick={handlePaneClick}
          proOptions={proOptions}
          aria-label="双环给水管网拓扑图"
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#cbd5e1" />
          <Controls showInteractive={false} position="bottom-left" />
        </ReactFlow>

        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-[11px] text-slate-500 shadow-sm backdrop-blur">
          {phase === "idle"
            ? "初始假定流量"
            : currentStep
              ? (
                  <>
                    <span className="sm:hidden">第 {currentStep.iteration} 轮 · {currentStep.loopName}</span>
                    <span className="hidden sm:inline">
                      第 {currentStep.iteration} 轮 · {currentStep.loopName} · 图中显示本步增减量
                    </span>
                  </>
                )
              : "已开始 · 点击“下一步”校正左环"}
        </div>

      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-3.5">
        {selectedPipe ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="font-semibold text-slate-900">{selectedPipe.name}</span>
            <span className="text-slate-500">
              L <b className="font-medium text-slate-800">{selectedPipe.length} m</b>
            </span>
            <span className="text-slate-500">
              D <b className="font-medium text-slate-800">{selectedPipe.diameter} mm</b>
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              C <b className="font-medium text-slate-800">{selectedPipe.hazenWilliamsC}</b>
              <EducationalTooltip label="解释海森-威廉系数">
                海森-威廉系数 C 表征管壁光滑程度；C 越大，水流阻力通常越小。
              </EducationalTooltip>
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              S <b className="font-medium tabular-nums text-slate-800">{selectedPipe.resistance.toFixed(4)}</b>
              <EducationalTooltip label="解释阻力系数 S">
                本案例把管长、管径和 C 值折算为二次阻力系数 S，并采用 h = S·q·|q|。
              </EducationalTooltip>
            </span>
            <span className="ml-auto font-semibold tabular-nums text-sky-700">
              q = {(currentFlows[selectedPipe.id] ?? 0).toFixed(3)} {network.flowUnit}
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-500">点击任一管段标签，可查看其水力参数。</p>
        )}
      </div>
    </Panel>
  );
}
