'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'

const MAX_IMAGE_DIMENSION = 2048
const MAX_SERVER_IMAGE_BYTES = 15 * 1024 * 1024
const WEBP_QUALITY = 0.86
const MIN_BYTES_SAVED = 80 * 1024

type CompressionStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'working'; readonly filename: string }
  | { readonly kind: 'done'; readonly originalBytes: number; readonly compressedBytes: number }
  | { readonly kind: 'skipped'; readonly reason: string }
  | { readonly kind: 'error'; readonly message: string }

type ImageUploadInputProps = {
  readonly name: string
  readonly accept?: string
  readonly disabled?: boolean
  readonly required?: boolean
  readonly multiple?: boolean
  readonly className: string
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function canOptimize(file: File): boolean {
  if (!file.type.startsWith('image/')) return false
  return file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
}

function optimizedName(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  const basename = dotIndex > 0 ? filename.slice(0, dotIndex) : filename
  return `${basename}.webp`
}

async function decodeImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)

  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

function getCanvasSize(width: number, height: number): { readonly width: number; readonly height: number } {
  const longestSide = Math.max(width, height)
  if (longestSide <= MAX_IMAGE_DIMENSION) return { width, height }

  const scale = MAX_IMAGE_DIMENSION / longestSide
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
  })
}

async function compressImage(file: File): Promise<File | null> {
  const image = await decodeImage(file)
  const size = getCanvasSize(image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height

  const context = canvas.getContext('2d', { alpha: true })
  if (!context) return null

  context.drawImage(image, 0, 0, size.width, size.height)
  const blob = await canvasToBlob(canvas)
  if (!blob) return null

  const isOverServerLimit = file.size > MAX_SERVER_IMAGE_BYTES
  if (!isOverServerLimit && blob.size + MIN_BYTES_SAVED >= file.size) return null
  if (isOverServerLimit && blob.size >= file.size) return null

  return new File([blob], optimizedName(file.name), {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}

function replaceInputFile(input: HTMLInputElement, file: File): void {
  const transfer = new DataTransfer()
  transfer.items.add(file)
  input.files = transfer.files
}

export function ImageUploadInput({
  name,
  accept = 'image/*',
  disabled = false,
  required = false,
  multiple = false,
  className,
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const workingRef = useRef(false)
  const [status, setStatus] = useState<CompressionStatus>({ kind: 'idle' })

  useEffect(() => {
    const input = inputRef.current
    const form = input?.form
    if (!form) return undefined

    const onSubmit = (event: SubmitEvent) => {
      if (!workingRef.current) return

      event.preventDefault()
      setStatus({ kind: 'error', message: 'Fotoğraf hazırlanıyor, birkaç saniye sonra tekrar kaydedin.' })
    }

    form.addEventListener('submit', onSubmit)
    return () => form.removeEventListener('submit', onSubmit)
  }, [])

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.item(0)
    if (!file) {
      setStatus({ kind: 'idle' })
      return
    }

    if (multiple) {
      setStatus({ kind: 'skipped', reason: 'Çoklu dosyada orijinal yüklenir.' })
      return
    }

    if (!canOptimize(file)) {
      setStatus({ kind: 'skipped', reason: file.type.startsWith('video/') ? 'Video dosyası sıkıştırılmadı.' : 'Bu format orijinal yüklenecek.' })
      return
    }

    workingRef.current = true
    setStatus({ kind: 'working', filename: file.name })

    try {
      const compressed = await compressImage(file)
      if (!compressed) {
        setStatus({ kind: 'skipped', reason: 'Fotoğraf zaten yeterince küçük.' })
        return
      }

      replaceInputFile(input, compressed)
      setStatus({
        kind: 'done',
        originalBytes: file.size,
        compressedBytes: compressed.size,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fotoğraf sıkıştırılamadı.'
      setStatus({ kind: 'error', message })
    } finally {
      workingRef.current = false
    }
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        disabled={disabled}
        required={required}
        multiple={multiple}
        onChange={onChange}
        className={className}
      />
      {status.kind === 'working' && (
        <p className="text-xs text-[#8a7a64]">Fotoğraf hazırlanıyor: {status.filename}</p>
      )}
      {status.kind === 'done' && (
        <p className="text-xs text-[#176b3f]">
          Sıkıştırıldı: {formatBytes(status.originalBytes)} → {formatBytes(status.compressedBytes)}
        </p>
      )}
      {status.kind === 'skipped' && (
        <p className="text-xs text-[#8a7a64]">{status.reason}</p>
      )}
      {status.kind === 'error' && (
        <p className="text-xs text-red-600">{status.message}</p>
      )}
    </div>
  )
}
