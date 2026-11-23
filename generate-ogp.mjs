
import fs from "node:fs";
import path from "node:path";

const baseUrl = "https://narmerZzz.github.io/blackpyramid/";

const sessions = JSON.parse(
  fs.readFileSync("sessions.json", "utf8")
);

const template = fs.readFileSync(
  "session-detail.html", "utf8"
);

const outputDir = "sessions";
fs.mkdirSync(outputDir, { recursive: true });

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

const idMarker =
  "const id = new URLSearchParams(location.search).get('id');";

if (!template.includes(idMarker)) {
  throw new Error("session-detail.html のID取得処理が見つかりません");
}

if (!template.includes("</head>")) {
  throw new Error("テンプレートに </head> がありません");
}

const generated = new Set();

for (const session of sessions) {
  if (!/^[a-zA-Z0-9_-]+$/.test(session.id)) {
    throw new Error(`不正なID: ${session.id}`);
  }

  const filename = `${session.id}.html`;
  const pageUrl = new URL(`sessions/${filename}`, baseUrl).href;

  const imageUrl = session.image
    ? new URL(session.image, baseUrl).href
    : "";

  const metadata = `
<base href="${escapeHtml(baseUrl)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(session.title)}">
<meta property="og:description" content="TRPG SESSION LOG">
<meta property="og:url" content="${escapeHtml(pageUrl)}">
${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">` : ""}
<meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}">
`;

  let html = template.replace(
    /<head>/i,
    `<head>\n${metadata}`
  );

  html = html.replace(
    idMarker,
    `const id = ${JSON.stringify(session.id)};`
  );

  fs.writeFileSync(
    path.join(outputDir, filename),
    html
  );

  generated.add(filename);
}

// Organize old generated pages from deleted tables
for (const file of fs.readdirSync(outputDir)) {
  if (file.endsWith(".html") && !generated.has(file)) {
    fs.unlinkSync(path.join(outputDir, file));
  }
}

console.log(`${generated.size}件の卓報告ページを生成しました`);
