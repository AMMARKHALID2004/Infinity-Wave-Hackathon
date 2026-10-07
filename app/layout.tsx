import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaWorks AI Project Manager",
  description: "Infinity Hack '26 CRM",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
