// 网址管理模块
class UrlManager {
    static categories = [];
    static currentCategoryId = null;
    static isEditMode = false;

    static async loadCategories() {
        try {
            const response = await API.getUrlCategories();
            this.categories = response.data || [];
            this.renderCategoryTabs();
            
            // 如果有分类，默认选择第一个
            if (this.categories.length > 0) {
                this.selectCategory(this.categories[0]._id);
            } else {
                this.renderEmptyState();
            }
            
            // 更新分类管理按钮状态
            this.updateCategoryButtons();
        } catch (error) {
            console.error('Error loading categories:', error);
            Utils.showToast('加载网址分类失败', 'error');
            this.renderEmptyState();
        }
    }

    static renderCategoryTabs() {
        const container = document.getElementById('categoryTabsList');
        
        if (this.categories.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.categories.map(category => `
            <div class="category-tab" data-category-id="${category._id}" 
                 onclick="UrlManager.selectCategory('${category._id}')"
                 oncontextmenu="event.preventDefault(); UrlManager.showCategoryMenu('${category._id}', event)">
                <span class="tab-name">${category.name}</span>
                <div class="tab-actions">
                    <button class="tab-action-btn tab-edit-btn" onclick="event.stopPropagation(); UrlManager.editCategory('${category._id}')" title="编辑">✎</button>
                    <button class="tab-action-btn tab-delete-btn" onclick="event.stopPropagation(); UrlManager.deleteCategory('${category._id}')" title="删除">×</button>
                </div>
            </div>
        `).join('');
    }

    static selectCategory(categoryId) {
        this.currentCategoryId = categoryId;
        
        // 更新标签状态
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.categoryId === categoryId) {
                tab.classList.add('active');
            }
        });
        
        // 渲染当前分类的网址（保持编辑模式状态）
        this.renderCurrentCategoryUrls();
        
        // 更新分类管理按钮状态
        this.updateCategoryButtons();
    }

    static renderCurrentCategoryUrls() {
        const container = document.getElementById('currentCategoryUrls');
        const currentCategory = this.categories.find(c => c._id === this.currentCategoryId);
        
        if (!currentCategory) {
            container.innerHTML = '';
            return;
        }

        const urls = currentCategory.urls || [];
        
        container.innerHTML = `
            <div class="category-header">
                <div class="header-actions">
                    <button class="action-icon-btn add-btn" onclick="UrlManager.addUrl('${currentCategory._id}')" title="添加网址">
                        <img src="images/add-web.png" alt="添加网址" class="icon-img">
                    </button>
                    <button class="action-icon-btn edit-btn ${this.isEditMode ? 'active' : ''}" onclick="UrlManager.toggleEditMode()" title="编辑模式">
                        <img src="images/edit.png" alt="编辑模式" class="icon-img">
                    </button>
                </div>
            </div>
            <div class="urls-list">
                ${this.renderUrls(urls)}
            </div>
        `;
    }

    static renderUrls(urls) {
        if (urls.length === 0) {
            return '<div class="empty-state"><p>暂无网址，点击上方按钮添加</p></div>';
        }

        return urls.map(url => `
            <div class="url-item" data-url-id="${url._id}">
                <div class="url-info" onclick="UrlManager.openUrl('${url.url}')">
                    <div class="url-name">${url.name}</div>
                    <div class="url-link">${url.url}</div>
                </div>
                <div class="url-actions ${this.isEditMode ? 'visible' : 'hidden'}">
                    <button onclick="UrlManager.editUrl('${url._id}')" class="btn-text">编辑</button>
                    <button onclick="UrlManager.deleteUrl('${url._id}')" class="btn-text" style="color: #ff4757;">删除</button>
                </div>
            </div>
        `).join('');
    }

    static renderEmptyState() {
        const tabsContainer = document.getElementById('categoryTabsList');
        const contentContainer = document.getElementById('currentCategoryUrls');
        
        tabsContainer.innerHTML = '';
        contentContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔗</div>
                <h3>暂无网址分类</h3>
                <p>点击右侧"+"按钮创建第一个分类</p>
            </div>
        `;
    }

    static addCategory() {
        const content = `
            <form id="categoryForm">
                <div class="form-group">
                    <label for="categoryName">分类名称</label>
                    <input type="text" id="categoryName" placeholder="请输入分类名称" maxlength="50" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-primary">创建分类</button>
                </div>
            </form>
        `;

        Modal.show('添加网址分类', content, () => {
            this.handleCategoryForm();
        });

        // 绑定表单提交事件
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategoryForm();
        });
    }

    static async handleCategoryForm(categoryId = null) {
        const name = document.getElementById('categoryName').value.trim();
        
        if (!name) {
            Utils.showToast('请输入分类名称', 'error');
            return;
        }

        try {
            if (categoryId) {
                await API.updateUrlCategory(categoryId, { name });
                Utils.showToast('分类更新成功', 'success');
            } else {
                await API.createUrlCategory({ name });
                Utils.showToast('分类创建成功', 'success');
            }
            
            Modal.hide();
            await this.loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            Utils.showToast('操作失败', 'error');
        }
    }

    static editCategory(categoryId) {
        const category = this.categories.find(c => c._id === categoryId);
        if (!category) return;

        const content = `
            <form id="categoryForm">
                <div class="form-group">
                    <label for="categoryName">分类名称</label>
                    <input type="text" id="categoryName" value="${category.name}" maxlength="50" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-primary">更新分类</button>
                </div>
            </form>
        `;

        Modal.show('编辑网址分类', content);

        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategoryForm(categoryId);
        });
    }

    static async deleteCategory(categoryId) {
        const category = this.categories.find(c => c._id === categoryId);
        if (!category) return;

        if (!confirm(`确定要删除分类"${category.name}"吗？\n删除后该分类下的所有网址也会被删除。`)) {
            return;
        }

        try {
            await API.deleteUrlCategory(categoryId);
            Utils.showToast('分类删除成功', 'success');
            await this.loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            Utils.showToast('删除失败', 'error');
        }
    }

    static addUrl(categoryId) {
        const category = this.categories.find(c => c._id === categoryId);
        if (!category) return;

        const content = `
            <form id="urlForm">
                <div class="form-group">
                    <label for="urlName">网址名称</label>
                    <input type="text" id="urlName" placeholder="请输入网址名称" maxlength="100" required>
                </div>
                <div class="form-group">
                    <label for="urlLink">网址链接</label>
                    <input type="text" id="urlLink" placeholder="请输入网址链接" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-primary">添加网址</button>
                </div>
            </form>
        `;

        Modal.show(`添加网址到"${category.name}"`, content);

        document.getElementById('urlForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUrlForm(categoryId);
        });
    }

    static async handleUrlForm(categoryId, urlId = null) {
        const name = document.getElementById('urlName').value.trim();
        const url = document.getElementById('urlLink').value.trim();
        
        if (!name || !url) {
            Utils.showToast('请填写完整信息', 'error');
            return;
        }

        const validUrl = Utils.validateUrl(url);
        if (!validUrl) {
            Utils.showToast('请输入有效的网址', 'error');
            return;
        }

        // 检查用户是否已登录
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) {
            Utils.showToast('请先登录', 'error');
            return;
        }

        try {
            const data = { name, url: validUrl };
            
            if (urlId) {
                await API.updateUrl(categoryId, urlId, data);
                Utils.showToast('网址更新成功', 'success');
            } else {
                await API.createUrl(categoryId, data);
                Utils.showToast('网址添加成功', 'success');
            }
            
            Modal.hide();
            // 重新加载数据但保持当前选中的分类和编辑模式
            const currentCategoryId = this.currentCategoryId;
            const editMode = this.isEditMode;
            await this.loadCategories();
            if (currentCategoryId) {
                this.selectCategory(currentCategoryId);
                this.isEditMode = editMode;
                this.renderCurrentCategoryUrls();
            }
        } catch (error) {
            console.error('Error saving url:', error);
            
            // 更详细的错误信息
            let errorMessage = '操作失败';
            if (error.message.includes('404')) {
                errorMessage = '后端接口未找到，请检查后端部署';
            } else if (error.message.includes('500')) {
                errorMessage = '服务器内部错误';
            } else if (error.message.includes('Network')) {
                errorMessage = '网络连接失败';
            } else {
                errorMessage = `操作失败: ${error.message}`;
            }
            
            Utils.showToast(errorMessage, 'error');
        }
    }

    static editUrl(urlId) {
        // 找到包含该网址的分类和网址信息
        let targetCategory = null;
        let targetUrl = null;
        
        for (const category of this.categories) {
            const url = category.urls?.find(u => u._id === urlId);
            if (url) {
                targetCategory = category;
                targetUrl = url;
                break;
            }
        }
        
        if (!targetCategory || !targetUrl) return;

        const content = `
            <form id="urlForm">
                <div class="form-group">
                    <label for="urlName">网址名称</label>
                    <input type="text" id="urlName" value="${targetUrl.name}" maxlength="100" required>
                </div>
                <div class="form-group">
                    <label for="urlLink">网址链接</label>
                    <input type="text" id="urlLink" value="${targetUrl.url}" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-primary">更新网址</button>
                </div>
            </form>
        `;

        Modal.show('编辑网址', content);

        document.getElementById('urlForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUrlForm(targetCategory._id, urlId);
        });
    }

    static async deleteUrl(urlId) {
        // 找到包含该网址的分类
        let targetCategory = null;
        let targetUrl = null;
        
        for (const category of this.categories) {
            const url = category.urls?.find(u => u._id === urlId);
            if (url) {
                targetCategory = category;
                targetUrl = url;
                break;
            }
        }
        
        if (!targetCategory || !targetUrl) return;

        if (!confirm(`确定要删除网址"${targetUrl.name}"吗？`)) {
            return;
        }

        try {
            await API.deleteUrl(targetCategory._id, urlId);
            Utils.showToast('网址删除成功', 'success');
            // 重新加载数据但保持当前选中的分类和编辑模式
            const currentCategoryId = this.currentCategoryId;
            const editMode = this.isEditMode;
            await this.loadCategories();
            if (currentCategoryId) {
                this.selectCategory(currentCategoryId);
                this.isEditMode = editMode;
                this.renderCurrentCategoryUrls();
            }
        } catch (error) {
            console.error('Error deleting url:', error);
            Utils.showToast('删除失败', 'error');
        }
    }

    static toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        // 重新渲染当前分类的网址列表以更新按钮显示状态
        this.renderCurrentCategoryUrls();
        
        // 显示提示信息
        if (this.isEditMode) {
            Utils.showToast('已进入编辑模式', 'info');
        } else {
            Utils.showToast('已退出编辑模式', 'info');
        }
    }

    static editCurrentCategory() {
        if (!this.currentCategoryId) {
            Utils.showToast('请先选择一个分类', 'error');
            return;
        }
        this.editCategory(this.currentCategoryId);
    }

    static deleteCurrentCategory() {
        if (!this.currentCategoryId) {
            Utils.showToast('请先选择一个分类', 'error');
            return;
        }
        this.deleteCategory(this.currentCategoryId);
    }

    static updateCategoryButtons() {
        const editBtn = document.getElementById('editCategoryBtn');
        const deleteBtn = document.getElementById('deleteCategoryBtn');
        
        if (editBtn && deleteBtn) {
            if (this.currentCategoryId && this.categories.length > 0) {
                editBtn.style.display = 'flex';
                deleteBtn.style.display = 'flex';
            } else {
                editBtn.style.display = 'none';
                deleteBtn.style.display = 'none';
            }
        }
    }

    static showCategoryMenu(categoryId, event) {
        // 移动端长按显示分类操作菜单
        const category = this.categories.find(c => c._id === categoryId);
        if (!category) return;

        const content = `
            <div class="category-menu">
                <h3>分类操作</h3>
                <p>分类：${category.name}</p>
                <div class="menu-actions">
                    <button class="btn-primary" onclick="Modal.hide(); UrlManager.editCategory('${categoryId}')">
                        ✎ 编辑分类
                    </button>
                    <button class="btn-primary" onclick="Modal.hide(); UrlManager.deleteCategory('${categoryId}')" style="background: #ff4757;">
                        × 删除分类
                    </button>
                </div>
            </div>
        `;

        Modal.show('分类操作', content);
    }

    static openUrl(url) {
        window.open(url, '_blank');
    }

    static init() {
        // 绑定添加分类按钮
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.addCategory());
        }
    }
}
