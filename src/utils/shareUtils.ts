
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = "https://www.bricolaltd.com";
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  return baseUrl + normalizedPath;
};

export const generateShareText = (title: string, excerpt: string): string => {
  return `${title}\n\n${excerpt}\n\nLire l'article complet :`;
};

export const generateShareUrls = (url: string, title: string, excerpt: string, imageUrl?: string) => {
  const shareText = generateShareText(title, excerpt);
  const twitterText = shareText + '\n' + url;
  const whatsappText = shareText + '\n' + url;
  
  // Pour Facebook, inclure l'image si disponible
  let facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
  if (imageUrl) {
    facebookUrl += `&picture=${encodeURIComponent(imageUrl)}`;
  }
  
  return {
    facebook: facebookUrl,
    twitter: `https://x.com/intent/tweet?text=${encodeURIComponent(twitterText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
    copy: url
  };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erreur lors de la copie :', err);
    return false;
  }
};

// Fonction pour ouvrir une URL dans un nouvel onglet
export const openInNewTab = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
