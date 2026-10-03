import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NWIS Fortnite Tournament",
  description: "NWIS Fortnite Zone Wars Tournament",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#090909]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}