import { ProjectionResults } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  results: ProjectionResults;
  hoveredYear: number | null;
  onHoveredYearChange: (year: number | null) => void;
}

export default function IncomeScheduleSection({ results, hoveredYear, onHoveredYearChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-700">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={results.income_schedule.map((row: any) => ({
            ...row,
            gross_annual_rent: Number(row.gross_annual_rent),
            vacancy_loss: Number(row.vacancy_loss),
            effective_gross_income: Number(row.effective_gross_income),
          }))} onMouseMove={(state: any) => {
            if (state && state.isTooltipActive && state.activeTooltipIndex !== undefined) {
              onHoveredYearChange(results.income_schedule[state.activeTooltipIndex]?.year_num ?? null);
            }
          }} onMouseLeave={() => onHoveredYearChange(null)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="calendar_year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
            <Legend />
            <Line type="monotone" dataKey="gross_annual_rent" stroke="#10b981" name="Gross Rent" strokeWidth={2} />
            <Line type="monotone" dataKey="effective_gross_income" stroke="#3b82f6" name="Effective Gross Income" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">Year</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Gross Rent</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Vacancy</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Mgmt Fee</th>
              <th className="px-4 py-2 text-right font-bold">Effective Gross</th>
            </tr>
          </thead>
          <tbody>
            {results.income_schedule.slice(0, 10).map((row) => (
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
                <td className="px-4 py-2 text-right">${row.gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">${row.vacancy_loss.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">${row.mgmt_fee.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-bold text-primary-600 dark:text-primary-400">${row.effective_gross_income.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
