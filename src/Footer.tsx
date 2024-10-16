import React from 'react';
import { GithubOutlined } from '@ant-design/icons';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>© {currentYear} CF Worker 节点搭建. All rights reserved.</p>
                <a href="https://github.com/6k-cloud/cf-worker-node" target="_blank" rel="noopener noreferrer">
                    <GithubOutlined />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
