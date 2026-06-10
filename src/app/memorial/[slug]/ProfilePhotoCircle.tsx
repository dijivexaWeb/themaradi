'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Props {
  src: string
  alt: string
  initial: string
}

export default function ProfilePhotoCircle({ src, alt, initial }: Props) {
  const [objectPos, setObjectPos] = useState('center 20%')

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth
      setObjectPos(ratio > 1.2 ? 'center 20%' : 'center center')
    }
    img.src = src
  }, [src])

  return src ? (
    <div className="relative mx-auto h-[210px] w-[210px] overflow-hidden rounded-full border-[5px] border-[#c7a76f]/35 bg-[#0c3327] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:h-[310px] sm:w-[310px] sm:border-[6px]">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="310px"
        className="object-cover"
        style={{ objectPosition: objectPos }}
        unoptimized
      />
      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" />
    </div>
  ) : (
    <div className="mx-auto flex h-[210px] w-[210px] items-center justify-center rounded-full border-[5px] border-[#c7a76f]/35 bg-[#091712] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:h-[310px] sm:w-[310px]">
      <span className="text-7xl font-bold text-[#c7a76f]/40">{initial}</span>
    </div>
  )
}
