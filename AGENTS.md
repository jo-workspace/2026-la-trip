<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 後端與試算表資料庫架構規範 (Google Sheets Backend Guidance)

- 當未來專案有需要擴充、修改後端邏輯，或複製建立新旅遊專案時：
  - **優先採用方案**：使用 **Next.js API Routes (`app/api/...`) + 官方 `@googleapis/sheets` 庫**，搭配 Google Service Account 與環境變數 (`GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`)。
  - **避免維護**：避免新增或重新部署 Google Apps Script (`.gs`) Web App 腳本，以達成零 `.gs` 部署、完全由 Next.js + Vercel 環境變數管理之架構。
