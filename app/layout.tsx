import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TopHoldings | Portfolio Intelligence',
  description: 'Real-time holdings analysis and AI-powered market intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
