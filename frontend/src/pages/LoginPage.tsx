import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      setError('Failed to connect to server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-950 dark:to-primary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
              <LogIn className="text-primary-600 dark:text-primary-400" size={32} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Propjection
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Real Estate Projection Analysis
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-700 text-danger-800 dark:text-danger-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input w-full"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded border border-primary-200 dark:border-primary-700">
            <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
              <span className="font-semibold">Demo Credentials:</span>
              <br />
              Username: <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded">admin</code>
              <br />
              Password: <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded">admin</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
