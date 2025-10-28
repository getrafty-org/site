'use client'

import { useEffect, useMemo, useState } from 'react'

interface LiquidGlassProps {
  width: number
  height: number
  scale?: number
  refractiveIndex?: number
  surfaceType?: 'convex-circle' | 'convex-squircle' | 'concave' | 'lip'
  filterId?: string
}

// Surface functions based on Snell's Law
const surfaceFunctions = {
  'convex-circle': (x: number) => Math.sqrt(1 - Math.pow(1 - x, 2)),
  'convex-squircle': (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 0.25),
  'concave': (x: number) => -Math.sqrt(1 - Math.pow(1 - x, 2)),
  'lip': (x: number) => {
    // Smootherstep blend of convex and concave
    const t = x < 0.5 ? 2 * x : 2 * (1 - x)
    const smoothT = t * t * t * (t * (t * 6 - 15) + 10)
    const convex = Math.sqrt(1 - Math.pow(1 - x, 2))
    const concave = -Math.sqrt(1 - Math.pow(1 - x, 2))
    return x < 0.5 ? convex * smoothT : concave * smoothT
  }
}

function calculateDisplacementMap(
  width: number,
  height: number,
  refractiveIndex: number,
  surfaceType: 'convex-circle' | 'convex-squircle' | 'concave' | 'lip'
): string {
  const samples = 127
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(centerX, centerY)

  const surfaceFunc = surfaceFunctions[surfaceType]

  // Pre-calculate displacement magnitudes
  const displacements: number[] = []
  let maxDisplacement = 0

  for (let i = 0; i <= samples; i++) {
    const r = i / samples
    const surfaceHeight = surfaceFunc(r)

    // Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
    // For simplicity, assume air (n1 = 1) and glass (n2 = refractiveIndex)
    const angle = Math.atan2(surfaceHeight, r)
    const displacement = Math.sin(angle) * r * (refractiveIndex - 1)

    displacements.push(displacement)
    maxDisplacement = Math.max(maxDisplacement, Math.abs(displacement))
  }

  // Normalize displacements
  const normalizedDisplacements = displacements.map(d => d / maxDisplacement)

  // Create RGBA displacement map
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const normalizedDistance = Math.min(distance / maxRadius, 1)

      const sampleIndex = Math.floor(normalizedDistance * samples)
      const magnitude = normalizedDisplacements[sampleIndex] || 0

      // Calculate angle from center
      const angle = Math.atan2(dy, dx)

      // Convert polar to Cartesian displacement
      const displacementX = Math.cos(angle) * magnitude
      const displacementY = Math.sin(angle) * magnitude

      // Convert to RGB values (0-255, neutral at 128)
      const idx = (y * width + x) * 4
      imageData.data[idx] = 128 + displacementX * 127     // R: X displacement
      imageData.data[idx + 1] = 128 + displacementY * 127 // G: Y displacement
      imageData.data[idx + 2] = 128                        // B: unused
      imageData.data[idx + 3] = 255                        // A: full opacity
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

function createSpecularHighlight(
  width: number,
  height: number,
  surfaceType: 'convex-circle' | 'convex-squircle' | 'concave' | 'lip'
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)

  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(centerX, centerY)

  // Light direction (from top-right)
  const lightDirX = 0.7
  const lightDirY = -0.7

  const surfaceFunc = surfaceFunctions[surfaceType]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const normalizedDistance = Math.min(distance / maxRadius, 1)

      // Calculate surface normal
      const surfaceHeight = surfaceFunc(normalizedDistance)
      const angle = Math.atan2(dy, dx)
      const normalX = Math.cos(angle) * surfaceHeight
      const normalY = Math.sin(angle) * surfaceHeight

      // Calculate specular intensity (dot product with light direction)
      const dotProduct = normalX * lightDirX + normalY * lightDirY
      const intensity = Math.max(0, dotProduct) * 255

      const idx = (y * width + x) * 4
      imageData.data[idx] = intensity
      imageData.data[idx + 1] = intensity
      imageData.data[idx + 2] = intensity
      imageData.data[idx + 3] = intensity * 0.3 // Subtle highlight
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

export function LiquidGlass({
  width,
  height,
  scale = 20,
  refractiveIndex = 1.5,
  surfaceType = 'convex-squircle',
  filterId: providedFilterId
}: LiquidGlassProps) {
  const [mounted, setMounted] = useState(false)
  const filterId = providedFilterId || useMemo(() => `liquid-glass-${Math.random().toString(36).substr(2, 9)}`, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const displacementMapUrl = useMemo(() => {
    if (!mounted) return ''
    return calculateDisplacementMap(width, height, refractiveIndex, surfaceType)
  }, [mounted, width, height, refractiveIndex, surfaceType])

  const specularHighlightUrl = useMemo(() => {
    if (!mounted) return ''
    return createSpecularHighlight(width, height, surfaceType)
  }, [mounted, width, height, surfaceType])

  if (!mounted) {
    return null
  }

  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0 }}
      colorInterpolationFilters="sRGB"
    >
      <defs>
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
          {/* Displacement map for refraction */}
          <feImage
            href={displacementMapUrl}
            x={0}
            y={0}
            width={width}
            height={height}
            result="displacement_map"
            preserveAspectRatio="none"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacement_map"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          {/* Specular highlight */}
          <feImage
            href={specularHighlightUrl}
            x={0}
            y={0}
            width={width}
            height={height}
            result="specular"
            preserveAspectRatio="none"
          />
          <feBlend
            in="displaced"
            in2="specular"
            mode="screen"
            result="with_highlight"
          />

          {/* Slight blur for smoothness */}
          <feGaussianBlur in="with_highlight" stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  )
}

export function useLiquidGlassFilter(
  width: number,
  height: number,
  scale?: number,
  refractiveIndex?: number,
  surfaceType?: 'convex-circle' | 'convex-squircle' | 'concave' | 'lip'
) {
  const filterId = useMemo(() => `liquid-glass-${Math.random().toString(36).substr(2, 9)}`, [])

  const component = (
    <LiquidGlass
      width={width}
      height={height}
      scale={scale}
      refractiveIndex={refractiveIndex}
      surfaceType={surfaceType}
    />
  )

  return { filterId, component }
}
