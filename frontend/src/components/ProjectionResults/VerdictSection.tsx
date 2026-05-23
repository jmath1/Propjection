import { ProjectionResults } from '../../types';

interface Props {
  results: ProjectionResults;
}

export default function VerdictSection({ results }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(results.verdict).map(([key, metric]) => (
        <div
          key={key}
          className={`p-3 rounded border-l-4 ${
            metric.pass
              ? 'border-success-500 dark:border-success-400 bg-success-50 dark:bg-success-900/30'
              : 'border-danger-500 dark:border-danger-400 bg-danger-50 dark:bg-danger-900/30'
          }`}
        >
          <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">{metric.description}</div>
          <div className="text-lg font-bold my-1 text-gray-900 dark:text-white">
            {typeof metric.value === 'number' ? (
              metric.value > 0 && metric.value < 1
                ? `${(metric.value * 100).toFixed(1)}%`
                : metric.value.toLocaleString('en-US', { maximumFractionDigits: 2 })
            ) : metric.value}
          </div>
          <div className={`text-xs font-semibold ${metric.pass ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'}`}>
            {metric.pass ? '✓ PASS' : '✗ FAIL'}
          </div>
        </div>
      ))}
    </div>
  );
}
