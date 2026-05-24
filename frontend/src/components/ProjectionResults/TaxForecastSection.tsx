import { ProjectionResults } from '../../types';

interface Props {
  results: ProjectionResults;
  hoveredYear: number | null;
  onHoveredYearChange: (year: number | null) => void;
}

export default function TaxForecastSection({ results, hoveredYear, onHoveredYearChange }: Props) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-200 font-semibold">Total Gross Income</div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-50 mt-2">
            ${results.tax_forecast.reduce((sum, row) => sum + row.gross_rental_income, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <div className="text-sm text-orange-700 dark:text-orange-200 font-semibold">Total Deductions</div>
          <div className="text-3xl font-bold text-orange-900 dark:text-orange-50 mt-2">
            ${results.tax_forecast.reduce((sum, row) => sum + row.total_deductions, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <div className="text-sm text-red-700 dark:text-red-200 font-semibold">Est. Total Tax</div>
          <div className="text-3xl font-bold text-red-900 dark:text-red-50 mt-2">
            ${results.tax_forecast.reduce((sum, row) => sum + row.estimated_tax_liability, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-slate-600">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Year</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Gross Rental Income</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Mortgage Interest</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Property Tax</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Repairs</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Insurance</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Utilities</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Total Deductions</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Taxable Income</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Est. Tax (25%)</th>
            </tr>
          </thead>
          <tbody>
            {results.tax_forecast.map((row, idx) => (
              <tr
                key={idx}
                className={`border-b border-gray-200 dark:border-slate-700 transition-colors ${
                  hoveredYear === row.year ? 'bg-primary-50 dark:bg-slate-700' : ''
                }`}
                onMouseEnter={() => onHoveredYearChange(row.year)}
                onMouseLeave={() => onHoveredYearChange(null)}
              >
                <td className="py-2 px-4 text-gray-700 dark:text-gray-300 font-medium">{row.year}</td>
                <td className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">${row.gross_rental_income.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">${row.mortgage_interest_deduction.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">${row.property_tax_deduction.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">${row.repairs_deduction.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">${row.insurance_deduction.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">${row.utilities_deduction.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 text-right text-gray-900 dark:text-white font-semibold">${row.total_deductions.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 text-right text-gray-900 dark:text-white font-semibold">${row.taxable_income.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 text-right text-red-600 dark:text-red-400 font-semibold">${row.estimated_tax_liability.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
