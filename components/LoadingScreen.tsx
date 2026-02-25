'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { message: 'Initializing market data connection...', ticker: null },
  { message: 'Fetching PANW — Palo Alto Networks...', ticker: 'PANW' },
  { message: 'Fetching AAPL — Apple Inc...', ticker: 'AAPL' },
  { message: 'Fetching MSFT — Microsoft Corp...', ticker: 'MSFT' },
  { message: 'Fetching GOOGL — Alphabet Inc...', ticker: 'GOOGL' },
  { message: 'Fetching NEOG — Neogenomics Inc...', ticker: 'NEOG' },
  { message: 'Querying news intelligence feed...', ticker: null },
  { message: 'Analyzing market sentiment...', ticker: null },
  { message: 'Generating AI-powered insights...', ticker: null },
  { message: 'Compiling holdings report...', ticker: null },
];

// Fixed bar heights to avoid hydration mismatch
const BAR_HEIGHTS = [
  42, 65, 38, 78, 55, 48, 70, 35, 62, 50, 73, 41, 58, 67, 44, 72, 39, 61, 54, 46,
];

// Fixed animation durations
const BAR_DURATIONS = [
  1.4, 1.8, 1.2, 2.0, 1.6, 1.1, 1.9, 1.3, 1.7, 1.5, 1.0, 1.8, 1.4, 2.0,
  1.2, 1.6, 1.3, 1.9, 1.1, 1.7,
];

export default function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 1600);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 7 + 2;
        return Math.min(prev + increment, 92);
      });
    }, 500);

    const dotsTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a365d 1px, transparent 1px),
            linear-gradient(to bottom, #1a365d 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Scanning line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
          style={{ animation: 'scan 2.5s linear infinite' }}
        />
      </div>

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1a365d] via-blue-400 to-[#1a365d]" />

      <div className="relative w-full max-w-xs px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1a365d] rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-5 h-5 text-white"
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
          <div>
            <div className="text-base font-bold text-[#1a365d] tracking-tight">
              TopHoldings
            </div>
            <div className="text-xs text-slate-400">Portfolio Intelligence</div>
          </div>
        </div>

        {/* Mini chart bars */}
        <div className="flex items-end justify-center gap-0.5 h-10 mb-8">
          {BAR_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="w-2 bg-[#1a365d] rounded-t animate-pulse-bar"
              style={{
                height: `${height}%`,
                animationDuration: `${BAR_DURATIONS[i]}s`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        {/* Progress label + percentage */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#1a365d] uppercase tracking-widest">
            Loading{dots}
          </span>
          <span className="text-xs font-mono text-slate-500">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1a365d] to-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current step */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs text-slate-600 font-mono truncate">
              {STEPS[stepIndex].message}
            </span>
          </div>
        </div>

        {/* Completed steps */}
        <div className="space-y-1.5 max-h-32 overflow-hidden">
          {STEPS.slice(0, stepIndex).map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg
                className="w-3 h-3 text-emerald-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-slate-400 font-mono truncate">
                {step.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
