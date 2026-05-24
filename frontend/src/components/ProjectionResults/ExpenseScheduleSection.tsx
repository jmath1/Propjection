import { ProjectionResults, Projection } from '../../types';

interface Props {
  results: ProjectionResults;
  projection: Projection;
  hoveredYear: number | null;
  onHoveredYearChange: (year: number | null) => void;
}

export default function ExpenseScheduleSection({ results, projection, hoveredYear, onHoveredYearChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">Year</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Property Tax</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Insurance</th>
              {projection.hoa_annual > 0 && <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">HOA</th>}
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Maintenance</th>
              <th className="px-4 py-2 text-right text-gray-900 dark:text-white font-semibold">Utilities</th>
              <th className="px-4 py-2 text-right font-bold">Total Operating</th>
              <th className="px-4 py-2 text-right font-bold">Debt Service</th>
              <th className="px-4 py-2 text-right font-bold bg-danger-100 dark:bg-danger-900 text-gray-900 dark:text-white">All-in Cost</th>
            </tr>
          </thead>
          <tbody>
            {results.expense_schedule.map((row) => (
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
                <td className="px-4 py-2 text-right">${row.property_tax.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">${row.insurance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                {projection.hoa_annual > 0 && <td className="px-4 py-2 text-right">${row.hoa.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>}
                <td className="px-4 py-2 text-right">${row.maintenance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right">${row.utilities.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-medium">${row.total_operating.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-medium">${row.debt_service.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-2 text-right font-bold bg-danger-100 dark:bg-danger-900 text-gray-900 dark:text-white">${row.all_in_cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded border border-primary-200 dark:border-primary-700 text-sm space-y-2">
        <h3 className="font-bold mb-3 text-gray-900 dark:text-white">Expense Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Property Tax:</span> Home value × {projection.property_tax_pct.toFixed(2)}%</p>
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Maintenance:</span> Home value × {projection.maintenance_pct.toFixed(2)}%</p>
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Insurance:</span> ${projection.insurance_annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year + inflation</p>
          </div>
          <div>
            {projection.hoa_annual > 0 && <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">HOA:</span> ${projection.hoa_annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year + inflation</p>}
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Utilities:</span> ${projection.utilities_annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year + inflation</p>
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Inflation Rate:</span> {projection.expense_inflation_pct.toFixed(2)}%/year</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-700">
          <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Debt Service:</span> Annual mortgage payment + PMI</p>
          <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">All-in Cost:</span> Total Operating Expenses + Debt Service</p>
        </div>
      </div>
    </div>
  );
}
