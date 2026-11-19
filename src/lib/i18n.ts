export const LANGS = ["pt", "en", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);
export const htmlLang: Record<Lang, string> = { pt: "pt-BR", en: "en", es: "es" };
export const langLabel: Record<Lang, string> = { pt: "Português", en: "English", es: "Español" };
export const numLocale: Record<Lang, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };
/** Portuguese lives at the root; the other languages get a prefix. */
export const href = (lang: Lang, path = "/") => (lang === "pt" ? path : `/${lang}${path === "/" ? "" : path}`);

const pt = {
  meta: { title: "docsmith — documentação a partir do código", description: "Cole a URL de um repositório público do GitHub e receba um site de documentação: visão geral, stack, estrutura, como rodar e API." },
  skip: "Pular para o conteúdo",
  nav: { label: "Principal", examples: "Exemplos", code: "Código", language: "Idioma" },
  footer: "docsmith · um projeto vhcodestudio · lê só repositórios públicos, direto da API do GitHub, sem guardar nada.",
  home: {
    eyebrow: "Manual de instruções · gerado do código", h1: ["Todo repo", "merece um", "manual."],
    lead: "Cole o endereço de um repositório público. O docsmith lê a árvore de arquivos, o README, o package.json e os arquivos principais, e monta uma documentação com visão geral, stack, estrutura, comandos e API.",
    try: "Experimente com", how: ["Como", "funciona"],
    examples: ["Estado global minúsculo para React", "Cliente HTTP em cima do fetch", "CLIs em Python a partir de type hints", "Hooks de data fetching", "Leitor de Markdown no terminal, em Go", "Um dos projetos deste portfólio"],
    steps: [
      ["Lê", "Árvore do repositório, README e manifesto do projeto pela API pública do GitHub."],
      ["Escolhe", "Ordena os arquivos que mais provavelmente definem a API: entradas, rotas e pastas de código."],
      ["Escreve", "Extrai exports, rotas e funções públicas e organiza tudo numa página com índice."],
    ],
  },
  form: { label: "URL do repositório", go: "Forjar", bad: "Não reconheci esse endereço. Use algo como github.com/dono/repo ou dono/repo." },
  forge: { title: "Forjando", yours: "seu repositório", steps: ["Consultando o repositório", "Lendo a árvore de arquivos", "Abrindo README e manifesto", "Escolhendo os arquivos principais", "Extraindo exports e rotas", "Montando a página"] },
  docs: {
    metaDesc: (s: string) => `Documentação gerada para ${s}: stack, estrutura, como rodar e API.`,
    failEyebrow: "Não deu desta vez", tryOther: "Tentar outro", generic: "Algo deu errado ao gerar a documentação.",
    toc: ["Visão geral", "Stack", "Como rodar", "Estrutura", "API"], onPage: "Nesta página",
    facts: ["Estrelas", "Linguagem", "Licença", "Arquivos", "Último push"],
    eyebrow: (b: string) => `Documentação · branch ${b}`, noDesc: "Sem descrição no repositório.",
    noStack: "Nada reconhecido automaticamente.", noCmds: "Não encontrei comandos no manifesto nem no README.",
    treeNote: "Pastas como node_modules, dist e build ficam de fora. Clique para abrir.",
    apiNote: (n: number, files: number, routes: number) => `${n} símbolos públicos em ${files} arquivos${routes ? `, incluindo ${routes} rotas HTTP` : ""}. A leitura é estática, então trate como um mapa, não como contrato.`,
    noApi: "Nenhum export público encontrado nos arquivos analisados.",
    download: "Baixar .md", copy: "copiar", copied: "copiado", copyLabel: (t: string) => `Copiar: ${t}`,
    md: { license: "Licença", stars: "Estrelas", run: "Como rodar", structure: "Estrutura", by: "Gerado por docsmith a partir de" },
  },
  labels: {} as Record<string, string>,
  errors: {} as Record<string, string>,
};
export type Dict = typeof pt;

const en: Dict = {
  meta: { title: "docsmith — documentation from the code", description: "Paste the URL of a public GitHub repository and get a documentation site: overview, stack, structure, how to run it and API." },
  skip: "Skip to content",
  nav: { label: "Main", examples: "Examples", code: "Code", language: "Language" },
  footer: "docsmith · a vhcodestudio project · reads public repositories only, straight from the GitHub API, storing nothing.",
  home: {
    eyebrow: "Instruction manual · generated from the code", h1: ["Every repo", "deserves a", "manual."],
    lead: "Paste the address of a public repository. docsmith reads the file tree, the README, package.json and the main files, and builds documentation with an overview, stack, structure, commands and API.",
    try: "Try it with", how: ["How it", "works"],
    examples: ["Tiny global state for React", "HTTP client on top of fetch", "Python CLIs from type hints", "Data fetching hooks", "Terminal Markdown reader, in Go", "One of the projects in this portfolio"],
    steps: [
      ["Reads", "The repository tree, README and project manifest through the public GitHub API."],
      ["Picks", "Ranks the files most likely to define the API: entry points, routes and source folders."],
      ["Writes", "Extracts exports, routes and public functions and lays them out on one page with a table of contents."],
    ],
  },
  form: { label: "Repository URL", go: "Forge", bad: "I did not recognize that address. Use something like github.com/owner/repo or owner/repo." },
  forge: { title: "Forging", yours: "your repository", steps: ["Querying the repository", "Reading the file tree", "Opening README and manifest", "Picking the main files", "Extracting exports and routes", "Building the page"] },
  docs: {
    metaDesc: (s) => `Generated documentation for ${s}: stack, structure, how to run it and API.`,
    failEyebrow: "Not this time", tryOther: "Try another", generic: "Something went wrong while generating the documentation.",
    toc: ["Overview", "Stack", "How to run", "Structure", "API"], onPage: "On this page",
    facts: ["Stars", "Language", "License", "Files", "Last push"],
    eyebrow: (b) => `Documentation · branch ${b}`, noDesc: "No description in the repository.",
    noStack: "Nothing recognized automatically.", noCmds: "No commands found in the manifest or the README.",
    treeNote: "Folders like node_modules, dist and build are left out. Click to open.",
    apiNote: (n, files, routes) => `${n} public symbols in ${files} files${routes ? `, including ${routes} HTTP routes` : ""}. The reading is static, so treat it as a map, not a contract.`,
    noApi: "No public exports found in the analyzed files.",
    download: "Download .md", copy: "copy", copied: "copied", copyLabel: (t) => `Copy: ${t}`,
    md: { license: "License", stars: "Stars", run: "How to run", structure: "Structure", by: "Generated by docsmith from" },
  },
  labels: { Instalar: "Install", Desenvolvimento: "Development", Iniciar: "Start", Build: "Build", Testes: "Tests", Lint: "Lint", Preview: "Preview", Executar: "Run", "Do README": "From README" },
  errors: {
    "Repositório não encontrado ou privado.": "Repository not found or private.",
    "O GitHub limitou as consultas por agora. Tente de novo em alguns minutos.": "GitHub is rate limiting requests right now. Try again in a few minutes.",
    "Repositório grande demais para esta demonstração (mais de 2 GB).": "Repository too large for this demo (over 2 GB).",
    "O GitHub não respondeu como esperado.": "GitHub did not respond as expected.",
  },
};

const es: Dict = {
  meta: { title: "docsmith — documentación a partir del código", description: "Pega la URL de un repositorio público de GitHub y recibe un sitio de documentación: visión general, stack, estructura, cómo ejecutarlo y API." },
  skip: "Saltar al contenido",
  nav: { label: "Principal", examples: "Ejemplos", code: "Código", language: "Idioma" },
  footer: "docsmith · un proyecto de vhcodestudio · solo lee repositorios públicos, directo de la API de GitHub, sin guardar nada.",
  home: {
    eyebrow: "Manual de instrucciones · generado del código", h1: ["Todo repo", "merece un", "manual."],
    lead: "Pega la dirección de un repositorio público. docsmith lee el árbol de archivos, el README, el package.json y los archivos principales, y arma una documentación con visión general, stack, estructura, comandos y API.",
    try: "Pruébalo con", how: ["Cómo", "funciona"],
    examples: ["Estado global diminuto para React", "Cliente HTTP sobre fetch", "CLIs en Python a partir de type hints", "Hooks de data fetching", "Lector de Markdown en la terminal, en Go", "Uno de los proyectos de este portafolio"],
    steps: [
      ["Lee", "El árbol del repositorio, el README y el manifiesto del proyecto con la API pública de GitHub."],
      ["Elige", "Ordena los archivos que más probablemente definen la API: entradas, rutas y carpetas de código."],
      ["Escribe", "Extrae exports, rutas y funciones públicas y lo organiza todo en una página con índice."],
    ],
  },
  form: { label: "URL del repositorio", go: "Forjar", bad: "No reconocí esa dirección. Usa algo como github.com/dueño/repo o dueño/repo." },
  forge: { title: "Forjando", yours: "tu repositorio", steps: ["Consultando el repositorio", "Leyendo el árbol de archivos", "Abriendo README y manifiesto", "Eligiendo los archivos principales", "Extrayendo exports y rutas", "Armando la página"] },
  docs: {
    metaDesc: (s) => `Documentación generada para ${s}: stack, estructura, cómo ejecutarlo y API.`,
    failEyebrow: "Esta vez no salió", tryOther: "Probar otro", generic: "Algo salió mal al generar la documentación.",
    toc: ["Visión general", "Stack", "Cómo ejecutar", "Estructura", "API"], onPage: "En esta página",
    facts: ["Estrellas", "Lenguaje", "Licencia", "Archivos", "Último push"],
    eyebrow: (b) => `Documentación · rama ${b}`, noDesc: "Sin descripción en el repositorio.",
    noStack: "Nada reconocido automáticamente.", noCmds: "No encontré comandos en el manifiesto ni en el README.",
    treeNote: "Carpetas como node_modules, dist y build quedan fuera. Haz clic para abrir.",
    apiNote: (n, files, routes) => `${n} símbolos públicos en ${files} archivos${routes ? `, incluidas ${routes} rutas HTTP` : ""}. La lectura es estática, así que tómala como un mapa, no como un contrato.`,
    noApi: "No se encontraron exports públicos en los archivos analizados.",
    download: "Descargar .md", copy: "copiar", copied: "copiado", copyLabel: (t) => `Copiar: ${t}`,
    md: { license: "Licencia", stars: "Estrellas", run: "Cómo ejecutar", structure: "Estructura", by: "Generado por docsmith a partir de" },
  },
  labels: { Instalar: "Instalar", Desenvolvimento: "Desarrollo", Iniciar: "Iniciar", Build: "Build", Testes: "Pruebas", Lint: "Lint", Preview: "Preview", Executar: "Ejecutar", "Do README": "Del README" },
  errors: {
    "Repositório não encontrado ou privado.": "Repositorio no encontrado o privado.",
    "O GitHub limitou as consultas por agora. Tente de novo em alguns minutos.": "GitHub limitó las consultas por ahora. Inténtalo de nuevo en unos minutos.",
    "Repositório grande demais para esta demonstração (mais de 2 GB).": "Repositorio demasiado grande para esta demostración (más de 2 GB).",
    "O GitHub não respondeu como esperado.": "GitHub no respondió como se esperaba.",
  },
};

export const dicts: Record<Lang, Dict> = { pt, en, es };
/** Analysis results are cached in Portuguese; these translate the few fixed strings at render time. */
export const tLabel = (lang: Lang, s: string) => dicts[lang].labels[s] ?? s;
export const tError = (lang: Lang, s: string) => dicts[lang].errors[s] ?? s;
