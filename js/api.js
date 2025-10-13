// API 请求封装
class API {
    static async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };
        
        // 添加用户信息到请求头 - 对中文昵称进行编码
        const user = Auth.getCurrentUser();
        if (user) {
            config.headers['X-User-Nickname'] = encodeURIComponent(user.nickname);
        }

        try {
            const response = await fetch(url, config);
            
            const data = await response.json();
            
            // 检查业务逻辑错误
            if (!data.success) {
                throw new Error(data.message || data.error || '操作失败');
            }
            
            return data;
        } catch (error) {
            
            // 如果是网络错误或解析错误，抛出更友好的错误信息
            if (error.name === 'SyntaxError') {
                throw new Error('服务器返回了无效的响应格式');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('网络连接失败，请检查网络连接');
            }
            
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // 用户相关 API
    static async loginUser(nickname) {
        return this.post('/users', { nickname });
    }

    // 网址分类相关 API
    static async getUrlCategories() {
        return this.get('/url-categories');
    }

    static async createUrlCategory(data) {
        return this.post('/url-categories', data);
    }

    static async updateUrlCategory(id, data) {
        return this.request(`/url-categories?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteUrlCategory(id) {
        return this.request(`/url-categories?id=${id}`, { method: 'DELETE' });
    }

    // 网址相关 API
    static async createUrl(categoryId, data) {
        return this.request(`/urls?categoryId=${categoryId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateUrl(categoryId, urlId, data) {
        return this.request(`/urls?categoryId=${categoryId}&urlId=${urlId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteUrl(categoryId, urlId) {
        return this.request(`/urls?categoryId=${categoryId}&urlId=${urlId}`, { method: 'DELETE' });
    }

    // 公告相关 API
    static async getAnnouncements(limit = 50) {
        return this.get(`/announcements?limit=${limit}`);
    }

    static async createAnnouncement(data) {
        return this.post('/announcements', data);
    }

    static async updateAnnouncement(id, data) {
        return this.request(`/announcements?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteAnnouncement(id) {
        return this.request(`/announcements?id=${id}`, { method: 'DELETE' });
    }

    // 轮盘相关 API
    static async getWheelConfigs() {
        return this.get('/wheel-configs');
    }

    static async createWheelConfig(data) {
        return this.post('/wheel-configs', data);
    }

    static async updateWheelConfig(id, data) {
        return this.request(`/wheel-configs?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteWheelConfig(id) {
        return this.request(`/wheel-configs?id=${id}`, { method: 'DELETE' });
    }

    // 抽奖历史相关 API
    static async getLotteryHistory(limit = 50, wheelConfigId = null) {
        let url = `/lottery-history?limit=${limit}`;
        if (wheelConfigId) {
            url += `&wheel_config_id=${wheelConfigId}`;
        }
        return this.get(url);
    }

    static async createLotteryRecord(data) {
        return this.post('/lottery-history', data);
    }
}

// 工具函数
class Utils {
    static showToast(message, type = 'info') {
        // 创建 toast 元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#4f8ef7',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '9999',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            opacity: '0',
            transition: 'opacity 0.3s'
        });
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.style.opacity = '1', 10);
        
        // 自动移除
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) { // 1天内
            return `${Math.floor(diff / 3600000)}小时前`;
        } else if (diff < 604800000) { // 1周内
            return `${Math.floor(diff / 86400000)}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    static validateUrl(url) {
        // 去除首尾空格
        url = url.trim();
        
        // 检查是否为空
        if (!url) {
            return false;
        }
        
        // 更宽松的验证：只要不是明显的纯文本就允许
        const hasProtocol = url.startsWith('http://') || url.startsWith('https://');
        const hasSpace = url.includes(' '); // 包含空格的通常是纯文本
        const isChinese = /[\u4e00-\u9fa5]/.test(url); // 包含中文的通常是纯文本
        const hasBasicFormat = url.includes('.') || url.includes(':') || url.includes('/') || hasProtocol;
        
        // 如果包含空格或中文，且没有协议，认为是纯文本
        if ((hasSpace || isChinese) && !hasProtocol) {
            return false;
        }
        
        // 如果没有任何网址格式特征，认为是纯文本
        if (!hasBasicFormat && !url.includes('localhost') && !url.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            return false;
        }
        
        // 自动添加协议前缀
        if (!hasProtocol) {
            url = 'https://' + url;
        }
        
        return url;
    }

    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}