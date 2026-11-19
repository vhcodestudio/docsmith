import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { parseRepo, toMarkdown } from "@/lib/analyze";
import { ERRORS, generateDocs } from "@/lib/github";
import { dicts, href, isLang, numLocale, tError, tLabel, type Lang } from "@/lib/i18n";

const NOT_FOUND = ERRORS.not_found;
const KNOWN: string[] = Object.values(ERRORS);
import { Copy, Download, Forge, Toc, Tree } from "@/components/docs-ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/r/[owner]/[repo]">): Promise<Metadata> {
  const { lang, owner, repo } = await params;
  const l: Lang = isLang(lang) ? lang : "pt";
  return { title: `${owner}/${repo}`, description: dicts[l].docs.metaDesc(`${owner}/${repo}`), alternates: { canonical: href(l, `/r/${owner}/${repo}`) } };
}

// Metadata reads params (runtime data); this marker lets the static shell prerender while it streams.
async function Connection() {
  await connection();
  return null;
}

export default function Page({ params }: PageProps<"/[lang]/r/[owner]/[repo]">) {
  return (
    <>
      <Suspense fallback={<Forge slug="…" />}>
        <Resolve params={params} />
      </Suspense>
      <Suspense><Connection /></Suspense>
    </>
  );
}

async function Resolve({ params }: { params: PageProps<"/[lang]/r/[owner]/[repo]">["params"] }) {
  const { lang, owner, repo } = await params;
  const r = parseRepo(`${owner}/${repo}`);
  if (!r || !isLang(lang)) notFound();
  return (
    <Suspense fallback={<Forge slug={`${r.owner}/${r.repo}`} lang={lang} />}>
      <DocsView owner={r.owner} repo={r.repo} lang={lang} />
    </Suspense>
  );
}

function H({ id, n, children }: { id: string; n: string; children: React.ReactNode }) {
  return (
    <h2 className="wide flex items-baseline gap-3 text-2xl font-black uppercase sm:text-3xl">
      <span className="font-mono text-sm font-normal text-muted">{n}</span>
      <span className="mark" id={`${id}-h`}>{children}</span>
    </h2>
  );
}

async function DocsView({ owner, repo, lang }: { owner: string; repo: string; lang: Lang }) {
  const t = dicts[lang].docs;
  let d;
  try {
    d = await generateDocs(owner, repo);
  } catch (e) {
    // Errors crossing the "use cache" boundary lose their class, so match on the message we control.
    const message = e instanceof Error ? e.message : "";
    if (message === NOT_FOUND) notFound();
    const msg = KNOWN.includes(message) ? tError(lang, message) : t.generic;
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs uppercase text-muted">{t.failEyebrow}</p>
        <h1 className="wide mt-3 text-3xl font-black uppercase">{owner}/{repo}</h1>
        <p className="mt-4 text-lg text-muted">{msg}</p>
        <Link href={href(lang)} className="mt-8 inline-block border-2 border-ink px-5 py-2 font-mono text-sm uppercase hover:bg-marker">{t.tryOther}</Link>
      </div>
    );
  }

  const toc: [string, string][] = (["visao", "stack", "rodar", "estrutura", "api"] as const).map((id, i) => [id, t.toc[i]]);
  const routes = d.api.flatMap((m) => m.items.filter((i) => i.kind === "route"));
  const facts: [string, string][] = [
    [t.facts[0], d.stars.toLocaleString(numLocale[lang])], [t.facts[1], d.language ?? "—"], [t.facts[2], d.license ?? "—"],
    [t.facts[3], d.fileCount.toLocaleString(numLocale[lang]) + (d.truncated ? "+" : "")], [t.facts[4], d.updated],
  ];

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-14">
      <aside className="min-w-0"><Toc items={toc} label={t.onPage} /></aside>
      <article className="min-w-0 space-y-16">
        <header id="visao" className="scroll-mt-6 border-b-2 border-ink pb-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">{t.eyebrow(d.branch)}</p>
              <h1 className="wide mt-2 break-all text-3xl font-black sm:text-6xl"><span className="text-muted">{d.owner}/</span>{d.repo}</h1>
            </div>
            <Download name={`${d.repo}-docs.md`} content={toMarkdown(d, t.md)} label={t.download} />
          </div>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed">{d.summary || d.description || t.noDesc}</p>
          <dl className="mt-8 grid grid-cols-2 border-l-2 border-t-2 border-ink sm:grid-cols-5">
            {facts.map(([k, v]) => (
              <div key={k} className="border-b-2 border-r-2 border-ink p-3">
                <dt className="font-mono text-[11px] uppercase text-muted">{k}</dt>
                <dd className="mt-1 font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section id="stack" className="scroll-mt-6" aria-labelledby="stack-h">
          <H id="stack" n="01">Stack</H>
          <ul className="mt-5 flex flex-wrap gap-2">
            {d.stack.map((s) => <li key={s} className="border-2 border-ink bg-sheet px-3 py-1 font-mono text-sm">{s}</li>)}
            {!d.stack.length && <li className="text-muted">{t.noStack}</li>}
          </ul>
        </section>

        <section id="rodar" className="scroll-mt-6" aria-labelledby="rodar-h">
          <H id="rodar" n="02">{t.toc[2]}</H>
          {d.commands.length ? (
            <ol className="mt-5 divide-y divide-paper/10 border-2 border-ink bg-code text-paper shadow-[6px_6px_0_var(--color-marker)]">
              {d.commands.map((c, i) => (
                <li key={c.cmd} className="flex items-center gap-4 px-4 py-3">
                  <span className="hidden w-32 shrink-0 font-mono text-[11px] uppercase text-paper/50 sm:block">{String(i + 1).padStart(2, "0")} {tLabel(lang, c.label)}</span>
                  <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm"><span className="text-marker">$</span> {c.cmd}</code>
                  <Copy text={c.cmd} label={t.copy} done={t.copied} aria={t.copyLabel(c.cmd)} />
                </li>
              ))}
            </ol>
          ) : <p className="mt-4 text-muted">{t.noCmds}</p>}
        </section>

        <section id="estrutura" className="scroll-mt-6" aria-labelledby="estrutura-h">
          <H id="estrutura" n="03">{t.toc[3]}</H>
          <p className="mt-3 text-muted">{t.treeNote}</p>
          <div className="mt-5"><Tree root={d.tree} /></div>
        </section>

        <section id="api" className="scroll-mt-6" aria-labelledby="api-h">
          <H id="api" n="04">API</H>
          <p className="mt-3 text-muted">
            {t.apiNote(d.api.reduce((a, m) => a + m.items.length, 0), d.api.length, routes.length)}
          </p>
          <div className="mt-6 space-y-6">
            {d.api.map((m) => (
              <details key={m.path} className="border-2 border-ink bg-sheet" open={d.api.length <= 6}>
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 font-mono text-sm font-bold hover:bg-marker">
                  <span className="truncate">{m.path}</span><span className="shrink-0 font-normal text-muted">{m.items.length}</span>
                </summary>
                <ul className="divide-y divide-rule border-t-2 border-ink">
                  {m.items.map((i) => (
                    <li key={i.kind + i.signature} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5">
                      <span className={`font-mono text-[11px] uppercase ${i.kind === "route" ? "bg-ink px-1.5 text-marker" : "text-muted"}`}>{i.kind}</span>
                      <code className="break-all font-mono text-sm">{i.signature}</code>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            {!d.api.length && <p className="text-muted">{t.noApi}</p>}
          </div>
        </section>
      </article>
    </div>
  );
}
