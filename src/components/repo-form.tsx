"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseRepo } from "@/lib/analyze";
import { dicts, href, type Lang } from "@/lib/i18n";

const HINTS = ["pmndrs/zustand", "vercel/swr", "tiangolo/typer", "sindresorhus/ky"];

export function RepoForm({ big = false, lang = "pt" }: { big?: boolean; lang?: Lang }) {
  const t = dicts[lang].form;
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const hint = useTypedHint(HINTS);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = parseRepo(value);
    if (!r) return setError(t.bad);
    setError("");
    router.push(href(lang, `/r/${r.owner}/${r.repo}`));
  }

  return (
    <form onSubmit={submit} className="w-full" noValidate>
      <label htmlFor="repo" className="font-mono text-xs uppercase tracking-wider">{t.label}</label>
      <div className={`mt-2 flex border-2 border-ink bg-sheet shadow-[6px_6px_0_var(--color-ink)] focus-within:shadow-[6px_6px_0_var(--color-marker),6px_6px_0_2px_var(--color-ink)]`}>
        <span className="hidden items-center border-r-2 border-ink px-3 font-mono text-sm text-muted sm:flex" aria-hidden="true">github.com/</span>
        <input id="repo" value={value} onChange={(e) => setValue(e.target.value)} placeholder={hint} autoComplete="off" spellCheck={false}
          aria-invalid={!!error} aria-describedby={error ? "repo-err" : undefined}
          className={`min-w-0 flex-1 bg-transparent px-3 font-mono outline-none ${big ? "py-4 text-lg" : "py-3"}`} />
        <button className="wide shrink-0 bg-ink px-5 font-bold uppercase text-paper hover:bg-marker hover:text-ink">{t.go}</button>
      </div>
      {error && <p id="repo-err" role="alert" className="mt-3 font-mono text-sm">⚠ {error}</p>}
    </form>
  );
}

/** Cycles example repos in the placeholder, typed and erased one character at a time. */
function useTypedHint(words: string[]) {
  const [text, setText] = useState(words[0]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0, i = words[0].length, dir = -1;
    const t = setInterval(() => {
      i += dir;
      if (i < 0) { w = (w + 1) % words.length; i = 0; dir = 1; }
      else if (i > words[w].length) { dir = -1; i = words[w].length + 14; }
      setText(words[w].slice(0, Math.max(0, Math.min(i, words[w].length))) || " ");
    }, 85);
    return () => clearInterval(t);
  }, [words]);
  return text;
}
