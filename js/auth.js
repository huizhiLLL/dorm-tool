// 用户认证管理
class Auth {
    static getCurrentUser() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    }

    static setCurrentUser(user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    }

    static logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        this.showLoginModal();
    }

    static isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    static async login(nickname) {
        // 验证昵称
        if (!nickname || nickname.trim().length === 0) {
            throw new Error(CONFIG.MESSAGES.NICKNAME_REQUIRED);
        }

        if (nickname.length > CONFIG.DEFAULTS.MAX_NICKNAME_LENGTH) {
            throw new Error(CONFIG.MESSAGES.NICKNAME_TOO_LONG);
        }

        try {
            // 调用后端 API 登录/注册用户
            const response = await API.loginUser(nickname.trim());
            
            const user = {
                nickname: nickname.trim(),
                loginTime: new Date().toISOString()
            };

            this.setCurrentUser(user);
            this.showMainPage();
            
            Utils.showToast(`欢迎，${user.nickname}！`, 'success');
            
            return user;
        } catch (error) {
            console.error('Login error:', error);
            Utils.showToast(error.message || CONFIG.MESSAGES.NETWORK_ERROR, 'error');
            throw error;
        }
    }

    static showLoginModal() {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('mainPage').classList.remove('active');
        
        // 清空输入框
        document.getElementById('nicknameInput').value = '';
        document.getElementById('nicknameInput').focus();
    }

    static showMainPage() {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('mainPage').classList.add('active');
        
        // 更新用户信息显示
        const user = this.getCurrentUser();
        if (user) {
            document.getElementById('currentUser').textContent = user.nickname;
        }
        
        // 加载首页数据
        Navigation.showPage('home');
    }

    static init() {
        // 绑定登录按钮事件
        const loginBtn = document.getElementById('loginBtn');
        const nicknameInput = document.getElementById('nicknameInput');
        const logoutBtn = document.getElementById('logoutBtn');

        loginBtn.addEventListener('click', () => {
            const nickname = nicknameInput.value.trim();
            this.login(nickname);
        });

        // 回车键登录
        nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const nickname = nicknameInput.value.trim();
                this.login(nickname);
            }
        });

        // 退出登录
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                this.logout();
            }
        });

        // 检查登录状态
        if (this.isLoggedIn()) {
            this.showMainPage();
        } else {
            this.showLoginModal();
        }
    }
}
