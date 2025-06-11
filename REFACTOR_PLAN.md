# 重构计划：从 Ant Design 迁移到 shadcn/ui

---

## 总体目标

将项目的前端 UI 框架从 Ant Design 完全迁移到 `shadcn/ui`，同时确保项目的功能完整性、代码质量和无错误运行。

## 技术选型

*   **UI 库**: `shadcn/ui` (基于 Tailwind CSS)
*   **表单**: `react-hook-form` (与 `shadcn/ui` 结合使用)
*   **图标**: `lucide-react` (一个流行的 `shadcn/ui` 配套图标库)
*   **通知/提示**: `sonner` (一个与 `shadcn/ui` 风格一致的 toast 组件库)

## 项目重构流程图

```mermaid
graph TD
    subgraph Phase 1: 环境设置与基础组件迁移
        A[1. 初始化 shadcn/ui] --> B[2. 安装核心依赖];
        B --> C[3. 配置 Tailwind CSS];
        C --> D[4. 替换核心组件: Header, AccountSelector];
    end

    subgraph Phase 2: 复杂组件与表单重构
        E[5. 重构 WorkerForm] --> F[6. 重构页面布局: workerformpage];
        F --> G[7. 重构所有弹窗: AccountManagement, BulkDeployment, etc.];
    end

    subgraph Phase 3: 清理与验证
        H[8. 全局代码扫描与清理] --> I[9. 移除 AntD 依赖];
        I --> J[10. 执行 Lint 和 Build];
        J --> K[11. Playwright 端到端测试];
    end

    Phase 1 --> Phase 2;
    Phase 2 --> Phase 3;
    K --> L[🎉 重构完成];
```

---

## 详细任务清单

### 阶段一：环境设置与基础组件迁移

1.  **初始化 `shadcn/ui`**
    *   **任务**: 运行 `shadcn-ui` 的初始化命令，自动生成配置文件。
    *   **影响文件**: `tailwind.config.js`, `postcss.config.js`, `src/lib/utils.ts`, `components.json`, `src/theme.css` 或 `src/app.scss`。

2.  **安装 `shadcn/ui` 组件和依赖**
    *   **任务**: 使用 `shadcn-ui` CLI 安装我们将要用到的所有组件，并手动安装 `lucide-react` 和 `sonner`。

3.  **重构 `src/components/Header.tsx`**
    *   **任务**: 将 `antd` 组件 (`Button`, `Modal`, `Tooltip`, `Dropdown`) 和 `@ant-design/icons` 替换为 `shadcn/ui` 和 `lucide-react` 的对应项。

4.  **重构 `src/components/AccountSelector.tsx`**
    *   **任务**: 将 `antd` 组件 (`Select`, `Button`, `Tag`, `Avatar`) 替换为 `shadcn/ui` 的对应项。

---

### 阶段二：复杂组件与表单重构

5.  **重构 `src/components/WorkerForm.tsx` (核心难点)**
    *   **任务**: 使用 `react-hook-form` 重写表单逻辑，并将所有 `antd` 表单相关组件替换为 `shadcn/ui` 和 `sonner` 的对应项。

6.  **重构 `src/pages/workerformpage.tsx`**
    *   **任务**: 将 `antd/Card` 和 `antd/Breadcrumb` 替换为 `shadcn/ui` 的对应项。

7.  **重构其余弹窗组件**
    *   **影响文件**: `src/components/AccountManagement.tsx`, `src/components/BulkWorkerDeployment.tsx`, `src/components/ConfigManagement.tsx`
    *   **任务**: 将内部所有 `antd` 组件替换为对应的 `shadcn/ui` 组件。

---

### 阶段三：清理与验证

8.  **全局代码扫描与清理**
    *   **任务**: 再次搜索 `antd` 和 `@ant-design/icons` 的残留引用并清除。

9.  **移除 AntD 依赖**
    *   **任务**: 运行 `npm uninstall antd @ant-design/icons`。

10. **执行 Lint 和 Build**
    *   **任务**: 运行 `npm run lint` 和 `npm run build` 并修复所有错误。

11. **Playwright 端到端测试**
    *   **任务**: 编写并运行一个简单的端到端测试，确保应用在浏览器中无控制台错误。