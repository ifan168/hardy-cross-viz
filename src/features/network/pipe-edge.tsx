import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { useLayoutEffect, useRef, useState } from "react";

export interface PipeEdgeData extends Record<string, unknown> {
  pipeName: string;
  length: number;
  diameter: number;
  hazenWilliamsC: number;
  resistance: number;
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

interface DirectionArrow {
  x: number;
  y: number;
  angle: number;
}

const DIRECTION_ARROW_POSITIONS = [0.2, 0.4, 0.6, 0.8];
const CORRECTION_LABEL_HORIZONTAL_DISTANCE = 116;
const CORRECTION_LABEL_VERTICAL_DISTANCE = 88;

/** 校正卡片变宽、变高后，只沿原标签的主要偏移方向增加安全距离。 */
function getLabelOffset(
  offsetX: number,
  offsetY: number,
  expanded: boolean,
): { x: number; y: number } {
  if (!expanded) return { x: offsetX, y: offsetY };

  if (Math.abs(offsetX) >= Math.abs(offsetY) && offsetX !== 0) {
    return {
      x: Math.sign(offsetX) * Math.max(
        Math.abs(offsetX),
        CORRECTION_LABEL_HORIZONTAL_DISTANCE,
      ),
      y: offsetY,
    };
  }

  if (offsetY !== 0) {
    return {
      x: offsetX,
      y: Math.sign(offsetY) * Math.max(
        Math.abs(offsetY),
        CORRECTION_LABEL_VERTICAL_DISTANCE,
      ),
    };
  }

  return { x: offsetX, y: offsetY };
}

/**
 * 根据 SVG 路径在多个位置计算切线方向，再绘制真正旋转的三角箭头。
 * 不能使用文字字符充当箭头，否则浏览器在竖直管段上可能仍按横向字形显示。
 */
function FlowDirectionArrows({
  path,
  color,
  reversed,
  opacity,
}: {
  path: string;
  color: string;
  reversed: boolean;
  opacity: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [arrows, setArrows] = useState<DirectionArrow[]>([]);

  useLayoutEffect(() => {
    const pathElement = pathRef.current;
    if (!pathElement) return;

    const totalLength = pathElement.getTotalLength();
    const tangentSample = Math.min(2, totalLength * 0.01);

    setArrows(
      DIRECTION_ARROW_POSITIONS.map((position) => {
        const distance = totalLength * position;
        const point = pathElement.getPointAtLength(distance);
        const before = pathElement.getPointAtLength(
          Math.max(0, distance - tangentSample),
        );
        const after = pathElement.getPointAtLength(
          Math.min(totalLength, distance + tangentSample),
        );
        const tangentAngle = Math.atan2(
          after.y - before.y,
          after.x - before.x,
        ) * 180 / Math.PI;

        return {
          x: point.x,
          y: point.y,
          angle: tangentAngle + (reversed ? 180 : 0),
        };
      }),
    );
  }, [path, reversed]);

  return (
    <>
      <path ref={pathRef} d={path} fill="none" stroke="none" aria-hidden="true" />
      <g
        aria-hidden="true"
        fill={color}
        stroke="white"
        strokeWidth={2.5}
        strokeLinejoin="round"
        style={{
          opacity,
          pointerEvents: "none",
          transition: "fill 280ms ease, opacity 180ms ease",
        }}
      >
        {arrows.map((arrow, index) => (
          <path
            key={`${index}-${arrow.x}-${arrow.y}`}
            d="M -6 -5 L 7 0 L -6 5 Z"
            transform={`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`}
          />
        ))}
      </g>
    </>
  );
}

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
  const hasCorrection =
    data.isInCurrentStep && data.flowBefore !== null && data.flowChange !== null;
  const isIncrease = (data.flowChange ?? 0) >= 0;
  const isDimmed = data.hasCurrentStep && !data.isInCurrentStep && !data.selected;
  const labelOffset = getLabelOffset(
    data.labelOffsetX,
    data.labelOffsetY,
    hasCorrection,
  );
  const accessibleParameters =
    `，长度 ${data.length} m，管径 ${data.diameter} mm，海森-威廉系数 ${data.hazenWilliamsC}，阻力系数 ${data.resistance.toFixed(6)}`;
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
      <FlowDirectionArrows
        path={edgePath}
        color={data.color}
        reversed={reversed}
        opacity={isDimmed ? 0.22 : 1}
      />
      <EdgeLabelRenderer>
        <button
          type="button"
          onClick={() => data.onSelect(id)}
          className={`nodrag nopan absolute whitespace-nowrap rounded-lg border text-left shadow-sm backdrop-blur transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 ${
            hasCorrection ? "min-w-[196px] px-3 py-2" : "min-w-[184px] px-3 py-2"
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
            transform: `translate(-50%, -50%) translate(${labelX + labelOffset.x}px, ${labelY + labelOffset.y}px)`,
          }}
          aria-label={`选择${data.pipeName}${accessibleParameters}${accessibleCorrection}${reversed ? "，方向已反转" : ""}`}
        >
          <span className="block text-[10px] font-semibold leading-none">
            {data.pipeName}
          </span>
          <span className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-slate-200/80 pt-1.5 font-mono text-[9px] leading-none tabular-nums text-slate-500">
            <span>L <b className="font-medium text-slate-700">{data.length} m</b></span>
            <span>D <b className="font-medium text-slate-700">{data.diameter} mm</b></span>
            <span>C <b className="font-medium text-slate-700">{data.hazenWilliamsC}</b></span>
            <span>S <b className="font-medium text-slate-700">{data.resistance.toFixed(6)}</b></span>
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
            <span className="mt-1.5 flex items-center gap-1 font-mono text-[11px] font-semibold leading-none tabular-nums text-slate-800">
              q {formatFlow(data.flow)} {data.flowUnit}
            </span>
          )}
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
