export async function request(path, body) {
  let response;
  try {
    response = await fetch(path, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(55000),
    });
  } catch (error) {
    throw new Error(
      error.name === 'TimeoutError'
        ? 'This request took too long. Please retry.'
        : 'The project API is unreachable. Check your connection and retry. For a local checkout, start npm run dev.',
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      'The project API returned an unexpected response. Please retry; for a local checkout, check that the server is running.',
    );
  }
  if (!response.ok) throw new Error(data.error || 'The request failed. Please retry.');
  return data;
}
export function download(name, content, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function timeLabel(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
