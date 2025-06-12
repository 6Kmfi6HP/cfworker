// Simple notification system to replace antd message and notification

interface NotificationOptions {
  message: string;
  description?: string;
  duration?: number;
  placement?: string;
}

class NotificationSystem {
  private container: HTMLElement | null = null;

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (typeof window === 'undefined') return;
    
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  private createNotification(type: 'success' | 'error' | 'warning' | 'info', options: NotificationOptions | string) {
    if (!this.container) return;

    const message = typeof options === 'string' ? options : options.message;
    const description = typeof options === 'object' ? options.description : undefined;
    const duration = typeof options === 'object' ? (options.duration || 3) : 3;

    const notification = document.createElement('div');
    notification.style.cssText = `
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 16px;
      padding: 16px;
      max-width: 384px;
      pointer-events: auto;
      border-left: 4px solid ${this.getTypeColor(type)};
      animation: slideIn 0.3s ease-out;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-weight: 600;
      color: #262626;
      margin-bottom: ${description ? '4px' : '0'};
    `;
    title.textContent = message;

    notification.appendChild(title);

    if (description) {
      const desc = document.createElement('div');
      desc.style.cssText = `
        color: #8c8c8c;
        font-size: 14px;
      `;
      desc.textContent = description;
      notification.appendChild(desc);
    }

    this.container.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, duration * 1000);

    // Add click to dismiss
    notification.addEventListener('click', () => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    });
  }

  private getTypeColor(type: string): string {
    switch (type) {
      case 'success': return '#52c41a';
      case 'error': return '#ff4d4f';
      case 'warning': return '#faad14';
      case 'info': return '#1890ff';
      default: return '#1890ff';
    }
  }

  success(options: NotificationOptions | string) {
    this.createNotification('success', options);
  }

  error(options: NotificationOptions | string) {
    this.createNotification('error', options);
  }

  warning(options: NotificationOptions | string) {
    this.createNotification('warning', options);
  }

  info(options: NotificationOptions | string) {
    this.createNotification('info', options);
  }
}

// Create global instance
const notificationSystem = new NotificationSystem();

// Add CSS animations
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Export message and notification objects that mimic antd API
export const message = {
  success: (content: string) => notificationSystem.success(content),
  error: (content: string) => notificationSystem.error(content),
  warning: (content: string) => notificationSystem.warning(content),
  info: (content: string) => notificationSystem.info(content),
};

export const notification = {
  success: (options: NotificationOptions) => notificationSystem.success(options),
  error: (options: NotificationOptions) => notificationSystem.error(options),
  warning: (options: NotificationOptions) => notificationSystem.warning(options),
  info: (options: NotificationOptions) => notificationSystem.info(options),
};