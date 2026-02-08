import { useRef, useState, useCallback } from 'react'

interface UploadScreenProps {
  onFileLoaded: (arrayBuffer: ArrayBuffer, fileName: string) => void
}

export default function UploadScreen({ onFileLoaded }: UploadScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loadingExample, setLoadingExample] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.epub')) return
    file.arrayBuffer().then((buf) => onFileLoaded(buf, file.name))
  }, [onFileLoaded])

  const handleExample = useCallback(() => {
    setLoadingExample(true)
    fetch('/example.epub')
      .then((r) => r.arrayBuffer())
      .then((buf) => onFileLoaded(buf, 'a-farewell-to-arms.epub'))
      .catch(() => setLoadingExample(false))
  }, [onFileLoaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="upload-screen">
      <h1>typedawords</h1>
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p>drop an .epub here or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".epub"
          onChange={handleChange}
        />
      </div>
      <button className="example-btn" onClick={handleExample} disabled={loadingExample}>
        {loadingExample ? 'loading...' : 'or try A Farewell to Arms'}
      </button>
      <p>type over prose, paragraph by paragraph</p>
    </div>
  )
}
