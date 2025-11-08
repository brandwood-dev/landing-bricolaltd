
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = 'https://www.bricolaltd.com'
  const normalizedPath = path.startsWith('/') ? path : '/' + path
  return baseUrl + normalizedPath
}

// Ensure given URL is absolute; if relative, prefix with site base
export const ensureAbsoluteUrl = (url?: string): string | undefined => {
  if (!url) return undefined
  try {
    // If url is already absolute, new URL will keep it.
    // If relative, it will be resolved against base.
    const resolved = new URL(url, 'https://www.bricolaltd.com')
    return resolved.href
  } catch {
    return url
  }
}

export const generateShareText = (title: string, excerpt: string): string => {
  const cleanTitle = (title || '').trim()
  const cleanExcerpt = (excerpt || '').trim()
  return `${cleanTitle}\n\n${cleanExcerpt}\n\nLire l'article complet :`
}

export const generateShareUrls = (
  url: string,
  title: string,
  excerpt: string,
  imageUrl?: string
) => {
  const canonicalUrl = ensureAbsoluteUrl(url) || url
  // Normalize trailing slashes to avoid `//share` which can break route matching
  const canonicalNoTrailing = canonicalUrl.replace(/\/+$/, '')
  // If this is a blog canonical, create API share URL that serves OG/Twitter HTML
  const shareHtmlUrl = canonicalNoTrailing.includes('/blog/')
    ? (canonicalNoTrailing.replace('/blog/', '/api/news/') + '/share')
    : canonicalNoTrailing
  const shareText = generateShareText(title, excerpt)

  // Platform-specific formats
  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(canonicalUrl)}`

  const whatsappText = `${title}\n\n${excerpt}\n\n${canonicalUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

  // Facebook ignores explicit image param; rely on OG tags
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareHtmlUrl
  )}`

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareHtmlUrl
  )}`

  return {
    facebook: facebookUrl,
    twitter: twitterUrl,
    whatsapp: whatsappUrl,
    linkedin: linkedinUrl,
    copy: canonicalNoTrailing,
  }
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Erreur lors de la copie :', err)
    return false
  }
}

// Fonction pour ouvrir une URL dans un nouvel onglet
export const openInNewTab = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Web Share API helpers
export const webShareSupported = (): boolean =>
  typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function'

export const shareViaWebAPI = async (
  data: { title?: string; text?: string; url?: string }
): Promise<boolean> => {
  try {
    if (webShareSupported()) {
      await (navigator as any).share(data)
      return true
    }
    return false
  } catch (err) {
    console.error('Erreur lors du partage natif :', err)
    return false
  }
}
