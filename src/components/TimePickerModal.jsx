import { useState } from 'react';
import DrumPicker from './DrumPicker';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function normalizeMinute(m) {
  if (MINUTES.includes(m)) return m;
  const n = parseInt(m, 10);
  return MINUTES.reduce((prev, curr) =>
    Math.abs(parseInt(curr) - n) < Math.abs(parseInt(prev) - n) ? curr : prev
  );
}

export default function TimePickerModal({ value, title, onConfirm, onClear, onCancel }) {
  const [h, m] = (value || '07:30').split(':');
  const [hour, setHour] = useState(h || '07');
  const [minute, setMinute] = useState(normalizeMinute(m || '30'));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-sheet">
        <div className="modal-title">{title}</div>
        <div className="drum-container">
          <DrumPicker items={HOURS} value={hour} onChange={setHour} />
          <div className="drum-separator">:</div>
          <DrumPicker items={MINUTES} value={minute} onChange={setMinute} />
        </div>
        <div className="modal-time-preview">{hour}:{minute}</div>
        <div className="modal-actions">
          {value && <button className="btn-clear" onClick={onClear}>クリア</button>}
          <button className="btn-cancel" onClick={onCancel}>キャンセル</button>
          <button className="btn-confirm" onClick={() => onConfirm(`${hour}:${minute}`)}>確定</button>
        </div>
      </div>
    </div>
  );
}
