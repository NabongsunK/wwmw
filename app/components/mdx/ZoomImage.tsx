'use client'

import { useEffect } from 'react'
import mediumZoom from 'medium-zoom'

export default function ZoomImage() {
  useEffect(() => {
    const zoom = mediumZoom('.prose img', {
      margin: 0,
      background: 'transparent',
    })
    const observer = new MutationObserver(() => {
      zoom.attach(document.querySelectorAll('.prose img'))
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}
