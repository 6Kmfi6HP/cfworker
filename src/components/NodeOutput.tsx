import React from 'react';
import { Button, Space, Modal, notification } from 'antd';
import { 
  ThunderboltOutlined, 
  RocketOutlined, 
  AccountBookFilled 
} from '@ant-design/icons';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  TelegramShareButton, 
  WhatsappShareButton, 
  FacebookIcon, 
  TwitterIcon, 
  TelegramIcon, 
  WhatsappIcon 
} from 'react-share';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';

// 获取随机分享文案的函数
const getRandomShareText = () => {
  const { t } = useTranslation();
  const shareTexts = t('shareTexts', { returnObjects: true }) as string[];
  const randomIndex = Math.floor(Math.random() * shareTexts.length);
  return shareTexts[randomIndex];
};

interface NodeOutputProps {
  node: string;
  url: string;
  isNodeGenerated: boolean;
  showShareModal: boolean;
  onCloseShareModal: () => void;
}

const NodeOutput: React.FC<NodeOutputProps> = ({
  node,
  url,
  isNodeGenerated,
  showShareModal,
  onCloseShareModal
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

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
    <>
      <div
        style={nodeOutputStyle}
        className={`node-output ${isNodeGenerated ? 'active' : 'blurred'}`}
      >
        <h2 style={titleStyle}>{t('workerNodeAddress')}</h2>
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
              {t('importToClash')}
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
              {t('importToShadowrocket')}
            </Button>
            <Button
              disabled={!isNodeGenerated}
              href={isNodeGenerated ? url : undefined}
              target="_blank"
              icon={<AccountBookFilled />}
              className="btn-manage"
            >
              {t('manageNode')}
            </Button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <FacebookShareButton
                url={window.location.href}
                hashtag={`#CFWorker ${getRandomShareText()}`}
                disabled={!isNodeGenerated}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton
                url={window.location.href}
                title={getRandomShareText()}
                disabled={!isNodeGenerated}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <TelegramShareButton
                url={window.location.href}
                title={getRandomShareText()}
                disabled={!isNodeGenerated}
              >
                <TelegramIcon size={32} round />
              </TelegramShareButton>
              <WhatsappShareButton
                url={window.location.href}
                title={getRandomShareText()}
                disabled={!isNodeGenerated}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            </div>
          </Space>
          <CopyToClipboard
            text={node}
            onCopy={() => {
              if (isNodeGenerated) {
                notification.success({
                  message: t('copiedSuccess'),
                  description: t('copiedSuccessDesc', 'Node configuration has been copied to clipboard.'),
                  placement: 'topRight',
                  duration: 2,
                });
              }
            }}
          >
            <p style={copyTextStyle}>
              {isNodeGenerated ? node : t('nodeInfoPlaceholder')}
            </p>
          </CopyToClipboard>
        </Space>
      </div>

      {/* Share Modal */}
      <Modal
        title={t('title')}
        open={showShareModal}
        onCancel={onCloseShareModal}
        footer={[
          <Button key="close" onClick={onCloseShareModal}>
            {t('close')}
          </Button>
        ]}
      >
        <p style={{ marginBottom: '20px' }}>{t('shareDescription')}</p>
        <Space style={{ width: '100%', justifyContent: 'center', gap: '16px' }}>
          <FacebookShareButton
            url={window.location.href}
            hashtag={`#CFWorker ${getRandomShareText()}`}
          >
            <FacebookIcon size={64} round />
          </FacebookShareButton>
          <TwitterShareButton
            url={window.location.href}
            title={getRandomShareText()}
          >
            <TwitterIcon size={64} round />
          </TwitterShareButton>
          <TelegramShareButton
            url={window.location.href}
            title={getRandomShareText()}
          >
            <TelegramIcon size={64} round />
          </TelegramShareButton>
          <WhatsappShareButton
            url={window.location.href}
            title={getRandomShareText()}
          >
            <WhatsappIcon size={64} round />
          </WhatsappShareButton>
        </Space>
      </Modal>
    </>
  );
};

export default NodeOutput; 