CF Worker 管理台 UI 重构 — TODO Checklist

面向开发者的逐项任务清单，结合现有源代码（App.tsx、AccountManagement.tsx、ThemeContext.tsx 等）与前期 UI/交互评审结果，按优先级排列。勾选✅即代表已完成。

⸻

0 · 准备工作
	•	升级依赖：
	•	升级 antd 到 v5.x，并锁定版本。
	•	安装 @ant-design/icons, react-router-dom ^6（如需）与 uuid。
	•	目录拆分：新建 components/, pages/, hooks/, contexts/ 目录；将现有文件移动到相应位置。
	•	TypeScript 严格模式：在 tsconfig.json 开启 strict: true 并修复报错。

⸻

1 · 全局主题 / Layout
	•	ConfigProvider 封装 (App.tsx)
	•	将现有 ThemeContext 与 AntD ConfigProvider 的 theme.algorithm（暗/亮）整合。
	•	提供 ThemeSwitcher 组件（使用 <Switch>，放在 Header 右侧）。
	•	页面骨架
	•	重构为 <Layout> → <Sider> + <Content> 结构；Sider 放置 账号切换 + 菜单。
	•	在 Content 顶部插 <Breadcrumb>（路由集成）。
	•	使用 <Card bordered={false}> 承载主要表单页面。

⸻

2 · 账户管理（AccountManagement.tsx）
	•	将 <Select> 换为 Drawer + List：
	•	点击当前邮箱弹出 Drawer，列出全部账号（<List itemLayout="horizontal">）。
	•	列表项：Avatar + PrimaryText + 副标题（标签 “默认”）。
	•	底部固定操作区：新增账号 / 管理账号。
	•	抽离逻辑至 useAccounts.ts：封装 addAccount / remove / selectCurrent。
	•	为 AccountManagement 添加 Skeleton 加载状态。

⸻

3 · Worker Form（新建 components/WorkerForm.tsx）
	•	重写表单：
	•	使用 Form + useForm()；字段：WorkerName、UUID、NodeName、useSocks、proxyIp、socksProxy、customDomain。
	•	必填校验：WorkerName、UUID。
	•	UUID 字段后缀按钮：<Tooltip title="生成 UUID"><Button icon={<ReloadOutlined />} onClick={genUuid} /></Tooltip>。
	•	useSocks 为 <Switch>；Form.Item noStyle shouldUpdate 动态显示 socksProxy 输入框。
	•	把 高级设置 放在 <Collapse> 「高级参数」。
	•	proxyIp 使用 Input.Group + 获取IP按钮。
	•	提交处理：
	•	使用 notification.success/error 反馈。
	•	提交按钮 loading 状态绑定 isSubmitting。

⸻

4 · 批量部署弹窗（BulkDeployment Modal）
	•	新建 components/BulkDeployModal.tsx。
	•	用 <Modal> + <Tabs>：Bulk Deployment / Deployment History。
	•	目标账号多选：Select mode="multiple" optionLabelProp="label" maxTagCount="responsive"。
	•	进度表格：<Table>，第一列 Progress + Badge 颜色；失败行可点击展开 <Drawer> 查看日志。
	•	右上角 StopOutlined 按钮 + Popconfirm 停止全部任务。

⸻

5 · Footer.tsx
	•	使用 AntD <FloatButton.BackTop />。
	•	版权信息放 <Typography.Text type="secondary">。

⸻

6 · 多语言 (i18n.ts)
	•	整合 react-i18next：
	•	将静态中文文案替换为 t('key')。
	•	添加英文资源包。
	•	在 Header 放语言切换下拉。

⸻

7 · 样式（app.scss & theme.css）
	•	删除无用全局选择器，改用 CSS vars + AntD token。
	•	body.dark/body.light 逻辑迁移到 ConfigProvider.theme 调色。
	•	组件级样式放置 components/*.module.scss。

⸻

8 · 路由与状态
	•	使用 react-router-dom@6：
	•	/ → WorkerForm
	•	/bulk → BulkDeploy
	•	使用 zustand 或 context + reducer 管理全局状态（当前账号、Workers 列表）。

⸻
x s

⸻

✅ 完成以上任务后：
	1.	手动验收暗/亮主题、i18n、批量部署全部流程。
	2.	打 Tag v1.0.0 并编写 Release Note。

⸻

如需拆分任务到 JIRA / GitHub Projects，可直接用此文档逐行复制创建卡片。

11 · 其他核心组件补充
	•	AccountSelector.tsx：删除独立组件，将选择逻辑并入 AccountManagement Drawer 内的 AccountList。
	•	VirtualAccountList.tsx：重命名为 AccountList，使用 react-window 支持上千账号虚拟滚动。
	•	GlobalShortcuts.tsx：集成 react-hotkeys-hook，实现 ? 打开快捷键帮助 Modal，g a 切换账号，g w 打开新建 Worker。
	•	Header.tsx：添加 ThemeSwitcher、LanguageSelector，右侧 Help 下拉整合快捷键帮助。
	•	NodeOutput.tsx：抽成独立 Drawer，供批量部署与单 Worker 日志查看共用。

12 · 批量部署模块补充
	•	将 BulkWorkerDeployment.tsx 拆分为 BulkDeployModal (UI) 与 useBulkDeploy (逻辑 hook)。
	•	表格列新增「查看日志」→ 触发 NodeOutput Drawer；失败行支持 RetryOutlined 重试。
	•	任务结果支持导出 CSV (json2csv + FileSaver)。

13 · 配置管理页（ConfigManagement.tsx）
	•	新增路由 /configs 显示配置列表，使用 EditableProTable 实现增删改。
	•	顶部工具栏加入关键字搜索、按标签过滤。
	•	保存时调用统一 saveConfigs API，成功后 notification.success。

14 · 状态管理（AccountContext.tsx）
	•	将 AccountContext 改造成 Context + Reducer，并暴露 useAccountState / useAccountDispatch hooks。
	•	与 zustand 比较后保留其一，避免双重来源。
	•	在 App.tsx 顶层包裹 <AccountProvider>，移除组件内部多余的 useState。
	•	为 AccountContext 编写单元测试（切换账号、添加账号）。

15 · API 客户端（apiClient.ts）
	•	使用 axios.create 设定 baseURL 与超时；统一 interceptors 处理 token 过期 / 错误提示。
	•	支持 Mock 开关：开发环境自动指向 msw mock 服务。
	•	暴露 request<T>(config) 泛型函数；重构所有 fetch 调用。
	•	在 src/hooks/useWorkers.ts 内调用 apiClient 完成 CRUD。

16 · 本地存储封装（storage.ts）
	•	用 localforage 代替 localStorage，统一异步 API。
	•	实现 setWithTTL / getWithTTL：过期后自动清理。
	•	加密敏感字段（如 accessToken）可选配置 crypto-js。
	•	为 storage.ts 增加 Vitest 覆盖：写入、读取、TTL 失效。

17 · 类型与常量（account.ts, constants.ts, cityToCountry.ts）
	•	account.ts 中的接口类型迁移至 @/types/account.d.ts。
	•	constants.ts 拆成 apiEndpoints, themeTokens, storageKeys 多文件，便于 tree-shaking。
	•	cityToCountry.ts 改为动态 import()；提供 getCountryByCity(city) 带缓存（Map）。
	•	在数据量大时考虑生成 JSON 并按需加载（webpack chunk）。