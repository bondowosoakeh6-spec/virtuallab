import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VirtualLab Analisis Kimia",
  description: "Aplikasi pembelajaran praktikum analisis kimia secara digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
