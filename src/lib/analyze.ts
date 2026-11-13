export type TreeNode = { name: string; path: string; children?: TreeNode[]; files: number };
export type Command = { label: string; cmd: string };
export type ApiItem = { name: string; kind: string; signature: string };
export type ApiModule = { path: string; items: ApiItem[] };
export type Pkg = { scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string> } | null;
export type Docs = {
  owner: string; repo: string; description: string; summary: string; stars: number; language: string | null; license: string | null;
  updated: string; branch: string; stack: string[]; tree: TreeNode; commands: Command[]; api: ApiModule[]; fileCount: number; truncated: boolean;
};

const NAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO = /^[A-Za-z0-9._-]{1,100}$/;

/** Accepts URLs, SSH remotes or owner/repo. Strict charset so the values are safe to put in API paths. */
export function parseRepo(input: string) {
  const s = input.trim().replace(/\.git$/, "");
  const m = s.match(/^(?:https?:\/\/)?(?:www\.)?github\.com[/:]([^/]+)\/([^/?#]+)/i) ?? s.match(/^git@github\.com:([^/]+)\/([^/?#]+)$/i) ?? s.match(/^([^/:.\s]+)\/([^/\s]+)$/);
  if (!m) return null;
  const [, owner, repo] = m;
  if (!NAME.test(owner) || !REPO.test(repo) || repo === "." || repo === "..") return null;
  return { owner, repo };
}

export function buildTree(paths: string[]): TreeNode {
  const root: TreeNode = { name: "", path: "", children: [], files: 0 };
  for (const p of paths) {
    const parts = p.split("/");
    let node = root;
    parts.forEach((part, i) => {
      node.files += 1;
      if (i === parts.length - 1) { node.children!.push({ name: part, path: p, files: 1 }); return; }
      let next = node.children!.find((c) => c.name === part && c.children);
      if (!next) { next = { name: part, path: parts.slice(0, i + 1).join("/"), children: [], files: 0 }; node.children!.push(next); }
      node = next;
    });
  }
  const sort = (n: TreeNode) => {
    n.children?.sort((a, b) => Number(!!b.children) - Number(!!a.children) || a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
    n.children?.forEach(sort);
  };
  sort(root);
  return root;
}

export function detectStack(paths: string[], pkg: Pkg) {
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  const has = (d: string) => d in deps;
  const file = (re: RegExp) => paths.some((p) => re.test(p));
  const out = new Set<string>();
  const rules: [string, boolean][] = [
    ["Next.js", has("next") || file(/(^|\/)next\.config\./)], ["React", has("react")], ["Vue", has("vue")], ["Svelte", has("svelte")],
    ["Astro", has("astro")], ["Vite", has("vite") || file(/(^|\/)vite\.config\./)], ["Express", has("express")], ["Fastify", has("fastify")],
    ["NestJS", has("@nestjs/core")], ["Tailwind CSS", has("tailwindcss") || file(/tailwind\.config\./)], ["Prisma", has("prisma") || file(/schema\.prisma$/)],
    ["Supabase", has("@supabase/supabase-js")], ["Vitest", has("vitest")], ["Jest", has("jest")], ["Playwright", has("@playwright/test")],
    ["TypeScript", has("typescript") || file(/\.tsx?$/)], ["Node.js", !!pkg], ["Python", file(/(^|\/)(pyproject\.toml|requirements\.txt|setup\.py)$|\.py$/)],
    ["Django", file(/(^|\/)manage\.py$/)], ["Go", file(/(^|\/)go\.mod$/)], ["Rust", file(/(^|\/)Cargo\.toml$/)], ["Docker", file(/(^|\/)(Dockerfile|docker-compose\.ya?ml)$/)],
  ];
  for (const [name, ok] of rules) if (ok) out.add(name);
  return [...out];
}

export function runCommands(paths: string[], pkg: Pkg, readme: string | null): Command[] {
  const top = new Set(paths.filter((p) => !p.includes("/")));
  if (pkg) {
    const pm = top.has("pnpm-lock.yaml") ? "pnpm" : top.has("yarn.lock") ? "yarn" : top.has("bun.lockb") || top.has("bun.lock") ? "bun" : "npm";
    const run = (s: string) => (pm === "npm" && !["start", "test"].includes(s) ? `npm run ${s}` : `${pm} ${s}`);
    const labels: Record<string, string> = { dev: "Desenvolvimento", start: "Iniciar", build: "Build", test: "Testes", lint: "Lint", preview: "Preview" };
    const scripts = Object.keys(pkg.scripts ?? {}).filter((s) => s in labels);
    return [{ label: "Instalar", cmd: `${pm} install` }, ...scripts.map((s) => ({ label: labels[s], cmd: run(s) }))];
  }
  const out: Command[] = [];
  if (top.has("pyproject.toml") || top.has("requirements.txt")) out.push({ label: "Instalar", cmd: top.has("requirements.txt") ? "pip install -r requirements.txt" : "pip install -e ." });
  if (top.has("go.mod")) out.push({ label: "Executar", cmd: "go run ." }, { label: "Testes", cmd: "go test ./..." });
  if (top.has("Cargo.toml")) out.push({ label: "Build", cmd: "cargo build" });
  for (const block of readme?.matchAll(/```(?:bash|sh|shell|console)?\n([\s\S]*?)```/g) ?? []) {
    for (const line of block[1].split("\n").map((l) => l.replace(/^\$\s*/, "").trim())) {
      if (line && line.length < 120 && /^(npm|pnpm|yarn|bun|pip|python|uv|poetry|cargo|go|make|docker)\b/.test(line) && !out.some((c) => c.cmd === line)) out.push({ label: "Do README", cmd: line });
    }
    if (out.length > 8) break;
  }
  return out;
}

const routePath = (p: string) => "/" + p.replace(/^(src\/)?app\//, "").replace(/\/route\.(t|j)sx?$/, "").replace(/\([^)]+\)\//g, "");

export function extractApi(files: { path: string; content: string }[]): ApiModule[] {
  const mods: ApiModule[] = [];
  for (const f of files) {
    const items: ApiItem[] = [];
    const src = f.content.slice(0, 80_000);
    if (/\.(t|j)sx?$|\.m[jt]s$/.test(f.path)) {
      const isRoute = /(^|\/)app\/.*route\.(t|j)sx?$/.test(f.path);
      for (const m of src.matchAll(/^export\s+(default\s+)?(async\s+)?(function\*?|const|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)([^\n{=]*)/gm)) {
        const [, def, , kind, name, rest] = m;
        if (isRoute && /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(name)) { items.push({ name, kind: "route", signature: `${name} ${routePath(f.path)}` }); continue; }
        const sig = kind.startsWith("function") ? `${name}${(rest.match(/\(.*\)\s*(:\s*[^{]+)?/)?.[0] ?? "()").trim()}` : `${kind} ${name}`;
        items.push({ name, kind: def ? `default ${kind}` : kind.replace("*", ""), signature: sig.replace(/\s+/g, " ").slice(0, 140) });
      }
      for (const m of src.matchAll(/\b(?:app|router)\.(get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/g)) items.push({ name: m[2], kind: "route", signature: `${m[1].toUpperCase()} ${m[2]}` });
    } else if (f.path.endsWith(".py")) {
      for (const m of src.matchAll(/^(async\s+)?(def|class)\s+([A-Za-z]\w*)(\([^)]*\))?/gm)) {
        items.push({ name: m[3], kind: m[2] === "def" ? "function" : "class", signature: `${m[3]}${m[4] ?? ""}`.slice(0, 140) });
      }
      for (const m of src.matchAll(/@(?:app|router)\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g)) items.push({ name: m[2], kind: "route", signature: `${m[1].toUpperCase()} ${m[2]}` });
    } else if (f.path.endsWith(".go")) {
      for (const m of src.matchAll(/^func\s+(?:\([^)]*\)\s*)?([A-Z]\w*)(\([^)]*\))/gm)) items.push({ name: m[1], kind: "function", signature: `${m[1]}${m[2]}` });
    }
    if (items.length) mods.push({ path: f.path, items: items.slice(0, 40) });
  }
  return mods;
}

export function summarize(readme: string | null) {
  if (!readme) return "";
  const paras = readme.replace(/\r/g, "").replace(/<[^>]+>/g, "").split(/\n\s*\n/);
  for (const p of paras) {
    const t = p.trim();
    if (!t || /^(#|!\[|\[!\[|```|>|\||-{3,}|=+)/.test(t)) continue;
    const clean = t.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();
    if (clean.length > 20) return clean.slice(0, 400);
  }
  return "";
}

function treeLines(n: TreeNode, depth = 0, max = 2): string[] {
  return (n.children ?? []).flatMap((c) => [`${"  ".repeat(depth)}- ${c.name}${c.children ? "/" : ""}`, ...(c.children && depth + 1 < max ? treeLines(c, depth + 1, max) : [])]);
}

export function toMarkdown(d: Docs) {
  return [
    `# ${d.owner}/${d.repo}`, "", d.summary || d.description, "",
    `**Stack:** ${d.stack.join(", ") || "—"}  `, `**Licença:** ${d.license ?? "—"} · **Estrelas:** ${d.stars}`, "",
    "## Como rodar", "", "```bash", ...d.commands.map((c) => c.cmd), "```", "",
    "## Estrutura", "", ...treeLines(d.tree), "",
    "## API", "", ...d.api.flatMap((m) => [`### \`${m.path}\``, ...m.items.map((i) => `- \`${i.signature}\` _(${i.kind})_`), ""]),
    `---`, `Gerado por docsmith a partir de https://github.com/${d.owner}/${d.repo}`,
  ].join("\n");
}
