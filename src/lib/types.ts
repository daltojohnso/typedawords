export interface ParsedSection {
  title: string
  paragraphs: string[]
}

export interface ParsedBook {
  title: string
  sections: ParsedSection[]
}

export interface BookPosition {
  sectionIndex: number
  paragraphIndex: number
  lastAccessed: number
}

export type CharState = 'correct' | 'incorrect' | 'cursor' | 'untyped'
