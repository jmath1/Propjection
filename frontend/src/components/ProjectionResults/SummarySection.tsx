import { useState } from 'react';
import { ProjectionResults } from '../../types';
import { projectionsAPI } from '../../api/client';

interface Props {
  results: ProjectionResults;
  projectionId?: number;
}

export default function SummarySection({ results, projectionId }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!projectionId) return;
    setSummaryLoading(true);
    try {
      const response = await projectionsAPI.getSummary(projectionId);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummary('Error generating summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

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

      {/* AI Summary Section */}
      {projectionId && (
        <>
          <div className="col-span-2 flex gap-3 items-center justify-between p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">Deal Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get an AI-powered analysis of this investment</p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={summaryLoading}
              className="whitespace-nowrap bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-all"
            >
              {summaryLoading ? 'Generating...' : '✨ Analyze'}
            </button>
          </div>

          {/* AI Summary Result */}
          {summary && (
            <div className="col-span-2 card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
