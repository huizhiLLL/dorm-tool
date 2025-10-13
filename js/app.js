// 主应用入口
class App {
    static async init() {
        try {
            // 初始化各个模块
            Auth.init();
            Navigation.init();
            UrlManager.init();
            AnnouncementManager.init();
            LotteryManager.init();
            
            console.log('宿舍工具箱应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            Utils.showToast('应用初始化失败', 'error');
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    Utils.showToast('发生了未知错误', 'error');
});

// 网络状态监听
window.addEventListener('online', () => {
    Utils.showToast('网络连接已恢复', 'success');
});

window.addEventListener('offline', () => {
    Utils.showToast('网络连接已断开', 'error');
});