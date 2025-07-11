import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Russuian Rummy",
    description: "Created with Next",
    generator: "Rummy",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
