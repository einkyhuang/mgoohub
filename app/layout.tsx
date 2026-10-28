import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MGOO 全域客服工作台",
  description: "统一监控 SaleSmartly 渠道账号、消息、客户开发进度与自动回复规则。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
