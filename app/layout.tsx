/**
 * app/layout.tsx
 * Root layout — estrutura HTML base
 */

export const metadata = {
  title: "Dr. Família IA",
  description: "Saúde Longitudinal · Utente · Madeira",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
