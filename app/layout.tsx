import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SafeTrip AI Guardian - Real-Time Travel Safety Assistant',
  description:
    'AI-powered travel safety assistant with real-time route recommendations, predictive danger alerts, safety heatmaps, and emergency SOS system. Stay safe with intelligent monitoring powered by Hugging Face AI.',
  keywords: [
    'travel safety',
    'AI assistant',
    'safe routes',
    'emergency SOS',
    'real-time monitoring',
    'safety heatmap',
    'travel guardian',
  ],
  authors: [{ name: 'SafeTrip AI' }],
  openGraph: {
    title: 'SafeTrip AI Guardian',
    description: 'Your AI-powered travel safety companion',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
