import Link from "next/link";
import { RepoForm } from "@/components/repo-form";

const EXAMPLES = [
  ["pmndrs/zustand", "Estado global minúsculo para React"],
  ["sindresorhus/ky", "Cliente HTTP em cima do fetch"],
  ["tiangolo/typer", "CLIs em Python a partir de type hints"],
  ["vercel/swr", "Hooks de data fetching"],
  ["charmbracelet/glow", "Leitor de Markdown no terminal, em Go"],
  ["vhcodestudio/echo", "Um dos projetos deste portfólio"],
];

export default function Home() {
  return (
    <>
      <section className="ruled border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider">Manual de instruções · gerado do código</p>
            <h1 className="wide mt-4 text-[clamp(2.6rem,7vw,5.8rem)] font-black uppercase leading-[0.9] tracking-tight">
              Todo repo<br />merece um<br /><span className="swipe px-2">manual.</span>
            </h1>
          </div>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-muted">
              Cole o endereço de um repositório público. O docsmith lê a árvore de arquivos, o README, o package.json e os arquivos
              principais, e monta uma documentação com visão geral, stack, estrutura, comandos e API.
            </p>
            <RepoForm big />
          </div>
        </div>
      </section>

      <section id="exemplos" aria-labelledby="ex-h" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-16 sm:px-6">
        <h2 id="ex-h" className="wide text-3xl font-black uppercase">Experimente com</h2>
        <ul className="mt-6 grid border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map(([slug, desc], i) => (
            <li key={slug} className="border-b-2 border-r-2 border-ink">
              <Link href={`/r/${slug}`} className="group flex h-full flex-col justify-between gap-6 p-5 transition-colors hover:bg-marker">
                <span className="font-mono text-xs text-muted group-hover:text-ink">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-mono text-lg font-bold">{slug}</span>
                  <span className="mt-1 block text-muted group-hover:text-ink">{desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="como-h" className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
          <h2 id="como-h" className="wide text-3xl font-black uppercase">Como<br />funciona</h2>
          {[
            ["Lê", "Árvore do repositório, README e manifesto do projeto pela API pública do GitHub."],
            ["Escolhe", "Ordena os arquivos que mais provavelmente definem a API: entradas, rotas e pastas de código."],
            ["Escreve", "Extrai exports, rotas e funções públicas e organiza tudo numa página com índice."],
          ].map(([t, d], i) => (
            <div key={t}><p className="font-mono text-xs text-marker">0{i + 1}</p><h3 className="wide mt-2 text-xl font-bold uppercase">{t}</h3><p className="mt-2 text-sm leading-relaxed opacity-75">{d}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
