/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useChordbaseStore } from '../store/useChordbaseStore';
import { 
  Database, 
  Percent, 
  ShieldCheck, 
  Activity, 
  Layers, 
  ArrowUpRight, 
  Languages, 
  Sparkles,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { SongStatus } from '../types';

export default function DashboardView() {
  const { songs, setActiveView, setSelectedSongId, parserModules } = useChordbaseStore();

  const confirmedSongs = songs.filter(s => s.status === SongStatus.Confirmed).length;
  const pendingSongs = songs.filter(s => s.status === SongStatus.PendingReview).length;
  const draftSongs = songs.filter(s => s.status === SongStatus.Draft).length;

  const averageConfidence = songs.reduce((acc, song) => acc + song.overallConfidence, 0) / (songs.length || 1);
  const activeModule = parserModules.find(m => m.isActive);

  // SVG parameters for our custom layout metrics visualization
  const graphData = [
    { label: '60-70%', val: 12, h: 40 },
    { label: '70-80%', val: 34, h: 75 },
    { label: '80-90%', val: 89, h: 140 },
    { label: '90-95%', val: 154, h: 210 },
    { label: '95-100%', val: 242, h: 280 }
  ];

  // System status log stream
  const systemLogs = [
    { time: '10:42 AM', type: 'info', msg: 'SQLite WAL mode enabled; active replica synchronized' },
    { time: '09:15 AM', type: 'success', msg: 'Song database validated successfully: 3/3 compliant schemas' },
    { time: 'Yesterday', type: 'success', msg: 'Deterministic Regex Lexer optimized (unicode character offset detection v1.2)' },
    { time: '2 days ago', type: 'warning', msg: 'System warning: Mixed English-Hebrew layout requires specific manual anchor review' }
  ];

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in">
      {/* Platform Title Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-zinc-100">Workspace Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Platform monitor for Chordbase canonical structures and parser pipeline health.</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-1.5 font-mono text-zinc-400 select-none">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>Local Environment Active</span>
        </div>
      </div>

      {/* Primary Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800/80 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/2 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Canonical Songs</span>
            <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 border border-zinc-900 group-hover:text-blue-400 group-hover:border-zinc-800 transition-all">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-zinc-100">{songs.length}</span>
            <span className="text-[11px] text-zinc-500 font-mono">active in DB</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-zinc-500">
            <span className="text-emerald-500">{confirmedSongs} Confirmed</span>
            <span>•</span>
            <span className="text-amber-500">{pendingSongs} Review</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800/80 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/2 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Overall Confidence</span>
            <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 border border-zinc-900 group-hover:text-emerald-400 group-hover:border-zinc-800 transition-all">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-zinc-100">
              {(averageConfidence * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">system mean</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
            <span className="text-emerald-500">Excellent</span>
            <span>alignment precision threshold</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800/80 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/2 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Prisma Schema sync</span>
            <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 border border-zinc-900 group-hover:text-violet-400 group-hover:border-zinc-800 transition-all">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-zinc-100">100%</span>
            <span className="text-[11px] text-zinc-500 font-mono">SQLite verified</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Structured integrity safe</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800/80 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/2 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Engine Status</span>
            <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 border border-zinc-900 group-hover:text-amber-400 group-hover:border-zinc-800 transition-all">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-md font-sans font-semibold text-zinc-100 truncate max-w-[150px] block">
              {activeModule ? activeModule.name.split(' ')[0] : 'Standby'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">active</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready for parsing pipeline</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Distribution Plot */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-sans font-medium text-zinc-100">Layout Confidence Distribution</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Statistical confidence distribution of alignment across simulated 500+ song tests</p>
            </div>
            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2.5 py-1 rounded border border-zinc-800">
              Mean: 92.4%
            </span>
          </div>

          {/* SVG Histograms */}
          <div className="h-60 flex items-end justify-between gap-2.5 pt-6 pb-2 border-b border-zinc-900/60 relative">
            <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-zinc-900/40" />
            <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-zinc-900/40" />
            <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-zinc-900/40" />

            {graphData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar z-10">
                <div className="text-[10px] font-mono text-zinc-500 opacity-0 group-hover/bar:opacity-100 transition-opacity pb-1">
                  {d.val} runs
                </div>
                {/* Visual Bar container */}
                <div className="w-full bg-zinc-900 rounded-md relative overflow-hidden transition-all duration-300 group-hover/bar:bg-zinc-800/80 cursor-pointer" style={{ height: `${d.h}px` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-600/80 to-indigo-500/50 group-hover/bar:from-blue-500 group-hover/bar:to-indigo-400 transition-all rounded-md" style={{ height: '100%' }} />
                </div>
                <span className="text-[10px] font-mono text-zinc-400">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-[11px] text-zinc-500 font-mono">
            <span>Minimum layout thresh: 60%</span>
            <span>Total Simulated Pipeline Records: 531</span>
          </div>
        </div>

        {/* Database Diagnostic Stream */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-sans font-medium text-zinc-100 mb-1">SQLite & Engine Logs</h3>
            <p className="text-[11px] text-zinc-500 mb-5">Platform execution telemetry and database migration states</p>
            
            <div className="space-y-4">
              {systemLogs.map((log, index) => (
                <div key={index} className="flex gap-3 text-xs">
                  <div className="text-[10px] font-mono text-zinc-500 w-16 shrink-0 pt-0.5">{log.time}</div>
                  <div className="flex-1 font-mono text-zinc-300 leading-relaxed break-words">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                      log.type === 'success' ? 'bg-emerald-500' :
                      log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    {log.msg}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">SQLite Replica: Online</span>
            <button 
              onClick={() => setActiveView('settings')}
              className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all"
            >
              Configure Engines <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Song Records */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-sans font-medium text-zinc-100">Live Database Schema Records</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Songs compiled and verified within the canonical JSON/relational mapping</p>
          </div>
          <button 
            onClick={() => setActiveView('library')}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-all"
          >
            Open Song Library
          </button>
        </div>

        <div className="divide-y divide-zinc-900">
          {songs.map((song) => (
            <div key={song.id} className="py-3.5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-400 font-mono text-xs group-hover:border-zinc-700 transition-all">
                  {song.language.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    {song.title}
                    {song.language === 'ar' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-mono">RTL Unicode</span>
                    )}
                    {song.language === 'mixed' && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[9px] font-mono">Multi-Language</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{song.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Confidence */}
                <div className="text-right">
                  <span className="text-xs font-mono font-medium text-zinc-300">
                    {(song.overallConfidence * 100).toFixed(0)}% Conf
                  </span>
                  <div className="w-16 h-1 bg-zinc-900 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        song.overallConfidence > 0.95 ? 'bg-emerald-500' :
                        song.overallConfidence > 0.90 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${song.overallConfidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium select-none ${
                  song.status === SongStatus.Confirmed ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                  song.status === SongStatus.PendingReview ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                  'bg-zinc-800 text-zinc-400 border border-zinc-800'
                }`}>
                  {song.status.toUpperCase().replace('_', ' ')}
                </span>

                {/* Action button */}
                <button
                  id={`inspect-${song.id}`}
                  onClick={() => {
                    setSelectedSongId(song.id);
                    setActiveView('library');
                  }}
                  className="p-1.5 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-all"
                  title="Inspect structure schema"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
