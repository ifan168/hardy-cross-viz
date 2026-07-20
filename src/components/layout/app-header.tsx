import { Droplets, GraduationCap } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/20">
            <Droplets className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                水衡 · 给水环网平差教学系统
              </h1>
              <span className="hidden rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-200 sm:inline-flex">
                教学版
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              Hardy Cross 流量校正法 · 双环管网演示
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
          <GraduationCap className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">教学准备就绪</span>
          <span className="sm:hidden">就绪</span>
        </div>
      </div>
    </header>
  );
}
