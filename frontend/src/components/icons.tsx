import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps): IconProps => ({
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
})

export const SparklesIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
  </svg>
)

export const FileTextIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
)

export const UploadCloudIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7 16.5a4.5 4.5 0 01-.4-8.98 6 6 0 0111.3 1.85A4 4 0 0117 17.5" />
    <path d="M12 12v8m0-8l-3.5 3.5M12 12l3.5 3.5" />
  </svg>
)

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)

export const SendIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12L3 21l18-9L3 3l2 9zm0 0h7" />
  </svg>
)

export const ArrowLeftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M19 12H5m0 0l6-6m-6 6l6 6" />
  </svg>
)

export const ChatBubbleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 12a8 8 0 01-8 8H4l2.3-2.9A8 8 0 1121 12z" />
  </svg>
)

export const BookOpenIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 6.5C10.5 4.9 8.4 4 6 4c-1 0-2 .15-3 .5v14c1-.35 2-.5 3-.5 2.4 0 4.5.9 6 2.5 1.5-1.6 3.6-2.5 6-2.5 1 0 2 .15 3 .5v-14c-1-.35-2-.5-3-.5-2.4 0-4.5.9-6 2.5zm0 0V20" />
  </svg>
)

export const CircleCheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
)

export const AlertIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4.5M12 16h.01" />
  </svg>
)

export const PageIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5" />
  </svg>
)
