# jo-travel-hub

這是一個基於 [Next.js](https://nextjs.org) 構建的多旅程行程規劃與隨身助理 Portal (包含 LA 2026、沖繩 2026 等旅程)。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 密碼保護 (Passcode Protection)

整站可設定一組共用通行碼，未輸入正確密碼無法瀏覽任何頁面（透過 `src/proxy.ts` 攔截）。

- 本地開發：於 `.env.local` 設定 `APP_PASSWORD=你的通行碼`。未設定時本地端不會啟用密碼保護。
- 正式環境 (Vercel)：於 Project Settings → Environment Variables 新增 `APP_PASSWORD`，之後重新部署。
- 忘記密碼或想換碼：直接更新 `APP_PASSWORD` 的值即可，舊的登入 cookie 會因簽章不符自動失效。
- 登出：在任一旅程頁「旅程設定」的左下角有「登出」按鈕。

## 分享特定頁面 (Deep Link)

切換分頁時網址列會自動帶上 `?tab=`（例如 `/trip/la-2026?tab=shopping`），也可以按 Header 上的分享圖示一鍵複製目前頁面連結給旅伴。旅伴打開連結時，若尚未登入仍會先看到通行碼頁面，登入後會直接導向該分頁。

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
