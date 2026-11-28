
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Violette Optic | Your Vision, Our Passion",
  description:
    "Discover elegant optical frames and sunglasses at Violette Optic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
