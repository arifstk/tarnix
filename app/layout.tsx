import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Tarnix",
  description: "Tarnix E-commerce Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-poppins"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
