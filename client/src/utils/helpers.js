export const COLORS = [
  '#f59e0b','#10b981','#3b82f6','#8b5cf6',
  '#ef4444','#06b6d4','#f97316','#84cc16'
]

export const avatarColor = (str = '') =>
  COLORS[str.charCodeAt(0) % COLORS.length]

export const initials = (str = '') =>
  str.slice(0, 2).toUpperCase()

export const fileSize = (bytes = 0) => {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}