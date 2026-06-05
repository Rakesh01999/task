import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Smart Project & Task Collaboration System",
  description: "A premium full-stack dashboard for teams to manage projects, assign tasks, and track team productivity in real time.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
