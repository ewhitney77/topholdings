'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import HoldingsTable from '@/components/HoldingsTable';

export interface Holding {
  ticker: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  weekChangePercent: number;
  reason: string;
  error: string | null;
}

export default function DashboardPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  const fetchHoldings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/holdings');

      if (response.status === 401) {
        router.push('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch holdings data');
      }

      const data = await response.json();
      setHoldings(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const gainers = holdings.filter((h) => h.weekChangePercent >= 0).length;
  const decliners = holdings.filter((h) => h.weekChangePercent < 0).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {loading && <LoadingScreen />}

      {/* Navigation */}
      <nav className="bg-[#1a365d] shadow-md sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-sm tracking-tight">
                TopHoldings
              </span>
              <span className="hidden sm:inline-block text-blue-300/70 text-xs">
                Portfolio Intelligence
              </span>
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={fetchHoldings}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors disabled:opacity-40"
              >
                <svg
                  className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              <div className="w-px h-4 bg-white/20" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#1a365d] tracking-tight">
                Holdings Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time data &nbsp;·&nbsp; AI-powered analysis &nbsp;·&nbsp;
                Weekly performance
              </p>
            </div>

            {!loading && holdings.length > 0 && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                    Positions
                  </div>
                  <div className="text-xl font-bold text-[#1a365d]">
                    {holdings.length}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                    Gainers
                  </div>
                  <div className="text-xl font-bold text-emerald-600">
                    {gainers}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                    Decliners
                  </div>
                  <div className="text-xl font-bold text-red-600">
                    {decliners}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">
                Error loading data
              </p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={fetchHoldings}
              className="text-xs font-semibold text-red-600 hover:text-red-800 whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && holdings.length > 0 && (
          <HoldingsTable holdings={holdings} lastUpdated={lastUpdated} />
        )}

        {!loading && holdings.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No holdings data available</p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} TopHoldings</span>
          <span>
            Data sourced from Yahoo Finance &nbsp;·&nbsp; AI by Claude
            &nbsp;·&nbsp; For informational purposes only
          </span>
        </div>
      </footer>
    </div>
  );
}
