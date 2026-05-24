import { ProjectionResults } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  results: ProjectionResults;
  hoveredYear: number | null;
  onHoveredYearChange: (year: number | null) => void;
}

export default function IncomeScheduleSection({ results, hoveredYear, onHoveredYearChange }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-slate-700">
          <tr>
            <th className="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">Year</th>
            <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Gross Rent</th>
            <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Effective</th>
          </tr>
        </thead>
        <tbody>
          {results.income_schedule.map((row) => (
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
              <td className="px-4 py-2">{row.calendar_year}</td>
              <td className="px-4 py-2 text-right">${row.gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right font-medium">${row.effective_rental_income.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
