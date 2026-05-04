import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Image from "next/image";
import { Providers } from "./providers";
import { PwaInstallButton } from "@/shared/ui/layout/PwaInstallButton";
import { PushNotificationManager } from "./PushNotificationManager";
import "./globals.css";
import cesizenLogo from "./public/CESIZEN.png";

export const metadata: Metadata = {
  title: {
    default: "Cesizen",
    template: "%s | Cesizen",
  },
  description: "Plateforme Cesizen de gestion et de consultation de ressources.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
          <footer style={{ textAlign: "center", padding: "24px 16px 40px", color: "#8a9aa8", fontSize: "0.85rem" }}>
            <PwaInstallButton />
            <PushNotificationManager />
            <div style={{ marginTop: 8 }}>© 2025 Cesizen — Ministère de la santé et de la prévention</div>
          </footer>
        </Providers>
        <Script id="sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js');
          }
        `}</Script>
      </body>
    </html>
  );
}
