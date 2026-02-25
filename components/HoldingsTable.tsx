'use client';

import type { Holding } from '@/app/dashboard/page';

interface Props {
  holdings: Holding[];
  lastUpdated: Date | null;
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  if (cap > 0) return `$${cap.toLocaleString()}`;
  return '—';
}

function formatPrice(price: number): string {
  return price > 0 ? `$${price.toFixed(2)}` : '—';
}

export default function HoldingsTable({ holdings, lastUpdated }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Table header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 bg-[#1a365d] rounded-full" />
          <span className="text-sm font-semibold text-slate-700">
            Holdings Report
          </span>
          <span className="text-xs text-slate-400">
            &nbsp;· {holdings.length} position{holdings.length !== 1 ? 's' : ''}
          </span>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Updated{' '}
            {lastUpdated.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-10">
                #
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ticker
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Company Name
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Market Cap
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Price
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                1-Week Chg
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[280px]">
                AI Analysis
              </th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, index) => {
              const isPositive = holding.weekChangePercent >= 0;
              const isZero = holding.weekChangePercent === 0;

              const badgeClass = isZero
                ? 'text-slate-500 bg-slate-50 border-slate-200'
                : isPositive
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-red-700 bg-red-50 border-red-200';

              return (
                <tr
                  key={holding.ticker}
                  className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Rank */}
                  <td className="px-5 py-4 text-xs font-mono text-slate-300">
                    {index + 1}
                  </td>

                  {/* Ticker */}
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#1a365d] text-sm tracking-wide">
                      {holding.ticker}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-5 py-4">
                    <span className="text-slate-700">{holding.name}</span>
                  </td>

                  {/* Market Cap */}
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono font-semibold text-slate-800">
                      {formatMarketCap(holding.marketCap)}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono text-slate-600">
                      {formatPrice(holding.currentPrice)}
                    </span>
                  </td>

                  {/* 1-Week Change */}
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold font-mono ${badgeClass}`}
                    >
                      {!isZero && (isPositive ? '▲' : '▼')}
                      {Math.abs(holding.weekChangePercent).toFixed(2)}%
                    </span>
                  </td>

                  {/* AI Analysis */}
                  <td className="px-5 py-4">
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                      {holding.reason}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-400">
          Market data via Yahoo Finance &nbsp;·&nbsp; News via NewsAPI
          &nbsp;·&nbsp; Insights by Claude AI &nbsp;·&nbsp; For informational
          purposes only. Not financial advice.
        </p>
      </div>
    </div>
  );
}
