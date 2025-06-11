import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Rocket, BookUser, Copy, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

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
    setShowShareModal: (show: boolean) => void;
}

const NodeOutput: React.FC<NodeOutputProps> = ({
    node,
    url,
    isNodeGenerated,
    showShareModal,
    onCloseShareModal,
    setShowShareModal
}) => {
    const { t } = useTranslation();
    const { toast } = useToast();

    const handleCopy = () => {
        if (isNodeGenerated) {
            navigator.clipboard.writeText(node);
            toast({
                title: t('copiedSuccess'),
                description: t('copiedSuccessDesc', 'Node configuration has been copied to clipboard.'),
            });
        }
    };

    return (
        <>
            <div
                className={`node-output bg-card text-card-foreground border rounded-lg p-6 mt-8 transition-filter duration-300 ${isNodeGenerated ? 'active' : 'blurred'}`}
            >
                <h2 className="text-primary text-2xl font-semibold mb-5">{t('workerNodeAddress')}</h2>
                <div className="flex flex-col w-full gap-4">
                    <div className="action-buttons flex flex-wrap gap-2">
                        <Button disabled={!isNodeGenerated} asChild>
                            <a href={isNodeGenerated ? `clash://install-config/?url=${encodeURIComponent(
                                `https://edsub.pages.dev/sub/clash-meta?url=${encodeURIComponent(
                                    node
                                )}&insert=false`
                            )}&name=worker节点` : undefined}>
                                <Zap className="mr-2 h-4 w-4" /> {t('importToClash')}
                            </a>
                        </Button>
                        <Button disabled={!isNodeGenerated} asChild>
                            <a href={isNodeGenerated ? `shadowrocket://add/sub://${window.btoa(
                                `https://edsub.pages.dev/sub/clash-meta?url=${encodeURIComponent(
                                    node
                                )}&insert=false`
                            )}?remark=cf%20worker` : undefined}>
                                <Rocket className="mr-2 h-4 w-4" /> {t('importToShadowrocket')}
                            </a>
                        </Button>
                        <Button disabled={!isNodeGenerated} asChild>
                            <a href={isNodeGenerated ? url : undefined} target="_blank" rel="noopener noreferrer">
                                <BookUser className="mr-2 h-4 w-4" /> {t('manageNode')}
                            </a>
                        </Button>
                        <Button disabled={!isNodeGenerated} onClick={() => setShowShareModal(true)}>
                            <Share2 className="mr-2 h-4 w-4" /> {t('share')}
                        </Button>
                    </div>
                    <div className="relative">
                        <p className="bg-background border rounded p-3 font-mono text-sm break-all pr-12">
                            {isNodeGenerated ? node : t('nodeInfoPlaceholder')}
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 right-2 -translate-y-1/2"
                            disabled={!isNodeGenerated}
                            onClick={handleCopy}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
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
                        <Button asChild variant="outline">
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&hashtag=${encodeURIComponent('#CFWorker ' + getRandomShareText())}`} target="_blank" rel="noopener noreferrer">
                                Facebook
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(getRandomShareText())}`} target="_blank" rel="noopener noreferrer">
                                Twitter
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(getRandomShareText())}`} target="_blank" rel="noopener noreferrer">
                                Telegram
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getRandomShareText() + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer">
                                WhatsApp
                            </a>
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button onClick={onCloseShareModal}>{t('close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NodeOutput;