import fs from 'fs'
import path from 'path'

interface ImageDimensions {
  width: number
  height: number
}

// http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html
const readPNGDimensions = (buffer: Buffer): ImageDimensions | null => {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4e || buffer[3] !== 0x47) {
    return null
  }

  // IHDR chunk starts at byte 16
  // Width: 4 bytes at offset 16
  // Height: 4 bytes at offset 20
  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)

  return { width, height }
}


// https://www.w3.org/Graphics/JPEG/itu-t81.pdf
const readJPEGDimensions = (buffer: Buffer): ImageDimensions | null => {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null
  }

  let offset = 2
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset++
      continue
    }

    const marker = buffer[offset + 1]

    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      const height = buffer.readUInt16BE(offset + 5)
      const width = buffer.readUInt16BE(offset + 7)
      return { width, height }
    }

    const segmentLength = buffer.readUInt16BE(offset + 2)
    offset += 2 + segmentLength
  }

  return null
}

// https://developers.google.com/speed/webp/docs/riff_container
const readWebPDimensions = (buffer: Buffer): ImageDimensions | null => {
  if (
    buffer[0] !== 0x52 || // R
    buffer[1] !== 0x49 || // I
    buffer[2] !== 0x46 || // F
    buffer[3] !== 0x46    // F
  ) {
    return null
  }

  if (
    buffer[8] !== 0x57 ||  // W
    buffer[9] !== 0x45 ||  // E
    buffer[10] !== 0x42 || // B
    buffer[11] !== 0x50    // P
  ) {
    return null
  }

  // lossy
  if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x20) {
    const width = buffer.readUInt16LE(26) & 0x3fff
    const height = buffer.readUInt16LE(28) & 0x3fff
    return { width, height }
  }

  // lossless
  if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x4c) {
    const bits = buffer.readUInt32LE(21)
    const width = (bits & 0x3fff) + 1
    const height = ((bits >> 14) & 0x3fff) + 1
    return { width, height }
  }

  // extended
  if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x58) {
    const width = (buffer.readUIntLE(24, 3) & 0xffffff) + 1
    const height = (buffer.readUIntLE(27, 3) & 0xffffff) + 1
    return { width, height }
  }

  return null
}

export const getImageSize = (imagePath: string): ImageDimensions | null => {
  const fullPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''))

  if (!fs.existsSync(fullPath)) {
    return null
  }

  // 64KB enough for most image headers
  const buffer = Buffer.alloc(65536)
  const fd = fs.openSync(fullPath, 'r')
  const bytesRead = fs.readSync(fd, buffer, 0, 65536, 0)
  fs.closeSync(fd)

  const fileBuffer = buffer.subarray(0, bytesRead)
  const ext = path.extname(imagePath).toLowerCase()

  switch (ext) {
    case '.png':
      return readPNGDimensions(fileBuffer)
    case '.jpg':
    case '.jpeg':
      return readJPEGDimensions(fileBuffer)
    case '.webp':
      return readWebPDimensions(fileBuffer)
    default:
      return null
  }
}
