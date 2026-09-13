import type { Metadata } from "next";
import { Anton, Raleway } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Karma",
  description:
    "Le petit coup de pouce discret pour les hommes qui veulent entretenir la magie dans leur couple.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${anton.variable} ${raleway.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
