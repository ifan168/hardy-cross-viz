import { Check, Circle, PlayCircle } from "lucide-react";

import { Panel, PanelContent, PanelHeader } from "@/components/ui/panel";
import { useSimulation } from "@/features/simulation/use-simulation";
import { cn } from "@/lib/utils";

export function DynamicLearningPath() {
  const { phase, currentStep } = useSimulation();

  const steps = [
    {
      id: "continuity",
      title: "检查初始流量",
      description: "节点流入 = 节点流出 + 需水量",
      state: phase === "idle" ? "active" : "done",
    },
    {
      id: "correction",
      title: "逐环计算与校正",
      description: phase === "completed"
        ? "??????????????"
        : currentStep
        ? `正在观察第 ${currentStep.iteration} 轮 ${currentStep.loopName}`
        : "计算 Σh、2S|q| 与 Δq",
      state: phase === "running" ? "active" : phase === "completed" ? "done" : "pending",
    },
    {
      id: "convergence",
      title: "判断是否收敛",
      description: "两个环路的闭合差均低于阈值",
      state: phase === "completed" ? "done" : "pending",
    },
  ] as const;

  return (
    <Panel>
      <PanelHeader>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">学习路径</h2>
          <p className="mt-1 text-xs text-slate-500">跟随状态理解算法，而非只看答案</p>
        </div>
      </PanelHeader>
      <PanelContent>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex gap-3">
              {index < steps.length - 1 ? (
                <span className="absolute left-[13px] top-7 h-[calc(100%+0.25rem)] w-px bg-slate-200" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full",
                  step.state === "done"
                    ? "bg-emerald-500 text-white"
                    : step.state === "active"
                      ? "bg-sky-600 text-white ring-4 ring-sky-50"
                      : "bg-slate-100 text-slate-400",
                )}
              >
                {step.state === "done" ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : step.state === "active" ? (
                  <PlayCircle className="size-3.5" aria-hidden="true" />
                ) : (
                  <Circle className="size-3" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className={cn("text-sm font-medium", step.state === "pending" ? "text-slate-500" : "text-slate-900")}>
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-slate-400">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </PanelContent>
    </Panel>
  );
}
