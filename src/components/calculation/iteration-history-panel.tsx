import { History } from "lucide-react";

import { Panel, PanelHeader } from "@/components/ui/panel";
import { useSimulation } from "@/features/simulation/use-simulation";

function formatSigned(value: number): string {
  const normalized = Math.abs(value) < 0.00005 ? 0 : value;
  return `${normalized >= 0 ? "+" : ""}${normalized.toFixed(4)}`;
}

export function IterationHistoryPanel() {
  const { executedSteps, stepIndex, phase } = useSimulation();

  return (
    <Panel className="overflow-hidden">
      <PanelHeader className="items-center">
        <div>
          <div className="flex items-center gap-2">
            <History className="size-4 text-sky-600" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900">迭代记录</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">完整保留每轮中两个环的闭合差与校正量</p>
        </div>
        <span className="text-xs tabular-nums text-slate-400">
          {executedSteps.length} 条记录
        </span>
      </PanelHeader>

      {executedSteps.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                <th scope="col" className="px-5 py-3 text-xs font-medium text-slate-500">迭代</th>
                <th scope="col" className="px-5 py-3 text-xs font-medium text-slate-500">环路</th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-slate-500">闭合差 Σh (m)</th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-slate-500">校正量 Δq (L/s)</th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-slate-500">流向变化</th>
              </tr>
            </thead>
            <tbody>
              {executedSteps.map((step, index) => (
                <tr
                  key={`${step.iteration}-${step.loopId}`}
                  className={`border-b border-slate-100 last:border-b-0 ${index === stepIndex ? "bg-sky-50/70" : ""}`}
                >
                  <td className="px-5 py-3 text-xs font-medium tabular-nums text-slate-700">
                    {step.iteration}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{step.loopName}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-slate-700">
                    {formatSigned(step.headLossSum)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-xs font-medium tabular-nums text-sky-700">
                    {formatSigned(step.correction)}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-slate-500">
                    {step.reversedPipeIds.length ? (
                      <span className="rounded-full bg-rose-50 px-2 py-1 font-medium text-rose-700">
                        {step.reversedPipeIds.join("、")} 反转
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {phase === "completed" ? (
            <div className="border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-xs font-medium text-emerald-700">
              已满足收敛条件，以上记录构成完整的平差轨迹。
            </div>
          ) : null}
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-xs text-slate-400">
          单步执行后将在这里追加记录。
        </div>
      )}
    </Panel>
  );
}
