/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Song, SongStatus, SectionType, ParserModule } from '../types';

interface ChordbaseState {
  songs: Song[];
  activeView: 'dashboard' | 'import' | 'library' | 'settings';
  selectedSongId: string | null;
  isCommandPaletteOpen: boolean;
  parserModules: ParserModule[];
  searchQuery: string;
  theme: 'dark' | 'light';
  
  // Actions
  setActiveView: (view: 'dashboard' | 'import' | 'library' | 'settings') => void;
  setSelectedSongId: (id: string | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  addSong: (song: Song) => void;
  updateSong: (id: string, updated: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  toggleParserModule: (id: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const INITIAL_PARSER_MODULES: ParserModule[] = [
  {
    id: 'regex-lexer',
    name: 'Standard Deterministic Regex Lexer',
    description: 'Uses regular expressions to extract chord lines and align them based on character offsets. Highly performant for clean text files.',
    version: '1.2.0',
    type: 'regex',
    isActive: true,
  },
  {
    id: 'gemini-structure-ai',
    name: 'Gemini 2.5 Flash Song Parser',
    description: 'Leverages advanced LLM layout reasoning to understand unstructured chord sheets, detect languages, and predict chord anchors in complex formatting.',
    version: '2.0.1',
    type: 'ai',
    isActive: false,
  },
  {
    id: 'vision-ocr-layout',
    name: 'Google Vision OCR Layout Analyzer',
    description: 'Pre-processes PDF documents and high-resolution images to reconstruct spatial grid lines and perform advanced typographic segmentation.',
    version: '0.9.4',
    type: 'ocr',
    isActive: false,
  }
];

const SEED_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'Hotel California',
    artist: 'Eagles',
    status: SongStatus.Confirmed,
    language: 'en',
    textDirection: 'ltr',
    rawSource: `[Intro]
Bm  F#  A  E  G  D  Em  F#

[Verse 1]
Bm                     F#
On a dark desert highway, cool wind in my hair
A                      E
Warm smell of colitas, rising up through the air
G                      D
Up ahead in the distance, I saw a shimmering light
Em
My head grew heavy and my sight grew dim
F#
I had to stop for the night`,
    metadata: {
      originalKey: 'Bm',
      currentKey: 'Bm',
      tempo: 147,
      timeSignature: '4/4',
      composer: 'Don Felder, Don Henley, Glenn Frey',
      lyricist: 'Don Henley',
      tags: ['Rock', 'Classic', 'Seventies'],
    },
    structure: [
      {
        id: 'sec-1',
        type: SectionType.Intro,
        label: 'Intro',
        confidence: 0.99,
        lines: [
          {
            id: 'line-1',
            lyrics: '',
            chords: [
              { id: 'c-1', chord: 'Bm', position: 0, confidence: 1.0 },
              { id: 'c-2', chord: 'F#', position: 4, confidence: 1.0 },
              { id: 'c-3', chord: 'A', position: 8, confidence: 1.0 },
              { id: 'c-4', chord: 'E', position: 11, confidence: 1.0 },
              { id: 'c-5', chord: 'G', position: 14, confidence: 1.0 },
              { id: 'c-6', chord: 'D', position: 17, confidence: 1.0 },
              { id: 'c-7', chord: 'Em', position: 21, confidence: 1.0 },
              { id: 'c-8', chord: 'F#', position: 25, confidence: 1.0 },
            ],
          }
        ]
      },
      {
        id: 'sec-2',
        type: SectionType.Verse,
        label: 'Verse 1',
        confidence: 0.96,
        lines: [
          {
            id: 'line-2',
            lyrics: 'On a dark desert highway, cool wind in my hair',
            chords: [
              { id: 'c-9', chord: 'Bm', position: 0, confidence: 0.98 },
              { id: 'c-10', chord: 'F#', position: 23, confidence: 0.97 },
            ]
          },
          {
            id: 'line-3',
            lyrics: 'Warm smell of colitas, rising up through the air',
            chords: [
              { id: 'c-11', chord: 'A', position: 0, confidence: 0.99 },
              { id: 'c-12', chord: 'E', position: 23, confidence: 0.98 },
            ]
          },
          {
            id: 'line-4',
            lyrics: 'Up ahead in the distance, I saw a shimmering light',
            chords: [
              { id: 'c-13', chord: 'G', position: 0, confidence: 0.95 },
              { id: 'c-14', chord: 'D', position: 26, confidence: 0.96 },
            ]
          },
          {
            id: 'line-5',
            lyrics: 'My head grew heavy and my sight grew dim',
            chords: [
              { id: 'c-15', chord: 'Em', position: 0, confidence: 0.99 },
            ]
          },
          {
            id: 'line-6',
            lyrics: 'I had to stop for the night',
            chords: [
              { id: 'c-16', chord: 'F#', position: 0, confidence: 0.99 },
            ]
          }
        ]
      }
    ],
    overallConfidence: 0.97,
    createdAt: '2026-07-16T10:30:00Z',
    updatedAt: '2026-07-16T10:30:00Z',
  },
  {
    id: 'song-2',
    title: 'Ya Rayah (يا رايح)',
    artist: 'Dahmane El Harrachi',
    status: SongStatus.PendingReview,
    language: 'ar',
    textDirection: 'rtl',
    rawSource: `[Chorus]
Am                       Dm
يا رايح وين مسافر تروح تعيا وتولي
G                     C
شحال ندموا العباد الغافلين قبلك وقبلي
Am                      Dm
شحال شفت البلدان العامرين والبر الخالي
G                       C
شحال ضيعت وقات وشحال تزيد ما زال تخلي`,
    metadata: {
      originalKey: 'Am',
      currentKey: 'Am',
      tempo: 112,
      timeSignature: '4/4',
      composer: 'Dahmane El Harrachi',
      lyricist: 'Dahmane El Harrachi',
      tags: ['Algerian', 'Chaabi', 'Folk'],
    },
    structure: [
      {
        id: 'sec-2-1',
        type: SectionType.Chorus,
        label: 'اللازمة (Chorus)',
        confidence: 0.94,
        lines: [
          {
            id: 'line-2-1',
            lyrics: 'يا رايح وين مسافر تروح تعيا وتولي',
            chords: [
              { id: 'c-20', chord: 'Am', position: 0, confidence: 0.95 },
              { id: 'c-21', chord: 'Dm', position: 20, confidence: 0.92 },
            ]
          },
          {
            id: 'line-2-2',
            lyrics: 'شحال ندموا العباد الغافلين قبلك وقبلي',
            chords: [
              { id: 'c-22', chord: 'G', position: 0, confidence: 0.94 },
              { id: 'c-23', chord: 'C', position: 20, confidence: 0.93 },
            ]
          },
          {
            id: 'line-2-3',
            lyrics: 'شحال شفت البلدان العامرين والبر الخالي',
            chords: [
              { id: 'c-24', chord: 'Am', position: 0, confidence: 0.95 },
              { id: 'c-25', chord: 'Dm', position: 21, confidence: 0.91 },
            ]
          },
          {
            id: 'line-2-4',
            lyrics: 'شحال ضيعت وقات وشحال تزيد ما زال تخلي',
            chords: [
              { id: 'c-26', chord: 'G', position: 0, confidence: 0.94 },
              { id: 'c-27', chord: 'C', position: 21, confidence: 0.94 },
            ]
          }
        ]
      }
    ],
    overallConfidence: 0.93,
    createdAt: '2026-07-17T08:15:00Z',
    updatedAt: '2026-07-17T08:15:00Z',
  },
  {
    id: 'song-3',
    title: 'Hallelujah (Bilingual)',
    artist: 'Leonard Cohen (feat. Hebrew Verse)',
    status: SongStatus.Draft,
    language: 'mixed',
    textDirection: 'ltr',
    rawSource: `[Verse 1]
C                      Am
I've heard there was a secret chord
C                      Am
That David played, and it pleased the Lord
F                      G              C      G
But you don't really care for music, do you?

[Verse 2 - Hebrew]
C                 Am
שמעתי שיר מתוך שתיקה
C                 Am
מזמור ישן של דוד מלכא
F                  G                 C      G
שניגן לאל ומצא את הדרך אליך`,
    metadata: {
      originalKey: 'C',
      currentKey: 'C',
      tempo: 80,
      timeSignature: '12/8',
      composer: 'Leonard Cohen',
      lyricist: 'Leonard Cohen / Transl.',
      tags: ['Bilingual', 'Ballad', 'Classic'],
    },
    structure: [
      {
        id: 'sec-3-1',
        type: SectionType.Verse,
        label: 'Verse 1 (English)',
        confidence: 0.98,
        lines: [
          {
            id: 'line-3-1',
            lyrics: "I've heard there was a secret chord",
            chords: [
              { id: 'c-30', chord: 'C', position: 0, confidence: 0.99 },
              { id: 'c-31', chord: 'Am', position: 23, confidence: 0.99 },
            ]
          },
          {
            id: 'line-3-2',
            lyrics: 'That David played, and it pleased the Lord',
            chords: [
              { id: 'c-32', chord: 'C', position: 0, confidence: 0.99 },
              { id: 'c-33', chord: 'Am', position: 23, confidence: 0.99 },
            ]
          },
          {
            id: 'line-3-3',
            lyrics: "But you don't really care for music, do you?",
            chords: [
              { id: 'c-34', chord: 'F', position: 0, confidence: 0.98 },
              { id: 'c-35', chord: 'G', position: 23, confidence: 0.98 },
              { id: 'c-36', chord: 'C', position: 37, confidence: 0.97 },
              { id: 'c-37', chord: 'G', position: 42, confidence: 0.97 },
            ]
          }
        ]
      },
      {
        id: 'sec-3-2',
        type: SectionType.Verse,
        label: 'Verse 2 (Hebrew RTL - Left-aligned Chords)',
        confidence: 0.92,
        lines: [
          {
            id: 'line-3-4',
            lyrics: 'שמעתי שיר מתוך שתיקה',
            language: 'he',
            chords: [
              { id: 'c-38', chord: 'C', position: 0, confidence: 0.94 },
              { id: 'c-39', chord: 'Am', position: 14, confidence: 0.92 },
            ]
          },
          {
            id: 'line-3-5',
            lyrics: 'מזמור ישן של דוד מלכא',
            language: 'he',
            chords: [
              { id: 'c-40', chord: 'C', position: 0, confidence: 0.94 },
              { id: 'c-41', chord: 'Am', position: 15, confidence: 0.91 },
            ]
          },
          {
            id: 'line-3-6',
            lyrics: 'שניגן לאל ומצא את הדרך אליך',
            language: 'he',
            chords: [
              { id: 'c-42', chord: 'F', position: 0, confidence: 0.90 },
              { id: 'c-43', chord: 'G', position: 10, confidence: 0.89 },
              { id: 'c-44', chord: 'C', position: 22, confidence: 0.88 },
              { id: 'c-45', chord: 'G', position: 26, confidence: 0.88 },
            ]
          }
        ]
      }
    ],
    overallConfidence: 0.94,
    createdAt: '2026-07-17T15:20:00Z',
    updatedAt: '2026-07-17T15:45:00Z',
  }
];

export const useChordbaseStore = create<ChordbaseState>((set) => ({
  songs: SEED_SONGS,
  activeView: 'dashboard',
  selectedSongId: null,
  isCommandPaletteOpen: false,
  parserModules: INITIAL_PARSER_MODULES,
  searchQuery: '',
  theme: 'dark',

  setActiveView: (view) => set({ activeView: view }),
  setSelectedSongId: (id) => set({ selectedSongId: id }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addSong: (song) => set((state) => ({ 
    songs: [song, ...state.songs] 
  })),
  
  updateSong: (id, updated) => set((state) => ({
    songs: state.songs.map((song) => 
      song.id === id 
        ? { ...song, ...updated, updatedAt: new Date().toISOString() } 
        : song
    ),
    // Update selected song if it was updated
    selectedSongId: state.selectedSongId === id ? id : state.selectedSongId
  })),
  
  deleteSong: (id) => set((state) => ({
    songs: state.songs.filter((song) => song.id !== id),
    selectedSongId: state.selectedSongId === id ? null : state.selectedSongId
  })),
  
  toggleParserModule: (id) => set((state) => ({
    parserModules: state.parserModules.map((mod) => 
      mod.id === id ? { ...mod, isActive: !mod.isActive } : mod
    )
  })),

  setTheme: (theme) => set({ theme })
}));
