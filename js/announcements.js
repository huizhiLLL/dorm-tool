// 公告管理模块
class AnnouncementManager {
    static announcements = [];
    static isEditMode = false;

    static async loadAnnouncements() {
        try {
            const response = await API.getAnnouncements();
            this.announcements = response.data || [];
            this.renderAnnouncements();
        } catch (error) {
            console.error('Error loading announcements:', error);
            Utils.showToast('加载公告失败', 'error');
            this.renderEmptyState();
        }
    }

    static renderAnnouncements() {
        const container = document.getElementById('announcementsList');
        
        if (this.announcements.length === 0) {
            this.renderEmptyState();
            return;
        }

        container.innerHTML = this.announcements.map(announcement => `
            <div class="card announcement-card" data-announcement-id="${announcement._id}">
                <div class="card-header">
                    <div class="card-title">${announcement.title}</div>
                    <div class="card-actions ${this.isEditMode ? 'visible' : 'hidden'}">
                        <button onclick="AnnouncementManager.editAnnouncement('${announcement._id}')" class="btn-text">编辑</button>
                        <button onclick="AnnouncementManager.deleteAnnouncement('${announcement._id}')" class="btn-text" style="color: #ff4757;">删除</button>
                    </div>
                </div>
                <div class="card-content">
                    ${this.formatContent(announcement.content)}
                </div>
                <div class="card-meta">
                    <span>发布者: ${announcement.created_by}</span>
                    <span>${Utils.formatDate(announcement.created_at)}</span>
                </div>
                ${announcement.updated_at !== announcement.created_at ? 
                    `<div class="card-meta" style="font-size: 0.8rem; color: #999;">
                        最后编辑: ${Utils.formatDate(announcement.updated_at)}
                    </div>` : ''
                }
            </div>
        `).join('');
    }

    static formatContent(content) {
        // 简单的文本格式化：保留换行
        return content.replace(/\n/g, '<br>');
    }

    static renderEmptyState() {
        const container = document.getElementById('announcementsList');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📢</div>
                <h3>暂无公告</h3>
                <p>点击上方"发布公告"按钮创建第一个公告</p>
            </div>
        `;
    }

    static toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        // 重新渲染公告列表以更新按钮显示状态
        this.renderAnnouncements();
        
        // 更新编辑模式按钮状态
        const editModeBtn = document.getElementById('editAnnouncementModeBtn');
        if (editModeBtn) {
            if (this.isEditMode) {
                editModeBtn.classList.add('active');
            } else {
                editModeBtn.classList.remove('active');
            }
        }
        
        // 显示提示信息
        if (this.isEditMode) {
            Utils.showToast('已进入编辑模式', 'info');
        } else {
            Utils.showToast('已退出编辑模式', 'info');
        }
    }

    static addAnnouncement() {
        const content = `
            <form id="announcementForm">
                <div class="form-group">
                    <label for="announcementTitle">公告标题</label>
                    <input type="text" id="announcementTitle" placeholder="请输入公告标题" maxlength="${CONFIG.DEFAULTS.MAX_TITLE_LENGTH}" required>
                </div>
                <div class="form-group">
                    <label for="announcementContent">公告内容</label>
                    <textarea id="announcementContent" placeholder="请输入公告内容" maxlength="${CONFIG.DEFAULTS.MAX_CONTENT_LENGTH}" rows="6" required></textarea>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-primary">发布公告</button>
                </div>
            </form>
        `;

        Modal.show('发布公告', content);

        // 绑定表单提交事件
        document.getElementById('announcementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnnouncementForm();
        });

        // 字数统计
        this.setupCharacterCount();
    }

    static setupCharacterCount() {
        const titleInput = document.getElementById('announcementTitle');
        const contentTextarea = document.getElementById('announcementContent');
        
        if (titleInput) {
            const titleCounter = document.createElement('div');
            titleCounter.className = 'character-count';
            titleCounter.style.cssText = 'text-align: right; font-size: 0.8rem; color: #999; margin-top: 5px;';
            titleInput.parentNode.appendChild(titleCounter);
            
            const updateTitleCount = () => {
                const remaining = CONFIG.DEFAULTS.MAX_TITLE_LENGTH - titleInput.value.length;
                titleCounter.textContent = `${titleInput.value.length}/${CONFIG.DEFAULTS.MAX_TITLE_LENGTH}`;
                titleCounter.style.color = remaining < 10 ? '#ff4757' : '#999';
            };
            
            titleInput.addEventListener('input', updateTitleCount);
            updateTitleCount();
        }
        
        if (contentTextarea) {
            const contentCounter = document.createElement('div');
            contentCounter.className = 'character-count';
            contentCounter.style.cssText = 'text-align: right; font-size: 0.8rem; color: #999; margin-top: 5px;';
            contentTextarea.parentNode.appendChild(contentCounter);
            
            const updateContentCount = () => {
                const remaining = CONFIG.DEFAULTS.MAX_CONTENT_LENGTH - contentTextarea.value.length;
                contentCounter.textContent = `${contentTextarea.value.length}/${CONFIG.DEFAULTS.MAX_CONTENT_LENGTH}`;
                contentCounter.style.color = remaining < 50 ? '#ff4757' : '#999';
            };
            
            contentTextarea.addEventListener('input', updateContentCount);
            updateContentCount();
        }
    }

    static async handleAnnouncementForm(announcementId = null) {
        const title = document.getElementById('announcementTitle').value.trim();
        const content = document.getElementById('announcementContent').value.trim();
        
        if (!title) {
            Utils.showToast(CONFIG.MESSAGES.TITLE_REQUIRED, 'error');
            return;
        }
        
        if (!content) {
            Utils.showToast(CONFIG.MESSAGES.CONTENT_REQUIRED, 'error');
            return;
        }

        if (title.length > CONFIG.DEFAULTS.MAX_TITLE_LENGTH) {
            Utils.showToast(`标题不能超过${CONFIG.DEFAULTS.MAX_TITLE_LENGTH}个字符`, 'error');
            return;
        }

        if (content.length > CONFIG.DEFAULTS.MAX_CONTENT_LENGTH) {
            Utils.showToast(`内容不能超过${CONFIG.DEFAULTS.MAX_CONTENT_LENGTH}个字符`, 'error');
            return;
        }

        try {
            const data = { title, content };
            
            if (announcementId) {
                await API.updateAnnouncement(announcementId, data);
                Utils.showToast('公告更新成功', 'success');
            } else {
                await API.createAnnouncement(data);
                Utils.showToast('公告发布成功', 'success');
            }
            
            Modal.hide();
            this.loadAnnouncements();
            
            // 如果在首页，也更新首页的公告预览
            if (Navigation.currentPage === 'home') {
                Navigation.loadHomeData();
            }
        } catch (error) {
            console.error('Error saving announcement:', error);
            Utils.showToast('操作失败', 'error');
        }
    }

    static editAnnouncement(announcementId) {
        const announcement = this.announcements.find(a => a._id === announcementId);
        if (!announcement) return;

        const content = `
            <form id="announcementForm">
                <div class="form-group">
                    <label for="announcementTitle">公告标题</label>
                    <input type="text" id="announcementTitle" value="${announcement.title}" maxlength="${CONFIG.DEFAULTS.MAX_TITLE_LENGTH}" required>
                </div>
                <div class="form-group">
                    <label for="announcementContent">公告内容</label>
                    <textarea id="announcementContent" maxlength="${CONFIG.DEFAULTS.MAX_CONTENT_LENGTH}" rows="6" required>${announcement.content}</textarea>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-primary">更新公告</button>
                </div>
            </form>
        `;

        Modal.show('编辑公告', content);

        document.getElementById('announcementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnnouncementForm(announcementId);
        });

        // 字数统计
        this.setupCharacterCount();
    }

    static async deleteAnnouncement(announcementId) {
        const announcement = this.announcements.find(a => a._id === announcementId);
        if (!announcement) return;

        if (!confirm(`确定要删除公告"${announcement.title}"吗？`)) {
            return;
        }

        try {
            await API.deleteAnnouncement(announcementId);
            Utils.showToast('公告删除成功', 'success');
            this.loadAnnouncements();
            
            // 如果在首页，也更新首页的公告预览
            if (Navigation.currentPage === 'home') {
                Navigation.loadHomeData();
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
            Utils.showToast('删除失败', 'error');
        }
    }

    static viewAnnouncement(announcementId) {
        const announcement = this.announcements.find(a => a._id === announcementId);
        if (!announcement) return;

        const content = `
            <div class="announcement-detail">
                <h3>${announcement.title}</h3>
                <div class="announcement-meta">
                    <p>发布者: ${announcement.created_by}</p>
                    <p>发布时间: ${Utils.formatDate(announcement.created_at)}</p>
                    ${announcement.updated_at !== announcement.created_at ? 
                        `<p>最后编辑: ${Utils.formatDate(announcement.updated_at)}</p>` : ''
                    }
                </div>
                <div class="announcement-content">
                    ${this.formatContent(announcement.content)}
                </div>
            </div>
        `;

        Modal.show('公告详情', content);
    }

    static init() {
        // 绑定发布公告按钮
        const addAnnouncementBtn = document.getElementById('addAnnouncementBtn');
        if (addAnnouncementBtn) {
            addAnnouncementBtn.addEventListener('click', () => this.addAnnouncement());
        }
    }
}
