import { createHash } from "crypto";

const SITE_URL = "https://mauricio-nine.vercel.app";
const ADMIN_PASSWORD = "mauricio2026";

const PL_CONTENT = `## **O Partido Liberal (PL) no Piauí realizou, na manhã desta sexta-feira (22), a apresentação dos nomes dos pré-candidatos para as eleições deste ano.**

O evento aconteceu na sede estadual da sigla, no bairro **Ininga**, zona leste de Teresina, e foi conduzido pelo presidente do PL no estado, **Tiago Junqueira.**
A chapa majoritária é encabeçada pelo jornalista Toni Rodrigues, anunciado como pré-candidato ao Governo do Piauí, enquanto Tiago Junqueira disputará uma vaga no Senado Federal. Durante o encontro, lideranças partidárias e apoiadores acompanharam a apresentação do projeto político da legenda para o pleito.

Em entrevista à imprensa, o presidente do partido destacou os objetivos do grupo e a estratégia para ampliar a presença do PL no estado. "Completando mais uma etapa para o PL, especialmente nesta data, que é dia 22 e no aniversário de um ano aqui da sede do partido, então, de forma comemorativa, entregando ao povo do Piauí uma alternativa de nomes para representar nossa direita na Alepi e na Câmara dos Deputados, também reforçando nossa pré-candidatura para o Senado, **Toni Rodrigues** para o Governo e Flávio Bolsonaro para presidente", afirmou o presidente do PL-PI.

Junqueira completou, destacando que as chapas proporcionais contêm nove nomes para federal e dezenove para estadual.
"Estão sendo anunciados nomes para deputados estaduais e federais, serão nove nomes para federal e dezenove para estadual, formando 30 nomes comigo e Toni Rodrigues que estão à disposição do povo do Piauí", declarou.

O pré-candidato ao Governo do Piauí, Toni Rodrigues, destacou que o PL é o único partido que nunca se aliou ao Partido dos Trabalhadores. "Eu nunca coloquei dificuldade para dialogar com nenhum partido, pelo contrário, se existe alguém do diálogo, sou eu. Agora o PL é o único partido que nunca se aliou ao PT. O pré-candidato Toni Rodrigues foi o único que nunca esteve aliado aos governos do PT nas governanças nefastas do PT no Governo do Piauí", pontuou.

**Confira a lista completa dos pré-candidatos:**
**PRÉ-CANDIDATOS FEDERAIS - MULHERES**
• Jhamya Junqueira - Teresina
• Socorro Medeiros - Várzea Grande
• Liamara - Teresina

**PRÉ-CANDIDATOS FEDERAIS - HOMENS**
• Erivan Limas - Picos
• Natanael - Floriano
• Maurício Soares - Teresina
• Major Costa Araújo
• Cleiton Popular - Teresina
• Rogério Leite Galvão

**PRÉ-CANDIDATAS ESTADUAIS - MULHERES**
• Emilly - Regeneração
• Eritma - Teresina
• Irmã Francisca - Amarante
• Jeane - Parnaíba
• Maria das Graças - Picos
• Glória - Teresina

**PRÉ-CANDIDATOS ESTADUAIS - HOMENS**
• Samuel Coelho - Teresina
• Sidney Floriano - Floriano
• Pedro Ayres - Teresina
• Jaciel Silva - Teresina
• Francisco Júnior Vet - Teresina
• Nel Lopes - Teresina
• Adelmarzin da Saúde - Floriano
• Alberto Silva
• Osias - Teresina
• Paulo Mourão - Pedro II
• Sudário
• Valmir Alves - Teresina
• Marazo - Teresina

Mais conteúdo sobre:
[www.gp1.com.br/eleicoes-2026/noticia/2026/5/22/p](https://www.gp1.com.br/eleicoes-2026/noticia/2026/5/22/partido-liberal-apresenta-nomes-dos-pre-candidatos-para-as-eleicoes-no-piaui-623508.html)`;

const RESTORED_NEWS = [
  {
    id: "1781279000001",
    title: 'Pré-candidato do PL critica "velha política" e aposta no engajamento jovem como força eleitoral',
    excerpt:
      "O pré-candidato também destacou que a juventude tem papel decisivo nas eleições e defendeu a mobilização de jovens em apoio a uma direita liberal e nacionalista...",
    date: "2026-04-28",
    category: "Política",
    image: "/uploads/instagram-mauricio.jpg",
    imageFocusX: 50,
    imageFocusY: 50,
    content: `## **Pré-candidato do PL critica "velha política" e aposta no engajamento jovem como força eleitoral**

O pré-candidato a deputado federal **Maurício Soares (PL)** destacou que a juventude tem papel decisivo nas eleições e defendeu a mobilização de jovens em apoio a uma direita liberal e nacionalista, além de partidos que se colocam como oposição ao PT. Para ele, o fortalecimento da consciência política juvenil é essencial para enfrentar práticas tradicionais ainda presentes no cenário político do Piauí.

"Há uma mudança de paradigma na política. Sou pré-candidato a deputado federal com projetos e serviços prestados, na Segurança Pública, pelo Exército, no setor público de Saúde e sou professor. Tenho pautas e projetos aplicados", afirmou Maurício Soares.

O pré-candidato também direcionou críticas à classe política dominante no Piauí, defendendo uma mudança de padrões por meio da vontade popular. "No Piauí existe a questão dos currais eleitorais, ultrapassando as leis eleitorais, com candidatos apoiados por grandes veículos da imprensa. Há personagens que já estão há 20 anos no poder. Já tenho soluções e vou puxar muitas lideranças para mudar essa visão de viralatismo eleitoral", concluiu.`,
  },
  {
    id: "1781277256294",
    title: "Partido Liberal apresenta nomes dos pré-candidatos para as eleições no Piauí",
    excerpt: "Partido Liberal apresenta nomes dos pré-candidatos para as eleições no Piauí, com chapas para Alepi e Câmara dos Deputados.",
    date: "2026-05-22",
    category: "Política",
    image: "/uploads/instagram-partido-liberal.jpg",
    imageFocusX: 50,
    imageFocusY: 50,
    content: PL_CONTENT,
  },
  {
    id: "1781279000002",
    title: "Mauricío Soares apresenta propostas para o agronegócio",
    excerpt:
      "Mauricío Soares protestou contra medidas que prejudicam os produtores rurais e apresentou alternativas para fortalecer o setor...",
    date: "2026-02-21",
    category: "Agronegócio",
    image: "/uploads/news-agronegocio.jpg",
    imageFocusX: 50,
    imageFocusY: 50,
    content:
      "Mauricío Soares protestou contra medidas que prejudicam os produtores rurais e apresentou alternativas para fortalecer o setor agrícola brasileiro, garantindo crédito acessível e condições justas para o campo. Durante agenda no interior do estado, o pré-candidato reforçou o compromisso com o desenvolvimento sustentável do agronegócio piauiense.",
  },
  {
    id: "1781279000003",
    title: "Dr. Maurício Soares dispara em enquete pública para Dep. Federal no Piauí.",
    excerpt:
      "O portal Br Hoje vem realizando uma série de enquetes pelo Instagram com os pré-candidatos a deputado federal no Piauí.",
    date: "2026-05-10",
    category: "Eleições",
    image: "/uploads/instagram-clube-news.jpg",
    imageFocusX: 50,
    imageFocusY: 50,
    content: `## **Dr. Maurício Soares dispara em enquete pública para Dep. Federal no Piauí**

O portal **Br Hoje** vem realizando uma série de enquetes pelo Instagram com os pré-candidatos a deputado federal no Piauí.

🏆 **Maurício Soares** foi o que mais pontuou entre os seguidores do Br Hoje com **56%**. Além do mesmo, também participaram da enquete Zenaíde Lustosa, Gyselle Cajuína e Liamara Alencar.

O resultado reforça o crescimento do nome de Maurício Soares no debate político estadual e a receptividade do público às propostas apresentadas para o Piauí.`,
  },
  {
    id: "1781279000004",
    title:
      "Aplicativo desenvolvido por piauienses promete modernizar transporte público de Teresina com monitoramento de ônibus em tempo real",
    excerpt:
      "Solução criada por equipe piauiense permite acompanhar linhas e horários de ônibus em Teresina diretamente pelo celular.",
    date: "2026-06-05",
    category: "Tecnologia",
    image: "/uploads/banner-mmbus.png",
    imageFocusX: 50,
    imageFocusY: 50,
    content: `## **Aplicativo desenvolvido por piauienses promete modernizar transporte público de Teresina com monitoramento de ônibus em tempo real**

Um aplicativo desenvolvido por piauienses promete modernizar o transporte público de Teresina com **monitoramento de ônibus em tempo real**, facilitando o dia a dia de quem depende do transporte coletivo na capital.

A ferramenta **MMBus** foi criada para oferecer mais praticidade, transparência e informação aos usuários, permitindo consultar linhas, trajetos e atualizações diretamente pelo celular.

Maurício Soares, envolvido no projeto, defende que soluções tecnológicas desenvolvidas localmente são fundamentais para melhorar a qualidade de vida da população e modernizar serviços públicos essenciais.`,
  },
];

async function main() {
  const writeLocal = process.argv.includes("--local");
  const configRes = await fetch(`${SITE_URL}/api/config`, { cache: "no-store" });
  if (!configRes.ok) throw new Error(`Falha ao ler config: ${configRes.status}`);
  const config = await configRes.json();

  config.news = RESTORED_NEWS;

  if (writeLocal) {
    const { writeFileSync } = await import("fs");
    const { default: path } = await import("path");
    const target = path.join(process.cwd(), "data", "site-config.json");
    writeFileSync(target, `${JSON.stringify(config, null, 2)}\n`);
    console.log("site-config.json atualizado localmente com", config.news.length, "notícias");
    return;
  }

  const authRes = await fetch(`${SITE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!authRes.ok) throw new Error(`Falha no login admin: ${authRes.status}`);
  const { token } = await authRes.json();

  const saveRes = await fetch(`${SITE_URL}/api/admin/config`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify(config),
  });

  const saveBody = await saveRes.json().catch(() => ({}));
  if (!saveRes.ok) {
    throw new Error(saveBody.error || `Falha ao salvar: ${saveRes.status}`);
  }

  const verifyRes = await fetch(`${SITE_URL}/api/config`, { cache: "no-store" });
  const verified = await verifyRes.json();

  console.log("Notícias restauradas:", verified.news.length);
  for (const item of verified.news) {
    console.log(`- ${item.id}: ${item.title}`);
  }
  console.log("Token hash prefix:", createHash("sha256").update(ADMIN_PASSWORD + "mauricio-salt").digest("hex").slice(0, 8));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
