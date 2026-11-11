import { request } from './api.js';
import { importGithub } from '../../../server/github.js';

export async function importPublicProject(
  repository,
  { requestApi = request, fetchImpl = fetch } = {},
) {
  try {
    return (await requestApi('/api/import/github', { repository })).project;
  } catch (error) {
    if (!error.message.startsWith('GitHub rate limit reached.')) throw error;
    // Public GitHub supports CORS. Use the visitor's connection when the shared
    // host reaches its unauthenticated quota; the same source limits still apply.
    try {
      return await importGithub(repository, { fetchImpl, userAgent: null });
    } catch (fallbackError) {
      if (fallbackError instanceof TypeError)
        throw new Error(
          'GitHub is unreachable from this browser. Retry later or import a local folder.',
        );
      throw fallbackError;
    }
  }
}
