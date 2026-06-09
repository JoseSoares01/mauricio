# Site Mauricío Soares

Réplica do site cironogueira.com.br personalizado para **Mauricío Soares**, com painel admin completo para edição fácil.

## Início Rápido

```bash
npm install
npm run dev
```

- **Site público:** http://localhost:3000
- **Painel Admin:** http://localhost:3000/admin
- **Senha padrão:** `mauricio2026`

## Páginas

| Página | URL |
|--------|-----|
| Home | `/` |
| Sobre | `/sobre` |
| Notícias | `/noticias` |
| Agenda | `/agenda` |
| Contato | `/contato` |
| Admin | `/admin` |

## Painel Admin (Control System)

O painel admin permite editar tudo sem tocar no código:

- **Cores & Tema** — cores primária, secundária, destaque, gradientes
- **Imagens** — upload para substituir fotos do site
- **Menus** — adicionar/remover/editar itens de navegação
- **Conteúdo** — textos, hero, sobre, contato
- **Notícias** — CRUD completo de notícias
- **Vídeos** — upload de vídeos ou links do YouTube
- **Agenda** — eventos com calendário semanal e mensal
- **Redes Sociais** — links e posts do Instagram

## Estrutura

```
data/site-config.json   ← Todas as configurações do site
public/uploads/         ← Imagens e vídeos enviados
src/app/                ← Páginas Next.js
src/components/         ← Componentes reutilizáveis
src/components/admin/   ← Componentes do painel admin
```

## Deploy na Vercel (salvar no admin online)

Na Vercel o disco é somente leitura. Para o botão **Salvar** do admin funcionar em produção:

1. No painel da Vercel, abra o projeto → **Storage** → crie um **Blob Store**
2. Conecte o Blob ao projeto (isso define `BLOB_READ_WRITE_TOKEN` automaticamente)
3. Faça um novo deploy

Sem o Blob, o admin funciona em `localhost`, mas dá erro ao salvar no site publicado.

## Feed real do Instagram

Por padrão a grade usa fotos manuais do admin. Para mostrar as **publicações reais** da conta:

1. A conta Instagram deve ser **Profissional** (Empresa ou Criador) e ligada a uma **Página do Facebook**
2. Crie uma app em [developers.facebook.com](https://developers.facebook.com/)
3. Adicione o produto **Instagram Graph API**
4. Gere um token de acesso de longa duração com permissão `instagram_basic`
5. Obtenha o **Instagram User ID** da conta
6. Na Vercel → Settings → Environment Variables, adicione:
   - `INSTAGRAM_ACCESS_TOKEN` — token de acesso
   - `INSTAGRAM_USER_ID` — ID numérico da conta Instagram
7. Faça **Redeploy**

O site atualiza o feed automaticamente (cache de ~1 hora). Se a API falhar, usa a grade manual do admin.

## Edição Manual (Alternativa)

Você também pode editar diretamente o arquivo `data/site-config.json` para alterações em massa.
