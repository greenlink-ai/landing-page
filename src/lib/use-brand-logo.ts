'use client'

import { useState, useEffect } from 'react'

const BRAND_LOGO_SVG = '/GreenLink-V2.svg'

export interface BrandLogoPaths {
  tree: string
  green: string
  link: string
}

/** Fetches and parses the GreenLink brand SVG into its 3 constituent paths. */
export function useBrandLogo(): BrandLogoPaths | null {
  const [paths, setPaths] = useState<BrandLogoPaths | null>(null)

  useEffect(() => {
    fetch(BRAND_LOGO_SVG)
      .then((r) => r.text())
      .then((text) => {
        const allPaths = [...text.matchAll(/\bd="([\s\S]*?)"/g)]
        if (allPaths.length >= 3) {
          setPaths({
            link: allPaths[0][1].replace(/[\r\n]+/g, ' ').trim(),
            green: allPaths[1][1].replace(/[\r\n]+/g, ' ').trim(),
            tree: allPaths[2][1].replace(/[\r\n]+/g, ' ').trim(),
          })
        }
      })
      .catch(() => {})
  }, [])

  return paths
}
