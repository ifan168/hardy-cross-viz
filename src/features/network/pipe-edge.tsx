import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";

export interface PipeEdgeData extends Record<string, unknown> {
  pipeName: string;
  flow: number;
  flowBefore: number | null;
  flowChange: number | null;
  flowUnit: string;
  color: string;
  selected: boolean;
  hasCurrentStep: boolean;
  isInCurrentStep: boolean;
  labelOffsetX: number;
  labelOffsetY: number;
  onSelect: (pipeId: string) => void;
}

export type PipeEdgeType = Edge<PipeEdgeData, "pipeEdge">;

function formatFlow(value: number): string {
  const sign = value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(3)}`;
}

function formatDelta(value: number): string {
  const normalized = Math.abs(value) < 0.0005 ? 0 : value;
  return `${normalized >= 0 ? "+" : "−"}${Math.abs(normalized).toFixed(3)}`;
}

export function PipeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerStart,
  markerEnd,
  data,
}: EdgeProps<PipeEdgeType>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 18,
  });

  if (!data) return null;

  const reversed = data.flow < 0;
  const directionPathId = `flow-direction-${id}`;
  const hasCorrection =
    data.isInCurrentStep && data.flowBefore !== null && data.flowChange !== null;
  const isIncrease = (data.flowChange ?? 0) >= 0;
  const isDimmed = data.hasCurrentStep && !data.isInCurrentStep && !data.selected;
  const accessibleCorrection = hasCorrection
    ? `，校正前 ${formatFlow(data.flowBefore!)}，${isIncrease ? "增加" : "减少"} ${Math.abs(data.flowChange!).toFixed(3)} ${data.flowUnit}，校正后 ${formatFlow(data.flow)}`
    : `，当前流量 ${formatFlow(data.flow)} ${data.flowUnit}`;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        interactionWidth={24}
        style={{
          stroke: data.color,
          strokeWidth: data.selected ? 5 : data.isInCurrentStep ? 4 : 2.6,
          opacity: isDimmed ? 0.28 : 1,
          transition: "stroke 280ms ease, stroke-width 180ms ease, opacity 180ms ease",
        }}
      />
      {/* 箭头沿真实管线路径排布；负流量时整体反向，不再依赖文字解释流向。 */}
      <path id={directionPathId} d={edgePath} fill="none" stroke="none" aria-hidden="true" />
      <text
        aria-hidden="true"
        fill={data.color}
        stroke="white"
        strokeWidth={3.5}
        paintOrder="stroke"
        fontSize={17}
        fontWeight={700}
        style={{
          opacity: isDimmed ? 0.22 : 1,
          pointerEvents: "none",
          transition: "fill 280ms ease, opacity 180ms ease",
        }}
      >
        <textPath
          href={`#${directionPathId}`}
          startOffset="50%"
          textAnchor="middle"
          dominantBaseline="central"
          letterSpacing={10}
        >
          {reversed ? "◀ ◀ ◀" : "▶ ▶ ▶"}
        </textPath>
      </text>
      <EdgeLabelRenderer>
        <button
          type="button"
          onClick={() => data.onSelect(id)}
          className={`nodrag nopan absolute whitespace-nowrap rounded-lg border text-left shadow-sm backdrop-blur transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 ${
            hasCorrection ? "min-w-[136px] px-3 py-2" : "px-2.5 py-1.5"
          } ${
            reversed
              ? "border-rose-300 bg-rose-50/95 text-rose-900"
              : data.isInCurrentStep
                ? "border-sky-300 bg-white text-slate-800 ring-2 ring-sky-100"
                : data.selected
                  ? "border-sky-300 bg-sky-50 text-sky-950 ring-2 ring-sky-100"
                  : "border-slate-200 bg-white/95 text-slate-700 hover:border-sky-200"
          } ${
            isDimmed ? "opacity-50" : "opacity-100"
          }`}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX + data.labelOffsetX}px, ${labelY + data.labelOffsetY}px)`,
          }}
          aria-label={`选择${data.pipeName}${accessibleCorrection}${reversed ? "，方向已反转" : ""}`}
        >
          <span className="block text-[10px] font-semibold leading-none">
            {data.pipeName}
          </span>
          {hasCorrection ? (
            <>
              <span className="mt-1.5 flex items-baseline justify-between gap-1.5 font-mono text-[11px] font-semibold leading-none tabular-nums text-slate-800">
                <span>{formatFlow(data.flowBefore!)}</span>
                <span className="font-sans text-slate-400" aria-hidden="true">→</span>
                <span className={reversed ? "text-rose-700" : "text-slate-950"}>
                  {formatFlow(data.flow)}
                </span>
              </span>
              <span
                className={`mt-1.5 flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold leading-none tabular-nums ${
                  isIncrease
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isIncrease ? "增加" : "减少"} Δ {formatDelta(data.flowChange!)} {data.flowUnit}
              </span>
            </>
          ) : (
            <span className="mt-1 flex items-center gap-1 text-[11px] font-medium leading-none tabular-nums">
              {formatFlow(data.flow)} {data.flowUnit}
            </span>
          )}
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
