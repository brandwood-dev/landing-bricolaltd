import { useEffect } from 'react';

interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    // Sauvegarde des valeurs originales
    const originalTitle = document.title;
    const originalMetaTags: { [key: string]: string } = {};
    
    // Fonction pour obtenir ou créer une balise meta
    const getOrCreateMetaTag = (property: string, attribute: 'property' | 'name' = 'property'): HTMLMetaElement => {
      let metaTag = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, property);
        document.head.appendChild(metaTag);
      } else {
        // Sauvegarder la valeur originale
        originalMetaTags[property] = metaTag.content;
      }
      return metaTag;
    };

    // Mise à jour du titre
    document.title = `${seoData.title} | Bricola LTD`;

    // Mise à jour des balises meta de base
    const descriptionMeta = getOrCreateMetaTag('description', 'name');
    descriptionMeta.content = seoData.description;

    if (seoData.author) {
      const authorMeta = getOrCreateMetaTag('author', 'name');
      authorMeta.content = seoData.author;
    }

    // Open Graph tags
    const ogTitle = getOrCreateMetaTag('og:title');
    ogTitle.content = seoData.title;

    const ogDescription = getOrCreateMetaTag('og:description');
    ogDescription.content = seoData.description;

    const ogType = getOrCreateMetaTag('og:type');
    ogType.content = seoData.type || 'article';

    if (seoData.url) {
      const ogUrl = getOrCreateMetaTag('og:url');
      ogUrl.content = seoData.url;
    }

    if (seoData.image) {
      const ogImage = getOrCreateMetaTag('og:image');
      ogImage.content = seoData.image;

      const ogImageAlt = getOrCreateMetaTag('og:image:alt');
      ogImageAlt.content = seoData.title;
    }

    if (seoData.publishedTime) {
      const ogPublishedTime = getOrCreateMetaTag('article:published_time');
      ogPublishedTime.content = seoData.publishedTime;
    }

    if (seoData.modifiedTime) {
      const ogModifiedTime = getOrCreateMetaTag('article:modified_time');
      ogModifiedTime.content = seoData.modifiedTime;
    }

    if (seoData.author) {
      const ogAuthor = getOrCreateMetaTag('article:author');
      ogAuthor.content = seoData.author;
    }

    if (seoData.section) {
      const ogSection = getOrCreateMetaTag('article:section');
      ogSection.content = seoData.section;
    }

    if (seoData.tags && seoData.tags.length > 0) {
      // Supprimer les anciennes balises de tags
      const existingTags = document.querySelectorAll('meta[property="article:tag"]');
      existingTags.forEach(tag => tag.remove());

      // Ajouter les nouveaux tags
      seoData.tags.forEach(tag => {
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.content = tag;
        document.head.appendChild(tagMeta);
      });
    }

    // Twitter Card tags
    const twitterCard = getOrCreateMetaTag('twitter:card', 'name');
    twitterCard.content = 'summary_large_image';

    const twitterTitle = getOrCreateMetaTag('twitter:title', 'name');
    twitterTitle.content = seoData.title;

    const twitterDescription = getOrCreateMetaTag('twitter:description', 'name');
    twitterDescription.content = seoData.description;

    if (seoData.image) {
      const twitterImage = getOrCreateMetaTag('twitter:image', 'name');
      twitterImage.content = seoData.image;
    }

    const twitterSite = getOrCreateMetaTag('twitter:site', 'name');
    twitterSite.content = '@BricolaLTD';

    // JSON-LD pour les données structurées
    const existingJsonLd = document.querySelector('#seo-json-ld');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": seoData.title,
      "description": seoData.description,
      "author": {
        "@type": "Person",
        "name": seoData.author || "Bricola LTD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Bricola LTD",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bricolaltd.com/logo.png"
        }
      },
      "datePublished": seoData.publishedTime,
      "dateModified": seoData.modifiedTime || seoData.publishedTime,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": seoData.url || window.location.href
      }
    };

    if (seoData.image) {
      jsonLdData["image"] = {
        "@type": "ImageObject",
        "url": seoData.image,
        "width": 800,
        "height": 600
      };
    }

    const script = document.createElement('script');
    script.id = 'seo-json-ld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLdData);
    document.head.appendChild(script);

    // Cleanup function pour restaurer les valeurs originales
    return () => {
      document.title = originalTitle;
      
      // Restaurer les balises meta originales
      Object.entries(originalMetaTags).forEach(([property, content]) => {
        const metaTag = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`) as HTMLMetaElement;
        if (metaTag && content) {
          metaTag.content = content;
        }
      });

      // Supprimer les balises ajoutées
      const jsonLdScript = document.querySelector('#seo-json-ld');
      if (jsonLdScript) {
        jsonLdScript.remove();
      }

      // Supprimer les tags d'article
      const articleTags = document.querySelectorAll('meta[property="article:tag"]');
      articleTags.forEach(tag => tag.remove());
    };
  }, [seoData]);
};
