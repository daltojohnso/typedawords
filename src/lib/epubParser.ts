import ePub from 'epubjs'
import type { ParsedBook, ParsedSection } from './types'

function extractParagraphs(doc: Document): string[] {
  const selectors = 'p, h1, h2, h3, h4, h5, h6, blockquote, li'
  const elements = doc.querySelectorAll(selectors)
  const paragraphs: string[] = []

  for (const el of elements) {
    const text = (el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
    if (text.length > 0) {
      paragraphs.push(text)
    }
  }

  return paragraphs
}

export async function parseEpub(arrayBuffer: ArrayBuffer): Promise<ParsedBook> {
  const book = ePub(arrayBuffer)
  await book.ready

  const title = book.packaging?.metadata?.title || 'Untitled'
  const sections: ParsedSection[] = []

  // spine.spineItems holds Section instances with .load()
  // spine.items is raw package data (plain objects without methods)
  const spine = book.spine as unknown as {
    spineItems: Array<{ load: (request: unknown) => Promise<unknown>; document: Document }>
  }
  const request = book.load.bind(book)

  for (const item of spine.spineItems) {
    await item.load(request)
    const paragraphs = extractParagraphs(item.document)

    if (paragraphs.length > 0) {
      sections.push({
        title: '',
        paragraphs,
      })
    }
  }

  // Try to set section titles from first heading in each section
  for (const section of sections) {
    const first = section.paragraphs[0]
    if (first && first.length < 100) {
      section.title = first
    }
  }

  book.destroy()
  return { title, sections }
}
