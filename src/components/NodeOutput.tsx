import React from 'react';
import { notification } from '../utils/notifications';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
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

  // Tailwind classes based on theme
  const nodeOutputClasses = `p-6 rounded-lg ${
    theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
  }`;
  
  const titleClasses = `text-2xl font-semibold mb-5 ${
    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
  }`;
  
  const copyTextClasses = `p-3 rounded border font-mono text-sm leading-relaxed break-all ${
    theme === 'dark' 
      ? 'bg-gray-800 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <>
      <div
        className={`${nodeOutputClasses} mt-8 transition-all duration-300 ${isNodeGenerated ? 'opacity-100' : 'opacity-50 blur-sm'}`}
      >
        <h2 className={titleClasses}>{t('workerNodeAddress')}</h2>
        <div className="space-y-4 w-full">
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!isNodeGenerated}
              asChild={isNodeGenerated}
              className="btn-clash"
            >
              {isNodeGenerated ? (
                <a href={`clash://install-config/?url=${encodeURIComponent(
                  `https://edsub.pages.dev/sub/clash-meta?url=${encodeURIComponent(
                    node
                  )}&insert=false`
                )}&name=worker节点`}>
                  ⚡ {t('importToClash')}
                </a>
              ) : (
                <span>⚡ {t('importToClash')}</span>
              )}
            </Button>
            <Button
              disabled={!isNodeGenerated}
              asChild={isNodeGenerated}
              className="btn-shadowrocket"
            >
              {isNodeGenerated ? (
                <a href={`shadowrocket://add/sub://${window.btoa(
                  `https://edsub.pages.dev/sub/clash-meta?url=${encodeURIComponent(
                    node
                  )}&insert=false`
                )}?remark=cf%20worker`}>
                  🚀 {t('importToShadowrocket')}
                </a>
              ) : (
                <span>🚀 {t('importToShadowrocket')}</span>
              )}
            </Button>
            <Button
              disabled={!isNodeGenerated}
              asChild={isNodeGenerated}
              className="btn-manage"
            >
              {isNodeGenerated ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  📋 {t('manageNode')}
                </a>
              ) : (
                <span>📋 {t('manageNode')}</span>
              )}
            </Button>
            <div className="flex gap-2">
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
          </div>
          <CopyToClipboard
            text={node}
            onCopy={() => {
              if (isNodeGenerated) {
                notification.success({
                  message: t('copySuccess'),
                  description: t('copySuccessDesc'),
                  placement: 'topRight',
                });
              }
            }}
          >
            <Button
              disabled={!isNodeGenerated}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              📋 {t('copyNodeAddress')}
            </Button>
          </CopyToClipboard>
          <div className={copyTextClasses}>{node}</div>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={onCloseShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          <p className="mb-5">{t('shareDescription')}</p>
          <div className="flex justify-center gap-4">
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
          </div>
          <DialogFooter>
            <Button onClick={onCloseShareModal}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NodeOutput;