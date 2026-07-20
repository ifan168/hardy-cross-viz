# 水衡 · 给水环网平差可视化教学系统

[English](README_EN.md) | 简体中文

一个面向环境工程、给排水科学与工程专业教学的 Hardy Cross 给水环网平差可视化应用。系统不仅给出最终结果，还将每一次环路校正、每条管段的流量增减和流向变化直接呈现在拓扑图上。

![初始双环管网](docs/screenshots/initial-network.png)

## 主要功能

- 经典双环给水管网教学案例，包含节点需水量、管长、管径、海森-威廉系数和阻力系数。
- Hardy Cross 流量校正算法，完整保留每轮迭代和每个环路的计算状态。
- “开始平差”“下一步”“直接看结果”“重置”四种教学控制。
- 管段直接显示“校正前流量 → 校正后流量”和本步 `Δq`。
- 管线上绘制实际流向箭头；负流量出现时，箭头自动反向且管段变红。
- 本步参与计算的管段高亮，未参与管段自动弱化。
- 逐管段展示 `q`、`S`、`h = Sq|q|`、`2S|q|`、校正量和校正后流量。
- 完整迭代历史、收敛状态和教学 Tooltip。
- 支持桌面端和移动端布局。

## 单步校正示例

下图展示第 1 轮右环校正。P3 流量增加，P5、P6、P7 流量减少；P7 校正后成为负流量，管线箭头随即反向并变红。

![单步校正与流向反转](docs/screenshots/step-correction-reversal.png)

## 算法说明

教学案例采用二次阻力模型：

```text
h = S · q · |q|
```

每个环路的 Hardy Cross 校正量为：

```text
Δq = -Σh / Σ(2S|q|)
```

系统在每轮迭代中依次校正左环和右环。共用管段会依照两个环路的遍历方向分别更新。所有环路闭合差满足阈值后，平差结束。

> 本项目用于算法教学与可视化演示。实际工程设计应结合现行规范、可靠的水力模型、边界条件和校核软件。

## 技术栈

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Flow (`@xyflow/react`)
- Radix UI Tooltip
- Vitest + ESLint

## 本地运行

要求 Node.js 20.19+。

```bash
npm install
npm run dev
```

浏览器访问 Vite 输出的本地地址，默认通常为 `http://localhost:5173`。

## 常用命令

```bash
# 开发服务器
npm run dev

# 算法测试
npm test

# 代码检查
npm run lint

# 生产构建
npm run build
```

## 项目结构

```text
src/
├─ components/                 # 页面、控制面板、计算表格与通用 UI
├─ features/
│  ├─ hardy-cross/             # Hardy Cross 算法与测试
│  ├─ network/                 # 双环案例、节点和管段可视化
│  └─ simulation/              # 单步执行状态与 React Context
├─ App.tsx
└─ main.tsx
docs/screenshots/              # README 功能截图
```

## 验证

当前版本通过以下检查：

- Hardy Cross 算法单元测试
- TypeScript 严格类型检查
- ESLint
- Vite 生产构建
- 桌面端及窄屏交互验证

## License

[MIT](LICENSE)
