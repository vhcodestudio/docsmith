"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TreeNode } from "@/lib/analyze";

const STEPS = ["Consultando o repositório", "Lendo a árvore de arquivos", "Abrindo README e manifesto", "Escolhendo os arquivos principais", "Extraindo exports e rotas", "Montando a página"];

/** Loading state: honest list of what the server is doing, revealed progressively. */
export function Forge({ slug }: { slug: string }) {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = setInterval(() => setN((x) => Math.min(x + 1, STEPS.length - 1)), reduce ? 200 : 700);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6" role="status" aria-live="polite">
      <p className="font-mono text-xs uppercase tracking-wider text-muted">Forjando</p>
      <h1 className="wide mt-2 break-all font-mono text-3xl font-bold sm:text-4xl">{slug}</h1>
      <ol className="mt-10 border-2 border-ink bg-code p-5 font-mono text-sm text-paper shadow-[6px_6px_0_var(--color-marker)]">
        {STEPS.slice(0, n + 1).map((s, i) => (
          <motion.li key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 py-0.5">
            <span className={i < n ? "text-marker" : "animate-pulse text-paper"}>{i < n ? "✓" : "›"}</span>
            <span className={i < n ? "opacity-60" : ""}>{s}{i === n ? "…" : ""}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function Toc({ items }: { items: [string, string][] }) {
  const [active, setActive] = useState(items[0][0]);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setActive(e.target.id);
          e.target.querySelector(".mark")?.classList.add("on");
        }
      }
    }, { rootMargin: "-20% 0px -65% 0px" });
    items.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="Nesta página" className="lg:sticky lg:top-6">
      <p className="font-mono text-xs uppercase tracking-wider text-muted">Nesta página</p>
      <ol className="mt-3 flex gap-1 overflow-x-auto border-l-0 lg:block lg:border-l-2 lg:border-ink">
        {items.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? "location" : undefined}
              className={`block whitespace-nowrap px-3 py-1.5 text-sm transition-colors ${active === id ? "bg-marker font-semibold" : "hover:bg-sheet"}`}>{label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Copy({ text, label = "copiar" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); } catch { /* blocked */ } }}
      className="shrink-0 border border-paper/30 px-2 py-1 font-mono text-[11px] uppercase hover:bg-marker hover:text-ink" aria-label={`Copiar: ${text}`}>
      {ok ? "copiado" : label}
    </button>
  );
}

export function Download({ name, content }: { name: string; content: string }) {
  return (
    <button onClick={() => {
      const url = URL.createObjectURL(new Blob([content], { type: "text/markdown" }));
      Object.assign(document.createElement("a"), { href: url, download: name }).click();
      URL.revokeObjectURL(url);
    }} className="no-print border-2 border-ink bg-sheet px-4 py-2 font-mono text-xs font-bold uppercase shadow-[3px_3px_0_var(--color-ink)] hover:bg-marker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
      Baixar .md
    </button>
  );
}

const EXT_COLOR: Record<string, string> = { ts: "#3178c6", tsx: "#3178c6", js: "#e8c400", jsx: "#e8c400", mjs: "#e8c400", py: "#3a75a8", go: "#00add8", rs: "#c55a11", md: "#777", json: "#999", css: "#7b4ccf" };

function Node({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  if (!node.children) {
    const ext = node.name.split(".").pop() ?? "";
    return (
      <li className="flex items-center gap-2 py-0.5 font-mono text-[13px]" style={{ paddingLeft: depth * 16 }}>
        <span className="size-2 shrink-0 rounded-full" style={{ background: EXT_COLOR[ext] ?? "#bbb" }} aria-hidden="true" />
        <span className="truncate">{node.name}</span>
      </li>
    );
  }
  return (
    <li>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-2 py-0.5 text-left font-mono text-[13px] font-bold hover:bg-marker/60" style={{ paddingLeft: depth * 16 }}>
        <span className="w-3 text-muted" aria-hidden="true">{open ? "▾" : "▸"}</span>
        {node.name}/
        <span className="ml-auto pr-2 font-normal text-muted">{node.files}</span>
      </button>
      {open && <ul>{node.children.slice(0, 200).map((c) => <Node key={c.path} node={c} depth={depth + 1} />)}</ul>}
    </li>
  );
}

export function Tree({ root }: { root: TreeNode }) {
  return <ul className="max-h-[32rem] overflow-auto border-2 border-ink bg-sheet p-3">{root.children!.slice(0, 300).map((c) => <Node key={c.path} node={c} depth={0} />)}</ul>;
}
