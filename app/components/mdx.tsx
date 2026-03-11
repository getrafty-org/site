import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'
import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import rehypePrism from '@mapbox/rehype-prism'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import Img from './img'
import { getImageSize } from '../lib/image-size'
import { slugify } from '../lib/slugify'

const prismGlobal = globalThis as typeof globalThis & { Prism?: typeof Prism }

if (typeof globalThis !== 'undefined' && !prismGlobal.Prism) {
  prismGlobal.Prism = Prism
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

interface TableData {
  headers: ReactNode[]
  rows: ReactNode[][]
}

interface TableProps {
  data: TableData
}

function Table({ data }: TableProps) {
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

type CustomLinkProps = ComponentPropsWithoutRef<'a'>

function CustomLink({ href = '', ...props }: CustomLinkProps) {
  if (!href) {
    return <a {...props} />
  }

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a href={href} {...props} />
  }

  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
}

type RoundedImageProps = ComponentProps<typeof Image>

function RoundedImage({ className, ...props }: RoundedImageProps) {
  const imageClassName = className ? `rounded-lg ${className}` : 'rounded-lg'
  return <Image className={imageClassName} {...props} />
}

type ImgWithDimensionsProps = ComponentProps<typeof Img>

function ImgWithDimensions(props: ImgWithDimensionsProps) {
  const dimensions = getImageSize(props.src)
  return (
    <Img
      {...props}
      width={props.width ?? dimensions?.width}
      height={props.height ?? dimensions?.height}
    />
  )
}

function extractTextContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(extractTextContent).join('')
  }

  if (React.isValidElement<{ children?: ReactNode }>(node)) {
    return extractTextContent(node.props.children)
  }

  return ''
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

function createHeading(level: HeadingLevel) {
  const Heading = ({ children }: { children: ReactNode }) => {
    const text = extractTextContent(children)
    const slug = slugify(text)

    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
          'aria-label': text ? `Link to section ${text}` : 'Link to section',
        }),
        children,
      ],
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

const components: MDXComponents = {
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

interface RehypeNode {
  properties?: Record<string, unknown>
  children?: RehypeNode[]
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

  return (tree: RehypeNode) => {
    const visit = (node: RehypeNode | undefined) => {
      if (!node || typeof node !== 'object') {
        return
      }

      if (node.properties) {
        const classNames = node.properties.className
        if (Array.isArray(classNames)) {
          node.properties.className = classNames.map((item) =>
            typeof item === 'string' ? aliasClass(item) : item,
          )
        }

        const dataLanguage = node.properties['data-language']
        if (typeof dataLanguage === 'string') {
          node.properties['data-language'] = aliasClass(dataLanguage)
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit)
      }
    }

    visit(tree)
  }
}

type CustomMDXProps = ComponentProps<typeof MDXRemote>

export function CustomMDX(props: CustomMDXProps) {
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
