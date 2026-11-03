-- Um registro por pessoa (navegador). `dados` guarda o mesmo JSON que a
-- versão Artifact gravava em uso/<id>: dias, avaliacoes, indicadores, acessos.
CREATE TABLE IF NOT EXISTS uso (
  id TEXT PRIMARY KEY,
  nome TEXT,
  dados TEXT NOT NULL,
  atualizado TEXT NOT NULL
);
