# 丸龜製麵：AI 虛擬導覽與沉浸式點餐系統

結合 **WebAR**、**AI 對話**與**互動點餐**的創新餐廳導覽系統。

## 核心功能

- **電腦版菜單**: 精美 Grid 佈局，Hover 顯示 QR Code
- **WebAR 體驗**: 掃描 QR 觀看 3D 麵條模型
- **AI 店長**: Llama 3.3 智能推薦餐點
- **購物車系統**: 跨頁面持久化點餐
- **語音朗讀**: AI 回覆可語音播放

## 專案結構

```
ResturantIntro/
├── Backend/                 # FastAPI 後端 API
│   ├── main.py             # API 核心
│   ├── menu.json           # 菜單資料
│   └── static/             # 圖片、3D 模型
└── Frontend/               # 前端網頁
    ├── index.html          # 主頁面
    ├── ar_view.html        # AR 頁面
    ├── css/                # 樣式
    └── js/                 # 互動邏輯
```

## 快速開始

### 1. 安裝後端依賴

```bash
cd Backend
pip install -r requirements.txt
```

### 2. 設定環境變數 (選用 - AI 功能)

```bash
# Windows PowerShell
$env:OPENROUTER_API_KEY = "your-api-key-here"
```

### 3. 啟動後端伺服器

```bash
cd Backend
python main.py
```

### 4. 訪問網站

- 主頁: http://localhost:8000
- AR 體驗: http://localhost:8000/ar?id=1
- API 文件: http://localhost:8000/docs

## AR 使用說明

1. 用電腦瀏覽主頁，Hover 餐點卡片看到 QR Code
2. 手機掃描 QR Code 進入 AR 頁面
3. 下載 [Hiro 標記](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png)
4. 將手機鏡頭對準標記，查看 3D 模型
5. 與 AI 店長對話，直接加入購物車

## 技術棧

### 後端
- **FastAPI**: Web 框架
- **OpenRouter**: AI API (Llama 3.3)
- **Uvicorn**: ASGI 伺服器

### 前端
- **Bootstrap 5**: UI 框架
- **A-Frame + AR.js**: WebAR
- **Web Speech API**: 語音合成

## 開發進度 (僅參考)

- [x] 後端 API 與資料庫
- [x] 前端 Grid 佈局與 Hover 特效
- [x] WebAR 體驗頁面
- [x] AI 店長整合
- [ ] 實際餐點圖片與 3D 模型
- [ ] HTTPS 部署 (ngrok)
- [ ] 手機 RWD 優化

## 詳細文件

- [後端 README](Backend/README.md)
- [前端 README](Frontend/README.md)

## 常見問題

### Q: AR 相機無法啟動？
A: WebAR 需要 HTTPS。開發時可用 ngrok 產生 HTTPS URL。

### Q: AI 無法回覆？
A: 確認已設定 `OPENROUTER_API_KEY` 環境變數。

### Q: 圖片無法顯示？
A: 將餐點圖片放入 `Backend/static/img/` 並更新 `menu.json` 路徑。

## 授權

MIT License

---

**Powered by FastAPI + AR.js + Llama 3.3** 🚀
