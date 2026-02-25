'use client';

import * as XLSX from 'xlsx';
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

function exportToExcel(holdings: Holding[], lastUpdated: Date | null) {
  const reportDate = (lastUpdated ?? new Date()).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build rows
  const rows: (string | number)[][] = [
    ['TopHoldings Portfolio Report', '', '', '', '', '', `As of ${reportDate}`],
    ['Data: Yahoo Finance  |  News: NewsAPI  |  AI Analysis: Claude  |  For informational purposes only — not financial advice.'],
    [],
    ['#', 'Ticker', 'Company Name', 'Market Cap', 'Current Price', '1-Week Change %', 'AI Analysis'],
    ...holdings.map((h, i) => [
      i + 1,
      h.ticker,
      h.name,
      formatMarketCap(h.marketCap),
      formatPrice(h.currentPrice),
      `${h.weekChangePercent >= 0 ? '+' : ''}${h.weekChangePercent.toFixed(2)}%`,
      h.reason,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Column widths (in characters)
  worksheet['!cols'] = [
    { wch: 4 },   // #
    { wch: 8 },   // Ticker
    { wch: 28 },  // Company Name
    { wch: 14 },  // Market Cap
    { wch: 14 },  // Current Price
    { wch: 18 },  // 1-Week Change %
    { wch: 90 },  // AI Analysis
  ];

  // Merge title row across all columns
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // title text spans cols 0-5
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // disclaimer spans full row
  ];

  // Freeze the header row (row 4 = index 3)
  worksheet['!freeze'] = { xSplit: 0, ySplit: 4 };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Holdings Report');

  const filename = `TopHoldings_${(lastUpdated ?? new Date()).toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
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
        <div className="flex items-center gap-4">
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
          <button
            onClick={() => exportToExcel(holdings, lastUpdated)}
            className="flex items-center gap-1.5 bg-[#1a365d] hover:bg-[#153152] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to Excel
          </button>
        </div>
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
