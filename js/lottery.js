// 抽奖轮盘模块
class LotteryManager {
    static wheels = [];
    static history = [];
    static currentWheel = null;
    static isSpinning = false;
    static isEditMode = false;

    static async loadWheels() {
        try {
            const response = await API.getWheelConfigs();
            this.wheels = response.data || [];
            this.renderWheels();
        } catch (error) {
            console.error('Error loading wheels:', error);
            Utils.showToast('加载轮盘配置失败', 'error');
            this.renderWheelsEmptyState();
        }
    }

    // 抽奖历史功能暂时隐藏
    // static async loadHistory() {
    //     try {
    //         const response = await API.getLotteryHistory();
    //         this.history = response.data || [];
    //         this.renderHistory();
    //     } catch (error) {
    //         console.error('Error loading history:', error);
    //         Utils.showToast('加载抽奖历史失败', 'error');
    //     }
    // }

    static renderWheels() {
        const container = document.getElementById('wheelsList');
        
        if (this.wheels.length === 0) {
            this.renderWheelsEmptyState();
            return;
        }

        container.innerHTML = this.wheels.map(wheel => `
            <div class="card wheel-card" data-wheel-id="${wheel._id}">
                <div class="card-header">
                    <div class="card-title">${wheel.name}</div>
                    <div class="card-actions ${this.isEditMode ? 'visible' : 'hidden'}">
                        <button onclick="LotteryManager.editWheel('${wheel._id}')" class="btn-text">编辑</button>
                        <button onclick="LotteryManager.deleteWheel('${wheel._id}')" class="btn-text" style="color: #ff4757;">删除</button>
                    </div>
                </div>
                <div class="card-content" onclick="LotteryManager.useWheel('${wheel._id}')" style="cursor: pointer;">
                    <div class="wheel-options">
                        ${wheel.options.map(option => `<span class="option-tag">${option}</span>`).join('')}
                    </div>
                </div>
                <div class="card-meta">
                    <span>创建者: ${wheel.created_by}</span>
                    <span>${Utils.formatDate(wheel.created_at)}</span>
                </div>
            </div>
        `).join('');
    }

    static renderWheelsEmptyState() {
        const container = document.getElementById('wheelsList');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎯</div>
                <h3>暂无轮盘配置</h3>
                <p>点击上方"新建轮盘"按钮创建第一个轮盘</p>
            </div>
        `;
    }

    static toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        // 重新渲染轮盘列表以更新按钮显示状态
        this.renderWheels();
        
        // 更新编辑模式按钮状态
        const editModeBtn = document.getElementById('editWheelModeBtn');
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

    // 抽奖历史渲染功能暂时隐藏
    // static renderHistory() {
    //     const container = document.getElementById('historyList');
    //     
    //     if (this.history.length === 0) {
    //         container.innerHTML = `
    //             <div class="empty-state">
    //                 <div class="empty-icon">📝</div>
    //                 <p>暂无抽奖记录</p>
    //             </div>
    //         `;
    //         return;
    //     }

    //     container.innerHTML = this.history.slice(0, 20).map(record => `
    //         <div class="history-item">
    //             <div class="history-info">
    //                 <div class="history-wheel">${record.wheel_name}</div>
    //                 <div class="history-result">结果: <strong>${record.result}</strong></div>
    //             </div>
    //             <div class="history-meta">
    //                 <div>操作者: ${record.operated_by}</div>
    //                 <div>${Utils.formatDate(record.created_at)}</div>
    //             </div>
    //         </div>
    //     `).join('');
    // }

    static addWheel() {
        const content = `
            <form id="wheelForm">
                <div class="form-group">
                    <label for="wheelName">轮盘名称</label>
                    <input type="text" id="wheelName" placeholder="请输入轮盘名称" maxlength="50" required>
                </div>
                <div class="form-group">
                    <label for="wheelOptions">轮盘选项</label>
                    <div class="options-input">
                        <div id="optionsList">
                            <div class="option-input">
                                <input type="text" placeholder="选项 1" maxlength="30" required>
                                <button type="button" onclick="LotteryManager.removeOption(this)" class="btn-remove" disabled>删除</button>
                            </div>
                            <div class="option-input">
                                <input type="text" placeholder="选项 2" maxlength="30" required>
                                <button type="button" onclick="LotteryManager.removeOption(this)" class="btn-remove">删除</button>
                            </div>
                        </div>
                        <button type="button" id="addOptionBtn" class="btn-text">+ 添加选项</button>
                    </div>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-primary">创建轮盘</button>
                </div>
            </form>
        `;

        Modal.show('新建轮盘', content);

        // 绑定事件
        document.getElementById('wheelForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleWheelForm();
        });

        document.getElementById('addOptionBtn').addEventListener('click', () => {
            this.addOption();
        });

        // 添加样式
        this.addWheelFormStyles();
    }

    static addWheelFormStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .options-input {
                border: 1px solid #e1e8ed;
                border-radius: 8px;
                padding: 15px;
                background: #f8fafc;
            }
            .option-input {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                align-items: center;
            }
            .option-input input {
                flex: 1;
                margin-bottom: 0;
            }
            .btn-remove {
                background: #ff4757;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                white-space: nowrap;
            }
            .btn-remove:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .option-tag {
                display: inline-block;
                background: #4f8ef7;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                margin: 2px;
            }
            .wheel-options {
                margin: 10px 0;
            }
            .history-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border: 1px solid #e1e8ed;
                border-radius: 8px;
                margin-bottom: 8px;
                background: white;
            }
            .history-info {
                flex: 1;
            }
            .history-wheel {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }
            .history-result {
                color: #4f8ef7;
                font-size: 14px;
            }
            .history-meta {
                text-align: right;
                font-size: 12px;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    }

    static addOption() {
        const optionsList = document.getElementById('optionsList');
        const currentOptions = optionsList.children.length;
        
        if (currentOptions >= CONFIG.DEFAULTS.MAX_WHEEL_OPTIONS) {
            Utils.showToast(`最多只能添加${CONFIG.DEFAULTS.MAX_WHEEL_OPTIONS}个选项`, 'error');
            return;
        }

        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-input';
        optionDiv.innerHTML = `
            <input type="text" placeholder="选项 ${currentOptions + 1}" maxlength="30" required>
            <button type="button" onclick="LotteryManager.removeOption(this)" class="btn-remove">删除</button>
        `;
        
        optionsList.appendChild(optionDiv);
        optionDiv.querySelector('input').focus();
    }

    static removeOption(button) {
        const optionsList = document.getElementById('optionsList');
        if (optionsList.children.length <= 2) {
            Utils.showToast('至少需要保留2个选项', 'error');
            return;
        }
        
        button.parentElement.remove();
        
        // 更新第一个选项的删除按钮状态
        const firstRemoveBtn = optionsList.querySelector('.btn-remove');
        if (firstRemoveBtn) {
            firstRemoveBtn.disabled = optionsList.children.length <= 2;
        }
    }

    static async handleWheelForm(wheelId = null) {
        const name = document.getElementById('wheelName').value.trim();
        const optionInputs = document.querySelectorAll('#optionsList input');
        const options = Array.from(optionInputs)
            .map(input => input.value.trim())
            .filter(option => option.length > 0);
        
        if (!name) {
            Utils.showToast('请输入轮盘名称', 'error');
            return;
        }
        
        if (options.length < 2) {
            Utils.showToast(CONFIG.MESSAGES.WHEEL_OPTIONS_REQUIRED, 'error');
            return;
        }

        if (options.length > CONFIG.DEFAULTS.MAX_WHEEL_OPTIONS) {
            Utils.showToast(CONFIG.MESSAGES.WHEEL_OPTIONS_TOO_MANY, 'error');
            return;
        }

        // 检查重复选项
        const uniqueOptions = [...new Set(options)];
        if (uniqueOptions.length !== options.length) {
            Utils.showToast('选项不能重复', 'error');
            return;
        }

        try {
            const data = { name, options: uniqueOptions };
            
            if (wheelId) {
                await API.updateWheelConfig(wheelId, data);
                Utils.showToast('轮盘更新成功', 'success');
            } else {
                await API.createWheelConfig(data);
                Utils.showToast('轮盘创建成功', 'success');
            }
            
            Modal.hide();
            this.loadWheels();
        } catch (error) {
            console.error('Error saving wheel:', error);
            Utils.showToast('操作失败', 'error');
        }
    }

    static editWheel(wheelId) {
        const wheel = this.wheels.find(w => w._id === wheelId);
        if (!wheel) return;

        const content = `
            <form id="wheelForm">
                <div class="form-group">
                    <label for="wheelName">轮盘名称</label>
                    <input type="text" id="wheelName" value="${wheel.name}" maxlength="50" required>
                </div>
                <div class="form-group">
                    <label for="wheelOptions">轮盘选项</label>
                    <div class="options-input">
                        <div id="optionsList">
                            ${wheel.options.map((option, index) => `
                                <div class="option-input">
                                    <input type="text" value="${option}" maxlength="30" required>
                                    <button type="button" onclick="LotteryManager.removeOption(this)" class="btn-remove" ${index === 0 && wheel.options.length <= 2 ? 'disabled' : ''}>删除</button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" id="addOptionBtn" class="btn-text">+ 添加选项</button>
                    </div>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-primary">更新轮盘</button>
                </div>
            </form>
        `;

        Modal.show('编辑轮盘', content);

        document.getElementById('wheelForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleWheelForm(wheelId);
        });

        document.getElementById('addOptionBtn').addEventListener('click', () => {
            this.addOption();
        });

        this.addWheelFormStyles();
    }

    static async deleteWheel(wheelId) {
        const wheel = this.wheels.find(w => w._id === wheelId);
        if (!wheel) return;

        if (!confirm(`确定要删除轮盘"${wheel.name}"吗？`)) {
            return;
        }

        try {
            await API.deleteWheelConfig(wheelId);
            Utils.showToast('轮盘删除成功', 'success');
            this.loadWheels();
        } catch (error) {
            console.error('Error deleting wheel:', error);
            Utils.showToast('删除失败', 'error');
        }
    }

    static useWheel(wheelId) {
        const wheel = this.wheels.find(w => w._id === wheelId);
        if (!wheel) return;

        this.currentWheel = wheel;
        this.showWheelSpinner();
    }

    static showWheelSpinner() {
        if (!this.currentWheel) return;

        const content = `
            <div class="wheel-spinner">
                <div class="wheel-container">
                    <div class="wheel-pointer"></div>
                    <canvas id="wheelCanvas" width="250" height="250" class="wheel"></canvas>
                </div>
                <div class="wheel-info">
                    <h3>${this.currentWheel.name}</h3>
                    <p>点击下方按钮开始抽奖</p>
                </div>
                <div class="wheel-controls">
                    <button id="spinBtn" class="btn-primary" onclick="LotteryManager.spinWheel()">开始抽奖</button>
                </div>
                <div id="spinResult" class="spin-result hidden"></div>
            </div>
        `;

        Modal.show('抽奖轮盘', content);
        this.addSpinnerStyles();
        this.drawWheel();
    }

    // 旧的轮盘section渲染方法已被Canvas方法替代
    // static renderWheelSections(options) { ... }

    static addSpinnerStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .wheel-spinner {
                text-align: center;
                padding: 20px;
            }
            .wheel-container {
                position: relative;
                margin: 20px auto;
            }
            .wheel {
                width: 250px;
                height: 250px;
                border: 4px solid #4f8ef7;
                border-radius: 50%;
                margin: 0 auto;
                position: relative;
                transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }
            .wheel-pointer {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 15px solid transparent;
                border-right: 15px solid transparent;
                border-top: 20px solid #ff4757;
                z-index: 10;
            }
            .wheel-info {
                margin: 20px 0;
            }
            .wheel-info h3 {
                color: #333;
                margin-bottom: 10px;
            }
            .wheel-controls {
                margin: 20px 0;
            }
            .spin-result {
                margin-top: 20px;
                padding: 20px;
                background: #f0f8ff;
                border-radius: 12px;
                border: 2px solid #4f8ef7;
            }
            .spin-result h3 {
                color: #4f8ef7;
                margin-bottom: 10px;
            }
            .spin-result .result-text {
                font-size: 1.2rem;
                font-weight: 600;
                color: #333;
            }
        `;
        document.head.appendChild(style);
    }

    static drawWheel() {
        const canvas = document.getElementById('wheelCanvas');
        if (!canvas || !this.currentWheel) return;

        const ctx = canvas.getContext('2d');
        const centerX = 125;
        const centerY = 125;
        const radius = 100;
        const options = this.currentWheel.options;
        const colors = CONFIG.DEFAULTS.WHEEL_COLORS;
        const sectionAngle = (2 * Math.PI) / options.length;

        // 清空画布
        ctx.clearRect(0, 0, 250, 250);

        // 绘制轮盘扇形
        options.forEach((option, index) => {
            const startAngle = index * sectionAngle - Math.PI / 2; // 从顶部开始
            const endAngle = (index + 1) * sectionAngle - Math.PI / 2;
            const color = colors[index % colors.length];

            // 绘制扇形
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // 绘制边框
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制文字
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sectionAngle / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.fillText(option, radius * 0.7, 5);
            ctx.restore();
        });
    }

    static async spinWheel() {
        if (this.isSpinning || !this.currentWheel) return;

        this.isSpinning = true;
        const spinBtn = document.getElementById('spinBtn');
        const canvas = document.getElementById('wheelCanvas');
        const resultDiv = document.getElementById('spinResult');
        
        spinBtn.disabled = true;
        spinBtn.textContent = '抽奖中...';
        resultDiv.classList.add('hidden');

        // 随机选择结果
        const options = this.currentWheel.options;
        const randomIndex = Math.floor(Math.random() * options.length);
        const result = options[randomIndex];
        
        // 计算旋转角度
        const sectionAngle = 360 / options.length;
        const targetAngle = randomIndex * sectionAngle + (sectionAngle / 2);
        const spins = 5; // 转5圈
        const finalAngle = 360 * spins + (360 - targetAngle); // 反向计算，因为指针在上方
        
        // 开始旋转Canvas
        canvas.style.transform = `rotate(${finalAngle}deg)`;
        
        // 等待动画完成
        setTimeout(async () => {
            // 显示结果
            resultDiv.innerHTML = `
                <h3>🎉 抽奖结果</h3>
                <div class="result-text">${result}</div>
            `;
            resultDiv.classList.remove('hidden');
            
            // 记录到历史（后端保存，但前端不显示）
            try {
                await API.createLotteryRecord({
                    wheel_config_id: this.currentWheel._id,
                    wheel_name: this.currentWheel.name,
                    result: result
                });
                
                // 暂时不刷新历史记录显示
                // this.loadHistory();
            } catch (error) {
                console.error('Error saving lottery record:', error);
            }
            
            // 重置按钮
            spinBtn.disabled = false;
            spinBtn.textContent = '再次抽奖';
            this.isSpinning = false;
        }, 3000);
    }

    static init() {
        // 绑定新建轮盘按钮
        const addWheelBtn = document.getElementById('addWheelBtn');
        if (addWheelBtn) {
            addWheelBtn.addEventListener('click', () => this.addWheel());
        }
    }
}
