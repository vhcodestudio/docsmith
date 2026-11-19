import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { dicts, href, htmlLang, isLang, LANGS, type Lang } from "@/lib/i18n";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { LangLink } from "@/components/lang-link";
import "../globals.css";

const sans = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const { title, description } = dicts[lang].meta;
  return {
  title: { default: title, template: "%s · docsmith" },
  description,
  metadataBase: new URL("https://docsmith-vhcode.vercel.app"),
  alternates: { canonical: href(lang), languages: { ...Object.fromEntries(LANGS.map((l) => [htmlLang[l], href(l)])), "x-default": "/" } },
  robots: { index: true, follow: true },
  referrer: "strict-origin-when-cross-origin",
  openGraph: { title: "docsmith", description, type: "website" },
  twitter: { card: "summary", title: "docsmith", description },
  };
}

export const viewport: Viewport = { themeColor: "#ebe8e1" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = dicts[lang];
  const description = d.meta.description;
  return (
    <html lang={htmlLang[lang]} className={`${sans.variable} ${mono.variable} antialiased`}>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-marker focus:px-3 focus:py-2">{d.skip}</a>
        <header className="border-b-2 border-ink">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href={href(lang)} className="wide flex items-center gap-2 text-lg font-extrabold uppercase tracking-tight">
              <span className="grid size-7 place-items-center bg-ink font-mono text-xs text-marker" aria-hidden="true">{"{}"}</span>
              docsmith
            </Link>
            <nav aria-label={d.nav.label} className="flex items-center gap-4 font-mono text-xs uppercase sm:gap-5">
              <Link href={`${href(lang)}#exemplos`} className="hover:underline">{d.nav.examples}</Link>
              <a href="https://github.com/vhcodestudio/docsmith" className="hidden hover:underline sm:inline">{d.nav.code}</a>
              <Suspense fallback={<span className="min-w-24" />}><LangSwitch lang={lang} label={d.nav.language} /></Suspense>
            </nav>
          </div>
        </header>
        <main id="conteudo">{children}</main>
        <footer className="border-t-2 border-ink">
          <p className="mx-auto max-w-7xl px-4 py-6 font-mono text-xs text-muted sm:px-6">{d.footer}</p>
        </footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebApplication", name: "docsmith", url: "https://docsmith-vhcode.vercel.app",
          applicationCategory: "DeveloperApplication", description, author: { "@type": "Organization", name: "vhcodestudio" },
        }) }} />
      </body>
    </html>
  );
}

function LangSwitch({ lang, label }: { lang: Lang; label: string }) {
  return (
    <ul aria-label={label} className="flex items-center">
      {LANGS.map((l) => (
        <li key={l}>
          <LangLink to={l} current={lang} className={`inline-grid min-h-8 min-w-8 place-items-center px-1 ${l === lang ? "bg-marker font-bold" : "hover:underline"}`} />
        </li>
      ))}
    </ul>
  );
}
