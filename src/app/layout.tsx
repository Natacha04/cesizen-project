import type { Metadata } from "next";
import Image from "next/image";
import { Providers } from "./providers";
import "./globals.css";
import cesizenLogo from "./public/CESIZEN.png";

export const metadata: Metadata = {
  title: {
    default: "Cesizen",
    template: "%s | Cesizen",
  },
  description: "Plateforme Cesizen de gestion et de consultation de ressources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <div className="mobile-top-logo">
            <Image src={cesizenLogo} alt="Cesizen" width={95} height={95} priority />
          </div>
          <div className="page-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
