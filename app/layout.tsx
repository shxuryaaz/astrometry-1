import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { authOptions } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Astrology Intelligence App",
  description:
    "Pixel-perfect astrology intelligence experience powered by deterministic rules.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} bg-midnight text-white antialiased`}
      >
        <AuthProvider session={session}>
          <div className="min-h-screen bg-cosmic-gradient">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
