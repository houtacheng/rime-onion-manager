# 🧅 洋蔥注音 Rime 設定管理器 (Rime Onion Manager)

專為 **[houtacheng/rime-bopomo-onion-mixed](https://github.com/houtacheng/rime-bopomo-onion-mixed)** 設計的跨平台視覺化桌面輔助工具。

讓使用者能 **一鍵部署最新注音設定檔**、**無痛切換/還原歷史版本**，並嚴格 **保護使用者的自建詞庫與詞頻學習紀錄**。

---

## ✨ 核心特色

- **🚀 一鍵極速部署**：自動從 GitHub 抓取最新發布的設定檔並解壓套用。
- **🔄 自動重新加載 (Auto Reload)**：
  - macOS 自動調用 `Squirrel --reload`
  - Windows 自動調用 `WeaselDeployer.exe /deploy`
  - 免手動開啟輸入法選單點擊重新部署！
- **🛡️ 個人資料零覆蓋保護**：
  - 嚴格保留 `*.userdb/`（個人輸入詞頻學習庫）
  - 保留 `custom_phrase.txt`（個人自定義短語）
  - 保留 `installation.yaml` 與 `user.yaml`
- **⏪ 歷史版本任意切換**：
  - 直接列出 GitHub 最近的 Commits / Releases，可一鍵切換至任一歷史版本。
- **📦 本地安全快照與無損還原**：
  - 每次部署前自動建立本地時間戳快照（`.backups/`）。
  - 若新版本有任何不習慣，可一鍵無損秒回滾！
- **💻 跨平台支援**：原生支援 macOS（鼠鬚管）與 Windows（小狼毫）。

---

## 🛠️ 開發與本地執行

### 需求
- Node.js >= 18
- npm

### 1. 安裝依賴
```bash
npm install
```

### 2. 開發模式啟動 (Electron 桌面視窗)
```bash
npm run dev:electron
```

### 3. 網頁伺服器模式 (瀏覽器預覽)
```bash
# 終端 1：啟動後端 API
npm run server

# 終端 2：啟動前端
npm run dev
```
瀏覽器打開 `http://localhost:5173` 即可體驗！

---

## 📦 打包發行 (Build)

### 本地打包
```bash
# 打包桌面安裝檔 (macOS .dmg / Windows .exe)
npm run build:electron
```
打包完成後檔案會產出於 `release/` 資料夾。

### GitHub Actions 自動發布
本專案已配置 `.github/workflows/release.yml`。每次推新 Tag（例如 `v1.0.0`），GitHub Actions 會自動在 macOS 與 Windows 雲端環境中編譯，並自動上傳 `.dmg` 與 `.exe` 安裝檔至 Releases 供使用者下載！
