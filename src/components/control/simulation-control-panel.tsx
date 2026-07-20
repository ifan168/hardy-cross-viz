import { CheckCircle2, Eye, Play, RotateCcw, StepForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EducationalTooltip } from "@/components/ui/educational-tooltip";
import { Panel, PanelContent, PanelHeader } from "@/components/ui/panel";
import { useSimulation } from "@/features/simulation/use-simulation";

export function SimulationControlPanel() {
  const {
    network,
    phase,
    stepIndex,
    result,
    progress,
    start,
    next,
    showResult,
    reset,
  } = useSimulation();
  const exponentMinusOne = (network.exponent - 1).toFixed(3);

  const statusLabel = phase === "idle"
    ? "尚未开始"
    : phase === "completed"
      ? "平差完成"
      : "逐步计算中";

  return (
    <Panel>
      <PanelHeader>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">平差控制台</h2>
          <p className="mt-1 text-xs text-slate-500">每次“下一步”完成一个环路校正</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            phase === "completed"
              ? "bg-emerald-50 text-emerald-700"
              : phase === "running"
                ? "bg-sky-50 text-sky-700"
                : "bg-slate-100 text-slate-600"
          }`}
          aria-live="polite"
        >
          {phase === "completed" ? <CheckCircle2 className="size-3" aria-hidden="true" /> : null}
          {statusLabel}
        </span>
      </PanelHeader>

      <PanelContent>
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={start}
          >
            <Play />
            {phase === "idle" ? "开始平差" : "重新开始"}
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={next}
            disabled={phase !== "running"}
          >
            <StepForward />
            下一步
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={showResult}
            disabled={phase === "completed"}
          >
            <Eye />
            直接看结果
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={reset}
            disabled={phase === "idle"}
          >
            <RotateCcw />
            重置
          </Button>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">计算进度</span>
            <span className="tabular-nums text-slate-500">
              {Math.round(progress)}% · {Math.max(stepIndex + 1, 0)}/{result.steps.length} 步
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="平差计算进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="h-full rounded-full bg-sky-600 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-sky-50 px-3.5 py-3 text-xs leading-5 text-sky-900">
          <div className="flex items-center gap-1.5 font-medium">
            校正公式
            <EducationalTooltip label="解释 Hardy Cross 校正公式" side="left">
              海森-威廉指数 n = {network.exponent.toFixed(3)}；闭合差 Σh 越大，需要的流量校正越明显，负号使校正方向抵消当前闭合差。
            </EducationalTooltip>
          </div>
          <p className="mt-1 font-mono text-[11px] tabular-nums">
            Δq = −Σh / Σ({network.exponent.toFixed(3)}·S·|q|
            <sup>{exponentMinusOne}</sup>)
          </p>
        </div>
      </PanelContent>
    </Panel>
  );
}
