import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import HeaderWrapper from "@/components/HeaderWrapper";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";

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
      <body className="min-h-full flex flex-col">
        <Providers>
          <HeaderWrapper />
          <main className='w-[96%] md:w-[90%] mx-auto'>
            {children}
            <Toaster
              position="top-right"
              reverseOrder={false}
            />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
