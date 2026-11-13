import "server-only";
import { cacheLife } from "next/cache";
import { buildTree, detectStack, extractApi, runCommands, summarize, type Docs, type Pkg } from "./analyze";

export const ERRORS = {
  not_found: "Repositório não encontrado ou privado.",
  rate_limited: "O GitHub limitou as consultas por agora. Tente de novo em alguns minutos.",
  too_large: "Repositório grande demais para esta demonstração (mais de 2 GB).",
  upstream: "O GitHub não respondeu como esperado.",
} as const;

export class DocsError extends Error {
  constructor(public code: keyof typeof ERRORS, public status: number) { super(ERRORS[code]); }
}

const REVALIDATE = 3600;
const headers = () => ({
  Accept: "application/vnd.github+json",
  "User-Agent": "docsmith-portfolio",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

async function gh<T>(path: string): Promise<T> {
  const r = await fetch(`https://api.github.com${path}`, { headers: headers(), next: { revalidate: REVALIDATE } });
  if (r.status === 404) throw new DocsError("not_found", 404);
  if (r.status === 403 || r.status === 429) throw new DocsError("rate_limited", 429);
  if (!r.ok) throw new DocsError("upstream", 502);
  return r.json() as Promise<T>;
}

async function raw(owner: string, repo: string, branch: string, path: string) {
  const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path.split("/").map(encodeURIComponent).join("/")}`, { next: { revalidate: REVALIDATE } });
  if (!r.ok) return null;
  const len = Number(r.headers.get("content-length") ?? 0);
  if (len > 200_000) return null;
  return (await r.text()).slice(0, 200_000);
}

const IGNORE = /(^|\/)(node_modules|dist|build|\.next|vendor|coverage|\.git|__pycache__|\.venv|target)\//;
const SOURCE = /\.(ts|tsx|js|mjs|jsx|py|go)$/;
const NOISE = /(\.test\.|\.spec\.|\.d\.ts$|\.config\.|__tests__|\/tests?\/|\/examples?\/|\/fixtures?\/|\.stories\.)/;

/** Rank files most likely to define the public API. */
function score(p: string) {
  let s = 0;
  if (/(^|\/)(index|main|mod|lib|__init__)\.(ts|tsx|js|mjs|py|go)$/.test(p)) s += 6;
  if (/(^|\/)app\/.*route\.(t|j)sx?$/.test(p)) s += 5;
  if (/^(src|lib|packages\/[^/]+\/src)\//.test(p)) s += 3;
  if (/(api|server|routes?|handlers?)\//.test(p)) s += 2;
  s -= p.split("/").length * 0.5;
  return s;
}

type RepoMeta = { description: string | null; stargazers_count: number; language: string | null; license: { spdx_id: string } | null; pushed_at: string; default_branch: string; size: number };
type TreeResp = { tree: { path: string; type: string; size?: number }[]; truncated: boolean };

export async function generateDocs(owner: string, repo: string): Promise<Docs> {
  "use cache";
  cacheLife("hours");
  const meta = await gh<RepoMeta>(`/repos/${owner}/${repo}`);
  if (meta.size > 2_000_000) throw new DocsError("too_large", 413);
  const branch = meta.default_branch;
  const [treeResp, readme, pkgText] = await Promise.all([
    gh<TreeResp>(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`),
    raw(owner, repo, branch, "README.md"),
    raw(owner, repo, branch, "package.json"),
  ]);
  const paths = treeResp.tree.filter((t) => t.type === "blob" && !IGNORE.test(t.path)).map((t) => t.path).slice(0, 5000);
  let pkg: Pkg = null;
  try { pkg = pkgText ? (JSON.parse(pkgText) as Pkg) : null; } catch { pkg = null; }

  const candidates = treeResp.tree
    .filter((t) => t.type === "blob" && SOURCE.test(t.path) && !IGNORE.test(t.path) && !NOISE.test(t.path) && (t.size ?? 0) < 60_000)
    .map((t) => t.path).sort((a, b) => score(b) - score(a)).slice(0, 24);
  const files = (await Promise.all(candidates.map(async (path) => ({ path, content: (await raw(owner, repo, branch, path)) ?? "" })))).filter((f) => f.content);

  return {
    owner, repo, branch,
    description: meta.description ?? "",
    summary: summarize(readme),
    stars: meta.stargazers_count,
    language: meta.language,
    license: meta.license?.spdx_id && meta.license.spdx_id !== "NOASSERTION" ? meta.license.spdx_id : null,
    updated: meta.pushed_at.slice(0, 10),
    stack: detectStack(paths, pkg),
    tree: buildTree(paths),
    commands: runCommands(paths, pkg, readme),
    api: extractApi(files),
    fileCount: paths.length,
    truncated: treeResp.truncated || paths.length >= 5000,
  };
}
