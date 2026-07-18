import { constants as fsConstants } from "node:fs";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VALID_SCOPES = new Set(["full", "links", "anki", "workflows", "projects"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".nuxt",
  ".parcel-cache",
  ".turbo",
  ".venv",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "target",
  "vendor",
]);
const CONTENT_EXTENSIONS = new Set([
  ".c",
  ".cc",
  ".cpp",
  ".css",
  ".go",
  ".h",
  ".html",
  ".java",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mjs",
  ".mts",
  ".py",
  ".rs",
  ".sh",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const PROJECT_MANIFESTS = ["package.json", "go.mod", "Cargo.toml", "pyproject.toml"];
const NODE_LOCKFILES = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"];
const PYTHON_LOCKFILES = ["uv.lock", "poetry.lock", "pdm.lock", "requirements.lock"];

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "variant" });
const issues = [];
const counts = {
  markdown: 0,
  links: 0,
  resolvedLinks: 0,
  unresolvedLinks: 0,
  ambiguousLinks: 0,
  ankiFiles: 0,
  ankiRows: 0,
  skills: 0,
  commands: 0,
  projects: 0,
  contentFiles: 0,
  orphans: 0,
  uncovered: 0,
};

function usage() {
  return [
    "Usage: node scripts/vault-audit.mjs [scope]",
    "",
    "Scopes:",
    "  full       Run every audit (default)",
    "  links      Check wikilinks and MOC/orphan coverage",
    "  anki       Check Anki TSV exports",
    "  workflows  Check skill metadata and command references",
    "  projects   Check standalone project boundaries",
  ].join("\n");
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function relativePath(absolutePath) {
  const relative = path.relative(REPOSITORY_ROOT, absolutePath);
  return toPosix(relative || ".");
}

function compareText(left, right) {
  return collator.compare(left, right);
}

function addIssue(severity, category, filePath, message, line) {
  issues.push({
    severity,
    category,
    path: typeof filePath === "string" && path.isAbsolute(filePath) ? relativePath(filePath) : filePath,
    line,
    message,
  });
}

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function walkFiles(root, options = {}) {
  if (!(await exists(root))) return [];

  const files = [];
  const visit = async (directory) => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      addIssue("error", "filesystem", directory, `cannot read directory: ${error.message}`);
      return;
    }

    entries.sort((left, right) => compareText(left.name, right.name));
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name) && !options.skipDirectories?.has(entry.name)) {
          await visit(absolutePath);
        }
      } else if (entry.isFile() && (!options.filter || options.filter(absolutePath))) {
        files.push(absolutePath);
      }
    }
  };

  await visit(root);
  return files;
}

async function readText(filePath, category) {
  try {
    return (await readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
  } catch (error) {
    addIssue("error", category, filePath, `cannot read file: ${error.message}`);
    return null;
  }
}

function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") {
    return { present: false, closed: false, fields: new Map(), lines, endLine: 0, problems: [] };
  }

  let closingIndex = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] === "---" || lines[index] === "...") {
      closingIndex = index;
      break;
    }
  }
  if (closingIndex === -1) {
    return { present: true, closed: false, fields: new Map(), lines, endLine: 0, problems: [] };
  }

  const fields = new Map();
  const problems = [];
  for (let index = 1; index < closingIndex; index += 1) {
    const line = lines[index];
    if (line.trim() === "" || /^\s/.test(line) || /^#/.test(line)) continue;
    const match = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (!match) {
      problems.push({ line: index + 1, message: "invalid top-level frontmatter entry" });
      continue;
    }
    const [, key, rawValue = ""] = match;
    if (fields.has(key)) {
      problems.push({ line: index + 1, message: `duplicate frontmatter key '${key}'` });
    } else {
      fields.set(key, { value: rawValue.trim(), line: index + 1 });
    }
  }

  return { present: true, closed: true, fields, lines, endLine: closingIndex + 1, problems };
}

function scalarValue(rawValue) {
  const value = rawValue.trim();
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
}

function frontmatterContinuation(frontmatter, field) {
  const continuation = [];
  const closingIndex = frontmatter.endLine - 1;
  for (let index = field.line; index < closingIndex; index += 1) {
    const line = frontmatter.lines[index];
    if (/^[A-Za-z0-9_-]+:/.test(line)) break;
    continuation.push(line);
  }
  return continuation;
}

function hasTagsValue(frontmatter, field) {
  if (field.value !== "") return !/^\[\s*\]$/.test(field.value);

  const continuation = frontmatterContinuation(frontmatter, field)
    .map((line) => line.replace(/\s+#.*$/, "").trimEnd())
    .filter((line) => line.trim() !== "");
  if (continuation.some((line) => /^\s*-\s*\S/.test(line))) return true;

  const flowSequence = continuation.join("\n").trim();
  if (!flowSequence.startsWith("[") || !flowSequence.endsWith("]")) return false;
  return flowSequence
    .slice(1, -1)
    .split(",")
    .some((entry) => entry.trim() !== "");
}

function inspectMarkdown(text, filePath, { checkBasics, collectLinks }) {
  const frontmatter = parseFrontmatter(text);
  if (checkBasics) {
    if (!frontmatter.present) {
      addIssue("warning", "markdown", filePath, "missing YAML frontmatter at the first line", 1);
    } else if (!frontmatter.closed) {
      addIssue("error", "markdown", filePath, "frontmatter has no closing delimiter", 1);
    } else {
      for (const problem of frontmatter.problems) {
        addIssue("error", "markdown", filePath, problem.message, problem.line);
      }
      const tags = frontmatter.fields.get("tags");
      if (!tags) {
        addIssue("error", "markdown", filePath, "frontmatter is missing 'tags'", 1);
      } else if (!hasTagsValue(frontmatter, tags)) {
        addIssue("error", "markdown", filePath, "frontmatter 'tags' must not be empty", tags.line);
      }
    }
  }

  const links = [];
  const lines = text.split(/\r?\n/);
  let fence = null;
  let hasHeading = false;
  let inHtmlComment = false;
  const startIndex = frontmatter.closed ? frontmatter.endLine : 0;

  for (let index = startIndex; index < lines.length; index += 1) {
    const originalLine = lines[index];
    const markdownLine = originalLine.replace(/^(?:\s*>\s*)+/, "");
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(markdownLine);
    if (fence) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence.character &&
        fenceMatch[1].length >= fence.length &&
        fenceMatch[2].trim() === ""
      ) {
        if (checkBasics && fence.unlabeled) {
          addIssue("warning", "markdown", filePath, "opening code fence has no language label", fence.line);
        }
        fence = null;
      }
      continue;
    }
    if (fenceMatch) {
      fence = {
        character: fenceMatch[1][0],
        length: fenceMatch[1].length,
        line: index + 1,
        unlabeled: fenceMatch[2].trim() === "",
      };
      continue;
    }

    if (/^#\s+\S/.test(markdownLine)) hasHeading = true;
    if (!collectLinks) continue;

    let visible = originalLine;
    if (inHtmlComment) {
      const end = visible.indexOf("-->");
      if (end === -1) continue;
      visible = visible.slice(end + 3);
      inHtmlComment = false;
    }
    while (visible.includes("<!--")) {
      const start = visible.indexOf("<!--");
      const end = visible.indexOf("-->", start + 4);
      if (end === -1) {
        visible = visible.slice(0, start);
        inHtmlComment = true;
        break;
      }
      visible = visible.slice(0, start) + visible.slice(end + 3);
    }
    visible = visible.replace(/(`+)(?:(?!\1).)*\1/g, "");
    const linkPattern = /(!?)\[\[([^\]\n]+)\]\]/g;
    for (const match of visible.matchAll(linkPattern)) {
      links.push({ raw: match[2], embedded: match[1] === "!", line: index + 1 });
    }
  }

  if (checkBasics && !hasHeading) {
    addIssue("warning", "markdown", filePath, "note has no level-one heading");
  }
  if (checkBasics && fence) {
    addIssue("error", "markdown", filePath, "code fence is not closed", fence.line);
  }
  return links;
}

function decodeLinkTarget(raw) {
  const aliasIndex = raw.search(/\\?\|/);
  let target = (aliasIndex === -1 ? raw : raw.slice(0, aliasIndex)).trim();
  try {
    target = decodeURIComponent(target);
  } catch {
    // Keep the literal target so the resolver can report it as unresolved.
  }
  const hashIndex = target.indexOf("#");
  if (hashIndex !== -1) target = target.slice(0, hashIndex);
  const blockIndex = target.indexOf("^");
  if (blockIndex !== -1) target = target.slice(0, blockIndex);
  return target.trim().replaceAll("\\", "/");
}

function createTargetIndex(allVaultFiles) {
  return { files: allVaultFiles };
}

async function resolveWikilink(sourcePath, rawTarget, targetIndex) {
  const target = decodeLinkTarget(rawTarget);
  if (target === "") return { status: "resolved", path: sourcePath };

  const normalizedTarget = target.replace(/^\/+/, "");
  const targetVariants = normalizedTarget.endsWith(".md")
    ? [normalizedTarget]
    : [normalizedTarget, `${normalizedTarget}.md`];
  const candidateRoots = target.startsWith("/")
    ? [REPOSITORY_ROOT, path.join(REPOSITORY_ROOT, "src")]
    : [path.dirname(sourcePath), path.join(REPOSITORY_ROOT, "src"), REPOSITORY_ROOT];
  const candidates = [];
  for (const root of candidateRoots) {
    for (const variant of targetVariants) {
      const candidate = path.resolve(root, ...variant.split("/"));
      const staysInsideRepository =
        candidate === REPOSITORY_ROOT || candidate.startsWith(`${REPOSITORY_ROOT}${path.sep}`);
      if (staysInsideRepository && !candidates.includes(candidate)) candidates.push(candidate);
    }
  }
  for (const candidate of candidates) {
    if (await isFile(candidate)) return { status: "resolved", path: candidate };
  }

  const vaultRoot = path.join(REPOSITORY_ROOT, "src");
  const suffixVariants = targetVariants
    .map((variant) => path.posix.normalize(variant.replace(/^\.\/+/, "")))
    .filter((variant) => variant !== ".." && !variant.startsWith("../"));
  const suffixMatches = targetIndex.files.filter((filePath) => {
    const vaultRelativePath = toPosix(path.relative(vaultRoot, filePath));
    return suffixVariants.some(
      (variant) => vaultRelativePath === variant || vaultRelativePath.endsWith(`/${variant}`),
    );
  });
  if (suffixMatches.length === 1) return { status: "resolved", path: suffixMatches[0] };
  if (suffixMatches.length > 1) return { status: "ambiguous", matches: suffixMatches };

  const stemVariant = path.posix.normalize(normalizedTarget.replace(/^\.\/+/, ""));
  if (stemVariant !== ".." && !stemVariant.startsWith("../")) {
    const stemMatches = targetIndex.files.filter((filePath) => {
      const vaultRelativePath = toPosix(path.relative(vaultRoot, filePath));
      const extension = path.posix.extname(vaultRelativePath);
      const withoutExtension = extension === "" ? vaultRelativePath : vaultRelativePath.slice(0, -extension.length);
      return withoutExtension === stemVariant || withoutExtension.endsWith(`/${stemVariant}`);
    });
    if (stemMatches.length === 1) return { status: "resolved", path: stemMatches[0] };
    if (stemMatches.length > 1) return { status: "ambiguous", matches: stemMatches };
  }
  return { status: "missing" };
}

async function auditLinks({ checkBasics }) {
  const vaultRoot = path.join(REPOSITORY_ROOT, "src");
  const allVaultFiles = await walkFiles(vaultRoot);
  const markdownFiles = allVaultFiles.filter((filePath) => filePath.endsWith(".md"));
  counts.markdown = markdownFiles.length;
  const targetIndex = createTargetIndex(allVaultFiles);
  const outgoing = new Map(markdownFiles.map((filePath) => [filePath, new Set()]));
  const incoming = new Map(markdownFiles.map((filePath) => [filePath, 0]));

  for (const filePath of markdownFiles) {
    const text = await readText(filePath, "markdown");
    if (text === null) continue;
    const links = inspectMarkdown(text, filePath, { checkBasics, collectLinks: true });
    for (const link of links) {
      counts.links += 1;
      const result = await resolveWikilink(filePath, link.raw, targetIndex);
      if (result.status === "resolved") {
        counts.resolvedLinks += 1;
        if (result.path.endsWith(".md") && outgoing.has(result.path)) {
          outgoing.get(filePath).add(result.path);
          if (result.path !== filePath) incoming.set(result.path, incoming.get(result.path) + 1);
        }
      } else if (result.status === "ambiguous") {
        counts.ambiguousLinks += 1;
        const candidates = result.matches.map(relativePath).sort(compareText).join(", ");
        addIssue("error", "links", filePath, `ambiguous wikilink '[[${link.raw}]]'; candidates: ${candidates}`, link.line);
      } else {
        counts.unresolvedLinks += 1;
        addIssue("error", "links", filePath, `unresolved wikilink '[[${link.raw}]]'`, link.line);
      }
    }
  }

  const mocFiles = markdownFiles.filter((filePath) => {
    const basename = path.basename(filePath).toLowerCase();
    return basename === "moc.md" || basename === "readme.md";
  });
  const covered = new Set(mocFiles);
  const queue = [...mocFiles];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const target of outgoing.get(current) ?? []) {
      if (!covered.has(target)) {
        covered.add(target);
        queue.push(target);
      }
    }
  }

  const mocSet = new Set(mocFiles);
  for (const filePath of markdownFiles) {
    if (mocSet.has(filePath)) continue;
    if ((incoming.get(filePath) ?? 0) === 0) {
      counts.orphans += 1;
      addIssue("warning", "coverage", filePath, "note has no incoming wikilink");
    }
    if (!covered.has(filePath)) {
      counts.uncovered += 1;
      addIssue("warning", "coverage", filePath, "note is not reachable from a MOC.md or README.md");
    }
  }
}

async function auditAnki() {
  const vaultRoot = path.join(REPOSITORY_ROOT, "src");
  const files = await walkFiles(vaultRoot, {
    filter: (filePath) => /(?:^|[-_])anki(?:[-_][^/]*)?\.(?:txt|tsv)$/i.test(path.basename(filePath)),
  });
  counts.ankiFiles = files.length;

  for (const filePath of files) {
    const text = await readText(filePath, "anki");
    if (text === null) continue;
    const lines = text.split(/\r?\n/);
    while (lines.length > 0 && lines.at(-1) === "") lines.pop();
    const expectedHeaders = ["#separator:tab", "#notetype:Basic", null, "#tags column:3"];
    for (let index = 0; index < expectedHeaders.length; index += 1) {
      const expected = expectedHeaders[index];
      const line = lines[index] ?? "";
      if (expected !== null && line !== expected) {
        addIssue("error", "anki", filePath, `line ${index + 1} must be exactly '${expected}'`, index + 1);
      } else if (expected === null && !/^#deck:\S(?:.*\S)?$/.test(line)) {
        addIssue("error", "anki", filePath, "line 3 must be a non-empty '#deck:<name>' header", 3);
      }
    }

    const questions = new Map();
    for (let index = 4; index < lines.length; index += 1) {
      const line = lines[index];
      if (line.trim() === "") {
        addIssue("error", "anki", filePath, "blank row inside Anki data", index + 1);
        continue;
      }
      const columns = line.split("\t");
      if (columns.length !== 3) {
        addIssue("error", "anki", filePath, `expected 3 tab-separated columns, found ${columns.length}`, index + 1);
        continue;
      }
      counts.ankiRows += 1;
      if (columns.some((column) => column.trim() === "")) {
        addIssue("error", "anki", filePath, "question, answer, and tags must all be non-empty", index + 1);
      }
      const normalizedQuestion = columns[0].trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
      if (questions.has(normalizedQuestion)) {
        addIssue("error", "anki", filePath, `duplicate question; first occurrence is line ${questions.get(normalizedQuestion)}`, index + 1);
      } else {
        questions.set(normalizedQuestion, index + 1);
      }
    }
    if (lines.length <= 4) addIssue("error", "anki", filePath, "export contains no card rows");
  }
}

function validateWorkflowFrontmatter(text, filePath, kind) {
  const frontmatter = parseFrontmatter(text);
  if (!frontmatter.present) {
    addIssue("error", "workflows", filePath, `${kind} is missing YAML frontmatter`, 1);
    return null;
  }
  if (!frontmatter.closed) {
    addIssue("error", "workflows", filePath, `${kind} frontmatter has no closing delimiter`, 1);
    return null;
  }
  for (const problem of frontmatter.problems) {
    addIssue("error", "workflows", filePath, problem.message, problem.line);
  }
  return frontmatter;
}

async function auditWorkflows() {
  const skillsRoot = path.join(REPOSITORY_ROOT, ".agents", "skills");
  const commandsRoot = path.join(REPOSITORY_ROOT, ".codex", "commands");
  const skillNames = new Map();

  if (!(await exists(skillsRoot))) {
    addIssue("error", "workflows", skillsRoot, "skills directory does not exist");
  } else {
    const entries = (await readdir(skillsRoot, { withFileTypes: true })).sort((left, right) => compareText(left.name, right.name));
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const skillFile = path.join(skillsRoot, entry.name, "SKILL.md");
      counts.skills += 1;
      if (!(await isFile(skillFile))) {
        addIssue("error", "workflows", path.join(skillsRoot, entry.name), "skill directory is missing SKILL.md");
        continue;
      }
      const text = await readText(skillFile, "workflows");
      if (text === null) continue;
      const frontmatter = validateWorkflowFrontmatter(text, skillFile, "skill");
      if (!frontmatter) continue;
      const nameField = frontmatter.fields.get("name");
      const descriptionField = frontmatter.fields.get("description");
      const name = nameField ? scalarValue(nameField.value) : "";
      const description = descriptionField ? scalarValue(descriptionField.value) : "";
      if (!nameField) addIssue("error", "workflows", skillFile, "skill metadata is missing 'name'", 1);
      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
        addIssue("error", "workflows", skillFile, `invalid skill name '${name}'`, nameField.line);
      } else if (name !== entry.name) {
        addIssue("error", "workflows", skillFile, `skill name '${name}' must match directory '${entry.name}'`, nameField.line);
      }
      if (!descriptionField || description === "") {
        addIssue("error", "workflows", skillFile, "skill metadata needs a non-empty 'description'", descriptionField?.line ?? 1);
      }
      if (name !== "") {
        if (skillNames.has(name)) {
          addIssue("error", "workflows", skillFile, `duplicate skill name; first declared in ${relativePath(skillNames.get(name))}`, nameField?.line);
        } else {
          skillNames.set(name, skillFile);
        }
      }
    }
  }

  if (!(await exists(commandsRoot))) {
    addIssue("error", "workflows", commandsRoot, "commands directory does not exist");
    return;
  }
  const commandFiles = await walkFiles(commandsRoot, { filter: (filePath) => filePath.endsWith(".md") });
  counts.commands = commandFiles.length;
  for (const filePath of commandFiles) {
    const text = await readText(filePath, "workflows");
    if (text === null) continue;
    const frontmatter = validateWorkflowFrontmatter(text, filePath, "command");
    if (frontmatter) {
      const description = frontmatter.fields.get("description");
      if (!description || scalarValue(description.value) === "") {
        addIssue("error", "workflows", filePath, "command metadata needs a non-empty 'description'", description?.line ?? 1);
      }
    }

    const primary = /\bUse the `([a-z0-9-]+)` skill\b/.exec(text);
    if (!primary) {
      addIssue("error", "workflows", filePath, "command must contain 'Use the `<name>` skill' entrypoint");
    } else if (!skillNames.has(primary[1])) {
      addIssue("error", "workflows", filePath, `command references missing skill '${primary[1]}'`);
    }
    const referenced = new Set();
    for (const match of text.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)*)`(?=\s+(?:skill|contracts?)\b)/g)) referenced.add(match[1]);
    for (const match of text.matchAll(/\buses `([a-z0-9]+(?:-[a-z0-9]+)*)`/g)) referenced.add(match[1]);
    for (const skillName of [...referenced].sort(compareText)) {
      if (!skillNames.has(skillName)) addIssue("error", "workflows", filePath, `command references missing skill '${skillName}'`);
    }
  }
}

async function parseJsonFile(filePath, category) {
  const text = await readText(filePath, category);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    addIssue("error", category, filePath, `invalid JSON: ${error.message}`);
    return null;
  }
}

async function hasAnyFile(directory, names) {
  for (const name of names) {
    if (await isFile(path.join(directory, name))) return true;
  }
  return false;
}

async function auditNodeProject(projectPath, kind) {
  const manifestPath = path.join(projectPath, "package.json");
  const manifest = await parseJsonFile(manifestPath, "projects");
  if (!manifest) return;
  if (Object.hasOwn(manifest, "workspaces")) addIssue("error", "projects", manifestPath, "standalone project must not declare npm workspaces");
  if (!(await hasAnyFile(projectPath, NODE_LOCKFILES))) {
    addIssue("error", "projects", projectPath, `Node project is missing a local lockfile (${NODE_LOCKFILES.join(", ")})`);
  }
  const scripts = manifest.scripts && typeof manifest.scripts === "object" ? manifest.scripts : {};
  for (const requiredScript of ["lint", "test"]) {
    if (typeof scripts[requiredScript] !== "string" || scripts[requiredScript].trim() === "") {
      addIssue("error", "projects", manifestPath, `Node project is missing a non-empty '${requiredScript}' script`);
    }
  }
  if (!Object.keys(scripts).some((name) => ["build", "dev", "start"].includes(name))) {
    addIssue("error", "projects", manifestPath, "Node project needs a 'build', 'dev', or 'start' script for its runnable entrypoint");
  }
  if (kind === "guided" && (typeof scripts.check !== "string" || scripts.check.trim() === "")) {
    addIssue("error", "projects", manifestPath, "guided Node project needs a targeted 'check' script");
  }

  const sourceFiles = await walkFiles(projectPath, { filter: (filePath) => /\.(?:ts|tsx|mts|cts)$/.test(filePath) });
  if (sourceFiles.length > 0 && !(await isFile(path.join(projectPath, "tsconfig.json")))) {
    addIssue("error", "projects", projectPath, "TypeScript project is missing project-local tsconfig.json");
  }

  for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    const dependencies = manifest[section];
    if (!dependencies || typeof dependencies !== "object") continue;
    for (const [name, version] of Object.entries(dependencies)) {
      if (typeof version === "string" && (/^workspace:/.test(version) || /^file:\.\.\//.test(version))) {
        addIssue("error", "projects", manifestPath, `${section}.${name} crosses the standalone package boundary ('${version}')`);
      }
    }
  }
}

async function auditProject(projectPath, kind) {
  counts.projects += 1;
  const manifests = [];
  for (const manifest of PROJECT_MANIFESTS) {
    if (await isFile(path.join(projectPath, manifest))) manifests.push(manifest);
  }
  if (manifests.length === 0) {
    addIssue("error", "projects", projectPath, `project has no native manifest (${PROJECT_MANIFESTS.join(", ")})`);
    return;
  }
  if (manifests.length > 1) {
    addIssue("error", "projects", projectPath, `project has multiple package boundaries: ${manifests.join(", ")}`);
  }
  if (!(await isFile(path.join(projectPath, ".gitignore")))) {
    addIssue("error", "projects", projectPath, "project is missing a project-local .gitignore");
  }
  if (kind === "guided" && !(await isFile(path.join(projectPath, "GUIDE.md")))) {
    addIssue("error", "projects", projectPath, "guided project is missing GUIDE.md");
  }

  const manifest = manifests[0];
  if (manifest === "package.json") {
    await auditNodeProject(projectPath, kind);
  } else if (manifest === "go.mod") {
    const goFiles = await walkFiles(projectPath, { filter: (filePath) => filePath.endsWith(".go") });
    if (!goFiles.some((filePath) => filePath.endsWith("_test.go"))) {
      addIssue("error", "projects", projectPath, "Go project has no project-local *_test.go file");
    }
  } else if (manifest === "Cargo.toml") {
    if (!(await isFile(path.join(projectPath, "Cargo.lock")))) {
      addIssue("error", "projects", projectPath, "Rust application is missing Cargo.lock");
    }
  } else if (manifest === "pyproject.toml") {
    if (!(await hasAnyFile(projectPath, PYTHON_LOCKFILES))) {
      addIssue("error", "projects", projectPath, `Python project is missing a local lockfile (${PYTHON_LOCKFILES.join(", ")})`);
    }
    const pythonTests = await walkFiles(projectPath, { filter: (filePath) => /(?:^|[/\\])test[^/\\]*\.py$/.test(filePath) });
    if (pythonTests.length === 0) addIssue("error", "projects", projectPath, "Python project has no project-local tests");
  }
}

async function auditProjects() {
  const rootManifestPath = path.join(REPOSITORY_ROOT, "package.json");
  if (await isFile(rootManifestPath)) {
    const rootManifest = await parseJsonFile(rootManifestPath, "projects");
    if (rootManifest && Object.hasOwn(rootManifest, "workspaces")) {
      addIssue("error", "projects", rootManifestPath, "root package must not register standalone projects as workspaces");
    }
  }

  for (const kind of ["examples", "guided"]) {
    const kindRoot = path.join(REPOSITORY_ROOT, "projects", kind);
    if (!(await exists(kindRoot))) continue;
    let entries;
    try {
      entries = await readdir(kindRoot, { withFileTypes: true });
    } catch (error) {
      addIssue("error", "projects", kindRoot, `cannot read project directory: ${error.message}`);
      continue;
    }
    entries.sort((left, right) => compareText(left.name, right.name));
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        await auditProject(path.join(kindRoot, entry.name), kind === "examples" ? "example" : "guided");
      }
    }
  }
}

async function auditEmptyContent() {
  const roots = [
    path.join(REPOSITORY_ROOT, "src"),
    path.join(REPOSITORY_ROOT, ".agents", "skills"),
    path.join(REPOSITORY_ROOT, ".codex", "commands"),
    path.join(REPOSITORY_ROOT, "projects"),
    path.join(REPOSITORY_ROOT, "scripts"),
  ];
  const candidates = [];
  for (const root of roots) {
    candidates.push(...(await walkFiles(root, { filter: (filePath) => CONTENT_EXTENSIONS.has(path.extname(filePath).toLowerCase()) })));
  }
  candidates.sort(compareText);
  counts.contentFiles = candidates.length;
  for (const filePath of candidates) {
    const text = await readText(filePath, "content");
    if (text !== null && text.trim() === "") addIssue("error", "content", filePath, "tracked-content candidate is empty");
  }
}

function printReport(scope) {
  const checked = [];
  if (scope === "full" || scope === "links") {
    checked.push(`${counts.markdown} Markdown files`);
    checked.push(
      `${counts.links} wikilinks (${counts.resolvedLinks} resolved, ${counts.unresolvedLinks} unresolved, ${counts.ambiguousLinks} ambiguous)`,
    );
    checked.push(`${counts.orphans} orphans`);
    checked.push(`${counts.uncovered} outside MOCs`);
  }
  if (scope === "full" || scope === "anki") checked.push(`${counts.ankiFiles} Anki files / ${counts.ankiRows} rows`);
  if (scope === "full" || scope === "workflows") checked.push(`${counts.skills} skills / ${counts.commands} commands`);
  if (scope === "full" || scope === "projects") checked.push(`${counts.projects} standalone projects`);
  if (scope === "full") checked.push(`${counts.contentFiles} content candidates`);

  const ordered = [...issues].sort((left, right) => {
    return (
      compareText(left.severity, right.severity) ||
      compareText(left.category, right.category) ||
      compareText(left.path, right.path) ||
      (left.line ?? 0) - (right.line ?? 0) ||
      compareText(left.message, right.message)
    );
  });
  const errors = ordered.filter((issue) => issue.severity === "error");
  const warnings = ordered.filter((issue) => issue.severity === "warning");

  console.log(`Vault audit (${scope})`);
  console.log(`Checked: ${checked.join(", ")}`);
  console.log("");
  console.log(`Errors (${errors.length})`);
  if (errors.length === 0) console.log("  none");
  for (const issue of errors) {
    const location = issue.line ? `${issue.path}:${issue.line}` : issue.path;
    console.log(`  [${issue.category}] ${location} — ${issue.message}`);
  }
  console.log("");
  console.log(`Warnings (${warnings.length})`);
  if (warnings.length === 0) console.log("  none");
  for (const issue of warnings) {
    const location = issue.line ? `${issue.path}:${issue.line}` : issue.path;
    console.log(`  [${issue.category}] ${location} — ${issue.message}`);
  }
  console.log("");
  console.log(errors.length === 0 ? "Result: PASS" : `Result: FAIL (${errors.length} contract violation${errors.length === 1 ? "" : "s"})`);
  return errors.length;
}

async function main() {
  const argumentsList = process.argv.slice(2);
  if (argumentsList.length === 1 && (argumentsList[0] === "--help" || argumentsList[0] === "-h")) {
    console.log(usage());
    return 0;
  }
  if (argumentsList.length > 1 || (argumentsList.length === 1 && !VALID_SCOPES.has(argumentsList[0]))) {
    console.error(`Invalid audit scope${argumentsList.length === 1 ? ` '${argumentsList[0]}'` : ""}.`);
    console.error(usage());
    return 2;
  }

  const scope = argumentsList[0] ?? "full";
  if (scope === "full" || scope === "links") await auditLinks({ checkBasics: scope === "full" });
  if (scope === "full" || scope === "anki") await auditAnki();
  if (scope === "full" || scope === "workflows") await auditWorkflows();
  if (scope === "full" || scope === "projects") await auditProjects();
  if (scope === "full") await auditEmptyContent();
  return printReport(scope) === 0 ? 0 : 1;
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(`Vault audit failed unexpectedly: ${error.stack ?? error.message}`);
  process.exitCode = 2;
}
