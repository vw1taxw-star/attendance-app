import { useState, useEffect, useRef } from 'react';
import {
  getPeriodDates, getCurrentPeriod, formatDate, getDayName,
  isWeekend, isSaturday, isSunday, formatPeriodLabel,
} from './utils/dateUtils';
import { loadData, saveData, getPeriodKey } from './utils/storage';
import {
  loadGistSettings, saveGistSettings, fetchFromGist, pushToGist,
} from './utils/gistSync';
import TimePickerModal from './components/TimePickerModal';
import PrintView from './components/PrintView';
import SettingsModal from './components/SettingsModal';

const today = formatDate(new Date());

export default function App() {
  const [period, setPeriod] = useState(getCurrentPeriod);
  const [allData, setAllData] = useState(loadData);
  const [picker, setPicker] = useState(null);
  const [gistSettings, setGistSettings] = useState(loadGistSettings);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error
  const [showSettings, setShowSettings] = useState(false);
  const skipNextSync = useRef(false);
  const syncTimer = useRef(null);

  const periodKey = getPeriodKey(period.year, period.month);
  const periodData = allData[periodKey] || {};
  const dates = getPeriodDates(period.year, period.month);

  // 起動時に Gist からデータを読み込む
  useEffect(() => {
    const { pat, gistId } = gistSettings;
    if (!pat || !gistId) return;
    setSyncStatus('syncing');
    fetchFromGist(pat, gistId)
      .then(data => {
        skipNextSync.current = true;
        setAllData(data);
        saveData(data);
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2000);
      })
      .catch(() => setSyncStatus('error'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // データ変更時に Gist へ遅延同期
  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    const { pat, gistId } = gistSettings;
    if (!pat || !gistId) return;

    setSyncStatus('pending');
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        await pushToGist(pat, gistId, allData);
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch {
        setSyncStatus('error');
      }
    }, 1500);
  }, [allData]); // eslint-disable-line react-hooks/exhaustive-deps

  function getEntry(ds) {
    return periodData[ds] || null;
  }

  function updateEntry(ds, updates) {
    const existing = getEntry(ds) || { start: '07:30', end: '17:00', paidLeave: false };
    const newEntry = { ...existing, ...updates };
    const newAll = {
      ...allData,
      [periodKey]: { ...periodData, [ds]: newEntry },
    };
    setAllData(newAll);
    saveData(newAll);
  }

  function prevPeriod() {
    setPeriod(p => p.month === 1 ? { year: p.year - 1, month: 12 } : { year: p.year, month: p.month - 1 });
  }

  function nextPeriod() {
    setPeriod(p => p.month === 12 ? { year: p.year + 1, month: 1 } : { year: p.year, month: p.month + 1 });
  }

  function handleSettingsSave(newSettings) {
    setGistSettings(newSettings);
    saveGistSettings(newSettings);
    setShowSettings(false);
    setSyncStatus('syncing');
    fetchFromGist(newSettings.pat, newSettings.gistId)
      .then(data => {
        skipNextSync.current = true;
        setAllData(data);
        saveData(data);
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2000);
      })
      .catch(() => setSyncStatus('error'));
  }

  function handleDisconnect() {
    const cleared = { pat: '', gistId: '' };
    setGistSettings(cleared);
    saveGistSettings(cleared);
    setSyncStatus('idle');
    setShowSettings(false);
  }

  let workedDays = 0;
  let paidLeaveDays = 0;

  dates.forEach(d => {
    const ds = formatDate(d);
    const entry = periodData[ds];
    if (entry?.paidLeave) {
      paidLeaveDays++;
    } else if (entry?.start && entry?.end) {
      workedDays++;
    }
  });

  const syncLabel = { pending: '...', syncing: '同期中', synced: '✓', error: '⚠' }[syncStatus] ?? '';
  const isConnected = !!gistSettings.gistId;

  return (
    <div className="app">
      <PrintView period={period} dates={dates} periodData={periodData} />

      <div className="screen-only">
        <div className="header">
          <h1>出勤簿</h1>
          <div className="period-nav">
            <button onClick={prevPeriod}>‹</button>
            <span className="period-label">{formatPeriodLabel(period.year, period.month)}</span>
            <button onClick={nextPeriod}>›</button>
          </div>
          <div className="header-right">
            {isConnected && syncLabel && (
              <span className={`sync-status sync-${syncStatus}`}>{syncLabel}</span>
            )}
            <button
              className={`settings-btn${isConnected ? ' settings-btn-active' : ''}`}
              onClick={() => setShowSettings(true)}
              title="同期設定"
            >⚙</button>
            <button className="pdf-btn" onClick={() => window.print()}>PDF出力</button>
          </div>
        </div>

        <div className="summary">
          <div className="summary-card">
            <div className="value">{workedDays}</div>
            <div className="label">出勤日数</div>
          </div>
          <div className="summary-card">
            <div className="value">{paidLeaveDays}</div>
            <div className="label">有給休暇</div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <span>日付</span>
            <span>出発</span>
            <span>到着</span>
            <span title="有給休暇">有給</span>
            <span>備考</span>
          </div>

          {dates.map(d => {
            const ds = formatDate(d);
            const entry = getEntry(ds);
            const paidLeave = entry?.paidLeave || false;
            const start = entry?.start || '';
            const end = entry?.end || '';
            const weekend = isWeekend(d);
            const sat = isSaturday(d);
            const sun = isSunday(d);
            const isToday = ds === today;

            let rowClass = 'attendance-row';
            if (isToday) rowClass += ' row-today';
            else if (paidLeave) rowClass += ' row-paid';
            else if (weekend) rowClass += ' row-weekend';

            return (
              <div key={ds} className={rowClass}>
                <div className="date-cell">
                  <span className="date-num">{d.getDate()}</span>
                  <span className={`day-badge${sat ? ' day-sat' : sun ? ' day-sun' : ''}`}>
                    {getDayName(d)}
                  </span>
                </div>

                <button
                  className={`time-btn${paidLeave ? ' time-disabled' : ''}`}
                  onClick={() => !paidLeave && setPicker({ ds, field: 'start', value: start })}
                  disabled={paidLeave}
                >
                  {paidLeave ? '—' : (start || '- - : - -')}
                </button>

                <button
                  className={`time-btn${paidLeave ? ' time-disabled' : ''}`}
                  onClick={() => !paidLeave && setPicker({ ds, field: 'end', value: end })}
                  disabled={paidLeave}
                >
                  {paidLeave ? '—' : (end || '- - : - -')}
                </button>

                <div className="paid-cell">
                  <input
                    type="checkbox"
                    checked={paidLeave}
                    onChange={e => updateEntry(ds, { paidLeave: e.target.checked })}
                  />
                </div>

                <input
                  className="note-input"
                  type="text"
                  value={entry?.note || ''}
                  placeholder="メモ"
                  onChange={e => updateEntry(ds, { note: e.target.value })}
                />
              </div>
            );
          })}
        </div>
      </div>

      {picker && (
        <TimePickerModal
          value={picker.value}
          title={picker.field === 'start' ? '出発時刻' : '到着時刻'}
          onConfirm={v => { updateEntry(picker.ds, { [picker.field]: v }); setPicker(null); }}
          onClear={() => { updateEntry(picker.ds, { [picker.field]: '' }); setPicker(null); }}
          onCancel={() => setPicker(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={gistSettings}
          onSave={handleSettingsSave}
          onDisconnect={handleDisconnect}
          onCancel={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
