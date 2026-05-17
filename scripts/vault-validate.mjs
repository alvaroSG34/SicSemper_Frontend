import fs from "node:fs";
import path from "node:path";

const requiredDirs = [
  "00_System",
  "01_Projects",
  "03_Decisions",
  "04_Sessions",
  "08_Runbooks",
  "09_Infrastructure",
  "99_Index",
];

const requiredFrontmatterFields = [
  "id",
  "title",
  "createdAt",
  "updatedAt",
  "tags",
  "status",
  "source",
];

const vaultCandidates = [
  process.env.VAULT_ROOT,
  path.resolve(process.cwd(), "vault-sicsemper"),
  path.resolve(process.cwd(), "..", "vault-sicsemper"),
].filter(Boolean);

const vaultRoot = vaultCandidates.find((candidate) => fs.existsSync(candidate));

let warningCount = 0;

function warn(message, file = "") {
  warningCount += 1;
  if (file) {
    console.log(`::warning file=${file}::${message}`);
    return;
  }
  console.log(`::warning::${message}`);
}

function collectMarkdownFiles(rootDir) {
  const results = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

if (!vaultRoot) {
  warn(
    "No se encontro 'vault-sicsemper' en el checkout actual. Validacion omitida (modo advisory)."
  );
  process.exit(0);
}

for (const dir of requiredDirs) {
  const fullDir = path.join(vaultRoot, dir);
  if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) {
    warn(`Falta directorio requerido del vault: ${dir}`, fullDir);
  }
}

const markdownFiles = collectMarkdownFiles(vaultRoot);
if (markdownFiles.length === 0) {
  warn("No se encontraron notas Markdown en el vault.", vaultRoot);
}

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatterMatch) {
    warn("Falta frontmatter YAML al inicio de la nota.", file);
    continue;
  }

  const frontmatter = frontmatterMatch[1];
  for (const field of requiredFrontmatterFields) {
    const fieldPattern = new RegExp(`^${field}:`, "m");
    if (!fieldPattern.test(frontmatter)) {
      warn(`Falta campo obligatorio de frontmatter: ${field}`, file);
    }
  }
}

if (warningCount > 0) {
  console.log(`Vault advisory completo con ${warningCount} warning(s).`);
} else {
  console.log("Vault advisory completo sin warnings.");
}

process.exit(0);
