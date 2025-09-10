import React, { useEffect } from 'react';

interface SEOHeadProps {
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

// Fonction utilitaire pour obtenir ou créer une balise meta
const getOrCreateMetaTag = (property: string, attribute: 'property' | 'name' = 'property'): HTMLMetaElement => {
  let metaTag = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, property);
    document.head.appendChild(metaTag);
  }
  return metaTag;
};

// Fonction pour définir les balises meta de base
const setBasicMetaTags = (title: string, description: string, author?: string) => {
  document.title = `${title} | Bricola LTD`;
  getOrCreateMetaTag('description', 'name').content = description;
  if (author) {
    getOrCreateMetaTag('author', 'name').content = author;
  }
};

// Fonction pour définir les balises Open Graph
const setOpenGraphTags = (title: string, description: string, type: string, currentUrl: string, image?: string) => {
  getOrCreateMetaTag('og:title').content = title;
  getOrCreateMetaTag('og:description').content = description;
  getOrCreateMetaTag('og:type').content = type;
  getOrCreateMetaTag('og:url').content = currentUrl;
  getOrCreateMetaTag('og:site_name').content = 'Bricola LTD';
  
  if (image) {
    getOrCreateMetaTag('og:image').content = image;
    getOrCreateMetaTag('og:image:alt').content = title;
    getOrCreateMetaTag('og:image:width').content = '800';
    getOrCreateMetaTag('og:image:height').content = '600';
  }
};

// Fonction pour définir les balises spécifiques aux articles
const setArticleMetaTags = (type: string, publishedTime?: string, modifiedTime?: string, author?: string, section?: string, tags: string[] = []) => {
  if (type !== 'article') return;

  if (publishedTime) {
    getOrCreateMetaTag('article:published_time').content = publishedTime;
  }
  if (modifiedTime || publishedTime) {
    getOrCreateMetaTag('article:modified_time').content = modifiedTime || publishedTime!;
  }
  if (author) {
    getOrCreateMetaTag('article:author').content = author;
  }
  if (section) {
    getOrCreateMetaTag('article:section').content = section;
  }
  
  // Supprimer les anciens tags d'abord
  const existingTags = document.querySelectorAll('meta[property="article:tag"]');
  existingTags.forEach(tag => tag.remove());
  
  // Ajouter les nouveaux tags
  tags.forEach(tag => {
    const tagMeta = document.createElement('meta');
    tagMeta.setAttribute('property', 'article:tag');
    tagMeta.content = tag;
    document.head.appendChild(tagMeta);
  });
};

// Fonction pour définir les balises Twitter Card
const setTwitterCardTags = (title: string, description: string, image?: string) => {
  getOrCreateMetaTag('twitter:card', 'name').content = 'summary_large_image';
  getOrCreateMetaTag('twitter:site', 'name').content = '@BricolaLTD';
  getOrCreateMetaTag('twitter:title', 'name').content = title;
  getOrCreateMetaTag('twitter:description', 'name').content = description;
  if (image) {
    getOrCreateMetaTag('twitter:image', 'name').content = image;
  }
};

// Fonction pour créer les données structurées JSON-LD
const createJsonLdData = (params: {
  title: string;
  description: string;
  type: string;
  currentUrl: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  image?: string;
}) => {
  const { title, description, type, currentUrl, author, publishedTime, modifiedTime, image } = params;
  
  const existingJsonLd = document.querySelector('#seo-json-ld');
  if (existingJsonLd) {
    existingJsonLd.remove();
  }
  
  const jsonLdData: any = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebPage',
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author || "Bricola LTD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bricola LTD",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/LOGO BRICOLA LTD VF.webp`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl
    }
  };

  if (publishedTime) {
    jsonLdData.datePublished = publishedTime;
    jsonLdData.dateModified = modifiedTime || publishedTime;
  }

  if (image) {
    jsonLdData.image = {
      "@type": "ImageObject",
      "url": image,
      "width": 800,
      "height": 600
    };
  }

  const script = document.createElement('script');
  script.id = 'seo-json-ld';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLdData);
  document.head.appendChild(script);
};

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) => {
  useEffect(() => {
    const currentUrl = url || window.location.href;
    
    setBasicMetaTags(title, description, author);
    setOpenGraphTags(title, description, type, currentUrl, image);
    setArticleMetaTags(type, publishedTime, modifiedTime, author, section, tags);
    setTwitterCardTags(title, description, image);
    createJsonLdData({
      title,
      description,
      type,
      currentUrl,
      author,
      publishedTime,
      modifiedTime,
      image
    });

  }, [title, description, image, url, type, author, publishedTime, modifiedTime, section, tags]);

  return null; // Ce composant ne rend rien visuellement
};

export default SEOHead;
