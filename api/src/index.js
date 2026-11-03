// Histórico de uso do Playbook de Vendas para Barbeiros (GitHub Pages).
// A página é estática; este Worker é o único lugar onde o uso fica salvo.
//   GET  /uso      -> todos os registros (painel de gestão, ?gestao na página)
//   GET  /uso/:id  -> registro de uma pessoa
//   PUT  /uso/:id  -> grava o registro inteiro {nome, dados}

const ORIGENS = ["https://daianesilvasvc-afk.github.io"];
const MAX_BYTES = 256 * 1024;
const ID_OK = /^[a-zA-Z0-9-]{8,64}$/;

function cors(request) {
  const origin = request.headers.get("Origin") || "";
  const ok = ORIGENS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ORIGENS[0],
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors(request) },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(request) });
    const parts = new URL(request.url).pathname.split("/").filter(Boolean);
    if (parts[0] !== "uso" || parts.length > 2) return json(request, { error: "rota inexistente" }, 404);

    if (parts.length === 1) {
      if (request.method !== "GET") return json(request, { error: "método não permitido" }, 405);
      const { results } = await env.DB.prepare("SELECT id, nome, dados FROM uso ORDER BY atualizado DESC").all();
      return json(request, results.map((r) => ({ id: r.id, nome: r.nome, dados: JSON.parse(r.dados) })));
    }

    const id = parts[1];
    if (!ID_OK.test(id)) return json(request, { error: "id inválido" }, 400);

    if (request.method === "GET") {
      const r = await env.DB.prepare("SELECT id, nome, dados FROM uso WHERE id = ?").bind(id).first();
      if (!r) return json(request, { error: "não encontrado" }, 404);
      return json(request, { id: r.id, nome: r.nome, dados: JSON.parse(r.dados) });
    }

    if (request.method === "PUT") {
      const texto = await request.text();
      if (texto.length > MAX_BYTES) return json(request, { error: "registro grande demais" }, 413);
      let body;
      try { body = JSON.parse(texto); } catch (e) { return json(request, { error: "JSON inválido" }, 400); }
      if (!body || typeof body.dados !== "object" || body.dados === null) return json(request, { error: "faltou dados" }, 400);
      const nome = typeof body.nome === "string" ? body.nome.trim().slice(0, 80) || null : null;
      await env.DB.prepare(
        `INSERT INTO uso (id, nome, dados, atualizado) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET nome = COALESCE(?2, uso.nome), dados = ?3, atualizado = ?4`
      ).bind(id, nome, JSON.stringify(body.dados), new Date().toISOString()).run();
      return json(request, { ok: true });
    }

    return json(request, { error: "método não permitido" }, 405);
  },
};
