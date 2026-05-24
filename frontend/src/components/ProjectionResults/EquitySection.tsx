import { ProjectionResults } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  results: ProjectionResults;
  hoveredYear: number | null;
  onHoveredYearChange: (year: number | null) => void;
}

export default function EquitySection({ results, hoveredYear, onHoveredYearChange }: Props) {
  const mergedData = results.equity_schedule.map((equityRow: any) => {
    const mortgageRow = results.mortgage_schedule.find((m: any) => m.year_num === equityRow.year_num);
    return {
      year_num: equityRow.year_num,
      calendar_year: equityRow.calendar_year,
      home_value: equityRow.home_value,
      loan_balance: equityRow.loan_balance,
      gross_equity: equityRow.gross_equity,
      noi: equityRow.noi,
      cap_rate: equityRow.cap_rate,
      monthly_payment: mortgageRow ? mortgageRow.annual_payment / 12 : 0,
      annual_payment: mortgageRow ? mortgageRow.annual_payment : 0,
      interest_paid: mortgageRow ? mortgageRow.interest_paid : 0,
      principal_paid: mortgageRow ? mortgageRow.principal_paid : 0,
      cumulative_interest: mortgageRow ? mortgageRow.cumulative_interest : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-700">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mergedData} onMouseMove={(state) => {
            if (state && state.isTooltipActive && state.activeTooltipIndex !== undefined) {
              onHoveredYearChange(mergedData[state.activeTooltipIndex]?.year_num ?? null);
            }
          }} onMouseLeave={() => onHoveredYearChange(null)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="calendar_year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
            <Legend />
            <Line type="monotone" dataKey="home_value" stroke="#10b981" name="Home Value" strokeWidth={2} dot={{ r: 1 }} />
            <Line type="monotone" dataKey="loan_balance" stroke="#ef4444" name="Loan Balance" strokeWidth={2} dot={{ r: 1 }} />
            <Line type="monotone" dataKey="gross_equity" stroke="#3b82f6" name="Gross Equity" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 1 }} />
            <Line type="monotone" dataKey="cumulative_interest" stroke="#f59e0b" name="Cumulative Interest" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 1 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Combined Equity & Mortgage Schedule Table */}
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
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Monthly Payment</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Annual Payment</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Interest Paid</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Principal Paid</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Cumulative Interest</th>
            </tr>
          </thead>
          <tbody>
            {mergedData.map((row) => (
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
                <td className="px-4 py-2 text-right text-success-600 dark:text-success-400 font-medium">${row.home_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right text-danger-600 dark:text-danger-400 font-medium">${row.loan_balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-bold">${row.gross_equity.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">${row.noi.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">{(row.cap_rate * 100).toFixed(2)}%</td>
                <td className="px-4 py-2 text-right">${row.monthly_payment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-medium">${row.annual_payment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right text-danger-600 dark:text-danger-400">${row.interest_paid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right text-success-600 dark:text-success-400 font-medium">${row.principal_paid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-bold">${row.cumulative_interest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
