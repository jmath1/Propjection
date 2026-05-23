import { ProjectionResults } from '../../types';

interface Props {
  results: ProjectionResults;
}

export default function SummarySection({ results }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800">
        <div className="text-sm text-primary-700 dark:text-primary-200 font-semibold">Purchase Price</div>
        <div className="text-3xl font-bold text-primary-900 dark:text-primary-50 mt-2">
          ${results.derived.purchase_price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div className="card bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900 dark:to-success-800">
        <div className="text-sm text-success-700 dark:text-success-200 font-semibold">Year 1 Gross Rent</div>
        <div className="text-3xl font-bold text-success-900 dark:text-success-50 mt-2">
          ${results.income_schedule[0].gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div className="card bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900 dark:to-warning-800">
        <div className="text-sm text-warning-700 dark:text-warning-200 font-semibold">Year 1 NOI</div>
        <div className="text-3xl font-bold text-warning-900 dark:text-warning-50 mt-2">
          ${results.cashflow_schedule[0].noi.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div className="card bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900 dark:to-danger-800">
        <div className="text-sm text-danger-700 dark:text-danger-200 font-semibold">Year 1 Cash Flow</div>
        <div className="text-3xl font-bold text-danger-900 dark:text-danger-50 mt-2">
          ${results.cashflow_schedule[0].annual_cash_flow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div className="card col-span-2 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800">
        <div className="text-sm text-gray-600">Total Cash to Close</div>
        <div className="text-2xl font-bold">
          ${results.derived.total_cash_to_close.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}
