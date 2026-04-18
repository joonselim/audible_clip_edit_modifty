'use client'

import { useEffect, useState } from 'react'
import type { BookTranscript, TranscriptSentence, TranscriptParagraph } from './book'

interface RawSentence {
  id: number
  text: string
  start: number
  end: number
  word_indices: [number, number]
}

interface RawParagraph {
  id: number
  text: string
  start: number
  end: number
  sentence_indices: [number, number]
}

interface RawTranscript {
  sentences: RawSentence[]
  paragraphs: RawParagraph[]
}

function mapTranscript(data: RawTranscript): BookTranscript {
  const sentenceToParagraph = new Map<number, number>()
  for (const p of data.paragraphs) {
    const [startIdx, endIdx] = p.sentence_indices
    for (let i = startIdx; i <= endIdx; i++) {
      sentenceToParagraph.set(i, p.id)
    }
  }

  const sentences: TranscriptSentence[] = data.sentences.map(s => ({
    id: `s${s.id}`,
    paragraphId: `p${sentenceToParagraph.get(s.id) ?? 0}`,
    text: s.text,
    startTime: s.start,
    endTime: s.end,
  }))

  const paragraphs: TranscriptParagraph[] = data.paragraphs.map(p => {
    const [startIdx, endIdx] = p.sentence_indices
    const sentenceIds: string[] = []
    for (let i = startIdx; i <= endIdx; i++) {
      sentenceIds.push(`s${i}`)
    }
    return { id: `p${p.id}`, sentenceIds }
  })

  return { hasTranscript: true, sentences, paragraphs }
}

export function useTranscript(src: string): BookTranscript | null {
  const [transcript, setTranscript] = useState<BookTranscript | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch(src)
      const ds = new DecompressionStream('gzip')
      const decompressed = res.body!.pipeThrough(ds)
      const json = (await new Response(decompressed).json()) as RawTranscript
      if (!cancelled) setTranscript(mapTranscript(json))
    }
    load().catch(console.error)
    return () => { cancelled = true }
  }, [src])

  return transcript
}
