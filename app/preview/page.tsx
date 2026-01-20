'use client';

import { useState, useEffect } from 'react';

export default function PreviewPage() {
  const [emailType, setEmailType] = useState<'morning' | 'evening'>('morning');
  const [emailHtml, setEmailHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'America/Denver',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/preview-email?type=${emailType}`);
      const data = await response.json();
      setEmailHtml(data.html);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on mount and type change
  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/preview-email?type=${emailType}`);
        const data = await response.json();
        setEmailHtml(data.html);
      } catch (error) {
        console.error('Failed to generate preview:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPreview();
  }, [emailType]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] antialiased">
      {/* Scanline overlay for terminal aesthetic */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)',
        }}
      />

      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between px-6 h-14">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs tracking-[0.2em] text-[#71717a] uppercase">
                  Research System
                </span>
              </div>
              <div className="h-4 w-px bg-[#27272a]" />
              <h1 className="text-sm font-medium tracking-tight">
                Email Preview
              </h1>
            </div>

            {/* Center: Type Selector */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <div className="flex bg-[#18181b] rounded-lg p-1 border border-[#27272a]">
                <button
                  onClick={() => setEmailType('morning')}
                  className={`relative px-5 py-2 rounded-md text-xs font-medium tracking-wide transition-all duration-300 ${
                    emailType === 'morning'
                      ? 'text-[#fafafa]'
                      : 'text-[#71717a] hover:text-[#a1a1aa]'
                  }`}
                >
                  {emailType === 'morning' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-md border border-cyan-500/30" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Morning Digest
                  </span>
                </button>
                <button
                  onClick={() => setEmailType('evening')}
                  className={`relative px-5 py-2 rounded-md text-xs font-medium tracking-wide transition-all duration-300 ${
                    emailType === 'evening'
                      ? 'text-[#fafafa]'
                      : 'text-[#71717a] hover:text-[#a1a1aa]'
                  }`}
                >
                  {emailType === 'evening' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-md border border-violet-500/30" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Evening Catch-Up
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Time & Navigation */}
            <div className="flex items-center gap-5">
              <div className="font-mono text-xs text-[#71717a] tabular-nums">
                {currentTime} <span className="text-[#52525b]">MST</span>
              </div>
              <a
                href="/"
                className="flex items-center gap-2 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14">
        <div className="max-w-[1800px] mx-auto flex">
          {/* Sidebar Info Panel */}
          <aside className="w-72 flex-shrink-0 border-r border-[#27272a] min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
            <div className="p-6 space-y-8">
              {/* Status */}
              <div>
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-[#52525b] uppercase mb-4">
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#a1a1aa]">Template Engine</span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#a1a1aa]">OpenAI</span>
                    <span className="flex items-center gap-1.5 text-xs text-[#52525b]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52525b]" />
                      Removed
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#a1a1aa]">Perplexity</span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-[#52525b] uppercase mb-4">
                  Schedule
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-[#18181b] rounded-lg border border-[#27272a]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span className="text-xs font-medium text-[#fafafa]">Morning Digest</span>
                    </div>
                    <div className="font-mono text-lg text-cyan-500 mb-1">06:30</div>
                    <div className="text-[10px] text-[#71717a]">Full research + blog topics</div>
                  </div>
                  <div className="p-3 bg-[#18181b] rounded-lg border border-[#27272a]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span className="text-xs font-medium text-[#fafafa]">Evening Catch-Up</span>
                    </div>
                    <div className="font-mono text-lg text-violet-500 mb-1">20:00</div>
                    <div className="text-[10px] text-[#71717a]">Urgent items only</div>
                  </div>
                </div>
              </div>

              {/* Cost Savings */}
              <div>
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-[#52525b] uppercase mb-4">
                  Cost Savings
                </h3>
                <div className="p-3 bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 rounded-lg border border-emerald-800/30">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-mono text-2xl text-emerald-400">$15-20</span>
                    <span className="text-xs text-emerald-600">/month</span>
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Saved by removing ChatGPT
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-[#52525b] uppercase mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={generatePreview}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-lg text-xs font-medium text-[#fafafa] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Preview
                      </>
                    )}
                  </button>
                  <a
                    href="/api/test-email"
                    target="_blank"
                    className="w-full px-4 py-2.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-lg text-xs font-medium text-[#fafafa] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Test Email
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Preview Area */}
          <div className="flex-1 p-8">
            {/* Device Frame */}
            <div className="max-w-3xl mx-auto">
              {/* Browser Chrome */}
              <div className="bg-[#18181b] rounded-t-xl border border-[#27272a] border-b-0">
                <div className="flex items-center px-4 h-10 border-b border-[#27272a]">
                  {/* Traffic Lights */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]/80 hover:bg-[#ef4444] transition-colors cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-[#eab308]/80 hover:bg-[#eab308] transition-colors cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]/80 hover:bg-[#22c55e] transition-colors cursor-pointer" />
                  </div>

                  {/* URL Bar */}
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#09090b] rounded-md">
                      <svg className="w-3 h-3 text-[#52525b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-[11px] text-[#71717a] font-mono">
                        mail.edwardguillen.com
                      </span>
                    </div>
                  </div>

                  {/* Tab Indicator */}
                  <div className="flex items-center gap-2 text-xs text-[#71717a]">
                    <span className={emailType === 'morning' ? 'text-cyan-500' : 'text-violet-500'}>
                      {emailType === 'morning' ? 'Morning Digest' : 'Evening Update'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div className="bg-[#09090b] border-x border-[#27272a] min-h-[600px]">
                {emailHtml ? (
                  <iframe
                    srcDoc={emailHtml}
                    className="w-full h-[800px] border-0"
                    title="Email Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#18181b] border border-[#27272a] mb-4">
                        <svg className="w-8 h-8 text-[#52525b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[#71717a]">Loading preview...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Browser Bottom */}
              <div className="bg-[#18181b] rounded-b-xl border border-[#27272a] border-t-0 h-3" />
            </div>

            {/* Footer Note */}
            <div className="max-w-3xl mx-auto mt-6 text-center">
              <p className="text-[11px] text-[#52525b]">
                Email templates use inline CSS for maximum email client compatibility.
                Preview may differ slightly from actual email rendering.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
