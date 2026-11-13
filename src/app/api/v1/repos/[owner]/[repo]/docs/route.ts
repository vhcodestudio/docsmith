import { parseRepo } from "@/lib/analyze";
import { ERRORS, generateDocs } from "@/lib/github";

const STATUS: Record<keyof typeof ERRORS, number> = { not_found: 404, rate_limited: 429, too_large: 413, upstream: 502 };

// Best-effort per-instance limiter: 20 requests / minute / IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 20;
}

const err = (status: number, code: string, message: string, extra?: HeadersInit) =>
  Response.json({ error: { code, message } }, { status, headers: extra });

export async function GET(req: Request, ctx: RouteContext<"/api/v1/repos/[owner]/[repo]/docs">) {
  const { owner, repo } = await ctx.params;
  const parsed = parseRepo(`${owner}/${repo}`);
  if (!parsed) return err(400, "invalid_repo", "Use o formato dono/repositório de um repositório público do GitHub.");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  if (limited(ip)) return err(429, "rate_limit_exceeded", "Muitas consultas seguidas. Espere um minuto.", { "Retry-After": "60" });
  try {
    const data = await generateDocs(parsed.owner, parsed.repo);
    return Response.json({ data }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (e) {
    // errors from the cached function lose their class; identify them by message
    const message = e instanceof Error ? e.message : "";
    const code = (Object.keys(ERRORS) as (keyof typeof ERRORS)[]).find((k) => ERRORS[k] === message);
    if (code) return err(STATUS[code], code, message, code === "rate_limited" ? { "Retry-After": "300" } : undefined);
    return err(500, "internal_error", "Algo deu errado ao gerar a documentação.");
  }
}
