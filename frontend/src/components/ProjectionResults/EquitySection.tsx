import { ProjectionResults } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  results: ProjectionResults;
  hoveredYear: number | null;
  onHoveredYearChange: (year: number | null) => void;
}

export default function EquitySection({ results, hoveredYear, onHoveredYearChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-700">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={results.equity_schedule.map((row: any) => ({
            ...row,
            home_value: Number(row.home_value),
            loan_balance: Number(row.loan_balance),
          }))} onMouseMove={(state) => {
            if (state && state.isTooltipActive && state.activeTooltipIndex !== undefined) {
              onHoveredYearChange(results.equity_schedule[state.activeTooltipIndex]?.year_num ?? null);
            }
          }} onMouseLeave={() => onHoveredYearChange(null)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="calendar_year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
            <Legend />
            <Line type="monotone" dataKey="home_value" stroke="#10b981" name="Home Value" strokeWidth={2} />
            <Line type="monotone" dataKey="loan_balance" stroke="#ef4444" name="Loan Balance" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">Year</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Home Value</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Loan Balance</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Equity</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">NOI</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Cap Rate</th>
            </tr>
          </thead>
          <tbody>
            {results.equity_schedule.map((row) => (
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
                <td className="px-4 py-2 text-right">${row.home_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">${row.loan_balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-medium">${row.equity.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">${row.noi.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">{(row.cap_rate * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
