type GitHubFileResponse = {
  sha: string;
  content?: string;
  encoding?: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável ${name} não configurada.`);
  }
  return value;
}

function getGithubConfig() {
  const token = getRequiredEnv("GITHUB_STORAGE_TOKEN");
  const owner = process.env.GITHUB_STORAGE_OWNER || "JoseSoares01";
  const repo = process.env.GITHUB_STORAGE_REPO || "mauricio";
  const branch = process.env.GITHUB_STORAGE_BRANCH || "main";
  return { token, owner, repo, branch };
}

function buildApiUrl(filePath: string, ref?: string): string {
  const { owner, repo } = getGithubConfig();
  const encodedPath = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const base = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
  return ref ? `${base}?ref=${encodeURIComponent(ref)}` : base;
}

async function githubFetch(url: string, init?: RequestInit): Promise<Response> {
  const { token } = getGithubConfig();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  return fetch(url, { ...init, headers, cache: "no-store" });
}

export function isGithubStorageEnabled(): boolean {
  return !!process.env.GITHUB_STORAGE_TOKEN;
}

export async function readTextFileFromGitHub(filePath: string): Promise<string | null> {
  const { branch } = getGithubConfig();
  const response = await githubFetch(buildApiUrl(filePath, branch));
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao ler ${filePath} no GitHub: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as GitHubFileResponse;
  if (payload.encoding !== "base64" || !payload.content) return null;
  return Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf-8");
}

export async function writeFileToGitHub(params: {
  filePath: string;
  content: Buffer | string;
  message: string;
}): Promise<void> {
  const { filePath, content, message } = params;
  const { branch } = getGithubConfig();
  const getResponse = await githubFetch(buildApiUrl(filePath, branch));

  let sha: string | undefined;
  if (getResponse.ok) {
    const data = (await getResponse.json()) as GitHubFileResponse;
    sha = data.sha;
  } else if (getResponse.status !== 404) {
    const body = await getResponse.text();
    throw new Error(`Falha ao verificar ${filePath} no GitHub: ${getResponse.status} ${body}`);
  }

  const encodedContent =
    typeof content === "string"
      ? Buffer.from(content, "utf-8").toString("base64")
      : content.toString("base64");

  const putResponse = await githubFetch(buildApiUrl(filePath), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: encodedContent,
      branch,
      sha,
    }),
  });

  if (!putResponse.ok) {
    const body = await putResponse.text();
    throw new Error(`Falha ao gravar ${filePath} no GitHub: ${putResponse.status} ${body}`);
  }
}

export function getGitHubRawUrl(filePath: string): string {
  const { owner, repo, branch } = getGithubConfig();
  const normalized = filePath.replace(/^\/+/, "");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${normalized}`;
}
