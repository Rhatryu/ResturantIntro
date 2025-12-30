# 丸龜製麵：AI 虛擬導覽與沉浸式點餐系統

## 🍜 專案簡介

這是一個結合 **WebAR**、**AI 對話**與**互動點餐**的創新餐廳導覽系統。使用者可以：
- 在電腦上瀏覽精美菜單，懸停查看 QR Code
- 用手機掃描進入 AR 體驗，觀看 3D 麵條模型
- 與 AI 店長「丸子」對話，獲得餐點推薦
- 直接在 AR 頁面加入購物車

## 🚀 快速開始

### 1. 安裝依賴套件

```bash
cd Backend
pip install -r requirements.txt
```

### 2. 設定環境變數 (選用，AI 功能需要)

```bash
# Windows PowerShell
$env:OPENROUTER_API_KEY = "your-api-key-here"

# 或建立 .env 檔案
OPENROUTER_API_KEY=your-api-key-here
```

### 3. 啟動伺服器

```bash
cd Backend
python main.py
```

或使用 uvicorn：
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 開啟瀏覽器

- 主頁面：http://localhost:8000
- API 文件：http://localhost:8000/docs
- AR 頁面：http://localhost:8000/ar?id=1

## 📂 專案結構

```
ResturantIntro/
├── Backend/                 # 後端 API
│   ├── main.py             # FastAPI 核心
│   ├── menu.json           # 菜單資料庫
│   ├── requirements.txt    # Python 套件
│   └── static/             # 靜態資源
│       ├── img/            # 餐點圖片
│       ├── models/         # 3D 模型 (.glb)
│       └── markers/        # AR 標記
└── Frontend/               # 前端網頁
    ├── index.html          # 主頁面
    ├── ar_view.html        # AR 體驗頁
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

## 🔗 API 端點

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/menu` | 取得完整菜單 |
| GET | `/api/menu/{id}` | 取得單一餐點 |
| GET | `/api/menu/popular/list` | 取得人氣餐點 |
| POST | `/api/chat` | AI 店長對話 |
| POST | `/api/order` | 送出訂單 |
| GET | `/api/health` | 健康檢查 |

## 📱 AR 功能說明

1. 下載或列印 [Hiro 標記](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png)
2. 用手機掃描主頁餐點卡片上的 QR Code
3. 將手機鏡頭對準 Hiro 標記
4. 觀看 3D 模型並與 AI 店長對話

## 🤖 AI 功能設定

本專案使用 [OpenRouter](https://openrouter.ai/) 串接 Llama 3.3 模型。

1. 前往 OpenRouter 註冊帳號
2. 取得 API Key
3. 設定環境變數 `OPENROUTER_API_KEY`

## 🖼️ 新增餐點圖片

將圖片放入 `static/img/` 資料夾，並在 `menu.json` 中更新路徑：

```json
{
  "id": 1,
  "name": "明太子釜玉烏龍麵",
  "image": "/static/img/mentaiko_udon.jpg",
  ...
}
```

## 🎨 3D 模型格式

- 格式：`.glb` (推薦) 或 `.gltf`
- 檔案大小：建議 5MB 以下
- 放置位置：`static/models/`

## 📝 開發階段

- [x] 第一階段：後端 API 與資料庫
- [x] 第二階段：前端 Grid 佈局與 Hover 特效
- [x] 第三階段：WebAR 體驗頁面
- [x] 第四階段：AI 店長整合
- [ ] 第五階段：RWD 優化與 HTTPS 部署

## 🔧 常見問題

### Q: AR 相機沒有啟動？
A: AR 功能需要 HTTPS。開發時可使用 ngrok 或設定本地 SSL。

### Q: AI 回覆失敗？
A: 請確認 `OPENROUTER_API_KEY` 已正確設定，並且帳戶有餘額。

### Q: 3D 模型沒有顯示？
A: 確認模型路徑正確，格式為 `.glb`，且檔案能透過瀏覽器直接存取。

## 📜 授權

MIT License

---

🍜 **丸龜製麵 AI 虛擬導覽系統** - 用科技傳遞美食的溫度