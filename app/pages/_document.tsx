import { Html, Head, Main, NextScript } from "next/document";
import Document, { DocumentContext, DocumentInitialProps } from "next/document";

class MyDocument extends Document {
    static async getInitialProps(
        ctx: DocumentContext
    ): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }

    render() {
        return (
            <Html lang="en">
                <Head>
                    {/* PWA primary color */}
                    <meta name="theme-color" content="#000000" />
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="icon" href="/icons/icon-192x192.png" />
                    <link
                        rel="apple-touch-icon"
                        href="/icons/icon-192x192.png"
                    />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta
                        name="apple-mobile-web-app-status-bar-style"
                        content="black-translucent"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
