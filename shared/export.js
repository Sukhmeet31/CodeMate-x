import { zipSync, strToU8 } from 'fflate';
import { analyzeProject, validateBackup } from './project.js';
import { getChanges } from './changes.js';

export function exportName(name) {
  const slug = String(name)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return `codemate-${slug || 'project'}`;
}

function checkedProject(project) {
  return validateBackup({ version: 1, projects: [project], activeProjectId: project.id })
    .projects[0];
}

export function sourceArchive(project) {
  const p = checkedProject(project);
  const root = exportName(p.name);
  const entries = Object.create(null);
  for (const file of p.files) entries[`${root}/${file.path}`] = strToU8(file.content);
  return { name: `${root}-source.zip`, bytes: zipSync(entries, { level: 6 }) };
}

const literal = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/([\\`*_{}\[\]()#+.!|\-])/g, '\\$1')
    .replace(/[\r\n]+/g, ' ');
const codeBlock = (value) =>
  String(value)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n');

export function rescueReport(project, now = new Date().toISOString()) {
  const p = checkedProject(project);
  const changes = getChanges(p);
  const commands = analyzeProject(p.files).commands;
  const lines = [
    `# Rescue report: ${literal(p.name)}`,
    '',
    `Generated: ${now}`,
    '',
    '## Project and source',
    '',
    `- Source: ${literal(p.source.type)}`,
    ...(p.source.type === 'github'
      ? [
          `- Repository: ${literal(p.source.repository)} (${p.source.url})`,
          `- Branch: ${literal(p.source.branch)}`,
          `- Imported commit: ${literal(p.source.commit)}`,
        ]
      : []),
    `- Comparison: ${p.baseline.kind === 'import' ? 'Imported original' : 'Saved starting point'} (${literal(p.baseline.capturedAt)})`,
    `- Current source: ${p.files.length} files; ${p.excluded} entries excluded at import`,
    '',
    'The source ZIP is the imported source subset, including current edits and added files. It does not include excluded assets, lockfiles, dependencies, or Git history. Known secret filenames and private-key blocks are excluded; credentials embedded in ordinary source may remain. Review files before sharing.',
    '',
    'Builds and tests were not run. Downloading does not update GitHub or prove that the project runs.',
    '',
    '## Source changes',
    '',
    ...(changes.length
      ? changes.map((f) => `- ${literal(f.path)} — ${f.status}`)
      : ['No source changes since the comparison starting point.']),
    '',
    '## Rescue missions',
    '',
    `Mission statuses are manually tracked. Last source assessment: ${literal(p.assessment.scannedAt)}. Rescan in the studio after edits to refresh findings.`,
    '',
  ];
  for (const mission of p.missions) {
    lines.push(
      `### ${literal(mission.title)}`,
      '',
      `Status: ${mission.status} · Priority: ${mission.priority}`,
      '',
      literal(mission.description),
      '',
    );
    if (mission.evidence.length) {
      lines.push('Evidence from the last assessment:', '');
      for (const evidence of mission.evidence) {
        lines.push(`- ${literal(evidence.path)}:${evidence.line} — ${literal(evidence.detail)}`);
      }
      lines.push('');
    }
    if (mission.steps.length)
      lines.push('Suggested steps:', '', ...mission.steps.map((s) => `- ${literal(s)}`), '');
    if (mission.note) lines.push('Your notes:', '', codeBlock(mission.note), '');
  }
  lines.push(
    '## Scripts in current source',
    '',
    'Review these scripts before running them in your own checkout. They have not been executed by CodeMate-X.',
    '',
  );
  if (!commands.length) lines.push('No package scripts found.', '');
  for (const command of commands) {
    lines.push(
      `### ${literal(command.path)} — ${literal(command.name)}`,
      '',
      `Directory: ${literal(command.directory)}`,
      '',
      codeBlock(command.script),
      '',
    );
  }
  return lines.join('\n');
}
