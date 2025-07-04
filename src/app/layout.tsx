import type { Metadata } from "next";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "himalayanchildren",
  description: "Shree Mangal Dvip (SMD) School Grading System for Himalayan Children in Kathmandu.",
  icons: {
    icon: "/SMD_Logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased" style={{ fontFamily: 'Nunito Sans, Arial, Helvetica, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
