// 配置文件
const CONFIG = {
    // API 基础地址 - 需要替换为你的 Laf 云函数地址
    API_BASE_URL: 'https://dormback.huizhi.pro',
    
    // 本地存储键名
    STORAGE_KEYS: {
        USER: 'dorm_tool_user',
        THEME: 'dorm_tool_theme'
    },
    
    // 默认配置
    DEFAULTS: {
        WHEEL_COLORS: [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
            '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
        ],
        MAX_WHEEL_OPTIONS: 12,
        MAX_NICKNAME_LENGTH: 20,
        MAX_TITLE_LENGTH: 100,
        MAX_CONTENT_LENGTH: 1000
    },
    
    // 错误消息
    MESSAGES: {
        NETWORK_ERROR: '网络连接失败，请检查网络后重试',
        SERVER_ERROR: '服务器错误，请稍后重试',
        INVALID_INPUT: '输入内容不符合要求',
        NICKNAME_REQUIRED: '请输入昵称',
        NICKNAME_TOO_LONG: '昵称不能超过20个字符',
        TITLE_REQUIRED: '请输入标题',
        CONTENT_REQUIRED: '请输入内容',
        URL_REQUIRED: '请输入网址',
        URL_INVALID: '请输入有效的网址',
        CATEGORY_REQUIRED: '请选择分类',
        WHEEL_OPTIONS_REQUIRED: '请至少添加2个选项',
        WHEEL_OPTIONS_TOO_MANY: '选项不能超过12个'
    }
};