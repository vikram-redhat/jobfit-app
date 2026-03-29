'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TABS = ['Overview', 'Users', 'Settings', 'Promo Codes'];

export default function AdminPage() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [settings, setSettings] = useState(null);
  const [coupons, setCoupons] = useState(null);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  // Settings form
  const [freeTierInput, setFreeTierInput] = useState('');

  // Coupon form
  const [couponCode, setCouponCode] = useState('');
  const [couponPercent, setCouponPercent] = useState('');
  const [couponAmount, setCouponAmount] = useState('');
  const [couponDuration, setCouponDuration] = useState('once');
  const [couponMax, setCouponMax] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('percent');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  async function fetchJson(url, setter, key) {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      setter(await res.json());
    } catch (e) {
      setError(e.message);
    }
    setLoading(prev => ({ ...prev, [key]: false }));
  }

  useEffect(() => { fetchJson('/api/admin/stats', setStats, 'stats'); }, []);

  useEffect(() => {
    if (tab === 'Users' && !users) fetchJson('/api/admin/users', setUsers, 'users');
    if (tab === 'Settings' && !settings) {
      fetchJson('/api/admin/settings', (data) => {
        setSettings(data);
        setFreeTierInput(data.free_tier_limit ?? '2');
      }, 'settings');
    }
    if (tab === 'Promo Codes' && !coupons) fetchJson('/api/admin/coupons', setCoupons, 'coupons');
  }, [tab]);

  async function saveSetting(key, value) {
    setSaved(''); setError('');
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) { setError(await res.text()); return; }
    setSaved('Saved!');
    setSettings(prev => ({ ...prev, [key]: String(value) }));
    setTimeout(() => setSaved(''), 2000);
  }

  async function createCoupon(e) {
    e.preventDefault();
    setCreatingCoupon(true); setError('');
    const body = {
      code: couponCode,
      duration: couponDuration,
      ...(couponDiscountType === 'percent' ? { percentOff: couponPercent } : { amountOff: couponAmount }),
      ...(couponMax ? { maxRedemptions: couponMax } : {}),
    };
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { setError(await res.text()); setCreatingCoupon(false); return; }
    setCouponCode(''); setCouponPercent(''); setCouponAmount(''); setCouponMax('');
    // Refresh coupons list
    fetchJson('/api/admin/coupons', setCoupons, 'coupons');
    setCreatingCoupon(false);
    setSaved('Promo code created!');
    setTimeout(() => setSaved(''), 3000);
  }

  async function deactivateCoupon(id) {
    if (!confirm('Deactivate this promo code?')) return;
    const res = await fetch('/api/admin/coupons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { setError(await res.text()); return; }
    setCoupons(prev => prev.filter(c => c.id !== id));
  }

  const inputCls = "px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide font-mono";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">JobFit</Link>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">Admin</span>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← Dashboard</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-600">{error}</div>}
        {saved && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 text-sm text-green-700">{saved}</div>}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'Overview' && (
          <div>
            {loading.stats ? <Spinner /> : stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers} />
                <StatCard label="Pro Subscribers" value={stats.paidUsers} sub={stats.totalUsers ? `${Math.round(stats.paidUsers / stats.totalUsers * 100)}%` : '0%'} />
                <StatCard label="Total Analyses" value={stats.totalAnalyses} />
                <StatCard label="At Free Limit" value={stats.usersAtLimit} sub="potential upgrades" />
              </div>
            ) : null}
          </div>
        )}

        {/* Users */}
        {tab === 'Users' && (
          <div>
            {loading.users ? <Spinner /> : users ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Name / Email</th>
                      <th className="text-center px-4 py-3 text-xs font-mono text-gray-500 uppercase">Analyses</th>
                      <th className="text-center px-4 py-3 text-xs font-mono text-gray-500 uppercase">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.user_id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{u.full_name}</div>
                          <div className="text-xs text-gray-400 font-mono">{u.email}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{u.analysis_count}</td>
                        <td className="px-4 py-3 text-center">
                          {u.is_subscribed
                            ? <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">Pro</span>
                            : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Free</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <p className="text-center py-8 text-sm text-gray-400">No users yet.</p>}
              </div>
            ) : null}
          </div>
        )}

        {/* Settings */}
        {tab === 'Settings' && (
          <div className="max-w-sm">
            {loading.settings ? <Spinner /> : (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div>
                  <label className={labelCls}>Free Tier Limit (analyses)</label>
                  <div className="flex gap-2">
                    <input type="number" min="0" value={freeTierInput} onChange={e => setFreeTierInput(e.target.value)}
                      className={`${inputCls} w-24`} />
                    <button onClick={() => saveSetting('free_tier_limit', freeTierInput)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                      Save
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">How many free analyses new users get before hitting the paywall.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Promo Codes */}
        {tab === 'Promo Codes' && (
          <div className="space-y-6">
            {/* Create form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold mb-4">Create Promo Code</h2>
              <form onSubmit={createCoupon} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Code</label>
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value)} required
                      className={`${inputCls} w-full uppercase`} placeholder="JOBFIT50" />
                  </div>
                  <div>
                    <label className={labelCls}>Duration</label>
                    <select value={couponDuration} onChange={e => setCouponDuration(e.target.value)} className={`${inputCls} w-full`}>
                      <option value="once">Once</option>
                      <option value="repeating">Repeating</option>
                      <option value="forever">Forever</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Discount Type</label>
                    <select value={couponDiscountType} onChange={e => setCouponDiscountType(e.target.value)} className={`${inputCls} w-full`}>
                      <option value="percent">Percent off</option>
                      <option value="amount">Amount off ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{couponDiscountType === 'percent' ? 'Percent (e.g. 50)' : 'Amount USD (e.g. 5.00)'}</label>
                    {couponDiscountType === 'percent'
                      ? <input type="number" min="1" max="100" value={couponPercent} onChange={e => setCouponPercent(e.target.value)} required className={`${inputCls} w-full`} placeholder="50" />
                      : <input type="number" min="0.01" step="0.01" value={couponAmount} onChange={e => setCouponAmount(e.target.value)} required className={`${inputCls} w-full`} placeholder="5.00" />}
                  </div>
                </div>
                <div className="w-40">
                  <label className={labelCls}>Max Redemptions (optional)</label>
                  <input type="number" min="1" value={couponMax} onChange={e => setCouponMax(e.target.value)}
                    className={`${inputCls} w-full`} placeholder="Unlimited" />
                </div>
                <button type="submit" disabled={creatingCoupon}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
                  {creatingCoupon ? 'Creating...' : 'Create Code'}
                </button>
              </form>
            </div>

            {/* Existing codes */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold">Active Promo Codes</h2>
              </div>
              {loading.coupons ? <div className="p-8"><Spinner /></div> : coupons?.length ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Code</th>
                      <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Discount</th>
                      <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Duration</th>
                      <th className="text-center px-4 py-3 text-xs font-mono text-gray-500 uppercase">Used</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                        <td className="px-4 py-3">{c.discount}</td>
                        <td className="px-4 py-3 capitalize text-gray-500">{c.duration}</td>
                        <td className="px-4 py-3 text-center font-mono text-gray-500">
                          {c.times_redeemed}{c.max_redemptions ? ` / ${c.max_redemptions}` : ''}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deactivateCoupon(c.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-8 text-sm text-gray-400">No active promo codes.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-2xl font-bold font-mono">{value ?? '—'}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 font-mono mt-0.5">{sub}</div>}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
