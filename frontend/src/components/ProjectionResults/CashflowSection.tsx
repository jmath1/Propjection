import { ProjectionResults } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  results: ProjectionResults;
  hoveredYear: number | null;
  onHoveredYearChange: (year: number | null) => void;
}

export default function CashflowSection({ results, hoveredYear, onHoveredYearChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-700">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={results.cashflow_schedule.map((row: any) => ({
            ...row,
            cumulative_cash_flow: Number(row.cumulative_cash_flow),
          }))} onMouseMove={(state: any) => {
            if (state && state.isTooltipActive && state.activeTooltipIndex !== undefined) {
              onHoveredYearChange(results.cashflow_schedule[state.activeTooltipIndex]?.year_num ?? null);
            }
          }} onMouseLeave={() => onHoveredYearChange(null)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="calendar_year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
            <Legend />
            <Line type="monotone" dataKey="cumulative_cash_flow" stroke="#2563eb" name="Cumulative CF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">Year</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">NOI</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Debt Service</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Annual CF</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">DSCR</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Cumulative CF</th>
            </tr>
          </thead>
          <tbody>
            {results.cashflow_schedule.map((row) => (
              <tr
                key={row.year_num}
                onMouseEnter={() => onHoveredYearChange(row.year_num)}
                onMouseLeave={() => onHoveredYearChange(null)}
                className={`border-t border-gray-200 dark:border-slate-600 transition-all text-gray-900 dark:text-gray-100 ${
                  hoveredYear === row.year_num
                    ? 'bg-blue-100 dark:bg-blue-900 shadow-md'
                    : hoveredYear !== null
                    ? 'bg-gray-50 dark:bg-slate-800 opacity-50'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <td className="px-4 py-2 font-medium">{row.calendar_year}</td>
                <td className="px-4 py-2 text-right">${row.noi.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">${row.debt_service.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-medium">${row.annual_cash_flow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">{row.dscr.toFixed(2)}x</td>
                <td className="px-4 py-2 text-right font-bold text-primary-600 dark:text-primary-400">${row.cumulative_cash_flow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
