import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'
import rehypePrism from '@mapbox/rehype-prism'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import Img from './img'
import { getImageSize } from '../lib/image-size'

if (typeof globalThis !== 'undefined' && !(globalThis as any).Prism) {
  ;(globalThis as any).Prism = Prism
}

const extraShellCommands = [
  'tasklet',
  'ctest',
  'cmake',
  'ninja',
  'clang',
  'clang++',
  'gcc',
  'g++',
  'lldb',
  'valgrind',
  'meson',
]

const escapedCommands = extraShellCommands.map((cmd) =>
  cmd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
)

const customCommandPattern = new RegExp(
  `(^|[\\s;|&]|[<>]\\()(?:${escapedCommands.join('|')})(?=$|[)\\s;|&])`
)

if (!Prism.languages.bash['course-command']) {
  Prism.languages.insertBefore('bash', 'function', {
    'course-command': {
      pattern: customCommandPattern,
      lookbehind: true,
      alias: 'function',
    },
  })
}

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

function ImgWithDimensions(props) {
  const dimensions = getImageSize(props.src)
  return <Img {...props} width={dimensions?.width} height={dimensions?.height}/>
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  Img: ImgWithDimensions,
  a: CustomLink,
  Table,
}

function withCodeLanguageAliases() {
  const aliasClass = (className: string) => {
    if (!className) {
      return className
    }
    switch (className) {
      case 'language-shell':
      case 'language-sh':
      case 'language-zsh':
      case 'language-shellsession':
        return 'language-bash'
      default:
        return className
    }
  }

  return (tree: any) => {
    const visit = (node: any) => {
      if (!node || typeof node !== 'object') {
        return
      }

      if (node.properties) {
        if (Array.isArray(node.properties.className)) {
          node.properties.className = node.properties.className.map(aliasClass)
        }

        if (typeof node.properties['data-language'] === 'string') {
          node.properties['data-language'] = aliasClass(node.properties['data-language'])
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit)
      }
    }

    visit(tree)
  }
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          rehypePlugins: [withCodeLanguageAliases, rehypePrism],
        },
      }}
    />
  )
}
