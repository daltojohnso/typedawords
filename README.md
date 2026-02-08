# typedawords

Type over prose, paragraph by paragraph. Upload an EPUB and practice typing through real literature with real-time linguistic analysis.

**Live at [typedawords.vercel.app](https://typedawords.vercel.app)**

## Features

- **Paragraph-by-paragraph typing** with character-level correct/incorrect feedback
- **Auto-advance** through sections and chapters
- **Progress persistence** — your place is saved per book in localStorage; re-upload the same EPUB and pick up where you left off
- **EPUB persistence** — the book itself is stored in IndexedDB so page refreshes don't require re-uploading
- **Browse mode** — jump to any paragraph; `<` / `>` buttons for quick navigation without leaving typing mode
- **Analysis panel** with:
  - **Sentence sparkline** — bar chart of word count per sentence
  - **Conjunction density** — count and percentage of coordinating conjunctions
  - **Stress pattern visualization** — dots sized by syllable stress (CMU Pronouncing Dictionary), displayable inline above words or in the panel
  - **Text overlays** — toggle background tints for conjunctions or syllable-length heatmap

## Setup

```
npm install
npm run gen:dict   # downloads CMU dict and generates public/cmudict.json
npm run dev
```

## Deploy

```
npm run build
vercel --prod
```

## Stack

- React 19 + TypeScript
- Vite
- [epubjs](https://github.com/futurepress/epub.js) for EPUB parsing
- [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) for stress/syllable data
- Hosted on Vercel
