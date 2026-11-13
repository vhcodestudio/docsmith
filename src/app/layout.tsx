import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

const description = "Cole a URL de um repositório público do GitHub e receba um site de documentação: visão geral, stack, estrutura, como rodar e API.";

export const metadata: Metadata = {
  title: { default: "docsmith — documentação a partir do código", template: "%s · docsmith" },
  description,
  metadataBase: new URL("https://docsmith-vhcode.vercel.app"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  referrer: "strict-origin-when-cross-origin",
  openGraph: { title: "docsmith", description, type: "website" },
  twitter: { card: "summary", title: "docsmith", description },
};

export const viewport: Viewport = { themeColor: "#ebe8e1" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable} antialiased`}>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-marker focus:px-3 focus:py-2">Pular para o conteúdo</a>
        <header className="border-b-2 border-ink">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="wide flex items-center gap-2 text-lg font-extrabold uppercase tracking-tight">
              <span className="grid size-7 place-items-center bg-ink font-mono text-xs text-marker" aria-hidden="true">{"{}"}</span>
              docsmith
            </Link>
            <nav aria-label="Principal" className="flex gap-5 font-mono text-xs uppercase">
              <Link href="/#exemplos" className="hover:underline">Exemplos</Link>
              <a href="https://github.com/vhcodestudio/docsmith" className="hover:underline">Código</a>
            </nav>
          </div>
        </header>
        <main id="conteudo">{children}</main>
        <footer className="border-t-2 border-ink">
          <p className="mx-auto max-w-7xl px-4 py-6 font-mono text-xs text-muted sm:px-6">docsmith · um projeto vhcodestudio · lê só repositórios públicos, direto da API do GitHub, sem guardar nada.</p>
        </footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebApplication", name: "docsmith", url: "https://docsmith-vhcode.vercel.app",
          applicationCategory: "DeveloperApplication", description, author: { "@type": "Organization", name: "vhcodestudio" },
        }) }} />
      </body>
    </html>
  );
}
