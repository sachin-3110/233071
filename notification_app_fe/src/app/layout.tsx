import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Notification Dashboard",
  description: "Campus Hiring Evaluation Submission",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.variable}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
