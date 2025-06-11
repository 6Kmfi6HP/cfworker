import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="mt-12 py-6 border-t">
            <div className="flex justify-between items-center text-sm text-muted-foreground sm:flex-row flex-col gap-3">
                <p>© {currentYear} CF Worker 节点搭建. All rights reserved.</p>
                <a href="https://t.me/edtunnel" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                    Telegram
                </a>
            </div>
        </footer>
    );
};

export default Footer;
