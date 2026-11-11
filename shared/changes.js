import { normalizeFiles, safePath } from './project.js';

export function getChanges(project) {
  const originals = new Map((project.baseline?.files || project.files).map((f) => [f.path, f.content]));
  return project.files.flatMap((file) => {
    const original = originals.get(file.path);
    if (original === file.content) return [];
    return [{
      path: file.path,
      status: originals.has(file.path) ? 'modified' : 'added',
      original: original ?? '',
      current: file.content,
    }];
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function checkedFiles(files) {
  const result = normalizeFiles(files);
  if (result.excluded) throw new Error('Unsupported or excluded content cannot be stored.');
  return result.files;
}

export function putFile(project, file) {
  const path = safePath(file.path);
  const next = { path, content: file.content };
  const files = project.files.some((f) => f.path === path)
    ? project.files.map((f) => f.path === path ? next : f)
    : [...project.files, next];
  return { ...project, files: checkedFiles(files) };
}

export function restoreFile(project, path) {
  if (!project.baseline) throw new Error('A comparison starting point is required. Reload the workspace.');
  if (!project.files.some((f) => f.path === path)) throw new Error('This file is no longer in the project.');
  const original = project.baseline.files.find((f) => f.path === path);
  return original
    ? putFile(project, original)
    : { ...project, files: checkedFiles(project.files.filter((f) => f.path !== path)) };
}
