# 自然大叔站台（Cloudflare Pages + GitHub）
- `index.html`：已接 Cloudinary（cloudName=nu-unsigned）。會抓 `/works/manifest.json`。
- `admin/admin-upload-cloudinary.html`：手機上傳 + 產 JSON（noindex）。
- `works/manifest.json`：每天只改這個檔，加一筆就上線。
- `_headers`：設定 manifest 不快取、/admin noindex。

## 部署（Cloudflare Pages → Connect to Git）
Framework: None  
Build command: *(空白)* 或 `exit 0`  
Build output directory: `.`  
