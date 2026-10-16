import type { ReactNode } from "react";

export const metadata = {
  title: "Text to speech with AudioPod",
  description: "A Next.js route handler that turns text into speech with AudioPod.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>{children}</body>
    </html>
  );
}
