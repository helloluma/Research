'use client';

import { useEffect, useState } from 'react';

interface SystemStatus {
  status: string;
  lastMorningRun: string | null;
  lastEveningRun: string | null;
  queryCounts: {
    morning: number;
    evening: number;
  };
  todayStats: {
    morningUrgentItems: number;
    eveningUrgentItems: number;
  } | null;
  timestamp: string;
  error?: string;
}

export default function Home() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch status:', error);
        setStatus({
          status: 'error',
          lastMorningRun: null,
          lastEveningRun: null,
          queryCounts: { morning: 0, evening: 0 },
          todayStats: null,
          timestamp: new Date().toISOString(),
          error: 'Failed to fetch status',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTimestamp(timestamp: string | null): string {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' CT';
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Research Automation System
          </h1>
          <p className="text-zinc-400 text-lg">
            Automated research digests for SponsorBase, Luma Comply, and Marina Real Estate
          </p>
        </header>

        {/* Status Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-3 h-3 rounded-full ${
                status?.status === 'active'
                  ? 'bg-green-500 animate-pulse'
                  : status?.status === 'error'
                  ? 'bg-red-500'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="text-xl font-semibold">
              {loading
                ? 'Loading...'
                : status?.status === 'active'
                ? 'System Active'
                : 'System Error'}
            </span>
          </div>

          {!loading && status && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Last Runs */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Last Runs
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-300">Morning Digest</span>
                    <span className="text-zinc-400 font-mono text-sm">
                      {formatTimestamp(status.lastMorningRun)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-300">Evening Catch-Up</span>
                    <span className="text-zinc-400 font-mono text-sm">
                      {formatTimestamp(status.lastEveningRun)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Today&apos;s Stats
                </h3>
                {status.todayStats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                      <span className="text-zinc-300">Morning Urgent Items</span>
                      <span className="text-amber-400 font-semibold">
                        {status.todayStats.morningUrgentItems}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-zinc-300">Evening Urgent Items</span>
                      <span className="text-amber-400 font-semibold">
                        {status.todayStats.eveningUrgentItems}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500 py-2">No data for today yet</p>
                )}
              </div>
            </div>
          )}

          {status?.error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
              <p className="text-red-400 text-sm">{status.error}</p>
            </div>
          )}
        </div>

        {/* Schedule Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Schedule</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-lg">AM</span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100">Morning Full Digest</h3>
                <p className="text-zinc-400 text-sm mt-1">
                  6:30 AM CT - Complete research with all queries, Reddit pain points,
                  trending blog topics, and urgent items highlighted
                </p>
                <p className="text-zinc-500 text-sm mt-2">
                  {status?.queryCounts?.morning || 30}+ queries processed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 text-lg">PM</span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100">Evening Catch-Up</h3>
                <p className="text-zinc-400 text-sm mt-1">
                  8:00 PM CT - Quick scan for NEW urgent items since morning.
                  Only sends email if new items found.
                </p>
                <p className="text-zinc-500 text-sm mt-2">
                  {status?.queryCounts?.evening || 7} queries processed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Tracked Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <h3 className="font-semibold text-zinc-100 mb-2">SponsorBase</h3>
              <p className="text-zinc-400 text-sm">
                Creator sponsorship SaaS - competitor intel, Reddit pain points
              </p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <h3 className="font-semibold text-zinc-100 mb-2">Luma Comply</h3>
              <p className="text-zinc-400 text-sm">
                HIPAA medical documentation - regulatory updates, provider pain points
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-zinc-500 text-sm">
          <p>
            Last status check:{' '}
            {status ? formatTimestamp(status.timestamp) : 'Loading...'}
          </p>
        </footer>
      </div>
    </div>
  );
}
