/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song, SongStatus, SectionType, SongSection, SongLine, ChordAlignment } from '../types';

/**
 * A regex-based modular layout engine that parses raw text into a canonical database structure.
 */
export function analyzeSongLayout(
  rawText: string,
  title: string = 'Untitled Import',
  artist: string = 'Unknown Artist'
): Song {
  const lines = rawText.split('\n');
  const sections: SongSection[] = [];
  let currentSection: SongSection | null = null;
  
  // Detect RTL: Scan for Arabic or Hebrew characters
  const rtlRegex = /[\u0600-\u06FF\u0590-\u05FF]/;
  const isRtl = rtlRegex.test(rawText);
  const textDirection = isRtl ? 'rtl' : 'ltr';
  
  // Basic language heuristic
  let language = 'en';
  if (/[\u0600-\u06FF]/.test(rawText)) language = 'ar';
  else if (/[\u0590-\u05FF]/.test(rawText)) language = 'he';
  else if (/[áéíóúñ¿¡]/i.test(rawText)) language = 'es';

  // Helper to test if a line is composed mostly of chords
  const isChordLine = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    
    // Chord tokens look like: C, G, Am, F#m, D/F#, Cmaj7, Esus4, Bb, etc.
    // Also include common dividers like | or spacers
    const chordTokenRegex = /^[A-G][b#]?(m|min|maj|dim|aug|sus|add)?\d*(\/[A-G][b#]?)?$/;
    const tokens = trimmed.split(/\s+/);
    
    let chordCount = 0;
    for (const token of tokens) {
      // Stripping brackets/parentheses or common separator symbols
      const cleanToken = token.replace(/[()|]/g, '');
      if (!cleanToken) continue;
      
      if (chordTokenRegex.test(cleanToken)) {
        chordCount++;
      }
    }
    
    // If more than 60% of non-empty tokens look like chords, or if it is a mix of chord tokens and spacing
    return chordCount > 0 && (chordCount / tokens.length) >= 0.5;
  };

  // Helper to parse chords with character positions
  const parseChords = (chordLine: string): ChordAlignment[] => {
    const alignments: ChordAlignment[] = [];
    // Regex matches non-whitespace sequences representing chords
    const regex = /\S+/g;
    let match;
    
    while ((match = regex.exec(chordLine)) !== null) {
      alignments.push({
        id: `c-align-${Math.random().toString(36).substr(2, 9)}`,
        chord: match[0],
        position: match.index,
        confidence: 0.98, // Baseline deterministic confidence
      });
    }
    
    return alignments;
  };

  // Process line by line
  let pendingChords: ChordAlignment[] | null = null;
  let sectionCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 1. Detect Section Headers
    // E.g., [Verse 1], [Chorus], (Intro), اللازمة
    const headerMatch = line.match(/^\[([^\]]+)\]$/) || line.match(/^\(([^)]+)\)$/);
    if (headerMatch) {
      const label = headerMatch[1];
      let type = SectionType.Verse;
      
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('intro')) type = SectionType.Intro;
      else if (lowerLabel.includes('chorus') || lowerLabel.includes('اللازمة') || lowerLabel.includes('פזמון')) type = SectionType.Chorus;
      else if (lowerLabel.includes('pre')) type = SectionType.PreChorus;
      else if (lowerLabel.includes('bridge') || lowerLabel.includes('גשר')) type = SectionType.Bridge;
      else if (lowerLabel.includes('outro')) type = SectionType.Outro;
      else if (lowerLabel.includes('instrumental') || lowerLabel.includes('عزف')) type = SectionType.Instrumental;

      // Close previous section if any
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        id: `sec-import-${sectionCounter++}`,
        type,
        label,
        lines: [],
        confidence: 0.95
      };
      
      pendingChords = null;
      continue;
    }

    // Ensure we always have an active section container
    if (!currentSection) {
      currentSection = {
        id: `sec-import-default`,
        type: SectionType.Verse,
        label: 'Section 1',
        lines: [],
        confidence: 0.80 // Lower confidence because header was synthesized
      };
    }

    // 2. Identify Chord line vs Lyric Line
    if (isChordLine(lines[i])) {
      pendingChords = parseChords(lines[i]);
      
      // If it's the last line of the song, or next line is also a chord line or section header
      const nextLine = lines[i + 1]?.trim();
      const isNextHeader = nextLine && (/^\[([^\]]+)\]$/.test(nextLine) || /^\(([^)]+)\)$/.test(nextLine));
      const isNextChord = nextLine && isChordLine(lines[i + 1]);
      
      if (!nextLine || isNextHeader || isNextChord) {
        // Instrumental chord line with no lyrics
        currentSection.lines.push({
          id: `line-${Math.random().toString(36).substr(2, 9)}`,
          lyrics: '',
          chords: pendingChords
        });
        pendingChords = null;
      }
    } else {
      // Lyric line. Bind pending chords if available, otherwise empty chords
      currentSection.lines.push({
        id: `line-${Math.random().toString(36).substr(2, 9)}`,
        lyrics: lines[i], // Keep original spacing/content
        chords: pendingChords || []
      });
      pendingChords = null;
    }
  }

  // Push final section
  if (currentSection) {
    sections.push(currentSection);
  }

  // Calculate overall confidence (geometric mean of sections and lines)
  const confidenceSum = sections.reduce((sum, sec) => sum + sec.confidence, 0);
  const overallConfidence = sections.length > 0 ? confidenceSum / sections.length : 0.90;

  return {
    id: `song-${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim() || 'Untitled Song',
    artist: artist.trim() || 'Unknown Artist',
    status: SongStatus.PendingReview, // New imports start as pending review
    language,
    textDirection,
    rawSource: rawText,
    metadata: {
      originalKey: sections[0]?.lines[0]?.chords[0]?.chord || 'C',
      currentKey: sections[0]?.lines[0]?.chords[0]?.chord || 'C',
      tempo: 120,
      timeSignature: '4/4',
    },
    structure: sections,
    overallConfidence,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
