/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useChordbaseStore } from '../store/useChordbaseStore';
import { 
  Search, 
  Terminal, 
  Settings, 
  Database, 
  UploadCloud, 
  Cpu, 
  X, 
  Navigation,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  action: () => void;
}

export default function CommandMenu() {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    setActiveView, 
    parserModules, 
    toggleParserModule 
  } = useChordbaseStore();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle Command Palette on Cmd+K/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Command database
  const commands: CommandItem[] = [
    {
      id: 'nav-dash',
      label: 'Go to Dashboard Overview',
      category: 'Navigation',
      icon: Navigation,
      shortcut: ['G', 'D'],
      action: () => { setActiveView('dashboard'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-import',
      label: 'Go to Import Workspace',
      category: 'Navigation',
      icon: UploadCloud,
      shortcut: ['G', 'I'],
      action: () => { setActiveView('import'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-library',
      label: 'Go to Song Library',
      category: 'Navigation',
      icon: Database,
      shortcut: ['G', 'L'],
      action: () => { setActiveView('library'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings & Parsers',
      category: 'Navigation',
      icon: Settings,
      shortcut: ['G', 'S'],
      action: () => { setActiveView('settings'); setCommandPaletteOpen(false); }
    },
    ...parserModules.map(mod => ({
      id: `toggle-mod-${mod.id}`,
      label: `Toggle parser: ${mod.name}`,
      category: 'Parser Engine',
      icon: Cpu,
      action: () => { toggleParserModule(mod.id); }
    }))
  ];

  // Filter based on search query
  const filtered = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Handle arrow navigation and selection
  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleNav);
    return () => window.removeEventListener('keydown', handleNav);
  }, [isCommandPaletteOpen, selectedIndex, filtered]);

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="command-palette-overlay"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
        onClick={() => setCommandPaletteOpen(false)}
      >
        <motion.div
          id="command-palette-window"
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.97, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[420px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Search Bar */}
          <div className="flex items-center border-b border-zinc-900 px-4 py-3.5 gap-3 shrink-0">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search actions, views, and core parser engines..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 bg-transparent border-0 outline-0 text-sm text-zinc-200 placeholder-zinc-500"
            />
            <button 
              onClick={() => setCommandPaletteOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded hover:bg-zinc-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-mono">
                No commands matching "{search}" found.
              </div>
            ) : (
              (() => {
                let currentCategory = '';
                return filtered.map((cmd, index) => {
                  const showCategory = cmd.category !== currentCategory;
                  if (showCategory) {
                    currentCategory = cmd.category;
                  }
                  const Icon = cmd.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <React.Fragment key={cmd.id}>
                      {showCategory && (
                        <span className="text-[10px] font-bold text-zinc-600 px-3 py-1.5 block tracking-wider uppercase select-none">
                          {cmd.category}
                        </span>
                      )}
                      <button
                        id={`cmd-item-${cmd.id}`}
                        onClick={() => cmd.action()}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected 
                            ? 'bg-zinc-900 text-white border-zinc-800' 
                            : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                        } border`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`} />
                          <span className="font-sans text-left">{cmd.label}</span>
                        </div>
                        {cmd.shortcut ? (
                          <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                            {cmd.shortcut.map(s => (
                              <span key={s} className="bg-zinc-950 border border-zinc-800 px-1 rounded uppercase">
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-mono">Action</span>
                        )}
                      </button>
                    </React.Fragment>
                  );
                });
              })()
            )}
          </div>

          {/* Footer Navigation Hints */}
          <div className="border-t border-zinc-900 px-4 py-2.5 bg-zinc-950/80 shrink-0 flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">↑↓</kbd> Navigation
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">Enter</kbd> Select
              </span>
            </div>
            <span>Chordbase Workspace Command Menu</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
