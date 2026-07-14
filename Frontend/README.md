# 菜菜製麵 - 前端

## 目錄結構

```
Frontend/
├── index.html           # 主頁面 (電腦版菜單)
├── ar_view.html         # AR 體驗頁面
├── css/
│   └── style.css        # 主樣式表
└── js/
    └── main.js          # 購物車與互動邏輯
```

## 技術棧

- **框架**: Bootstrap 5
- **圖示**: Bootstrap Icons
- **字體**: Google Fonts (Noto Sans TC)
- **AR**: A-Frame + AR.js
- **語音**: Web Speech API

## 響應式設計

- 桌面版: Grid 佈局 + Hover QR Code
- 平板版: 2 欄 Grid
- 手機版: 單欄 + Modal 點擊

## 與後端整合

前端透過 `fetch()` 呼叫後端 API：

```javascript
window.__APP_CONFIG__ = {
    apiBase: 'https://your-backend.example.com',
    appBase: 'https://your-frontend.example.com'
};

// main.js 會自動讀取設定；未設定時預設使用目前網站同源位址
```

後端會：
1. 提供 API 數據 (`/api/*`)
2. 服務靜態資源 (`/static/*` - 圖片、模型)
3. 返回 HTML 頁面 (`/`, `/ar`)