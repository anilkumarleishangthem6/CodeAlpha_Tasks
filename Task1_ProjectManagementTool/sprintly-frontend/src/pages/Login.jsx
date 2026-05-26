import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', formData);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">

      {/* top bar */}
      <div className="px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#6366f1"/>
            <path d="M8 16L12 10L16 14L20 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 20H21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M19 18V22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="text-white font-bold tracking-tight">Sprintly</span>
        </Link>
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-white hover:underline transition">
            Sign up
          </Link>
        </p>
      </div>

      {/* center form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              Sign in to your Sprintly workspace
            </p>
          </div>

          {error && (
            <div className="mb-5 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-white/[0.04] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition placeholder:text-gray-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-white/[0.04] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition placeholder:text-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">
              By signing in you agree to our{' '}
              <button className="text-gray-500 hover:text-white transition">Terms</button>
              {' '}and{' '}
              <button className="text-gray-500 hover:text-white transition">Privacy Policy</button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;