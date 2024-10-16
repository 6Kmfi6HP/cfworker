import {
  Button,
  Collapse,
  Form,
  Image,
  Input,
  Modal,
  Space,
  Tag,
  Tooltip,
  message,
  Switch,
} from "antd";
import { CloudUploadOutlined, ThunderboltOutlined, RocketOutlined, ReloadOutlined, AccountBookFilled, DeleteOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { v4 as uuidv4 } from 'uuid';
import Footer from './Footer';

import img from "./getGlobalAPIKey.png";

// Add this array of words for generating worker names
const words = ['swift', 'breeze', 'cloud', 'spark', 'nova', 'pulse', 'wave', 'flux', 'echo', 'zephyr', 'blaze', 'comet', 'drift', 'ember', 'flare', 'glow', 'haze', 'mist', 'quasar', 'ray', 'shine', 'twilight', 'vortex', 'whirl', 'zenith'];

// Add this new import for the Cloudflare logo

// Add this new import for the useTheme hook
import { ThemeProvider, useTheme } from './ThemeContext';

import './theme.css';

function App() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [node, setNode] = useState(
    "vless://d342d11e-d424-4583-b36e-524ab1f0afa4@www.visa.com.sg:8880?encryption=none&security=none&type=ws&host=a.srps7gic.workers.dev&path=%2F%3Fed%3D2560#worker节点"
  );
  const [url, setUrl] = useState(
    "https://www.cloudflare.com/"
  );
  const [form] = Form.useForm();
  const [isNodeGenerated, setIsNodeGenerated] = useState(false);

  // Load saved form data on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('cfWorkerFormData');
    if (savedFormData) {
      form.setFieldsValue(JSON.parse(savedFormData));
    }
  }, [form]);

  // Save form data in real-time
  const saveFormData = useCallback(() => {
    const currentValues = form.getFieldsValue();
    localStorage.setItem('cfWorkerFormData', JSON.stringify(currentValues));
  }, [form]);

  const createWorker = useCallback(async () => {
    setLoading(true);
    try {
      const formData = await form.validateFields();
      console.log(formData);
      const { data } = await axios.post(
        "https://cfworkerback-pages.pages.dev/createWorker",
        formData
      );

      setNode(data.node);
      setUrl(data.url);
      setIsNodeGenerated(true);  // 设置节点已生成
      message.success("Worker 节点创建成功！");
    } catch (error) {
      console.error("创建 Worker 节点失败:", error);
      message.error("创建 Worker 节点失败，请检查您的输入并重试。");
    }

    setLoading(false);
  }, [form]);

  const generateUUID = () => {
    const newUUID = uuidv4();
    form.setFieldsValue({ uuid: newUUID });
  };

  const generateWorkerName = () => {
    const randomWord1 = words[Math.floor(Math.random() * words.length)];
    const randomWord2 = words[Math.floor(Math.random() * words.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const newWorkerName = `${randomWord1}-${randomWord2}-${randomNumber}`;
    form.setFieldsValue({ workerName: newWorkerName });
  };

  // Function to clear saved form data
  const clearSavedData = () => {
    localStorage.removeItem('cfWorkerFormData');
    form.resetFields();
    message.success("已清除保存的数据");
  };

  // Add this useEffect hook to set the document title
  useEffect(() => {
    document.title = "CF Worker 节点搭建";
  }, []);

  // Add these new hooks for theme management
  const { theme, setTheme } = useTheme();

  const nodeOutputStyle = {
    backgroundColor: theme === 'dark' ? '#141414' : '#f0f2f5',
    color: theme === 'dark' ? '#ffffff' : '#333333',
    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
    borderRadius: '8px',
    padding: '24px',
    marginTop: '32px',
    transition: 'filter 0.3s ease-in-out',
  };

  const titleStyle = {
    color: theme === 'dark' ? '#40a9ff' : '#1890ff',
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '20px',
  };

  const copyTextStyle = {
    backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
    borderRadius: '4px',
    padding: '12px',
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.875rem',
    lineHeight: 1.5,
    wordBreak: 'break-all' as const,
    color: theme === 'dark' ? '#ffffff' : '#333333',
  };

  return (
    <div className={`page ${theme}`}>
      <div className="header">
        <h1>
          CF Worker 节点搭建
          <Switch
            checkedChildren={<SunOutlined />}
            unCheckedChildren={<MoonOutlined />}
            checked={theme === 'light'}
            onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ marginLeft: '10px' }}
          />
        </h1>
        <p>
          需要提供 CloudFlare 账号的 <Tag color="blue">邮箱</Tag> 和 <Tag color="blue">Global API Key</Tag>{" "}
          <Button size="large" color="default" type="link" onClick={() => setOpen(true)}>
            如何获取 Global API Key
          </Button>
        </p>
      </div>

      <Modal
        open={open}
        footer={null}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <Image src={img} alt="" />
        <p>
          1. 登录 CloudFlare 账号，进入 <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank">API Tokens</a> 页面。
        </p>
        <p>
          2. 找到 <b>Global API Key</b> 并复制。
        </p>
        <p>
          3. 将 <b>Global API Key</b> 粘贴到下面的输入框中。
        </p>
      </Modal>

      <Form
        layout="vertical"
        form={form}
        onValuesChange={saveFormData}
      >
        <Form.Item
          rules={[
            {
              required: true,
              type: "email",
              message: "请输入 CloudFlare 账号的 邮箱",
            },
          ]}
          label={<Tooltip title="CloudFlare 账号的 邮箱">邮箱</Tooltip>}
          name={"email"}
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "请输入 CloudFlare 账号的  Global API Key",
            },
          ]}
          label={
            <Tooltip title="CloudFlare 账号的  Global API Key">
              Global API Key
            </Tooltip>
          }
          name={"globalAPIKey"}
        >
          <Input />
        </Form.Item>

        <Collapse
          style={{ marginBottom: 24 }}
          items={[
            {
              key: "1",
              label: "额外参数",
              children: (
                <>
                  <Form.Item
                    label={
                      <Tooltip title="CloudFlare Worker 的名字">
                        Worker名称
                      </Tooltip>
                    }
                    name={"workerName"}
                  >
                    <Input
                      suffix={
                        <Tooltip title="生成随机Worker名称">
                          <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={generateWorkerName}
                            style={{ border: 'none', padding: 0 }}
                          />
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label={<Tooltip title="节点的uuid">UUID</Tooltip>}
                    name={"uuid"}
                  >
                    <Input
                      suffix={
                        <Tooltip title="生成新的UUID">
                          <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={generateUUID}
                            style={{ border: 'none', padding: 0 }}
                          />
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label={<Tooltip title="节点的名字">节点名</Tooltip>}
                    name={"nodeName"}
                  >
                    <Input />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />

        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
          <Button
            type="primary"
            loading={loading}
            onClick={createWorker}
            icon={<CloudUploadOutlined />}
          >
            创建 Worker 节点
          </Button>
          <Button
            onClick={clearSavedData}
            icon={<DeleteOutlined />}
          >
            清除保存的数据
          </Button>
        </Space>
      </Form>

      <div
        style={nodeOutputStyle}
        className={`node-output ${isNodeGenerated ? 'active' : 'blurred'}`}
      >
        <h2 style={titleStyle}>Worker 节点地址:</h2>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space className="action-buttons">
            <Button
              disabled={!isNodeGenerated}
              href={isNodeGenerated ? `clash://install-config/?url=${encodeURIComponent(
                `https://edsub.pages.dev/sub/clash-meta?url=${encodeURIComponent(
                  node
                )}&insert=false`
              )}&name=worker节点` : undefined}
              icon={<ThunderboltOutlined />}
              className="btn-clash"
            >
              导入到 Clash
            </Button>
            <Button
              disabled={!isNodeGenerated}
              href={isNodeGenerated ? `shadowrocket://add/sub://${window.btoa(
                `https://edsub.pages.dev/sub/clash-meta?url=${encodeURIComponent(
                  node
                )}&insert=false`
              )}?remark=cf%20worker` : undefined}
              icon={<RocketOutlined />}
              className="btn-shadowrocket"
            >
              导入到小火箭
            </Button>
            <Button
              disabled={!isNodeGenerated}
              href={isNodeGenerated ? url : undefined}
              target="_blank"
              icon={<AccountBookFilled />}
              className="btn-manage"
            >
              管理节点
            </Button>
          </Space>
          <CopyToClipboard
            text={node}
            onCopy={() => {
              if (isNodeGenerated) {
                message.success("复制成功");
              }
            }}
          >
            <p style={copyTextStyle}>{isNodeGenerated ? node : '节点信息将在这里显示'}</p>
          </CopyToClipboard>
        </Space>
      </div>

      <Footer />
    </div>
  );
}

// 使用 ThemeProvider 包装 App 组件
const AppWithTheme = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

// Export AppWithTheme as the default export
export default AppWithTheme;
