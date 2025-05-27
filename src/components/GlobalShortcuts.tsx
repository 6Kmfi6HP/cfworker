import React, { useEffect, useState } from 'react';
import { Modal, Input, List, Typography, Tag, Space, Divider } from 'antd';
import { SearchOutlined, KeyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

interface ShortcutAction {
  id: string;
  label: string;
  description: string;
  keys: string[];
  category: string;
  action: () => void;
}

interface GlobalShortcutsProps {
  onOpenAccountManagement: () => void;
  onOpenBulkDeployment: () => void;
  onOpenConfigManagement: () => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

const GlobalShortcuts: React.FC<GlobalShortcutsProps> = ({
  onOpenAccountManagement,
  onOpenBulkDeployment,
  onOpenConfigManagement,
  onToggleTheme,
  onToggleLanguage,
}) => {
  const { t } = useTranslation();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const shortcuts: ShortcutAction[] = [
    // Navigation shortcuts
    {
      id: 'open-accounts',
      label: t('openAccountManagement', 'Open Account Management'),
      description: t('openAccountManagementDesc', 'Manage your Cloudflare accounts'),
      keys: ['g', 'a'],
      category: t('navigation', 'Navigation'),
      action: onOpenAccountManagement,
    },
    {
      id: 'bulk-deploy',
      label: t('openBulkDeployment', 'Open Bulk Deployment'),
      description: t('openBulkDeploymentDesc', 'Deploy workers to multiple accounts'),
      keys: ['g', 'd'],
      category: t('navigation', 'Navigation'),
      action: onOpenBulkDeployment,
    },
    {
      id: 'config-management',
      label: t('openConfigManagement', 'Open Configuration'),
      description: t('openConfigManagementDesc', 'Import/export settings'),
      keys: ['g', 'c'],
      category: t('navigation', 'Navigation'),
      action: onOpenConfigManagement,
    },
    // UI shortcuts
    {
      id: 'toggle-theme',
      label: t('toggleTheme', 'Toggle Theme'),
      description: t('toggleThemeDesc', 'Switch between light and dark theme'),
      keys: ['t'],
      category: t('ui', 'UI'),
      action: onToggleTheme,
    },
    {
      id: 'toggle-language',
      label: t('toggleLanguage', 'Toggle Language'),
      description: t('toggleLanguageDesc', 'Switch between English and Chinese'),
      keys: ['l'],
      category: t('ui', 'UI'),
      action: onToggleLanguage,
    },
    // Help shortcuts
    {
      id: 'show-shortcuts',
      label: t('showShortcuts', 'Show Shortcuts'),
      description: t('showShortcutsDesc', 'Display all available shortcuts'),
      keys: ['?'],
      category: t('help', 'Help'),
      action: () => setShowShortcutHelp(true),
    },
    {
      id: 'command-palette',
      label: t('commandPalette', 'Command Palette'),
      description: t('commandPaletteDesc', 'Quick access to all actions'),
      keys: ['cmd', 'k'],
      category: t('help', 'Help'),
      action: () => setShowCommandPalette(true),
    },
  ];

  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedShortcuts = filteredShortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, ShortcutAction[]>);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette: Cmd/Ctrl + K
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      // Help: ?
      if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setShowShortcutHelp(true);
        return;
      }

      // Single key shortcuts (only when not in input fields)
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      if (!isInputField && !event.metaKey && !event.ctrlKey && !event.altKey) {
        switch (event.key) {
          case 't':
            event.preventDefault();
            onToggleTheme();
            break;
          case 'l':
            event.preventDefault();
            onToggleLanguage();
            break;
        }
      }
    };

    // Sequential key shortcuts (g + a, g + d, etc.)
    let keySequence: string[] = [];
    let sequenceTimeout: NodeJS.Timeout;

    const handleSequentialKeys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      if (isInputField || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      keySequence.push(event.key);
      
      // Clear sequence after 1 second
      clearTimeout(sequenceTimeout);
      sequenceTimeout = setTimeout(() => {
        keySequence = [];
      }, 1000);

      // Check for matches
      const sequenceStr = keySequence.join('');
      
      if (sequenceStr === 'ga') {
        event.preventDefault();
        onOpenAccountManagement();
        keySequence = [];
      } else if (sequenceStr === 'gd') {
        event.preventDefault();
        onOpenBulkDeployment();
        keySequence = [];
      } else if (sequenceStr === 'gc') {
        event.preventDefault();
        onOpenConfigManagement();
        keySequence = [];
      }
    };

    const combinedHandler = (event: KeyboardEvent) => {
      handleKeyDown(event);
      handleSequentialKeys(event);
    };

    document.addEventListener('keydown', combinedHandler);

    return () => {
      document.removeEventListener('keydown', combinedHandler);
      clearTimeout(sequenceTimeout);
    };
  }, [onOpenAccountManagement, onOpenBulkDeployment, onOpenConfigManagement, onToggleTheme, onToggleLanguage]);

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      switch (key) {
        case 'cmd':
          return '⌘';
        case 'ctrl':
          return 'Ctrl';
        case 'alt':
          return 'Alt';
        case 'shift':
          return 'Shift';
        default:
          return key.toUpperCase();
      }
    }).join(' + ');
  };

  const executeAction = (action: () => void) => {
    action();
    setShowCommandPalette(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* Command Palette */}
      <Modal
        title={
          <Space>
            <SearchOutlined />
            {t('commandPalette', 'Command Palette')}
          </Space>
        }
        open={showCommandPalette}
        onCancel={() => {
          setShowCommandPalette(false);
          setSearchTerm('');
        }}
        footer={null}
        width={600}
      >
        <Input
          placeholder={t('searchCommands', 'Search commands...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined />}
          autoFocus
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <Title level={5} style={{ margin: '16px 0 8px 0', color: '#666' }}>
                {category}
              </Title>
              <List
                size="small"
                dataSource={categoryShortcuts}
                renderItem={(shortcut) => (
                  <List.Item
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px',
                      borderRadius: '4px',
                      marginBottom: '4px',
                    }}
                    className="command-item"
                    onClick={() => executeAction(shortcut.action)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{shortcut.label}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {shortcut.description}
                        </Text>
                      </div>
                      <Tag style={{ fontFamily: 'monospace' }}>
                        {formatKeys(shortcut.keys)}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ))}
        </div>
        
        <Divider />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {t('commandPaletteHint', 'Press Esc to close, Enter to execute selected command')}
        </Text>
      </Modal>

      {/* Shortcuts Help */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            {t('keyboardShortcuts', 'Keyboard Shortcuts')}
          </Space>
        }
        open={showShortcutHelp}
        onCancel={() => setShowShortcutHelp(false)}
        footer={null}
        width={700}
      >
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <Title level={5} style={{ margin: '16px 0 8px 0', color: '#666' }}>
                {category}
              </Title>
              <List
                size="small"
                dataSource={categoryShortcuts}
                renderItem={(shortcut) => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{shortcut.label}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {shortcut.description}
                        </Text>
                      </div>
                      <Tag style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {formatKeys(shortcut.keys)}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
              {category !== Object.keys(groupedShortcuts)[Object.keys(groupedShortcuts).length - 1] && <Divider />}
            </div>
          ))}
        </div>
      </Modal>

      {/* Global styles for command palette hover effects */}
      <style>
        {`
          .command-item:hover {
            background-color: #f5f5f5;
          }
          .ant-modal-body .command-item:hover {
            background-color: #f0f2f5;
          }
        `}
      </style>
    </>
  );
};

export default GlobalShortcuts; 