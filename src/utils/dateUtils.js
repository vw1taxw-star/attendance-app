const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

export function getPeriodDates(year, month) {
  const dates = [];
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const start = new Date(prevYear, prevMonth - 1, 21);
  const end = new Date(year, month - 1, 20);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

export function getCurrentPeriod() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  if (day >= 21) {
    return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  }
  return { year, month };
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDayName(date) {
  return DAY_NAMES[date.getDay()];
}

export function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

export function isSaturday(date) {
  return date.getDay() === 6;
}

export function isSunday(date) {
  return date.getDay() === 0;
}

export function calcMinutes(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}:00` : `${h}:${String(m).padStart(2, '0')}`;
}

export function formatPeriodLabel(year, month) {
  return `${year}年${month}月分`;
}

export function formatPeriodRange(year, month) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}年${prevMonth}月21日 〜 ${year}年${month}月20日`;
}
