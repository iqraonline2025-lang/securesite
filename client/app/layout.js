import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SecureMe | Premium Cyber Security",
  description: "Advanced protection for your digital life",
};

export default function RootLayout({ children }) {
  return (
    // Added suppressHydrationWarning here
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning={true} // And here
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#050505] text-white`}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <main className="relative">
            {children}
          </main>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}