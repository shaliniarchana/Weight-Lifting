import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Anton } from "next/font/google";

const anton = Anton({ 
  weight: "400", 
  subsets: ["latin"] 
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Weight Lifting",
  description: "Developed by Shalini Archana",
  icons: [
    { rel: "icon", url: "/faviconnew.ico" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/faviconnew.png" }
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" webcrx="">
      <body
        id="__next"
        className={`${geistSans.variable} ${geistMono.variable} ${anton.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
