import { useRef, useState, useCallback } from 'react'

interface UploadScreenProps {
  onFileLoaded: (arrayBuffer: ArrayBuffer, fileName: string) => void
}

export default function UploadScreen({ onFileLoaded }: UploadScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.epub')) return
    file.arrayBuffer().then((buf) => onFileLoaded(buf, file.name))
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
      <p>type over prose, paragraph by paragraph</p>
    </div>
  )
}
