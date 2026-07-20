import { Calculator, CornerDownRight, Info, Repeat2 } from "lucide-react";

import { EducationalTooltip } from "@/components/ui/educational-tooltip";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useSimulation } from "@/features/simulation/use-simulation";
import { cn } from "@/lib/utils";

function formatSigned(value: number, digits = 4): string {
  const normalized = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return `${normalized >= 0 ? "+" : ""}${normalized.toFixed(digits)}`;
}

export function IterationCalculationPanel() {
  const {
    currentStep,
    network,
    selectedPipeId,
    selectPipe,
    phase,
  } = useSimulation();
  const exponentMinusOne = (network.exponent - 1).toFixed(3);

  return (
    <Panel className="overflow-hidden">
      <PanelHeader className="items-center">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="size-4 text-sky-600" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900">当前环路计算明细</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            逐管段展示本步闭合差、分母项和流量修正
          </p>
        </div>
        {currentStep ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              Iteration {currentStep.iteration}
            </span>
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
              {currentStep.loopName}
            </span>
          </div>
        ) : (
          <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            <Info className="size-3.5" aria-hidden="true" />
            等待单步计算
          </div>
        )}
      </PanelHeader>

      {currentStep ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-slate-500">管段</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-500">
                    环向
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                    当前 q ({network.flowUnit})
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                    S
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center justify-end gap-1">
                      h = S·q·|q|<sup>{exponentMinusOne}</sup>
                      <EducationalTooltip label="解释有符号水头损失">
                        先把 q 换算为环路遍历方向；同向为正、反向为负，因此 h 也保留方向符号。
                      </EducationalTooltip>
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                    {network.exponent.toFixed(3)}·S·|q|<sup>{exponentMinusOne}</sup>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                    本管校正
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                    校正后 q′
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentStep.rows.map((row) => (
                  <tr
                    key={row.pipeId}
                    className={cn(
                      "border-b border-slate-100 transition-colors last:border-b-0",
                      row.pipeId === selectedPipeId ? "bg-sky-50/70" : "hover:bg-slate-50/70",
                    )}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => selectPipe(row.pipeId)}
                        className="font-semibold text-slate-800 outline-none hover:text-sky-700 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-500/50"
                      >
                        {row.pipeId}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                          row.direction > 0
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-700",
                        )}
                        aria-label={row.direction > 0 ? "与环路方向一致" : "与环路方向相反"}
                      >
                        {row.direction > 0 ? "+" : "−"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-700">
                      {formatSigned(row.flowBefore, 3)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-500">
                      {row.resistance.toFixed(6)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-700">
                      {formatSigned(row.signedHeadLoss)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-700">
                      {row.derivative.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-medium tabular-nums text-sky-700">
                      {formatSigned(row.correctionContribution)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-mono text-xs font-semibold tabular-nums",
                        row.flowAfter < 0 ? "text-rose-600" : "text-slate-900",
                      )}
                    >
                      {formatSigned(row.flowAfter, 3)}
                      {row.reversed ? (
                        <span className="ml-1.5 rounded bg-rose-100 px-1.5 py-0.5 font-sans text-[9px] text-rose-700">
                          反转
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] text-slate-500">闭合差 Σh</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900">
                {formatSigned(currentStep.headLossSum)} m
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">
                分母 Σ({network.exponent.toFixed(3)}·S·|q|<sup>{exponentMinusOne}</sup>)
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900">
                {currentStep.derivativeSum.toFixed(5)}
              </p>
            </div>
            <div className="rounded-lg bg-sky-600 px-3 py-2.5 text-white shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] text-sky-100">
                <Repeat2 className="size-3" aria-hidden="true" />
                环校正流量 Δq
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
                {formatSigned(currentStep.correction)} {network.flowUnit}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-52 items-center justify-center px-5 py-10 text-center">
          <div className="max-w-md">
            <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <CornerDownRight className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-700">
              {phase === "idle" ? "点击“开始平差”进入教学过程" : "点击“下一步”计算左环闭合差"}
            </p>
            <p className="mt-1.5 text-xs leading-5 text-slate-400">
              表格会保留正负号，帮助判断管段假定方向、环路方向与实际流向之间的关系。
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}
