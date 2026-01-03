"""
丸龜製麵：AI 虛擬導覽與沉浸式點餐系統
FastAPI 後端核心
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os
import httpx
import time
from dotenv import load_dotenv

# ============== 初始化 ==============
load_dotenv()
app = FastAPI(
    title="丸龜製麵 API",
    description="AI 虛擬導覽與沉浸式點餐系統後端",
    version="1.0.0"
)

# CORS 設定 (允許前端跨域請求)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開發時允許所有來源，部署時應限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 掛載靜態資源 (圖片、模型等)
app.mount("/static", StaticFiles(directory="./static"), name="static")

# 掛載前端資源 (HTML, CSS, JS)
app.mount("/assets", StaticFiles(directory="../Frontend"), name="frontend")

# ============== 資料載入 ==============
def load_menu():
    """載入菜單資料"""
    menu_path = "./menu.json"
    with open(menu_path, "r", encoding="utf-8") as f:
        return json.load(f)

# ============== 資料模型 ==============
class ChatMessage(BaseModel):
    message: str
    menu_id: Optional[int] = None

class OrderItem(BaseModel):
    menu_id: int
    quantity: int

class Order(BaseModel):
    items: list[OrderItem]
    customer_note: Optional[str] = None

# ============== API 路由 ==============

@app.get("/", response_class=HTMLResponse)
async def root():
    """首頁 - 返回主頁面"""
    return FileResponse("../Frontend/index.html")

@app.get("/ar")
async def ar_page():
    """AR 體驗頁面"""
    return FileResponse("../Frontend/ar_view.html")

@app.get("/order_confirm.html", response_class=HTMLResponse)
async def order_confirm_page():
    """訂單確認頁面"""
    return FileResponse("../Frontend/order_confirm.html")

# ---------- 菜單 API ----------

@app.get("/api/menu")
async def get_all_menu():
    """取得完整菜單 (主餐 + 副餐)"""
    menu_data = load_menu()
    return {
        "success": True,
        "data": {
            "menu": menu_data["menu"],
            "sides": menu_data["sides"],
            "store_info": menu_data["store_info"]
        }
    }

@app.get("/api/menu/main")
async def get_main_dishes():
    """只取得主餐 (烏龍麵)"""
    menu_data = load_menu()
    return {
        "success": True,
        "data": menu_data["menu"]
    }

@app.get("/api/menu/sides")
async def get_sides():
    """只取得副餐/配料"""
    menu_data = load_menu()
    return {
        "success": True,
        "data": menu_data["sides"]
    }

@app.get("/api/menu/{item_id}")
async def get_menu_item(item_id: int):
    """取得單一餐點詳細資料 (給 AR 頁面使用)"""
    menu_data = load_menu()
    
    # 在主餐中尋找
    for item in menu_data["menu"]:
        if item["id"] == item_id:
            return {
                "success": True,
                "data": item,
                "type": "main"
            }
    
    # 在副餐中尋找
    for item in menu_data["sides"]:
        if item["id"] == item_id:
            return {
                "success": True,
                "data": item,
                "type": "side"
            }
    
    raise HTTPException(status_code=404, detail=f"找不到 ID 為 {item_id} 的餐點")

@app.get("/api/menu/popular/list")
async def get_popular_items():
    """取得人氣餐點"""
    menu_data = load_menu()
    popular = [item for item in menu_data["menu"] if item.get("is_popular", False)]
    return {
        "success": True,
        "data": popular
    }

# ---------- AI 聊天 API ----------

# OpenRouter API 設定 (dotenv 讀取)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

@app.post("/api/chat")
async def chat_with_ai(chat: ChatMessage):
    """與 AI 店長對話"""
    menu_data = load_menu()
    store_info = menu_data["store_info"]
    
    # 讀取 System Prompt 模板
    with open("./system_prompt.txt", "r", encoding="utf-8") as f:
        system_prompt_template = f.read()
    
    # 替換店舖資訊
    system_prompt = system_prompt_template.format(
        ai_personality=store_info['ai_personality'],
        store_name=store_info['name'],
        store_name_jp=store_info['name_jp'],
        slogan=store_info['slogan'],
        opening_hours=store_info['opening_hours'],
        menu_info=""
    )
    
    # 如果有指定餐點 ID，加入該餐點資訊
    if chat.menu_id:
        for item in menu_data["menu"]:
            if item["id"] == chat.menu_id:
                menu_info = f"""

【目前客人正在看的餐點】
- 名稱：{item['name']} ({item['name_jp']})
- 價格：NT${item['price']}
- 介紹：{item['description']}
- 店長小提示：{item['ai_prompt']}
- 辣度：{'🌶️' * item['spicy_level'] if item['spicy_level'] > 0 else '不辣'}
"""
                system_prompt = system_prompt_template.format(
                    ai_personality=store_info['ai_personality'],
                    store_name=store_info['name'],
                    store_name_jp=store_info['name_jp'],
                    slogan=store_info['slogan'],
                    opening_hours=store_info['opening_hours'],
                    menu_info=menu_info
                )
                break
    
    # 呼叫 OpenRouter API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "meta-llama/llama-3.3-70b-instruct:free",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": chat.message}
                    ],
                    "max_tokens": 300,
                    "temperature": 0.7
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_reply = result["choices"][0]["message"]["content"]
                return {
                    "success": True,
                    "reply": ai_reply
                }
            else:
                # API 失敗時的備用回覆
                return {
                    "success": False,
                    "reply": "哎呀！店長現在有點忙，請稍後再試試看喔～ 🙇",
                    "error": f"API Error: {response.status_code}"
                }
                
    except Exception as e:
        # 錯誤處理 - 提供備用回覆
        return {
            "success": False,
            "reply": "網路好像有點不穩定呢！不過沒關係，歡迎直接點餐，我們的每道烏龍麵都很好吃喔！ 🍜",
            "error": str(e)
        }

# ---------- 訂單 API ----------

@app.post("/api/order")
async def create_order(order: Order):
    """建立訂單"""
    menu_data = load_menu()
    order_details = []
    total = 0
    
    for item in order.items:
        # 尋找餐點
        found = None
        for menu_item in menu_data["menu"] + menu_data["sides"]:
            if menu_item["id"] == item.menu_id:
                found = menu_item
                break
        
        if found:
            subtotal = found["price"] * item.quantity
            order_details.append({
                "name": found["name"],
                "price": found["price"],
                "quantity": item.quantity,
                "subtotal": subtotal
            })
            total += subtotal
        else:
            raise HTTPException(status_code=400, detail=f"找不到餐點 ID: {item.menu_id}")
    
    # 產生簡單訂單編號（可用時間戳記或亂數）
    order_id = f"OD{int(time.time())}"
    # info 欄位可帶主要資訊
    info = {
        "總金額": total,
        "備註": order.customer_note or "",
        "品項": ", ".join([f"{d['name']}x{d['quantity']}" for d in order_details])
    }
    return {
        "success": True,
        "order": {
            "order_id": order_id,
            "info": info,
            "items": order_details,
            "total": total,
            "note": order.customer_note,
            "message": f"感謝您的訂購！總金額為 NT${total} 元 🎉"
        }
    }

# ---------- 健康檢查 ----------

@app.get("/api/health")
async def health_check():
    """API 健康檢查"""
    return {
        "status": "healthy",
        "message": "丸龜製麵 API 運作正常！🍜"
    }

# ============== 啟動設定 ==============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
