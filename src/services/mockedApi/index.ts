import { Suggestion, Country } from '@/types';

const BASE_URL = 'https://restcountries.com/v3.1';

export const fetchSuggestions = async (query: string): Promise<Array<Suggestion>> => {
  try {
    const response = await fetch(`${BASE_URL}/all?fields=flag,name,currencies`);

    const countries: Array<Country> = await response.json();
    const suggestions: Array<Suggestion> = countries.flatMap((country) => {
      if (!country.currencies) return [];

      return Object.entries(country.currencies).map(([code, currency]) => ({
        id: code,
        name: `${country.flag} ${currency.name} (${currency.symbol})`,
      }));
    });

    return suggestions.filter((suggestion) =>
      suggestion.name.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error fetching country and currency suggestions:', error);
    return [];
  }
};
