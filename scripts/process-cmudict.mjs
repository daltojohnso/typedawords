#!/usr/bin/env node
import { writeFileSync } from 'fs'
import { get } from 'https'

const URL = 'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict'

function fetch(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve, reject)
      }
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data))
      res.on('error', reject)
    }).on('error', reject)
  })
}

console.log('Downloading CMU Pronouncing Dictionary...')
const raw = await fetch(URL)
const lines = raw.split('\n')

const dict = {}
for (const line of lines) {
  if (!line || line.startsWith(';;;')) continue
  const parts = line.split(/\s+/)
  let word = parts[0].toLowerCase()
  // Skip variant pronunciations like "about(2)"
  if (word.includes('(')) continue
  const phonemes = parts.slice(1)
  const stress = phonemes
    .filter((p) => /\d/.test(p))
    .map((p) => Number(p.replace(/\D/g, '')))
  if (stress.length > 0) {
    dict[word] = stress
  }
}

const json = JSON.stringify(dict)
writeFileSync('public/cmudict.json', json)
const sizeMB = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2)
console.log(`Wrote public/cmudict.json (${Object.keys(dict).length} words, ${sizeMB} MB)`)
