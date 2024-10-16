import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          title: "CF Worker VLESS Setup",
          apiKeyDescription:
            "You need to provide the email and Global API Key of your CloudFlare account",
          howToGetApiKey: "How to get Global API Key",
          email: "Email",
          emailTooltip: "Email of your CloudFlare account",
          globalAPIKey: "Global API Key",
          globalAPIKeyTooltip: "Global API Key of your CloudFlare account",
          additionalParams: "Additional Parameters",
          workerName: "Worker Name",
          workerNameTooltip: "Name of the CloudFlare Worker",
          uuid: "UUID",
          uuidTooltip: "UUID of the node",
          nodeName: "Node Name",
          nodeNameTooltip: "Name of the node",
          createWorkerNode: "Create Worker VLESS Node",
          clearSavedData: "Clear Saved Data",
          workerNodeAddress: "VLESS URL:",
          importToClash: "Import to Clash",
          importToShadowrocket: "Import to Shadowrocket",
          manageNode: "Manage Node",
          nodeInfoPlaceholder: "Node information will be displayed here",
          copiedSuccess: "Copied successfully",
          workerCreationSuccess: "Worker node created successfully!",
          workerCreationFail:
            "Failed to create Worker node. Please check your input and try again.",
          dataClearedSuccess: "Saved data has been cleared",
          apiKeyInstructions1:
            '1. Log in to your CloudFlare account and go to the <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer">API Tokens</a> page.',
          apiKeyInstructions2: "2. Find the <b>Global API Key</b> and copy it.",
          apiKeyInstructions3:
            "3. Paste the <b>Global API Key</b> into the input box below.",
          metaDescription: "Create and manage Cloudflare Worker VLESS nodes easily with our user-friendly interface. Optimize your network performance and security.",
        },
      },
      zh: {
        translation: {
          title: "CF Worker 节点搭建",
          apiKeyDescription:
            "需要提供 CloudFlare 账号的 邮箱 和 Global API Key",
          howToGetApiKey: "如何获取 Global API Key",
          email: "邮箱",
          emailTooltip: "CloudFlare 账号的邮箱",
          globalAPIKey: "Global API Key",
          globalAPIKeyTooltip: "CloudFlare 账号的 Global API Key",
          additionalParams: "额外参数",
          workerName: "Worker名称",
          workerNameTooltip: "CloudFlare Worker 的名字",
          uuid: "UUID",
          uuidTooltip: "节点的uuid",
          nodeName: "节点名",
          nodeNameTooltip: "节点的名字",
          createWorkerNode: "创建 Worker 节点",
          clearSavedData: "清除保存的数据",
          workerNodeAddress: "Worker 节点地址:",
          importToClash: "导入到 Clash",
          importToShadowrocket: "导入到小火箭",
          manageNode: "管理节点",
          nodeInfoPlaceholder: "节点信息将在这里显示",
          copiedSuccess: "复制成功",
          workerCreationSuccess: "Worker 节点创建成功！",
          workerCreationFail: "创建 Worker 节点失败，请检查您的输入并重试。",
          dataClearedSuccess: "已清除保存的数据",
          apiKeyInstructions1:
            '1. 登录 CloudFlare 账号，进入 <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer">API Tokens</a> 页面。',
          apiKeyInstructions2: "2. 找到 <b>Global API Key</b> 并复制。",
          apiKeyInstructions3:
            "3. 将 <b>Global API Key</b> 粘贴到下面的输入框中。",
          metaDescription: "轻松创建和管理 Cloudflare Worker VLESS 节点。优化您的网络性能和安全性。",
        },
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
