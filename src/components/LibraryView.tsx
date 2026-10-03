/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useChordbaseStore } from '../store/useChordbaseStore';
import { 
  Search, 
  Database, 
  Trash2, 
  Check, 
  Copy, 
  Eye, 
  X, 
  Languages, 
  Grid, 
  List,
  Edit2,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Song, SongStatus, SectionType } from '../types';

export default function LibraryView() {
  const { 
    songs, 
    selectedSongId, 
    setSelectedSongId, 
    updateSong, 
    deleteSong 
  } = useChordbaseStore();

  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'visual' | 'schema'>('visual');
  const [copySuccess, setCopySuccess] = useState(false);

  // Filter songs
  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(search.toLowerCase()) || 
                          song.artist.toLowerCase().includes(search.toLowerCase());
    
    const matchesLang = langFilter === 'all' || 
                        song.language === langFilter;
                        
    const matchesStatus = statusFilter === 'all' || 
                          song.status === statusFilter;

    return matchesSearch && matchesLang && matchesStatus;
  });

  const selectedSong = songs.find(s => s.id === selectedSongId) || null;

  const handleCopyJSON = (song: Song) => {
    // Generate clean copyable database representation
    const canonicalPayload = JSON.stringify(song, null, 2);
    navigator.clipboard.writeText(canonicalPayload);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleStatusChange = (id: string, newStatus: SongStatus) => {
    updateSong(id, { status: newStatus });
  };

  return (
    <div id="library-view" className="space-y-6 pb-12 animate-fade-in relative h-full">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-zinc-100">Canonical Song Database</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Browse, review, and export standardized structured document schemas.
          </p>
        </div>
      </div>

      {/* Database Search & Filters */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="flex-1 bg-zinc-900/50 border border-zinc-900 rounded-lg px-3.5 py-2.5 flex items-center gap-3">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              id="library-search"
              type="text"
              placeholder="Query database by song title, composer, or artist name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-0 outline-0 text-sm text-zinc-200 placeholder-zinc-600 font-sans"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-zinc-300 text-xs">Clear</button>
            )}
          </div>

          {/* Quick status filter select */}
          <select
            id="library-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-400 outline-0 focus:border-zinc-800"
          >
            <option value="all">Status: ALL SCHEMAS</option>
            <option value={SongStatus.Confirmed}>Status: CONFIRMED</option>
            <option value={SongStatus.PendingReview}>Status: PENDING REVIEW</option>
            <option value={SongStatus.Draft}>Status: DRAFT</option>
          </select>
        </div>

        {/* Quick Language Filter Pills (Unicode tags) */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-900/40 flex-wrap">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider font-mono mr-2">Languages:</span>
          {[
            { id: 'all', label: 'All Unicode' },
            { id: 'en', label: 'English (LTR)' },
            { id: 'ar', label: 'Arabic (RTL)' },
            { id: 'he', label: 'Hebrew (RTL)' },
            { id: 'es', label: 'Spanish' },
            { id: 'mixed', label: 'Bilingual' },
          ].map(lang => (
            <button
              key={lang.id}
              id={`lang-filter-${lang.id}`}
              onClick={() => setLangFilter(lang.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all font-mono ${
                langFilter === lang.id
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSongs.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-zinc-900 rounded-xl space-y-2">
            <Database className="w-8 h-8 text-zinc-700 mx-auto animate-pulse" />
            <span className="text-xs font-mono text-zinc-500 block">No Database Records Found</span>
            <p className="text-[11px] text-zinc-600 max-w-xs mx-auto">Try clearing search parameters or importing new sheets in the Import Engine workspace.</p>
          </div>
        ) : (
          filteredSongs.map((song) => {
            const isSelected = selectedSongId === song.id;
            return (
              <div
                key={song.id}
                id={`song-card-${song.id}`}
                onClick={() => setSelectedSongId(song.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-48 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-700 shadow-lg'
                    : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-950/80'
                }`}
              >
                {/* Visual language watermarks */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-zinc-900/10 rounded-full flex items-center justify-center font-mono text-xs text-zinc-800 font-bold uppercase select-none group-hover:scale-110 transition-all">
                  {song.language}
                </div>

                <div>
                  <div className="flex items-start justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${
                      song.status === SongStatus.Confirmed ? 'bg-emerald-500/10 text-emerald-500' :
                      song.status === SongStatus.PendingReview ? 'bg-amber-500/10 text-amber-500' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {song.status.toUpperCase().replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {(song.overallConfidence * 100).toFixed(0)}% align_conf
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100 mt-4 leading-snug truncate pr-6 group-hover:text-blue-400 transition-colors">
                    {song.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate mt-1">
                    {song.artist}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-900/60 mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Sections: {song.structure.length}</span>
                  <span className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    Inspect <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Apple-style Drawer Panel Inspector */}
      <AnimatePresence>
        {selectedSong && (
          <div 
            id="inspector-drawer-overlay"
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 flex justify-end"
            onClick={() => setSelectedSongId(null)}
          >
            <motion.div
              id="inspector-drawer-window"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 uppercase">
                    {selectedSong.language}
                  </div>
                  <div>
                    <h2 className="text-md font-semibold text-zinc-100 flex items-center gap-2">
                      {selectedSong.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">{selectedSong.artist}</p>
                  </div>
                </div>
                <button
                  id="close-inspector-btn"
                  onClick={() => setSelectedSongId(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-header navigation: Visual Render vs Raw database JSON */}
              <div className="px-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/40 py-2 shrink-0 select-none">
                <div className="flex gap-2">
                  <button
                    id="tab-visual"
                    onClick={() => setActiveTab('visual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
                      activeTab === 'visual'
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Structural Preview
                  </button>
                  <button
                    id="tab-schema"
                    onClick={() => setActiveTab('schema')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
                      activeTab === 'schema'
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Database Schema (JSON)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="copy-schema-btn"
                    onClick={() => handleCopyJSON(selectedSong)}
                    className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all text-xs font-mono flex items-center gap-1.5 border border-zinc-900"
                    title="Copy canonical JSON representation"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 text-[10px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scrollable Main Content Drawer */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'visual' ? (
                  <div className="space-y-6">
                    {/* Confidence score metrics banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-zinc-900/30 border border-zinc-900/60 rounded-xl p-4">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase">Alignment Confidence</span>
                        <span className="text-sm font-semibold text-zinc-200 mt-1 block">
                          {(selectedSong.overallConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase">Detected Key</span>
                        <span className="text-sm font-semibold text-zinc-200 mt-1 block">
                          {selectedSong.metadata.currentKey || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase">Tempo</span>
                        <span className="text-sm font-semibold text-zinc-200 mt-1 block font-mono">
                          {selectedSong.metadata.tempo ? `${selectedSong.metadata.tempo} BPM` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Structure Parser Layout */}
                    <div className="space-y-4">
                      {selectedSong.structure.map((section) => (
                        <div key={section.id} className="border border-zinc-900 rounded-xl bg-zinc-950/80 overflow-hidden">
                          <div className="bg-zinc-900/30 px-4 py-2 border-b border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span className="font-semibold text-zinc-300">{section.label}</span>
                            <span>Confidence: {(section.confidence * 100).toFixed(0)}%</span>
                          </div>
                          
                          <div className="p-5 space-y-4">
                            {section.lines.map((line) => (
                              <div 
                                key={line.id} 
                                className={`space-y-1.5 border-l border-zinc-800/80 pl-3 ${
                                  selectedSong.textDirection === 'rtl' ? 'text-right border-l-0 border-r border-zinc-800/80 pr-3' : 'text-left'
                                }`}
                                dir={selectedSong.textDirection}
                              >
                                {/* Align chords */}
                                {line.chords.length > 0 && (
                                  <div className="font-mono text-xs font-semibold text-blue-400 flex flex-wrap gap-2 select-all leading-none pb-0.5 h-4.5">
                                    {line.chords.map((align) => (
                                      <span 
                                        key={align.id} 
                                        className="px-1.5 py-0.2 rounded bg-blue-950/10 text-[11px] border border-blue-900/10"
                                        title={`Aligned character offset: ${align.position}`}
                                      >
                                        {align.chord}
                                        <span className="text-[9px] text-zinc-600 ml-1">@{align.position}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="text-xs text-zinc-300 font-sans tracking-wide">
                                  {line.lyrics || <span className="text-zinc-600 italic">[Instrumental Section]</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // JSON Database inspector rendering
                  <div className="h-full flex flex-col">
                    <pre className="flex-1 bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 text-[11px] font-mono leading-relaxed text-blue-300 overflow-auto select-text max-h-[500px]">
                      {JSON.stringify(selectedSong, null, 2)}
                    </pre>
                    <p className="text-[10px] font-mono text-zinc-500 mt-2">
                      * This JSON payload models the complete canonical document entity. music database applications can directly consume this target schema.
                    </p>
                  </div>
                )}
              </div>

              {/* Drawer Footer: Manual Review Controls */}
              <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 shrink-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">Manual Review Verification</span>
                    <p className="text-xs text-zinc-400 mt-0.5">Approve the parsed record to declare it production-compliant.</p>
                  </div>

                  <div className="flex gap-1.5">
                    {[
                      { id: SongStatus.Draft, label: 'Draft', color: 'hover:bg-zinc-800 border-zinc-800' },
                      { id: SongStatus.PendingReview, label: 'Pending', color: 'hover:bg-amber-900/20 border-zinc-800' },
                      { id: SongStatus.Confirmed, label: 'Confirm', color: 'hover:bg-emerald-900/20 border-zinc-800' },
                    ].map(statusBtn => {
                      const isActive = selectedSong.status === statusBtn.id;
                      return (
                        <button
                          key={statusBtn.id}
                          id={`btn-status-set-${statusBtn.id}`}
                          onClick={() => handleStatusChange(selectedSong.id, statusBtn.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                            isActive
                              ? statusBtn.id === SongStatus.Confirmed
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : statusBtn.id === SongStatus.PendingReview
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-200 border-zinc-700'
                              : `bg-transparent text-zinc-500 ${statusBtn.color}`
                          }`}
                        >
                          {statusBtn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                  <button
                    id="btn-delete-record"
                    onClick={() => {
                      if(confirm('Are you absolutely sure you want to delete this canonical record?')) {
                        deleteSong(selectedSong.id);
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-red-950/30 hover:bg-red-950/80 text-red-400 border border-red-900/30 hover:border-red-800 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Song Record
                  </button>

                  <button
                    id="btn-close-inspect"
                    onClick={() => setSelectedSongId(null)}
                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-sans font-medium transition-all"
                  >
                    Done Inspections
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
