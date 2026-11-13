import { describe, expect, it } from "vitest";
import { parseRepo, buildTree, detectStack, runCommands, extractApi, summarize, toMarkdown, type Docs } from "./analyze";

describe("parseRepo", () => {
  it.each([
    ["https://github.com/vercel/next.js", { owner: "vercel", repo: "next.js" }],
    ["github.com/vercel/swr/tree/main/src", { owner: "vercel", repo: "swr" }],
    ["vercel/swr", { owner: "vercel", repo: "swr" }],
    ["git@github.com:pmndrs/zustand.git", { owner: "pmndrs", repo: "zustand" }],
  ])("%s", (input, out) => expect(parseRepo(input)).toEqual(out));
  it.each(["https://gitlab.com/a/b", "../../etc/passwd", "a/b/../../c", "http://169.254.169.254/x", "owner", ""])("rejects %s", (bad) => {
    expect(parseRepo(bad)).toBeNull();
  });
});

describe("buildTree", () => {
  it("nests paths, sorts dirs first and counts files", () => {
    const t = buildTree(["src/a.ts", "src/lib/b.ts", "README.md", "package.json"]);
    expect(t.children!.map((c) => c.name)).toEqual(["src", "package.json", "README.md"]);
    expect(t.children![0].files).toBe(2);
  });
});

describe("detectStack", () => {
  it("reads frameworks from package.json and files", () => {
    const s = detectStack(["next.config.ts", "tailwind.config.js", "src/app/page.tsx"], { dependencies: { next: "16", react: "19" }, devDependencies: { vitest: "5" } });
    expect(s).toEqual(expect.arrayContaining(["Next.js", "React", "Tailwind CSS", "Vitest", "TypeScript"]));
  });
  it("detects Python and Go", () => {
    expect(detectStack(["pyproject.toml", "app/main.py"], null)).toContain("Python");
    expect(detectStack(["go.mod", "main.go"], null)).toContain("Go");
  });
});

describe("runCommands", () => {
  it("builds install + scripts for npm projects, preferring the detected package manager", () => {
    const c = runCommands(["pnpm-lock.yaml", "package.json"], { scripts: { dev: "next dev", build: "next build", test: "vitest" } }, null);
    expect(c[0]).toEqual({ label: "Instalar", cmd: "pnpm install" });
    expect(c.map((x) => x.cmd)).toContain("pnpm dev");
  });
  it("falls back to README code blocks for other ecosystems", () => {
    const c = runCommands(["Cargo.toml"], null, "## Run\n```bash\ncargo run --release\n```");
    expect(c.map((x) => x.cmd)).toContain("cargo run --release");
  });
});

describe("extractApi", () => {
  it("finds JS/TS exports, Next route handlers and Python defs", () => {
    const api = extractApi([
      { path: "src/lib/math.ts", content: "export function add(a: number, b: number): number { return a+b }\nexport const PI = 3.14;\nfunction hidden(){}\nexport default class Calc {}" },
      { path: "src/app/api/users/[id]/route.ts", content: "export async function GET(req: Request) {}\nexport async function DELETE() {}" },
      { path: "pkg/core.py", content: "def public(x, y=1):\n    pass\ndef _private():\n    pass\nclass Engine:\n    pass" },
    ]);
    const names = api.flatMap((m) => m.items.map((i) => i.name));
    expect(names).toEqual(expect.arrayContaining(["add", "PI", "Calc", "public", "Engine"]));
    expect(names).not.toContain("hidden");
    expect(names).not.toContain("_private");
    const route = api.find((m) => m.path.includes("route.ts"))!;
    expect(route.items.map((i) => i.signature)).toEqual(["GET /api/users/[id]", "DELETE /api/users/[id]"]);
  });
});

describe("summarize + markdown", () => {
  it("takes the first real paragraph of a README without markdown noise", () => {
    expect(summarize("# Title\n\n[![badge](x)](y)\n\nA **tiny** library for [state](z).\n\nMore.")).toBe("A tiny library for state.");
  });
  it("renders a markdown export", () => {
    const d: Docs = { owner: "a", repo: "b", description: "d", summary: "s", stars: 1, language: "TypeScript", license: "MIT", updated: "2026-01-01", branch: "main",
      stack: ["React"], tree: buildTree(["src/a.ts"]), commands: [{ label: "Instalar", cmd: "npm install" }], api: [], fileCount: 1, truncated: false };
    const md = toMarkdown(d);
    expect(md).toContain("# a/b");
    expect(md).toContain("npm install");
  });
});
