import type { ReactNode } from "react";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <>
      <PublicHeader />
      <main
        style={{
          padding: "4rem 1.5rem 5rem",
        }}
      >
        <section
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            display: "grid",
            gap: "1.5rem",
          }}
        >
          <div style={{ display: "grid", gap: "0.75rem", textAlign: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.05,
                color: "#1d2a35",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                color: "#44515d",
                lineHeight: 1.6,
              }}
            >
              {description}
            </p>
          </div>
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.76)",
              boxShadow: "0 24px 60px rgba(60, 47, 22, 0.12)",
            }}
          >
            {children}
          </div>
        </section>
      </main>
    </>
  );
}
