import { useState } from 'react';
import { createGist, fetchFromGist } from '../utils/gistSync';

export default function SettingsModal({ settings, onSave, onDisconnect, onCancel }) {
  const [pat, setPat] = useState(settings.pat || '');
  const [gistId, setGistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isConnected = !!settings.gistId;

  async function handleConnect() {
    if (!pat.trim()) { setError('トークンを入力してください'); return; }
    setLoading(true);
    setError('');
    try {
      let id = gistId.trim();
      if (!id) {
        id = await createGist(pat.trim());
      } else {
        await fetchFromGist(pat.trim(), id);
      }
      onSave({ pat: pat.trim(), gistId: id });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-sheet">
        <div className="modal-title">GitHub 同期設定</div>

        {isConnected ? (
          <div className="settings-body">
            <div className="settings-connected-msg">✓ GitHub Gist に接続済みです</div>
            <div className="settings-gist-id">Gist ID: <code>{settings.gistId}</code></div>
          </div>
        ) : (
          <div className="settings-body">
            <p className="settings-desc">
              GitHub の Personal Access Token（gist スコープ）を入力してください。
            </p>
            <label className="settings-label">Personal Access Token</label>
            <input
              className="settings-input"
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={pat}
              onChange={e => { setPat(e.target.value); setError(''); }}
            />
            <label className="settings-label">Gist ID（既存データを引き継ぐ場合のみ）</label>
            <input
              className="settings-input"
              type="text"
              placeholder="空白のとき自動で新規作成"
              value={gistId}
              onChange={e => setGistId(e.target.value)}
            />
            {error && <div className="settings-error">{error}</div>}
          </div>
        )}

        <div className="modal-actions">
          {isConnected ? (
            <>
              <button className="btn-clear" onClick={onDisconnect}>接続解除</button>
              <button className="btn-confirm" onClick={onCancel}>閉じる</button>
            </>
          ) : (
            <>
              <button className="btn-cancel" onClick={onCancel}>キャンセル</button>
              <button className="btn-confirm" onClick={handleConnect} disabled={loading}>
                {loading ? '接続中...' : '接続'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
