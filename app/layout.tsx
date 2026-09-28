import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Étiquettes de bibliothèque",
  description: "Impression simple de codes-barres pour les livres.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
