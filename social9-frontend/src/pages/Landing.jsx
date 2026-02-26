import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import useAuthStore from '../store/authStore';

export default function Landing() {
  const navigate = useNavigate();
  const { login, register, isLoading, error } = useAuthStore();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-start">
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-lg">S9</div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-medium">Grow on Instagram • Plan smarter</div>
          </div>

          <h1 className="text-5xl lg:text-6xl leading-tight font-extrabold text-gray-900">Social9 — content planning, analytics and simple posting</h1>

          <p className="text-lg text-gray-600 max-w-2xl">We help creators and small businesses plan consistent content, understand what works, and grow organic reach. Schedule ideas, get daily suggestions, and connect your Instagram for tailored recommendations.</p>

          <div className="flex items-center space-x-4 mt-6">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700">Get started — it's free</button>
            <a href="#strategy" className="px-5 py-3 text-primary-600 border border-primary-100 rounded-lg hover:bg-primary-50">How it works</a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Analytics</div>
              <div className="font-semibold mt-1">Follower trends, reach, impressions</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Strategy</div>
              <div className="font-semibold mt-1">Daily posting suggestions & calendar</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Scheduler</div>
              <div className="font-semibold mt-1">Auto-schedule coming soon</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">AI Insights</div>
              <div className="font-semibold mt-1">Practical recommendations (no external keys)</div>
            </div>
          </div>
        </section>

        <aside className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">Social9</h3>
                <div className="text-xs text-gray-500">Sign in or create an account to continue</div>
              </div>
              <div className="text-sm text-gray-400">S9</div>
            </div>

            <div className="mb-4 bg-gray-50 p-1 rounded-full flex">
              <button onClick={() => setTab('login')} className={`flex-1 py-2 rounded-full text-sm ${tab==='login' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Sign in</button>
              <button onClick={() => setTab('signup')} className={`flex-1 py-2 rounded-full text-sm ${tab==='signup' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Sign up</button>
            </div>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            {tab === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Email</label>
                    <input name="email" value={form.email} onChange={handleChange} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field w-full" />
                  </div>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn-primary w-full" disabled={isLoading}>{isLoading? 'Signing in...' : 'Sign in'}</button>
                </div>
                <div className="mt-3 text-center text-sm text-gray-500">Or <Link to="/signup" className="text-primary-600">Create an account</Link></div>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Full name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Email</label>
                    <input name="email" value={form.email} onChange={handleChange} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field w-full" />
                  </div>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn-primary w-full" disabled={isLoading}>{isLoading? 'Creating...' : 'Create account'}</button>
                </div>
                <div className="mt-3 text-center text-sm text-gray-500">By creating an account you agree to our <Link to="/terms" className="text-primary-600">terms</Link>.</div>
              </form>
            )}

          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">Existing user? <Link to="/login" className="text-primary-600">Go to login page</Link></div>
        </aside>
      </div>
    </div>
  );
}
