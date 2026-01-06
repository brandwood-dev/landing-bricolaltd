export type Translations = {
  fr: Record<string, string>
  en: Record<string, string>
  ar: Record<string, string>
}

export type I18nValidationResult = {
  missing: {
    fr: string[]
    en: string[]
    ar: string[]
  }
  extra: {
    fr: string[]
    en: string[]
    ar: string[]
  }
  inconsistentPlaceholders: string[]
}

export function validateTranslations(t: Translations): I18nValidationResult {
  const keysFr = new Set(Object.keys(t.fr))
  const keysEn = new Set(Object.keys(t.en))
  const keysAr = new Set(Object.keys(t.ar))

  const allKeys = new Set<string>([...keysFr, ...keysEn, ...keysAr])

  const missingFr: string[] = []
  const missingEn: string[] = []
  const missingAr: string[] = []

  const extraFr: string[] = []
  const extraEn: string[] = []
  const extraAr: string[] = []

  const inconsistentPlaceholders: string[] = []

  for (const k of allKeys) {
    if (!keysFr.has(k)) missingFr.push(k)
    if (!keysEn.has(k)) missingEn.push(k)
    if (!keysAr.has(k)) missingAr.push(k)

    if (keysFr.has(k) && !keysEn.has(k) && !keysAr.has(k)) extraFr.push(k)
    if (keysEn.has(k) && !keysFr.has(k) && !keysAr.has(k)) extraEn.push(k)
    if (keysAr.has(k) && !keysFr.has(k) && !keysEn.has(k)) extraAr.push(k)

    const vFr = t.fr[k]
    const vEn = t.en[k]
    const vAr = t.ar[k]
    if (vFr && vEn && vAr) {
      const phFr = Array.from(vFr.matchAll(/\{\w+\}/g)).map(m => m[0]).sort().join(',')
      const phEn = Array.from(vEn.matchAll(/\{\w+\}/g)).map(m => m[0]).sort().join(',')
      const phAr = Array.from(vAr.matchAll(/\{\w+\}/g)).map(m => m[0]).sort().join(',')
      if (!(phFr === phEn && phEn === phAr)) inconsistentPlaceholders.push(k)
    }
  }

  return {
    missing: { fr: missingFr, en: missingEn, ar: missingAr },
    extra: { fr: extraFr, en: extraEn, ar: extraAr },
    inconsistentPlaceholders
  }
}

