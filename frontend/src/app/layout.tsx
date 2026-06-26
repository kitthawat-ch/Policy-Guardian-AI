import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Policy Guardian AI",
  description: "AI Agent for Enterprise Policy Intelligence / ระบบผู้ช่วยอัจฉริยะสำหรับค้นหา ตีความ และตรวจสอบความสอดคล้องตามระเบียบองค์กร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex`}>
        {/* Glassmorphism Background Elements */}
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>

        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-8 relative z-10">
          <header className="mb-8 flex justify-between items-center">
            <div className="text-sm text-slate-500">Workspace / Current Page</div>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
