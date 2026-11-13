"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseRepo } from "@/lib/analyze";

export function RepoForm({ big = false }: { big?: boolean }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = parseRepo(value);
    if (!r) return setError("Não reconheci esse endereço. Use algo como github.com/dono/repo ou dono/repo.");
    setError("");
    router.push(`/r/${r.owner}/${r.repo}`);
  }

  return (
    <form onSubmit={submit} className="w-full" noValidate>
      <label htmlFor="repo" className="font-mono text-xs uppercase tracking-wider">URL do repositório</label>
      <div className={`mt-2 flex border-2 border-ink bg-sheet shadow-[6px_6px_0_var(--color-ink)] focus-within:shadow-[6px_6px_0_var(--color-marker),6px_6px_0_2px_var(--color-ink)]`}>
        <span className="hidden items-center border-r-2 border-ink px-3 font-mono text-sm text-muted sm:flex" aria-hidden="true">github.com/</span>
        <input id="repo" value={value} onChange={(e) => setValue(e.target.value)} placeholder="pmndrs/zustand" autoComplete="off" spellCheck={false}
          aria-invalid={!!error} aria-describedby={error ? "repo-err" : undefined}
          className={`min-w-0 flex-1 bg-transparent px-3 font-mono outline-none ${big ? "py-4 text-lg" : "py-3"}`} />
        <button className="wide shrink-0 bg-ink px-5 font-bold uppercase text-paper hover:bg-marker hover:text-ink">Forjar</button>
      </div>
      {error && <p id="repo-err" role="alert" className="mt-3 font-mono text-sm">⚠ {error}</p>}
    </form>
  );
}
