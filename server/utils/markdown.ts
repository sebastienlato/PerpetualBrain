export function titleFromMarkdown(content: string) {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim()
}
