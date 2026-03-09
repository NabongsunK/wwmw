'use client'

import { useEffect } from 'react'
import mediumZoom from 'medium-zoom'

export default function ZoomImage() {
  useEffect(() => {
    mediumZoom('.prose img', {
      margin: 24,
      background: '#000',
    })
  }, [])

  return null
}
