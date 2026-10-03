/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useChordbaseStore } from '../store/useChordbaseStore';
import { Search, Command, RefreshCw, Database } from 'lucide-react';

export default function TopBar() {
  const { activeView, songs, setCommandPaletteOpen } = useChordbaseStore();

  const getBreadcrumbs = () => {
    switch (activeView) {
      case 'dashboard':
        return ['Console', 'Overview'];
      case 'import':
        return ['Workspace', 'Import Engine'];
      case 'library':
        return ['Database', 'Song Library'];
      case 'settings':
        return ['Platform', 'System Settings'];
      default:
        return ['Console'];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header id="app-topbar" className="h-14 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md flex items-center justify-between px-8 select-none shrink-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <span className="text-zinc-700">/</span>}
            <span className={idx === breadcrumbs.length - 1 ? "text-zinc-200 font-medium" : "text-zinc-500"}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Raycast Trigger Bar */}
        <button
          id="topbar-search-trigger"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all text-xs"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-sans pr-4 text-[11px]">Search commands...</span>
          <div className="flex items-center gap-0.5 font-mono text-[9px] bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800 text-zinc-600">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>

        {/* Database Stats Badge */}
        <div className="h-7 px-3 rounded-md bg-zinc-900/40 border border-zinc-900 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <Database className="w-3.5 h-3.5 text-blue-500/80" />
          <span>{songs.length} Canonical Song{songs.length !== 1 && 's'}</span>
        </div>

        {/* Sync Indicator */}
        <div className="h-7 px-2.5 rounded-md bg-zinc-900/10 border border-zinc-900/40 flex items-center gap-1.5 text-[10px] font-mono text-emerald-500/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px]">SQLite Live</span>
        </div>
      </div>
    </header>
  );
}
