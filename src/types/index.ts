/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SongStatus {
  Draft = 'draft',
  PendingReview = 'pending_review',
  Confirmed = 'confirmed',
}

export enum SectionType {
  Intro = 'intro',
  Verse = 'verse',
  Chorus = 'chorus',
  PreChorus = 'pre_chorus',
  Bridge = 'bridge',
  Outro = 'outro',
  Instrumental = 'instrumental',
}

export interface ChordAlignment {
  id: string;
  chord: string;          // Canonical chord name (e.g., "Cmaj7", "D/F#")
  position: number;       // Character index offset in the line's lyrics string for exact alignment
  beatOffset?: number;    // Optional beat marker (for future grid/tempo align)
  confidence: number;     // Parser confidence score for this chord (0.0 to 1.0)
}

export interface SongLine {
  id: string;
  lyrics: string;         // The vocal line, support unicode (Arabic, Hebrew, English, Japanese, etc.)
  chords: ChordAlignment[]; // Array of chords aligned over this line
  language?: string;      // Explicit language code if different from song level (for mixed-language tracks)
}

export interface SongSection {
  id: string;
  type: SectionType;
  label: string;          // E.g., "Verse 1", "Chorus B"
  lines: SongLine[];
  confidence: number;     // Section-level structure detection confidence
}

export interface SongMetadata {
  originalKey?: string;
  currentKey?: string;
  tempo?: number;
  timeSignature?: string; // e.g., "4/4"
  composer?: string;
  lyricist?: string;
  copyright?: string;
  tags?: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  status: SongStatus;
  language: string;       // Primary language (e.g., 'en', 'ar', 'he', 'es')
  textDirection: 'ltr' | 'rtl'; // Auto-detected text direction
  rawSource: string;      // The original pasted chord sheet/file content
  metadata: SongMetadata;
  structure: SongSection[];
  overallConfidence: number; // Aggregate parsing/alignment confidence score (0.0 to 1.0)
  createdAt: string;
  updatedAt: string;
}

export interface ParserModule {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'regex' | 'ai' | 'ocr' | 'hybrid';
  isActive: boolean;
}
