import React from 'react';
// import { GithubOutlined } from '@ant-design/icons';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>© {currentYear} CF Worker 节点搭建. All rights reserved.</p>
                <div className="footer-links">
                    <a href="https://t.me/edtunnel" target="_blank" rel="noopener noreferrer">
                        Telegram
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
