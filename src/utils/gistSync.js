const SETTINGS_KEY = 'attendance_gist_settings';
const GIST_FILENAME = 'attendance_data.json';

export function loadGistSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { pat: '', gistId: '' };
  } catch {
    return { pat: '', gistId: '' };
  }
}

export function saveGistSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function createGist(pat) {
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: '出勤簿データ',
      public: false,
      files: { [GIST_FILENAME]: { content: '{}' } },
    }),
  });
  if (!res.ok) throw new Error(`接続に失敗しました (${res.status})`);
  const json = await res.json();
  return json.id;
}

export async function fetchFromGist(pat, gistId) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: { Authorization: `Bearer ${pat}` },
  });
  if (!res.ok) throw new Error(`データ取得に失敗しました (${res.status})`);
  const json = await res.json();
  const content = json.files[GIST_FILENAME]?.content;
  return content ? JSON.parse(content) : {};
}

export async function pushToGist(pat, gistId, data) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { [GIST_FILENAME]: { content: JSON.stringify(data) } },
    }),
  });
  if (!res.ok) throw new Error(`同期に失敗しました (${res.status})`);
}
