// Utility function to map country codes to currencies

export interface CountryCurrencyMapping {
  [countryCode: string]: string;
}

// Mapping between country codes and their respective currencies
export const COUNTRY_TO_CURRENCY: CountryCurrencyMapping = {
  // Gulf Cooperation Council (GCC) countries
  'KW': 'KWD', // Kuwait
  'SA': 'SAR', // Saudi Arabia
  'BH': 'BHD', // Bahrain
  'OM': 'OMR', // Oman
  'QA': 'QAR', // Qatar
  'AE': 'AED', // United Arab Emirates
  
  // Alternative country name formats (in case backend uses full names)
  'Kuwait': 'KWD',
  'Saudi Arabia': 'SAR',
  'Bahrain': 'BHD',
  'Oman': 'OMR',
  'Qatar': 'QAR',
  'United Arab Emirates': 'AED',
  'UAE': 'AED',
  
  // Default fallback
  'GB': 'GBP', // United Kingdom
  'UK': 'GBP', // United Kingdom alternative
  'United Kingdom': 'GBP',
};

/**
 * Get currency code based on user's country
 * @param country - User's country (can be country code, full name, or Country object)
 * @returns Currency code (defaults to GBP if country not found)
 */
export const getCurrencyFromCountry = (country?: string | { id?: string; code?: string; name?: string }): string => {
  if (!country) {
    return 'GBP'; // Default currency
  }

  // Handle different country input types
  let countryCode: string;
  
  if (typeof country === 'string') {
    countryCode = country.trim();
  } else if (typeof country === 'object') {
    // If it's a Country object, try to get the code or id
    countryCode = country.code || country.id || '';
  } else {
    return 'GBP'; // Default if unknown type
  }

  // Normalize country input (convert to uppercase for codes)
  const normalizedCountry = countryCode;
  
  // Try exact match first
  if (COUNTRY_TO_CURRENCY[normalizedCountry]) {
    return COUNTRY_TO_CURRENCY[normalizedCountry];
  }
  
  // Try uppercase match for country codes
  const upperCountry = normalizedCountry.toUpperCase();
  if (COUNTRY_TO_CURRENCY[upperCountry]) {
    return COUNTRY_TO_CURRENCY[upperCountry];
  }
  
  // Try case-insensitive match for full country names
  const matchingKey = Object.keys(COUNTRY_TO_CURRENCY).find(
    key => key.toLowerCase() === normalizedCountry.toLowerCase()
  );
  
  if (matchingKey) {
    return COUNTRY_TO_CURRENCY[matchingKey];
  }
  
  // Default fallback
  return 'GBP';
};

/**
 * Check if a country has a supported currency mapping
 * @param country - User's country
 * @returns boolean indicating if country has currency mapping
 */
export const hasCountryCurrencyMapping = (country?: string): boolean => {
  if (!country) return false;
  
  const normalizedCountry = country.trim();
  return !!(
    COUNTRY_TO_CURRENCY[normalizedCountry] ||
    COUNTRY_TO_CURRENCY[normalizedCountry.toUpperCase()] ||
    Object.keys(COUNTRY_TO_CURRENCY).find(
      key => key.toLowerCase() === normalizedCountry.toLowerCase()
    )
  );
};