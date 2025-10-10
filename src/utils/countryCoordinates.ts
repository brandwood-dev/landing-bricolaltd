// Service pour mapper les codes de pays vers leurs coordonnées et configurations Mapbox

export interface CountryCoordinates {
  lat: number;
  lng: number;
  zoom: number;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

export const countryCoordinatesMap: Record<string, CountryCoordinates> = {
  // Pays du Golfe (région principale)
  'KW': { // Kuwait
    lat: 29.3759,
    lng: 47.9774,
    zoom: 10,
    bbox: [46.5687, 28.5243, 48.4160, 30.0590]
  },
  'SA': { // Saudi Arabia
    lat: 23.8859,
    lng: 45.0792,
    zoom: 6,
    bbox: [34.5085, 16.0000, 55.6666, 32.1543]
  },
  'AE': { // United Arab Emirates
    lat: 23.4241,
    lng: 53.8478,
    zoom: 8,
    bbox: [51.5795, 22.4969, 56.3968, 26.0840]
  },
  'QA': { // Qatar
    lat: 25.3548,
    lng: 51.1839,
    zoom: 9,
    bbox: [50.7439, 24.4707, 51.6067, 26.1540]
  },
  'BH': { // Bahrain
    lat: 26.0667,
    lng: 50.5577,
    zoom: 11,
    bbox: [50.4500, 25.7900, 50.6640, 26.3280]
  },
  'OM': { // Oman
    lat: 21.4735,
    lng: 55.9754,
    zoom: 7,
    bbox: [51.9999, 16.6510, 59.8360, 26.3959]
  },
  
  // Autres pays du Moyen-Orient
  'JO': { // Jordan
    lat: 30.5852,
    lng: 36.2384,
    zoom: 8,
    bbox: [34.9226, 29.1974, 39.3012, 33.3786]
  },
  'LB': { // Lebanon
    lat: 33.8547,
    lng: 35.8623,
    zoom: 9,
    bbox: [35.1023, 33.0890, 36.6117, 34.6449]
  },
  'SY': { // Syria
    lat: 34.8021,
    lng: 38.9968,
    zoom: 7,
    bbox: [35.7007, 32.3129, 42.3495, 37.2298]
  },
  'IQ': { // Iraq
    lat: 33.2232,
    lng: 43.6793,
    zoom: 7,
    bbox: [38.7936, 29.0695, 48.5679, 37.3781]
  },
  'IR': { // Iran
    lat: 32.4279,
    lng: 53.6880,
    zoom: 6,
    bbox: [44.0479, 25.0640, 63.3166, 39.7816]
  },
  
  // Pays d'Afrique du Nord
  'EG': { // Egypt
    lat: 26.8206,
    lng: 30.8025,
    zoom: 6,
    bbox: [24.6499, 22.0000, 36.8877, 31.6673]
  },
  'MA': { // Morocco
    lat: 31.7917,
    lng: -7.0926,
    zoom: 6,
    bbox: [-17.0204, 21.4207, -1.1244, 35.9224]
  },
  'TN': { // Tunisia
    lat: 33.8869,
    lng: 9.5375,
    zoom: 7,
    bbox: [7.5244, 30.2407, 11.5981, 37.5440]
  },
  'DZ': { // Algeria
    lat: 28.0339,
    lng: 1.6596,
    zoom: 6,
    bbox: [-8.6676, 18.9681, 11.9995, 37.0938]
  },
  'LY': { // Libya
    lat: 26.3351,
    lng: 17.2283,
    zoom: 6,
    bbox: [9.3158, 19.5008, 25.1503, 33.1369]
  },
  
  // Pays européens
  'FR': { // France
    lat: 46.2276,
    lng: 2.2137,
    zoom: 6,
    bbox: [-5.1423, 41.3253, 9.5596, 51.1242]
  },
  'DE': { // Germany
    lat: 51.1657,
    lng: 10.4515,
    zoom: 6,
    bbox: [5.8663, 47.2701, 15.0419, 55.0581]
  },
  'GB': { // United Kingdom
    lat: 55.3781,
    lng: -3.4360,
    zoom: 6,
    bbox: [-10.7695, 49.9599, 1.7712, 60.8448]
  },
  'IT': { // Italy
    lat: 41.8719,
    lng: 12.5674,
    zoom: 6,
    bbox: [6.6272, 35.4929, 18.7844, 47.0921]
  },
  'ES': { // Spain
    lat: 40.4637,
    lng: -3.7492,
    zoom: 6,
    bbox: [-18.1681, 27.6379, 4.3278, 43.7913]
  },
  
  // Pays par défaut (région du Golfe)
  'DEFAULT': {
    lat: 25.2048,
    lng: 55.2708, // Dubai comme centre par défaut
    zoom: 8,
    bbox: [34.5, 16, 59.8, 32.2]
  }
};

/**
 * Obtient les coordonnées et la configuration pour un pays donné
 */
export const getCountryCoordinates = (countryCode?: string): CountryCoordinates => {
  // Debug logs pour getCountryCoordinates
  console.log('🔍 [getCountryCoordinates] Input:', {
    countryCode,
    'typeof countryCode': typeof countryCode,
    'countryCode value': countryCode
  })

  // Vérifier si countryCode est une chaîne de caractères valide
  if (!countryCode || typeof countryCode !== 'string') {
    console.log('⚠️ [getCountryCoordinates] Invalid countryCode, using DEFAULT:', {
      countryCode,
      'typeof countryCode': typeof countryCode,
      defaultCoords: countryCoordinatesMap['DEFAULT']
    })
    return countryCoordinatesMap['DEFAULT']
  }

  const upperCountryCode = countryCode.toUpperCase()
  const coordinates = countryCoordinatesMap[upperCountryCode] || countryCoordinatesMap['DEFAULT']
  
  console.log('🌍 [getCountryCoordinates] Result:', {
    originalCode: countryCode,
    upperCode: upperCountryCode,
    found: !!countryCoordinatesMap[upperCountryCode],
    coordinates,
    'coordinates.lat': coordinates.lat,
    'coordinates.lng': coordinates.lng,
    'coordinates.zoom': coordinates.zoom
  })

  return coordinates
}

/**
 * Obtient la liste des codes de pays pour la recherche Mapbox
 */
export const getMapboxCountryCodes = (primaryCountry?: string): string => {
  if (!primaryCountry) {
    return 'KW,SA,BH,OM,QA,AE'; // Pays du Golfe par défaut
  }
  
  const upperCode = primaryCountry.toUpperCase();
  
  // Groupes de pays par région
  const gulfCountries = ['KW', 'SA', 'BH', 'OM', 'QA', 'AE'];
  const middleEastCountries = ['JO', 'LB', 'SY', 'IQ', 'IR'];
  const northAfricaCountries = ['EG', 'MA', 'TN', 'DZ', 'LY'];
  const europeanCountries = ['FR', 'DE', 'GB', 'IT', 'ES'];
  
  // Prioriser le pays de l'utilisateur et ajouter les pays de la même région
  if (gulfCountries.includes(upperCode)) {
    return [upperCode, ...gulfCountries.filter(c => c !== upperCode)].join(',');
  } else if (middleEastCountries.includes(upperCode)) {
    return [upperCode, ...middleEastCountries.filter(c => c !== upperCode), ...gulfCountries].join(',');
  } else if (northAfricaCountries.includes(upperCode)) {
    return [upperCode, ...northAfricaCountries.filter(c => c !== upperCode), ...gulfCountries].join(',');
  } else if (europeanCountries.includes(upperCode)) {
    return [upperCode, ...europeanCountries.filter(c => c !== upperCode)].join(',');
  }
  
  // Pour les autres pays, inclure le pays de l'utilisateur + région du Golfe
  return [upperCode, ...gulfCountries].join(',');
};

/**
 * Obtient la bbox pour la recherche Mapbox
 */
export const getMapboxBbox = (countryCode?: string): string => {
  const coords = getCountryCoordinates(countryCode);
  if (coords.bbox) {
    return coords.bbox.join(',');
  }
  
  // Bbox par défaut pour la région du Golfe
  return '34.5,16,59.8,32.2';
};

/**
 * Obtient les coordonnées de proximité pour la recherche Mapbox
 */
export const getMapboxProximity = (countryCode?: string): string => {
  const coords = getCountryCoordinates(countryCode);
  return `${coords.lng},${coords.lat}`;
};