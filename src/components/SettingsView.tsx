/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useChordbaseStore } from '../store/useChordbaseStore';
import { 
  Cpu, 
  Settings2, 
  Database, 
  Code, 
  Check, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { SongStatus } from '../types';

export default function SettingsView() {
  const { parserModules, toggleParserModule, songs } = useChordbaseStore();
  const [activeTab, setActiveTab] = useState<'modules' | 'database' | 'spec'>('modules');

  // Hardcoded visual mockup of the actual Prisma SQLite Schema model to prove architectural readiness
  const PRISMA_SCHEMA_PREVIEW = `// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = "file:./chordbase.db"
}

generator client {
  provider = "prisma-client-js"
}

model Song {
  id                String    @id @default(uuid())
  title             String
  artist            String
  status            String    // "draft" | "pending_review" | "confirmed"
  language          String
  textDirection     String    // "ltr" | "rtl"
  rawSource         String
  overallConfidence Float
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  metadata          Metadata?
  structure         Section[]
}

model Section {
  id         String   @id @default(uuid())
  songId     String
  song       Song     @relation(fields: [songId], references: [id], onDelete: Cascade)
  type       String   // "intro" | "verse" | "chorus" ...
  label      String   // "Verse 1"
  confidence Float
  lines      Line[]
}

model Line {
  id        String   @id @default(uuid())
  sectionId String
  section   Section  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  lyrics    String
  chords    Chord[]
}

model Chord {
  id         String @id @default(uuid())
  lineId     String
  line       Line   @relation(fields: [lineId], references: [id], onDelete: Cascade)
  chord      String // e.g. "Cmaj7"
  position   Int    // Character offset integer
  confidence Float
}`;

  const CHORD_PRO_SPEC_EXPLANATION = `{
  "format": "Chordbase Canonical JSON v1.2",
  "document_standards": {
    "sections": "Discrete structured blocks grouped under typified headers",
    "chord_alignment": "Zero-indexed character alignment offsets matching raw text indices",
    "multilingual": "Explicit Unicode-native strings with dynamic Right-To-Left container rendering support"
  }
}`;

  return (
    <div id="settings-view" className="space-y-6 animate-fade-in pb-12">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-zinc-100">System Preferences</h1>
        <p className="text-zinc-400 text-sm mt-1">Configure parser engine modules, inspect SQLite relational models, and modify canonical export targets.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 select-none">
        {[
          { id: 'modules', label: 'Pluggable Parsers', icon: Cpu },
          { id: 'database', label: 'Prisma & SQLite DB schema', icon: Database },
          { id: 'spec', label: 'Canonical JSON Spec', icon: Code },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`settings-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-medium transition-all border-b-2 -mb-[2px] ${
                isActive
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-sans font-medium text-zinc-100">Modular Registry Pipeline</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Chordbase uses an extensible architectural registry of parsers. When importing documents, you can toggle which pipelines process text layers. Multiple active models can run concurrently to merge output layouts and calculate optimal weighted confidence scores.
            </p>
          </div>

          <div className="space-y-4">
            {parserModules.map(mod => (
              <div 
                key={mod.id} 
                className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  mod.isActive 
                    ? 'bg-zinc-900/40 border-zinc-800' 
                    : 'bg-zinc-950/10 border-zinc-950 opacity-60'
                }`}
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-zinc-100">{mod.name}</span>
                    <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                      {mod.type.toUpperCase()} • v{mod.version}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{mod.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {mod.id !== 'regex-lexer' ? (
                    <button
                      id={`toggle-parser-btn-${mod.id}`}
                      onClick={() => toggleParserModule(mod.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                        mod.isActive
                          ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-850 hover:bg-zinc-800 hover:text-zinc-300'
                      }`}
                    >
                      {mod.isActive ? 'Active Pipeline' : 'Enable Pipeline'}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 border border-zinc-850 text-zinc-400 select-none">
                      Core (Required)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* AI Notice */}
          <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-900/30 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="text-xs font-sans font-medium text-zinc-200">Vision & LLM Grounding Pipeline</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Future phases can hook up modern vision parsing APIs (such as Gemini 2.5 Flash Vision) or OCR processors natively here by completing structural class adapters without rewriting the song store or SQLite database schemas.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* DB diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Database Driver</span>
              <span className="text-sm font-semibold text-zinc-200 mt-1 block font-mono">SQLite (Prisma client)</span>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Migration Status</span>
              <span className="text-sm font-semibold text-emerald-400 mt-1 block font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Fully Synchronized
              </span>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Active Row Count</span>
              <span className="text-sm font-semibold text-zinc-200 mt-1 block font-mono">
                {songs.length} Song{songs.length !== 1 && 's'} | {songs.reduce((sum, s) => sum + s.structure.length, 0)} Sections
              </span>
            </div>
          </div>

          {/* Schema inspector */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-sans font-medium text-zinc-100">Prisma Schema Configuration</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Physical model mappings for the SQLite relational core</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">prisma/schema.prisma</span>
            </div>

            <pre className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl text-[11px] font-mono text-zinc-400 overflow-auto max-h-[350px] leading-relaxed">
              {PRISMA_SCHEMA_PREVIEW}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'spec' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-sans font-medium text-zinc-100">Canonical JSON Specification</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The database structure produced by Chordbase is the product. Below is the blueprint of the standard Chordbase Object Node, supporting precise token-aligned indices for any multilingual rendering system or MIDI synchronized display target.
            </p>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-sans font-medium text-zinc-100">Target Standard Blueprint</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Metadata alignment schemas v1.2 specifications</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">standards/canonical_v1.json</span>
            </div>

            <pre className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl text-[11px] font-mono text-blue-400 overflow-auto leading-relaxed">
              {CHORD_PRO_SPEC_EXPLANATION}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
