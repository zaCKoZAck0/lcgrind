export function Star13({
  color,
  size,
  stroke,
  strokeWidth,
  pathClassName,
  width,
  height,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  color?: string
  size?: number
  stroke?: string
  pathClassName?: string
  strokeWidth?: number
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 200 200"
      width={size ?? width}
      height={size ?? height}
      {...props}
    >
      <path
        fill={color ?? "currentColor"}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={pathClassName}
        d="M99.006 14.395c.126-1.193 1.862-1.193 1.988 0l7.08 66.88a1 1 0 0 0 1.532.738l56.703-36.164c1.011-.645 2.094.712 1.24 1.555l-47.875 47.233a1 1 0 0 0 .378 1.658l63.628 21.784c1.135.389.749 2.082-.442 1.939l-66.779-7.98a1 1 0 0 0-1.06 1.33l22.64 63.328c.404 1.13-1.161 1.883-1.792.863l-35.397-57.185a1 1 0 0 0-1.7 0l-35.397 57.185c-.631 1.02-2.196.267-1.792-.863l22.64-63.328a1 1 0 0 0-1.06-1.33l-66.779 7.98c-1.19.143-1.577-1.55-.442-1.939l63.628-21.784a1 1 0 0 0 .378-1.657L32.451 47.403c-.854-.842.229-2.2 1.24-1.554l56.703 36.164a1 1 0 0 0 1.532-.738z"
      />
    </svg>
  )
}
