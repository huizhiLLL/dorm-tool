// 导航管理
class Navigation {
    static currentPage = 'home';

    static showPage(pageName) {
        // 更新底部导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // 更新内容页面
        document.querySelectorAll('.content-page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`${pageName}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            
            // 加载页面数据
            this.loadPageData(pageName);
        }
    }

    static async loadPageData(pageName) {
        try {
            switch (pageName) {
                case 'home':
                    await this.loadHomeData();
                    break;
                case 'urls':
                    await UrlManager.loadCategories();
                    break;
                case 'announcements':
                    await AnnouncementManager.loadAnnouncements();
                    break;
                case 'lottery':
                    await LotteryManager.loadWheels();
                    // 暂时不加载抽奖历史
                    // await LotteryManager.loadHistory();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${pageName} data:`, error);
            Utils.showToast('加载数据失败', 'error');
        }
    }

    static async loadHomeData() {
        try {
            // 加载最近公告
            const announcements = await API.getAnnouncements(3);
            const recentList = document.getElementById('recentAnnouncementsList');
            
            if (announcements && announcements.data && announcements.data.length > 0) {
                const recent = announcements.data.slice(0, 3); // 显示最近3条
                recentList.innerHTML = recent.map(announcement => `
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">${Utils.truncateText(announcement.title, 30)}</div>
                        </div>
                        <div class="card-content">
                            ${Utils.truncateText(announcement.content, 60)}
                        </div>
                        <div class="card-meta">
                            <span>${announcement.created_by}</span>
                            <span>${Utils.formatDate(announcement.created_at)}</span>
                        </div>
                    </div>
                `).join('');
            } else {
                recentList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📢</div>
                        <p>暂无公告</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading home data:', error);
            document.getElementById('recentAnnouncementsList').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❌</div>
                    <p>加载失败</p>
                </div>
            `;
        }
    }

    static init() {
        // 绑定底部导航事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageName = item.dataset.page;
                this.showPage(pageName);
            });
        });

        // 绑定快速操作卡片事件
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.showPage(action);
            });
        });

        // 初始化模态框
        Modal.init();
    }
}

// 模态框管理
class Modal {
    static currentModal = null;

    static show(title, content, onConfirm = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('active');
        
        this.currentModal = { onConfirm };

        // 聚焦第一个输入框
        const firstInput = modalBody.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    static hide() {
        const modal = document.getElementById('modal');
        modal.classList.remove('active');
        this.currentModal = null;
    }

    static confirm() {
        if (this.currentModal && this.currentModal.onConfirm) {
            this.currentModal.onConfirm();
        }
        this.hide();
    }

    static init() {
        const modal = document.getElementById('modal');
        const closeBtn = document.getElementById('closeModal');

        // 关闭按钮
        closeBtn.addEventListener('click', () => this.hide());

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hide();
            }
        });
    }
}