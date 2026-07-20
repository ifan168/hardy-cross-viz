import { IterationCalculationPanel } from "@/components/calculation/iteration-calculation-panel";
import { IterationHistoryPanel } from "@/components/calculation/iteration-history-panel";
import { SimulationControlPanel } from "@/components/control/simulation-control-panel";
import { SimulationStatusPanel } from "@/components/control/simulation-status-panel";
import { DynamicLearningPath } from "@/components/education/dynamic-learning-path";
import { AppHeader } from "@/components/layout/app-header";
import { InteractiveNetworkCanvas } from "@/components/network/interactive-network-canvas";

export function App() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <AppHeader />

      {/* 主工作区在宽屏采用“画布 + 控制栏”，窄屏自动改为纵向布局。 */}
      <main className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-4 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          <InteractiveNetworkCanvas />
          <IterationCalculationPanel />
          <IterationHistoryPanel />
        </div>

        <aside className="space-y-4" aria-label="平差教学控制与状态">
          <SimulationControlPanel />
          <SimulationStatusPanel />
          <DynamicLearningPath />
        </aside>
      </main>
    </div>
  );
}
