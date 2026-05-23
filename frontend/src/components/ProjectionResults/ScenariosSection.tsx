import { ProjectionResults } from '../../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  results: ProjectionResults;
}

export default function ScenariosSection({ results }: Props) {
  return (
    <div className="space-y-6">
      {/* Scenario Assumptions Grid */}
      <div className="grid grid-cols-3 gap-4">
        {(['bull', 'base', 'bear'] as const).map((scenario) => {
          const scenarioData = results.scenarios[scenario];
          const scenarioLabel = scenario === 'bull' ? '🚀 Bull Case' : scenario === 'base' ? '📊 Base Case' : '📉 Bear Case';
          return (
            <div key={scenario} className={`p-4 rounded border-2 ${
              scenario === 'bull' ? 'border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-900/30' :
              scenario === 'base' ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/30' :
              'border-danger-300 dark:border-danger-700 bg-danger-50 dark:bg-danger-900/30'
            }`}>
              <h3 className="font-bold mb-3 text-center text-lg text-gray-900 dark:text-white">{scenarioLabel}</h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Appreciation:</span>
                  <span className="font-medium">{(scenarioData.appreciation * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Rent Growth:</span>
                  <span className="font-medium">{(scenarioData.rent_growth * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Vacancy:</span>
                  <span className="font-medium">{(scenarioData.vacancy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Expense Inflation:</span>
                  <span className="font-medium">{(scenarioData.expense_inflation * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scenario Comparison - Year 1 Metrics */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-700">
        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Year 1 Comparison</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-success-50 dark:bg-success-900/30 p-4 rounded border border-success-200 dark:border-success-700">
            <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-semibold">Bull Case</div>
            <div className="text-2xl font-bold text-success-700 dark:text-success-400">${(results.income_schedule[0].gross_annual_rent * 1.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Projected Gross Rent</div>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded border border-primary-200 dark:border-primary-700">
            <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-semibold">Base Case</div>
            <div className="text-2xl font-bold text-primary-700 dark:text-primary-400">${results.income_schedule[0].gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Projected Gross Rent</div>
          </div>
          <div className="bg-danger-50 dark:bg-danger-900/30 p-4 rounded border border-danger-200 dark:border-danger-700">
            <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-semibold">Bear Case</div>
            <div className="text-2xl font-bold text-danger-700 dark:text-danger-400">${(results.income_schedule[0].gross_annual_rent * 0.85).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Projected Gross Rent</div>
          </div>
        </div>
      </div>

      {/* Cumulative Cash Flow Projection */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-700">
        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">30-Year Cumulative Cash Flow Projection</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={results.cashflow_schedule}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="calendar_year" tick={{ fill: '#6b7280' }} />
            <YAxis tick={{ fill: '#6b7280' }} />
            <Tooltip formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }} />
            <Legend wrapperStyle={{ color: '#6b7280' }} />
            <Line
              type="monotone"
              dataKey="cumulative_cash_flow"
              stroke="#3b82f6"
              name="Base Case CF"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey={(data: any) => data.cumulative_cash_flow * 1.15}
              stroke="#10b981"
              name="Bull Case CF"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey={(data: any) => data.cumulative_cash_flow * 0.85}
              stroke="#ef4444"
              name="Bear Case CF"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Outcomes */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-700">
        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">30-Year Outcome Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              {
                name: 'Bull Case',
                'Total Cash Flow': results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 1.15,
                'Home Appreciation': (results.equity_schedule[results.equity_schedule.length - 1].home_value * 1.10) - results.derived.purchase_price,
                fill: '#10b981',
              },
              {
                name: 'Base Case',
                'Total Cash Flow': results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow,
                'Home Appreciation': results.equity_schedule[results.equity_schedule.length - 1].home_value - results.derived.purchase_price,
                fill: '#3b82f6',
              },
              {
                name: 'Bear Case',
                'Total Cash Flow': results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 0.85,
                'Home Appreciation': (results.equity_schedule[results.equity_schedule.length - 1].home_value * 0.90) - results.derived.purchase_price,
                fill: '#ef4444',
              },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
            <Legend />
            <Bar dataKey="Total Cash Flow" stackId="a" fill="#8b5cf6" />
            <Bar dataKey="Home Appreciation" stackId="a" fill="#fbbf24" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Scenario Table */}
      <div className="bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">Metric</th>
              <th className="px-4 py-2 text-right bg-success-100 dark:bg-success-900 text-gray-900 dark:text-white font-semibold">Bull Case</th>
              <th className="px-4 py-2 text-right bg-primary-100 dark:bg-primary-900 text-gray-900 dark:text-white font-semibold">Base Case</th>
              <th className="px-4 py-2 text-right bg-danger-100 dark:bg-danger-900 text-gray-900 dark:text-white font-semibold">Bear Case</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-2 font-medium">Year 1 Gross Rent</td>
              <td className="px-4 py-2 text-right bg-success-100 dark:bg-success-900 text-gray-900 dark:text-white">${(results.income_schedule[0].gross_annual_rent * 1.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right bg-primary-100 dark:bg-primary-900 text-gray-900 dark:text-white">${results.income_schedule[0].gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right bg-danger-100 dark:bg-danger-900 text-gray-900 dark:text-white">${(results.income_schedule[0].gross_annual_rent * 0.85).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 font-medium">Year 30 Home Value</td>
              <td className="px-4 py-2 text-right bg-success-100 dark:bg-success-900 text-gray-900 dark:text-white">${(results.equity_schedule[results.equity_schedule.length - 1].home_value * 1.10).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right bg-primary-100 dark:bg-primary-900 text-gray-900 dark:text-white">${results.equity_schedule[results.equity_schedule.length - 1].home_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right bg-danger-100 dark:bg-danger-900 text-gray-900 dark:text-white">${(results.equity_schedule[results.equity_schedule.length - 1].home_value * 0.90).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 font-medium">30-Year Cumulative CF</td>
              <td className="px-4 py-2 text-right bg-success-100 dark:bg-success-900 text-gray-900 dark:text-white">${(results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 1.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right bg-primary-100 dark:bg-primary-900 text-gray-900 dark:text-white">${results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right bg-danger-100 dark:bg-danger-900 text-gray-900 dark:text-white">${(results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 0.85).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 font-medium">Total Wealth Created</td>
              <td className="px-4 py-2 text-right bg-success-100 dark:bg-success-900 text-gray-900 dark:text-white font-bold">${(((results.equity_schedule[results.equity_schedule.length - 1].home_value * 1.10) - results.derived.purchase_price) + (results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 1.15)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right bg-primary-100 dark:bg-primary-900 text-gray-900 dark:text-white font-bold">${((results.equity_schedule[results.equity_schedule.length - 1].home_value - results.derived.purchase_price) + results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-2 text-right bg-danger-100 dark:bg-danger-900 text-gray-900 dark:text-white font-bold">${(((results.equity_schedule[results.equity_schedule.length - 1].home_value * 0.90) - results.derived.purchase_price) + (results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 0.85)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
