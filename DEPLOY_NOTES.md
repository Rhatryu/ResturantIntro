# Railway 部署踩坑紀錄

## 坑 1：`.venv` 被推上 GitHub

**錯誤訊息**
```
Build Failed: failed to compute cache key: "/app/.venv": not found
```

**原因**  
`.gitignore` 沒有排除 `.venv`，導致本機的 Windows 虛擬環境被推到 GitHub。  
Railway 的 Railpack builder 偵測到 `.venv` 存在，嘗試直接複製進 Linux Docker image，但 Windows 的 `.venv` 在 Linux 容器裡無效，build 失敗。

**解法**  
在 `.gitignore` 加上：
```
.venv/
venv/
```
然後從 Git 追蹤中移除：
```bash
git rm -r --cached .venv
git add .gitignore
git commit -m "fix: remove .venv from git tracking"
git push
```

---

## 坑 2：Railpack builder 本身有 `.venv` cache bug

**錯誤訊息**  
同上，即使 `.venv` 已從 repo 移除，錯誤依然出現。

**原因**  
Railpack 的 Python provider 在 build 過程中自己建立 `.venv`，但後續的 cache key 計算步驟找不到它，屬於 Railpack 本身的問題。

**解法**  
放棄 Railpack，改用 Nixpacks（Railway 官方主力 builder）。

修改 `railway.toml`：
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn Backend.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/"
```

同時刪除 `railpack.json`，避免混淆。

---

## 最終正確設定

### `.gitignore` 必須包含
```
.env
.venv/
venv/
__pycache__/
*.pyc
```

### `railway.toml`
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn Backend.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/"
```

### 專案入口
根目錄 `main.py` 只需一行：
```python
from Backend.main import app
```
Nixpacks 會用 `requirements.txt` 安裝依賴，再執行 `startCommand`。
