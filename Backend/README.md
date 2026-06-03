# 菜菜製麵：AI 虛擬導覽與沉浸式點餐系統

## 專案簡介

這是一個結合 **WebAR**、**AI 對話**與**互動點餐**的創新餐廳導覽系統。使用者可以：
- 在電腦上瀏覽精美菜單，懸停查看 QR Code
- 用手機掃描進入 AR 體驗，觀看 3D 麵條模型
- 與 AI 店長「丸子」對話，獲得餐點推薦
- 直接在 AR 頁面加入購物車

## 專案結構

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

## API 端點

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/menu` | 取得完整菜單 |
| GET | `/api/menu/{id}` | 取得單一餐點 |
| GET | `/api/menu/popular/list` | 取得人氣餐點 |
| POST | `/api/chat` | AI 店長對話 |
| POST | `/api/order` | 送出訂單 |
| GET | `/api/health` | 健康檢查 |

## AI 功能設定

本專案使用 [OpenRouter](https://openrouter.ai/) 串接 Llama 3.3 模型。

1. 前往 OpenRouter 註冊帳號
2. 取得 API Key
3. 設定環境變數 `OPENROUTER_API_KEY`

## 新增餐點圖片

將圖片放入 `static/img/` 資料夾，並在 `menu.json` 中更新路徑：

```json
{
  "id": 1,
  "name": "明太子釜玉烏龍麵",
  "image": "/static/img/mentaiko_udon.jpg",
  ...
}
```

## 3D 模型格式

- 格式：`.glb` (推薦) 或 `.gltf`
- 檔案大小：建議 5MB 以下
- 放置位置：`static/models/`
