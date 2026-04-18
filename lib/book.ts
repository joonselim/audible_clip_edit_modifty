export interface BookLine {
  id: string
  text: string
  timestamp: number // seconds from chapter start
  isPlaying: boolean
}

export interface Chapter {
  id: string
  title: string
  duration: number // seconds
  lines: BookLine[]
}

export interface PlayerState {
  isPlaying: boolean
  currentTime: number
  isLocked: boolean
  activeWordId: string
  /**
   * When the user scrolls + taps a word to seek, we remember the playback
   * position they were at BEFORE the seek so they can return to it.
   * `null` means "no jump to return to".
   */
  previousTime: number | null
}

export interface BookWord {
  id: string
  text: string
  timestamp: number
  lineId: string
  paragraphId: string
  endOfSentence: boolean
}

export interface Paragraph {
  id: string
  role: 'epigraph' | 'attribution' | 'body' | 'dialogue'
  lineIds: string[]
}

export interface Book {
  id: string
  title: string
  author: string
  subtitle?: string
  timeLeft: string
  progress: number // 0..1
  chapter: Chapter
}

// Dune – Chapter 31 (approximate): opens with Princess Irulan epigraph,
// then a closing beat of Paul, Jessica, and Stilgar in the sietch.
const lines: BookLine[] = [
  { id: 'l1',  text: 'Prophecy and prescience—How can they be put to the test',            timestamp: 0,   isPlaying: false },
  { id: 'l2',  text: 'in the face of the unanswered question?',                             timestamp: 6,   isPlaying: false },
  { id: 'l3',  text: 'Consider: How much is actual prediction of the "wave form"',          timestamp: 12,  isPlaying: false },
  { id: 'l4',  text: '(as Muad\u2019Dib referred to his vision-image)',                      timestamp: 19,  isPlaying: false },
  { id: 'l5',  text: 'and how much is the prophet shaping the future to fit the prophecy?', timestamp: 24,  isPlaying: false },
  { id: 'l6',  text: 'What of the harmonics inherent in the act of prophecy?',              timestamp: 32,  isPlaying: false },
  { id: 'l7',  text: 'Does the prophet see the future,',                                     timestamp: 39,  isPlaying: false },
  { id: 'l8',  text: 'or does he see a line of weakness,',                                   timestamp: 44,  isPlaying: false },
  { id: 'l9',  text: 'a fault or cleavage that he may shatter',                              timestamp: 49,  isPlaying: false },
  { id: 'l10', text: 'with words or decisions,',                                             timestamp: 54,  isPlaying: false },
  { id: 'l11', text: 'as a diamond-cutter shatters his gem with the blow of a knife?',      timestamp: 58,  isPlaying: false },
  { id: 'l12', text: '— from "Private Reflections on Muad\u2019Dib" by the Princess Irulan', timestamp: 66,  isPlaying: false },
  { id: 'l13', text: 'Paul saw it now — the jihad to come,',                                 timestamp: 78,  isPlaying: false },
  { id: 'l14', text: 'the wave of fanaticism that his very existence had set in motion.',    timestamp: 84,  isPlaying: false },
  { id: 'l15', text: 'Jessica watched her son\u2019s face and felt the chill of it.',        timestamp: 92,  isPlaying: false },
  { id: 'l16', text: 'He was seeing something she could not share,',                         timestamp: 99,  isPlaying: false },
  { id: 'l17', text: 'a prescience born of spice and need.',                                 timestamp: 104, isPlaying: false },
  { id: 'l18', text: 'The Fremen waited in silence,',                                        timestamp: 110, isPlaying: false },
  { id: 'l19', text: 'their loyalty a living thing.',                                        timestamp: 114, isPlaying: false },
  { id: 'l20', text: '"We ride at first light," Stilgar said, his voice low and steady.',   timestamp: 120, isPlaying: false },
  { id: 'l21', text: 'Paul nodded, feeling the weight of what he had become',                timestamp: 128, isPlaying: false },
  { id: 'l22', text: 'settle across his shoulders like a mantle.',                           timestamp: 134, isPlaying: false }
]

export const paragraphs: Paragraph[] = [
  {
    id: 'p1',
    role: 'epigraph',
    lineIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11']
  },
  { id: 'p2', role: 'attribution', lineIds: ['l12'] },
  {
    id: 'p3',
    role: 'body',
    lineIds: ['l13', 'l14', 'l15', 'l16', 'l17', 'l18', 'l19']
  },
  { id: 'p4', role: 'dialogue', lineIds: ['l20', 'l21', 'l22'] }
]

/** Split a sentence into tokens, preserving punctuation attached to each word. */
function tokenize(text: string): string[] {
  // keep ordinary whitespace as separator, but allow em-dash punctuation
  return text.split(/\s+/).filter(Boolean)
}

/**
 * Derive per-word timing by distributing each line's timestamp window across
 * its words. End of line defaults to next line's timestamp (or +6s for last).
 */
export function wordsForChapter(chapter: Chapter, paras: Paragraph[] = paragraphs): BookWord[] {
  const lineToParagraph = new Map<string, string>()
  for (const p of paras) for (const id of p.lineIds) lineToParagraph.set(id, p.id)

  const result: BookWord[] = []
  for (let i = 0; i < chapter.lines.length; i++) {
    const line = chapter.lines[i]
    const next = chapter.lines[i + 1]
    const start = line.timestamp
    const end = next ? next.timestamp : start + 6
    const words = tokenize(line.text)
    const dt = words.length > 0 ? (end - start) / words.length : 0
    words.forEach((w, j) => {
      result.push({
        id: `${line.id}-w${j}`,
        text: w,
        timestamp: start + dt * j,
        lineId: line.id,
        paragraphId: lineToParagraph.get(line.id) ?? 'p1',
        endOfSentence: j === words.length - 1 && /[.?!]["\u201D]?$/.test(w)
      })
    })
  }
  return result
}

export function wordForTime(words: BookWord[], t: number): BookWord {
  let active = words[0]
  for (const w of words) {
    if (w.timestamp <= t) active = w
    else break
  }
  return active
}

export const dune: Book = {
  id: 'dune',
  title: 'Dune',
  author: 'Frank Herbert',
  subtitle: 'Book One in the Dune Chronicles',
  timeLeft: '9h 9m left',
  progress: 0.41,
  chapter: {
    id: 'ch-31',
    title: 'Chapter 31',
    duration: 1620,
    lines
  }
}

export const library: Book[] = [
  dune,
  {
    id: 'project-hail-mary',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    timeLeft: '4h 12m left',
    progress: 0.72,
    chapter: { id: 'phm-7', title: 'Chapter 7', duration: 1800, lines: [] }
  },
  {
    id: 'the-way-of-kings',
    title: 'The Way of Kings',
    author: 'Brandon Sanderson',
    timeLeft: '22h 48m left',
    progress: 0.18,
    chapter: { id: 'wok-2', title: 'Chapter 2', duration: 1800, lines: [] }
  },
  {
    id: 'foundation',
    title: 'Foundation',
    author: 'Isaac Asimov',
    timeLeft: '6h 02m left',
    progress: 0.55,
    chapter: { id: 'f-4', title: 'Chapter 4', duration: 1200, lines: [] }
  }
]

export type Audiobook = {
  id: string
  title: string
  author: string
  duration?: string
  price?: string
  discount?: string
}

export const audiobooks: Audiobook[] = [
  { id: 'dune', title: 'Dune', author: 'Frank Herbert', duration: '21h 2m' },
  { id: 'a-promised-land', title: 'A Promised Land', author: 'Barack Obama', duration: '29h 10m' },
  { id: 'end-of-average', title: 'The End of Average', author: 'Todd Rose', duration: '7h 12m' },
  { id: 'yearbook', title: 'Yearbook', author: 'Seth Rogen', duration: '6h 42m' },
  { id: 'born-a-crime', title: 'Born a Crime', author: 'Trevor Noah', duration: '8h 44m', price: '₩8,737', discount: '-68%' },
  { id: 'malcolm-x', title: 'The Autobiography of Malcolm X', author: 'Malcolm X and Alex Haley', duration: '16h 52m', price: '₩10,195', discount: '-71%' },
  { id: 'dune-messiah', title: 'Dune Messiah', author: 'Frank Herbert', duration: '9h 21m' },
  { id: 'dungeon-crawler', title: 'Dungeon Crawler Carl', author: 'Matt Dinniman', duration: '16h 49m' },
  { id: 'harry-potter-hbp', title: 'Harry Potter and the Half-Blood Prince', author: 'J.K. Rowling', duration: '17h 24m' }
]

export const categories: { label: string; color: string }[] = [
  { label: 'Comedy & Humor', color: '#d97706' },
  { label: 'Bios & Memoirs', color: '#2563eb' },
  { label: 'History', color: '#059669' },
  { label: 'Business', color: '#7c3aed' },
  { label: 'Kids', color: '#ea580c' },
  { label: 'Fantasy', color: '#b91c1c' },
  { label: 'Romance', color: '#db2777' },
  { label: 'Mystery', color: '#475569' }
]

export function formatClock(t: number): string {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function lineForTime(chapter: Chapter, t: number): BookLine {
  let active = chapter.lines[0]
  for (const line of chapter.lines) {
    if (line.timestamp <= t) active = line
    else break
  }
  return active
}

/* -----------------------------------------------------------
 * Adaptive Clip — transcript model (for the Pride and Prejudice demo)
 * -----------------------------------------------------------
 *
 * Timings align with the LibriVox Chapter 1 recording by Elizabeth
 * Klett (public domain — CC0), bundled at /audio/pride-ch1.mp3. The
 * first ~24 s of the recording is the LibriVox attribution and
 * "Chapter 1" announcement; the novel's text begins around 25 s.
 *
 * The transcript model is sentence-aligned. Each sentence has a real
 * start/end timestamp so the Sentence/Paragraph clip modes can snap to
 * semantic boundaries. Paragraphs group sentences.
 */

export interface TranscriptSentence {
  id: string
  paragraphId: string
  text: string
  startTime: number
  endTime: number
}

export interface TranscriptParagraph {
  id: string
  sentenceIds: string[]
}

export interface BookTranscript {
  hasTranscript: boolean
  sentences: TranscriptSentence[]
  paragraphs: TranscriptParagraph[]
}

export interface ListenBook {
  id: string
  title: string
  author: string
  subtitle?: string
  chapter: {
    id: string
    title: string
    duration: number // seconds
  }
  bookTimeLeftLabel: string // e.g. "28h 40m left"
  /** Path to a bundled audio file under /public. When absent, the
   * player uses a synthetic clock and play/pause is purely visual. */
  audioSrc?: string
  transcript: BookTranscript
}

/* Sentence timings approximated from the LibriVox Chapter 1 recording.
 * Silences were detected with ffmpeg and cross-referenced against the
 * public-domain text of the novel. */
const prideAndPrejudiceSentences: TranscriptSentence[] = [
  // Paragraph 1 — narrator opens
  { id: 's1',  paragraphId: 'p1', startTime: 25.0,  endTime: 31.9, text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.' },
  { id: 's2',  paragraphId: 'p1', startTime: 33.0,  endTime: 46.1, text: 'However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.' },
  // Paragraph 2 — Mrs. Bennet opens the conversation
  { id: 's3',  paragraphId: 'p2', startTime: 47.2,  endTime: 54.7, text: '"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"' },
  // Paragraph 3
  { id: 's4',  paragraphId: 'p3', startTime: 55.7,  endTime: 57.7, text: 'Mr. Bennet replied that he had not.' },
  // Paragraph 4
  { id: 's5',  paragraphId: 'p4', startTime: 58.6,  endTime: 65.3, text: '"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."' },
  // Paragraph 5
  { id: 's6',  paragraphId: 'p5', startTime: 68.5,  endTime: 72.2, text: 'Mr. Bennet made no answer.' },
  // Paragraph 6
  { id: 's7',  paragraphId: 'p6', startTime: 73.0,  endTime: 79.2, text: '"Do not you want to know who has taken it?" cried his wife impatiently.' },
  // Paragraph 7
  { id: 's8',  paragraphId: 'p7', startTime: 80.0,  endTime: 85.0, text: '"You want to tell me, and I have no objection to hearing it."' },
  // Paragraph 8
  { id: 's9',  paragraphId: 'p8', startTime: 85.6,  endTime: 87.1, text: 'This was invitation enough.' },
  // Paragraph 9 — Mrs. Bennet's long speech about Mr. Bingley
  { id: 's10', paragraphId: 'p9', startTime: 87.8,  endTime: 100.7, text: '"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England;"' },
  { id: 's11', paragraphId: 'p9', startTime: 101.3, endTime: 117.3, text: '"that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately;"' },
  { id: 's12', paragraphId: 'p9', startTime: 118.0, endTime: 130.8, text: '"that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."' },
  // Paragraph 10
  { id: 's13', paragraphId: 'p10', startTime: 131.5, endTime: 134.2, text: '"What is his name?"' },
  // Paragraph 11
  { id: 's14', paragraphId: 'p11', startTime: 135.0, endTime: 138.8, text: '"Bingley."' },
  // Paragraph 12
  { id: 's15', paragraphId: 'p12', startTime: 139.5, endTime: 145.9, text: '"Is he married or single?"' },
  // Paragraph 13
  { id: 's16', paragraphId: 'p13', startTime: 146.5, endTime: 159.9, text: '"Oh! single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"' }
]

const prideAndPrejudiceParagraphs: TranscriptParagraph[] = [
  { id: 'p1',  sentenceIds: ['s1', 's2'] },
  { id: 'p2',  sentenceIds: ['s3'] },
  { id: 'p3',  sentenceIds: ['s4'] },
  { id: 'p4',  sentenceIds: ['s5'] },
  { id: 'p5',  sentenceIds: ['s6'] },
  { id: 'p6',  sentenceIds: ['s7'] },
  { id: 'p7',  sentenceIds: ['s8'] },
  { id: 'p8',  sentenceIds: ['s9'] },
  { id: 'p9',  sentenceIds: ['s10', 's11', 's12'] },
  { id: 'p10', sentenceIds: ['s13'] },
  { id: 'p11', sentenceIds: ['s14'] },
  { id: 'p12', sentenceIds: ['s15'] },
  { id: 'p13', sentenceIds: ['s16'] }
]

export const prideAndPrejudice: ListenBook = {
  id: 'pride-and-prejudice',
  title: 'Pride and Prejudice',
  author: 'Jane Austen',
  subtitle: 'Read by Elizabeth Klett',
  chapter: {
    id: 'ch-1',
    title: 'Chapter 1',
    duration: 328 // seconds — actual LibriVox recording length
  },
  bookTimeLeftLabel: '10h 54m left',
  audioSrc: '/audio/pride-ch1.mp3',
  transcript: {
    hasTranscript: true,
    sentences: prideAndPrejudiceSentences,
    paragraphs: prideAndPrejudiceParagraphs
  }
}

/**
 * The sentence active at time `t`. Prefers a sentence strictly
 * containing `t`; falls back to the sentence just before `t` if the
 * tap lands in an inter-sentence pause (≤ 2 s after a sentence ended).
 * Returns null if `t` is outside any covered range.
 */
export function sentenceAt(
  transcript: BookTranscript,
  t: number
): TranscriptSentence | null {
  // 1. Sentence actively being spoken at t.
  for (const s of transcript.sentences) {
    if (t >= s.startTime && t <= s.endTime) return s
  }
  // 2. Sentence that just ended (inter-sentence pause tolerance).
  for (const s of transcript.sentences) {
    if (t > s.endTime && t <= s.endTime + 2) return s
  }
  return null
}

/**
 * 1-sentence clip range: just the sentence active at tap.
 */
export function oneSentenceRange(
  transcript: BookTranscript,
  tapTime: number
): { start: number; end: number; sentenceIds: string[] } {
  const current = sentenceAt(transcript, tapTime)
  if (!current) {
    // Outside transcript coverage — approximate 8 s window.
    return { start: Math.max(0, tapTime - 8), end: tapTime, sentenceIds: [] }
  }
  return {
    start: current.startTime,
    end: current.endTime,
    sentenceIds: [current.id]
  }
}

/**
 * 2-sentence clip range: the sentence active at tap + the immediately
 * preceding sentence, iff they share a paragraph. Otherwise just the one.
 */
export function twoSentenceRange(
  transcript: BookTranscript,
  tapTime: number
): { start: number; end: number; sentenceIds: string[] } {
  const current = sentenceAt(transcript, tapTime)
  if (!current) {
    // Outside transcript coverage — approximate 15 s window.
    return { start: Math.max(0, tapTime - 15), end: tapTime, sentenceIds: [] }
  }
  const idx = transcript.sentences.findIndex(s => s.id === current.id)
  const prev = idx > 0 ? transcript.sentences[idx - 1] : null
  const prevSameParagraph = prev && prev.paragraphId === current.paragraphId
  const start = prevSameParagraph ? prev!.startTime : current.startTime
  const sentenceIds = prevSameParagraph ? [prev!.id, current.id] : [current.id]
  return { start, end: current.endTime, sentenceIds }
}

/**
 * Paragraph clip range: from the start of the current paragraph up to
 * the end of the sentence active at tap. Clamped at 3 minutes.
 */
export function paragraphRange(
  transcript: BookTranscript,
  tapTime: number
): { start: number; end: number; paragraphId: string; sentenceIds: string[] } {
  const current = sentenceAt(transcript, tapTime)
  if (!current) {
    return { start: Math.max(0, tapTime - 60), end: tapTime, paragraphId: '', sentenceIds: [] }
  }
  const paragraph = transcript.paragraphs.find(p => p.id === current.paragraphId)
  if (!paragraph) {
    return {
      start: current.startTime,
      end: current.endTime,
      paragraphId: current.paragraphId,
      sentenceIds: [current.id]
    }
  }
  const paragraphSentences = paragraph.sentenceIds
    .map(sid => transcript.sentences.find(s => s.id === sid))
    .filter((s): s is TranscriptSentence => !!s)
  const start = paragraphSentences[0].startTime
  const end = current.endTime
  const cappedStart = end - start > 180 ? end - 180 : start
  return {
    start: cappedStart,
    end,
    paragraphId: paragraph.id,
    sentenceIds: paragraphSentences.filter(s => s.endTime <= end + 0.1).map(s => s.id)
  }
}

/** Format seconds as HH:MM:SS. */
export function formatLongClock(t: number): string {
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = Math.floor(t % 60)
  const hh = h > 0 ? `${h.toString().padStart(2, '0')}:` : ''
  return `${hh}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
