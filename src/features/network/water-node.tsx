import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Droplets, Gauge } from "lucide-react";

export interface WaterNodeData extends Record<string, unknown> {
  name: string;
  demand: number;
  kind: "source" | "junction";
  flowUnit: string;
}

export type WaterNodeType = Node<WaterNodeData, "waterNode">;

const hiddenHandleClass = "!size-2 !border-0 !bg-transparent !opacity-0";

export function WaterNode({ data }: NodeProps<WaterNodeType>) {
  const isSource = data.kind === "source";

  return (
    <div
      className={`min-w-28 rounded-xl border bg-white px-3 py-2.5 shadow-md transition-shadow ${
        isSource
          ? "border-sky-300 ring-4 ring-sky-100/80"
          : "border-slate-200 hover:shadow-lg"
      }`}
      aria-label={`${data.name}，${isSource ? "供水" : "需水"} ${Math.abs(data.demand)} ${data.flowUnit}`}
    >
      <Handle id="left-target" type="target" position={Position.Left} className={hiddenHandleClass} />
      <Handle id="left-source" type="source" position={Position.Left} className={hiddenHandleClass} />
      <Handle id="right-target" type="target" position={Position.Right} className={hiddenHandleClass} />
      <Handle id="right-source" type="source" position={Position.Right} className={hiddenHandleClass} />
      <Handle id="top-target" type="target" position={Position.Top} className={hiddenHandleClass} />
      <Handle id="top-source" type="source" position={Position.Top} className={hiddenHandleClass} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className={hiddenHandleClass} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className={hiddenHandleClass} />

      <div className="flex items-center gap-2">
        <span
          className={`flex size-7 items-center justify-center rounded-lg ${
            isSource ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {isSource ? (
            <Droplets className="size-3.5" aria-hidden="true" />
          ) : (
            <Gauge className="size-3.5" aria-hidden="true" />
          )}
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-900">{data.name}</p>
          <p className={`mt-0.5 text-[11px] ${isSource ? "text-sky-700" : "text-slate-500"}`}>
            {isSource ? "供水" : "需水"} {Math.abs(data.demand)} {data.flowUnit}
          </p>
        </div>
      </div>
    </div>
  );
}
