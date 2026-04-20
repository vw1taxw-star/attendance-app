const KEY = 'attendance_v1';

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getPeriodKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}
