import { Activity, CircleGauge, RefreshCw, Route } from "lucide-react";

import { EducationalTooltip } from "@/components/ui/educational-tooltip";
import { Panel, PanelContent, PanelHeader } from "@/components/ui/panel";
import { useSimulation } from "@/features/simulation/use-simulation";

function formatSigned(value: number, digits = 4): string {
  const normalized = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return `${normalized >= 0 ? "+" : ""}${normalized.toFixed(digits)}`;
}

export function SimulationStatusPanel() {
  const { phase, currentStep, currentIteration, result, network } = useSimulation();
  const isIterationComplete = currentStep?.loopId === network.loops.at(-1)?.id;

  const statusItems = [
    {
      label: "当前迭代",
      value: currentStep ? `${currentStep.iteration} / ${result.iterations.length}` : "—",
      icon: RefreshCw,
    },
    {
      label: "当前环路",
      value: currentStep?.loopName ?? "—",
      icon: Route,
    },
    {
      label: "本步闭合差 Σh",
      value: currentStep ? `${formatSigned(currentStep.headLossSum)} m` : "—",
      icon: Activity,
    },
    {
      label: "本步校正量 Δq",
      value: currentStep ? `${formatSigned(currentStep.correction)} L/s` : "—",
      icon: CircleGauge,
    },
  ];

  const finalResidual = result.iterations.at(-1)?.maxLoopImbalance ?? 0;

  return (
    <Panel>
      <PanelHeader>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-slate-900">迭代状态</h2>
            <EducationalTooltip label="解释闭合差">
              闭合差是沿同一环路按方向累加的水头损失 Σh；理想平衡状态下应趋近于 0。
            </EducationalTooltip>
          </div>
          <p className="mt-1 text-xs text-slate-500">闭合差与校正量随单步计算更新</p>
        </div>
      </PanelHeader>
      <PanelContent className="space-y-2.5">
        {statusItems.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between gap-3 py-1.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <Icon className="size-4 text-slate-400" aria-hidden="true" />
              {label}
            </div>
            <span className="text-xs font-semibold tabular-nums text-slate-900">
              {value}
            </span>
          </div>
        ))}

        <div className="mt-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">收敛阈值</span>
            <span className="font-medium tabular-nums text-slate-800">
              |Σh|max ≤ {result.tolerance.toFixed(3)} m
            </span>
          </div>
          {phase === "completed" ? (
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              已收敛：最终最大闭合差 {finalResidual.toExponential(2)} m
            </p>
          ) : currentIteration && isIterationComplete ? (
            <p className="mt-2 text-[11px] text-slate-400">
              第 {currentIteration.iteration} 轮全部环校正后的残差：{currentIteration.maxLoopImbalance.toFixed(5)} m
            </p>
          ) : null}
        </div>
      </PanelContent>
    </Panel>
  );
}
