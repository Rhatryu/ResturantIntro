# ---- 建置階段 ----
FROM python:3.12-slim AS builder

WORKDIR /app

# 只複製 requirements，利用 Docker 快取層
COPY Backend/requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ---- 正式執行階段 ----
FROM python:3.12-slim

WORKDIR /app

# 從 builder 複製已安裝的套件
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 複製後端與前端程式碼
COPY Backend/ ./Backend/
COPY Frontend/ ./Frontend/

# 設定工作目錄至 Backend（main.py 位置）
WORKDIR /app/Backend

# 對外暴露 port
EXPOSE 8000

# 以非 root 使用者執行（安全性最佳實踐）
RUN useradd -m -u 1000 appuser \
    && chown -R appuser:appuser /app
USER appuser

# 啟動指令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
