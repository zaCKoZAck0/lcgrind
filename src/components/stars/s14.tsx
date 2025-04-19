export function Star14({
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
        d="m100 5 10.403 29.319 18.954-24.67.833 31.1 25.65-17.606-8.817 29.834 29.834-8.817-17.605 25.65 31.098.833-24.669 18.954L195 100l-29.319 10.403 24.669 18.954-31.098.833 17.605 25.65-29.834-8.817 8.817 29.834-25.65-17.605-.833 31.098-18.954-24.669L100 195l-10.403-29.319-18.954 24.669-.833-31.098-25.65 17.605 8.817-29.834-29.834 8.817 17.605-25.65-31.098-.833 24.669-18.954L5 100l29.319-10.403-24.67-18.954 31.1-.833-17.606-25.65 29.834 8.817-8.817-29.834 25.65 17.605.833-31.098 18.954 24.669z"
      />
    </svg>
  )
}
