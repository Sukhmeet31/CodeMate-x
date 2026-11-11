export const LIMITS = { files: 120, fileBytes: 128 * 1024, totalBytes: 3 * 1024 * 1024 };
const encoder = new TextEncoder();
const excludedParts =
  /(^|\/)(node_modules|\.git|dist|build|coverage|\.next|\.venv|vendor|\.cache)(\/|$)/i;
const secretName =
  /(^|\/)(\.env(?!\.example$|\.sample$)[^/]*|[^/]*(?:credentials|secrets?)[^/]*|id_rsa|id_ed25519)$|\.(pem|key|p12|pfx)$/i;
const textName =
  /\.(js|jsx|ts|tsx|mjs|cjs|json|html|css|scss|sass|less|md|mdx|txt|yml|yaml|toml|py|go|rs|java|sql|vue|svelte|sh|rb|php|c|cpp|h|xml|svg)$/i;
const lockName = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$/;
export const byteLength = (text) => encoder.encode(text).length;
export const containsPrivateKey = (text) =>
  /-----BEGIN [A-Z ]*PRIVATE KEY(?: BLOCK)?-----/.test(text);

export function safePath(path) {
  if (
    typeof path !== 'string' ||
    !path ||
    path.length > 300 ||
    /[\x00-\x1f:]/.test(path) ||
    path.startsWith('/') ||
    path.startsWith('\\') ||
    path.split(/[\\/]/).some((p) => !p || p === '.' || p === '..')
  )
    throw new Error('Invalid source file path.');
  return path.replaceAll('\\', '/');
}

export function isSourcePath(path) {
  return (
    !excludedParts.test(path) &&
    !secretName.test(path) &&
    !lockName.test(path) &&
    (textName.test(path) ||
      /(^|\/)(Dockerfile|Makefile|\.gitignore|\.env\.example|\.env\.sample)$/i.test(path))
  );
}

export function normalizeFiles(input) {
  if (!Array.isArray(input) || input.length > 20000)
    throw new Error('Choose a smaller project folder.');
  const files = [];
  const paths = new Set();
  let excluded = 0;
  let total = 0;
  for (const entry of input) {
    const path = safePath(entry?.path);
    if (!isSourcePath(path)) {
      excluded++;
      continue;
    }
    if (typeof entry.content !== 'string') throw new Error(`Expected text in ${path}.`);
    const bytes = byteLength(entry.content);
    if (
      bytes > LIMITS.fileBytes ||
      entry.content.includes('\0') ||
      containsPrivateKey(entry.content)
    ) {
      excluded++;
      continue;
    }
    if (paths.has(path)) throw new Error(`Duplicate file path: ${path}`);
    paths.add(path);
    total += bytes;
    if (total > LIMITS.totalBytes)
      throw new Error('Projects can contain up to 3 MiB of source text.');
    files.push({ path, content: entry.content });
    if (files.length > LIMITS.files) throw new Error('Import up to 120 source files at a time.');
  }
  if (!files.length)
    throw new Error(
      'No supported source files found. Choose a folder containing code or documentation.',
    );
  return { files: files.sort((a, b) => a.path.localeCompare(b.path)), excluded, totalBytes: total };
}

function mission(id, title, description, priority, evidence, steps) {
  return { id, title, description, priority, evidence, steps, status: 'todo', note: '' };
}

export function analyzeProject(files) {
  const paths = files.map((f) => f.path);
  const missions = [];
  const stack = new Set();
  const commands = [];
  const manifests = files.filter((f) => /(^|\/)package\.json$/.test(f.path));
  for (const f of manifests) {
    try {
      const pkg = JSON.parse(f.content);
      if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg))
        throw new Error('invalid manifest');
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const [key, name] of Object.entries({
        react: 'React',
        next: 'Next.js',
        vite: 'Vite',
        express: 'Express',
        vue: 'Vue',
        svelte: 'Svelte',
        typescript: 'TypeScript',
      }))
        if (deps[key]) stack.add(name);
      const dir = f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/')) : '.';
      for (const [name, script] of Object.entries(pkg.scripts || {}))
        if (typeof script === 'string')
          commands.push({ name, script, directory: dir, path: f.path });
    } catch {
      missions.push(
        mission(
          `manifest:${f.path}`,
          'Repair the package manifest',
          `${f.path} could not be parsed as a package object. Dependency installation needs a valid manifest.`,
          'high',
          [{ path: f.path, line: 1, detail: 'Invalid package JSON' }],
          [
            'Open the manifest and correct its JSON syntax.',
            'Confirm the package name, dependencies, and scripts.',
            'Run your package manager locally to check the result.',
          ],
        ),
      );
    }
  }
  if (paths.some((p) => /\.tsx?$/.test(p))) stack.add('TypeScript');
  if (paths.some((p) => /\.py$/.test(p))) stack.add('Python');
  if (!stack.size && paths.some((p) => /\.[cm]?jsx?$/.test(p))) stack.add('JavaScript');
  const readme = paths.find((p) => /(^|\/)readme(?:\.md|\.txt)?$/i.test(p));
  const tests = paths.find((p) =>
    /(^|\/)(__tests__|tests?|specs?)\/|[.-](test|spec)\.[a-z]+$/i.test(p),
  );
  const ci = paths.find((p) => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p));
  const environment = files.some((f) => /process\.env\.|import\.meta\.env\./.test(f.content));
  const envDoc = paths.find((p) => /(^|\/)\.env\.(example|sample)$/.test(p));
  const checks = [
    { id: 'readme', label: 'Project guide', found: !!readme, path: readme },
    { id: 'tests', label: 'Test files', found: !!tests, path: tests },
    {
      id: 'scripts',
      label: 'Build or run script',
      found: commands.some((c) => ['build', 'dev', 'start'].includes(c.name)),
      path: commands.find((c) => ['build', 'dev', 'start'].includes(c.name))?.path,
    },
    { id: 'ci', label: 'CI workflow', found: !!ci, path: ci },
  ];
  if (!readme)
    missions.push(
      mission(
        'missing-readme',
        'Write the project restart guide',
        'No README was found in the imported files. Capture what the project does and how to get it running.',
        'medium',
        [],
        [
          'Add a README.md with the purpose and current state.',
          'Document installation, configuration, and start commands.',
          'Write down the next unfinished feature.',
        ],
      ),
    );
  if (!tests)
    missions.push(
      mission(
        'missing-tests',
        'Protect the first working flow',
        'No test files were detected in the imported source. Start with the most important user journey.',
        'high',
        [],
        [
          'Choose one behavior the project needs to get right.',
          'Add a regression test for its success and failure paths.',
          'Run that test locally and record the result in your notes.',
        ],
      ),
    );
  if (!checks[2].found)
    missions.push(
      mission(
        'missing-scripts',
        'Make the project easy to run',
        'No build, dev, or start script was found in the imported package manifests.',
        'high',
        manifests.map((f) => ({
          path: f.path,
          line: 1,
          detail: 'No build/dev/start script detected',
        })),
        [
          'Identify the application entry point.',
          'Add a repeatable development command and document it.',
          'Run the command locally and note any setup issues.',
        ],
      ),
    );
  if (environment && !envDoc)
    missions.push(
      mission(
        'missing-env',
        'Document the environment setup',
        'Source refers to environment variables, but no .env.example or .env.sample was imported.',
        'medium',
        files
          .filter((f) => /process\.env\.|import\.meta\.env\./.test(f.content))
          .slice(0, 3)
          .map((f) => ({
            path: f.path,
            line:
              f.content.split('\n').findIndex((l) => /process\.env\.|import\.meta\.env\./.test(l)) +
              1,
            detail: 'Environment variables referenced',
          })),
        [
          'List the configuration variables the app reads.',
          'Add an .env.example with placeholder values only.',
          'Document where developers obtain their own credentials.',
        ],
      ),
    );
  if (!ci)
    missions.push(
      mission(
        'missing-ci',
        'Make future changes easier to trust',
        'No GitHub Actions workflow was found in the imported files. Automate checks after the local workflow is reliable.',
        'low',
        [],
        [
          'Confirm the local build and test commands.',
          'Add a workflow that installs dependencies and runs those checks.',
          'Inspect the first run on GitHub before calling it verified.',
        ],
      ),
    );
  for (const f of files.filter((f) =>
    /\.(jsx?|tsx?|mjs|cjs|py|vue|svelte|go|rs|java)$/.test(f.path),
  )) {
    const lines = f.content.split('\n');
    const placeholder = lines.findIndex((l) =>
      /No commands available yet|once this screen is connected to real persistence|once they are loaded from a real source|Connect real tracking or persistence|when real account data is available/i.test(
        l,
      ),
    );
    if (placeholder >= 0 && missions.filter((m) => m.id.startsWith('placeholder:')).length < 12)
      missions.push(
        mission(
          `placeholder:${f.path}`,
          'Connect an unfinished screen',
          `The text in ${f.path} explicitly describes an unfinished data connection. Review the surrounding implementation.`,
          'high',
          [
            {
              path: f.path,
              line: placeholder + 1,
              detail: lines[placeholder].trim().slice(0, 220),
            },
          ],
          [
            'Identify what data and actions this screen should support.',
            'Connect one complete user flow and handle empty/error states.',
            'Test it with real data, update the placeholder copy, and rescan.',
          ],
        ),
      );
    const index = lines.findIndex((l) => /(?:\/\/|#|\/\*|^\s*\*)\s*(TODO|FIXME)\b/i.test(l));
    if (index >= 0 && missions.filter((m) => m.id.startsWith('todo:')).length < 12)
      missions.push(
        mission(
          `todo:${f.path}`,
          'Resolve an unfinished implementation',
          `A TODO or FIXME in ${f.path} identifies work to revisit.`,
          'medium',
          [{ path: f.path, line: index + 1, detail: lines[index].trim().slice(0, 220) }],
          [
            'Read the surrounding implementation and the comment.',
            'Define the expected behavior and add a test when appropriate.',
            'Complete the behavior, remove the comment, and rescan.',
          ],
        ),
      );
  }
  const order = { high: 0, medium: 1, low: 2 };
  missions.sort((a, b) => order[a.priority] - order[b.priority]);
  return {
    stack: [...stack],
    checks,
    commands,
    missions,
    verification: 'not-run',
    scannedAt: new Date().toISOString(),
    fileCount: files.length,
  };
}

export function createProject({ name, files, source = { type: 'local' } }) {
  const normalized = normalizeFiles(files);
  const assessment = analyzeProject(normalized.files);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name:
      String(name || 'Untitled project')
        .trim()
        .slice(0, 80) || 'Untitled project',
    files: normalized.files,
    baseline: {
      kind: 'import',
      capturedAt: now,
      files: normalized.files.map((f) => ({ ...f })),
    },
    source,
    excluded: normalized.excluded,
    assessment: { ...assessment, missions: undefined },
    missions: assessment.missions,
    createdAt: now,
    updatedAt: now,
    activity: [{ id: crypto.randomUUID(), text: 'Project imported and source assessed', at: now }],
  };
}

export function rescanProject(project) {
  const assessment = analyzeProject(project.files);
  const missions = assessment.missions.map((m) => {
    const old = project.missions.find((x) => x.id === m.id);
    return old ? { ...m, status: old.status, note: old.note } : m;
  });
  return { ...project, assessment: { ...assessment, missions: undefined }, missions };
}

export function progress(project) {
  const total = project?.missions.length || 0;
  const done = project?.missions.filter((m) => m.status === 'done').length || 0;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function validateBackup(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.projects) || value.projects.length > 20)
    throw new Error('Invalid workspace backup (version 1 expected, up to 20 projects).');
  const ids = new Set();
  const projects = value.projects.map((p) => {
    if (
      !p ||
      typeof p.id !== 'string' ||
      p.id.length > 100 ||
      !p.id ||
      typeof p.name !== 'string' ||
      !p.name.trim() ||
      p.name.length > 80
    )
      throw new Error('Invalid project in backup.');
    if (ids.has(p.id)) throw new Error('Duplicate project ID in backup.');
    ids.add(p.id);
    const normalized = normalizeFiles(p.files);
    if (normalized.excluded) throw new Error('Backup contains unsupported or excluded files.');
    if (
      !Array.isArray(p.missions) ||
      p.missions.length > 200 ||
      p.missions.some(
        (m) =>
          !m ||
          typeof m.id !== 'string' ||
          !['todo', 'in-progress', 'done'].includes(m.status) ||
          typeof m.note !== 'string' ||
          m.note.length > 10000,
      )
    )
      throw new Error('Invalid mission data in backup.');
    if (new Set(p.missions.map((m) => m.id)).size !== p.missions.length)
      throw new Error('Duplicate mission IDs in backup.');
    const string = (text, max, empty = true) => {
      if (typeof text !== 'string' || text.length > max || (!empty && !text))
        throw new Error('Invalid text in backup.');
      return text;
    };
    const list = (items, max) => {
      if (!Array.isArray(items) || items.length > max) throw new Error('Invalid list in backup.');
      return items;
    };
    const date = (text) => {
      if (typeof text !== 'string' || Number.isNaN(Date.parse(text)))
        throw new Error('Invalid date in backup.');
      return text;
    };
    let baseline;
    if (p.baseline === undefined) {
      baseline = {
        kind: 'saved',
        capturedAt: date(p.updatedAt),
        files: normalized.files.map((f) => ({ ...f })),
      };
    } else {
      if (!p.baseline || !['import', 'saved'].includes(p.baseline.kind))
        throw new Error('Invalid comparison baseline in backup.');
      const originals = normalizeFiles(p.baseline.files);
      const currentPaths = new Set(normalized.files.map((f) => f.path));
      if (originals.excluded || originals.files.some((f) => !currentPaths.has(f.path)))
        throw new Error('Backup contains excluded or missing baseline files.');
      baseline = {
        kind: p.baseline.kind,
        capturedAt: date(p.baseline.capturedAt),
        files: originals.files,
      };
    }
    const missions = p.missions.map((m) => {
      if (!['high', 'medium', 'low'].includes(m.priority))
        throw new Error('Invalid mission priority in backup.');
      return {
        id: string(m.id, 512, false),
        title: string(m.title, 300, false),
        description: string(m.description, 4000),
        priority: m.priority,
        status: m.status,
        note: m.note,
        steps: list(m.steps, 20).map((s) => string(s, 2000)),
        evidence: list(m.evidence, 120).map((e) => {
          if (!Number.isInteger(e.line) || e.line < 1)
            throw new Error('Invalid evidence in backup.');
          return { path: safePath(e.path), line: e.line, detail: string(e.detail, 1000) };
        }),
      };
    });
    if (!p.source || !['local', 'sample', 'github', 'restored'].includes(p.source.type))
      throw new Error('Invalid source in backup.');
    const source = { type: p.source.type };
    if (source.type === 'github') {
      if (
        typeof p.source.repository !== 'string' ||
        !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(p.source.repository)
      )
        throw new Error('Invalid GitHub source in backup.');
      Object.assign(source, {
        repository: p.source.repository,
        url: `https://github.com/${p.source.repository}`,
        branch: string(p.source.branch, 250, false),
        commit: string(p.source.commit, 64, false),
      });
    }
    const a = p.assessment;
    if (!a || a.verification !== 'not-run') throw new Error('Invalid assessment in backup.');
    const assessment = {
      stack: list(a.stack, 30).map((s) => string(s, 50)),
      checks: list(a.checks, 20).map((c) => {
        if (typeof c.found !== 'boolean') throw new Error('Invalid presence check in backup.');
        return {
          id: string(c.id, 100, false),
          label: string(c.label, 150, false),
          found: c.found,
          ...(c.path ? { path: safePath(c.path) } : {}),
        };
      }),
      commands: list(a.commands, 1000).map((c) => ({
        name: string(c.name, 200, false),
        script: string(c.script, 10000),
        directory: c.directory === '.' ? '.' : safePath(c.directory),
        path: safePath(c.path),
      })),
      verification: 'not-run',
      scannedAt: date(a.scannedAt),
      fileCount: a.fileCount,
    };
    if (!Number.isInteger(a.fileCount) || a.fileCount < 0 || a.fileCount > 120)
      throw new Error('Invalid assessment scope in backup.');
    const activity = list(p.activity || [], 100).map((event) => ({
      id: string(event.id, 100, false),
      text: string(event.text, 1000),
      at: date(event.at),
    }));
    return {
      id: p.id,
      name: p.name,
      files: normalized.files,
      baseline,
      source,
      excluded: Number.isInteger(p.excluded) && p.excluded >= 0 ? p.excluded : 0,
      assessment,
      missions,
      createdAt: date(p.createdAt),
      updatedAt: date(p.updatedAt),
      activity,
    };
  });
  const settings = { fontSize: 14 };
  if (value.settings?.fontSize !== undefined) {
    if (
      !Number.isInteger(value.settings.fontSize) ||
      value.settings.fontSize < 12 ||
      value.settings.fontSize > 20
    )
      throw new Error('Invalid editor settings in backup.');
    settings.fontSize = value.settings.fontSize;
  }
  return {
    version: 1,
    projects,
    activeProjectId: ids.has(value.activeProjectId)
      ? value.activeProjectId
      : projects[0]?.id || null,
    settings,
  };
}
