# Playbook de Vendas para Barbeiros · Podium Educação

Material de aula com técnicas práticas de venda de produtos para barbeiros: diagnóstico na cadeira, atendimento passo a passo, scripts, objeções, exposição e pós-venda, exercícios de sala e calculadora de indicadores.

## Publicar com GitHub Pages

1. Envie `index.html` para a raiz do repositório.
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. O link fica em `https://<usuario-ou-org>.github.io/<repositorio>/`.

## Histórico de uso

A página grava o uso de cada pessoa (dias, seções vistas, avaliações e indicadores) num Worker do Cloudflare com banco D1, código em `api/`:

- Worker: `https://playbook-vendas-api.podium-playbook.workers.dev` (conta daiane.podiumeducacao@gmail.com)
- Banco: D1 `playbook_vendas_db`, tabela `uso` (`api/schema.sql`)
- Deploy: `cd api && npx wrangler deploy`

Cada navegador recebe um id próprio e a pessoa informa o nome uma vez. O painel de quem está usando aparece abrindo o link com `?gestao` no fim (sem senha).
