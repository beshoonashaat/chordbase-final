/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useChordbaseStore } from '../store/useChordbaseStore';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Database, 
  Settings, 
  Command, 
  Layers,
  ChevronRight,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Sidebar() {
  const { activeView, setActiveView, setCommandPaletteOpen, parserModules } = useChordbaseStore();
  const activeModule = parserModules.find(m => m.isActive);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'import', label: 'Import Engine', icon: UploadCloud },
    { id: 'library', label: 'Song Library', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside id="app-sidebar" className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-display font-semibold text-zinc-100 tracking-tight block text-md leading-none">Chordbase</span>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">v1.2.0-canonical</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase px-3 block mb-2">Core Platform</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                isActive 
                  ? 'text-white' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              )}
            </button>
          );
        })}

        {/* Command Menu Quick Accent */}
        <div className="pt-6">
          <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase px-3 block mb-2">Workspace</span>
          <button
            id="sidebar-cmd-pallete-trigger"
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-dashed border-zinc-800/60 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Command className="w-3.5 h-3.5 text-zinc-500" />
              <span>Search Actions</span>
            </div>
            <div className="flex items-center gap-0.5 text-[9px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-500">
              <span>⌘</span>
              <span>K</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Active Parser Diagnostics Panel */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/80">
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-zinc-300 font-medium">Active Parser Engine</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-sans truncate">
            {activeModule ? activeModule.name : 'No Active Parser'}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Type: {activeModule ? activeModule.type.toUpperCase() : 'N/A'}</span>
            <span className="text-emerald-500/90 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Standby
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
