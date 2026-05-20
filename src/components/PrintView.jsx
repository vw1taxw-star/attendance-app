import { formatDate, getDayName, isWeekend, isSaturday, isSunday, formatPeriodRange } from '../utils/dateUtils';

export default function PrintView({ period, dates, periodData }) {
  const { year, month } = period;

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

  return (
    <div className="print-view">
      <div className="print-top">
        <h2 className="print-title">出　勤　簿</h2>
        <div className="print-name">高杉＠広島</div>
        <div className="print-period">{year}年{month}月分　　{formatPeriodRange(year, month)}</div>
      </div>

      <table className="print-table">
        <colgroup>
          <col className="col-date" />
          <col className="col-day" />
          <col className="col-start" />
          <col className="col-end" />
          <col className="col-note" />
        </colgroup>
        <thead>
          <tr>
            <th>日付</th>
            <th>曜日</th>
            <th>出発</th>
            <th>到着</th>
            <th>備考</th>
          </tr>
        </thead>
        <tbody>
          {dates.map(d => {
            const ds = formatDate(d);
            const entry = periodData[ds];
            const paidLeave = entry?.paidLeave || false;
            const start = entry?.start || '';
            const end = entry?.end || '';
            const weekend = isWeekend(d);
            const sat = isSaturday(d);
            const sun = isSunday(d);
            const rowClass = paidLeave ? 'row-paid' : weekend ? 'row-weekend' : '';

            return (
              <tr key={ds} className={rowClass}>
                <td>{d.getMonth() + 1}/{d.getDate()}</td>
                <td className={sat ? 'day-sat' : sun ? 'day-sun' : ''}>{getDayName(d)}</td>
                <td>{paidLeave ? '' : start}</td>
                <td>{paidLeave ? '' : end}</td>
                <td>{paidLeave ? `有給休暇${entry?.note ? `　${entry.note}` : ''}` : (entry?.note || '')}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan={2}>合計</td>
            <td colSpan={2}>出勤 {workedDays}日　有給 {paidLeaveDays}日</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
