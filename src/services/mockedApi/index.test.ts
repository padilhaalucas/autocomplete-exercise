import { fetchSuggestions } from './index.ts';
import { Country } from '@/types';

// Mock the global fetch function
global.fetch = jest.fn();

describe('fetchSuggestions', () => {
  // Helper function to mock fetch response
  const mockFetchResponse = (data: any) => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(data),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error
  });

  it('fetches suggestions successfully', async () => {
    const mockCountries: Array<Country> = [
      {
        flag: '🇺🇸',
        name: { common: 'United States' },
        currencies: { USD: { name: 'United States Dollar', symbol: '$' } },
      },
      {
        flag: '🇬🇧',
        name: { common: 'United Kingdom' },
        currencies: { GBP: { name: 'British Pound', symbol: '£' } },
      },
    ];

    mockFetchResponse(mockCountries);

    const result = await fetchSuggestions('');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://restcountries.com/v3.1/all?fields=flag,name,currencies'
    );
    expect(result).toEqual([
      { id: 'USD', name: '🇺🇸 United States Dollar ($)' },
      { id: 'GBP', name: '🇬🇧 British Pound (£)' },
    ]);
  });

  it('filters suggestions based on query', async () => {
    const mockCountries: Array<Country> = [
      {
        flag: '🇺🇸',
        name: { common: 'United States' },
        currencies: { USD: { name: 'United States Dollar', symbol: '$' } },
      },
      {
        flag: '🇯🇵',
        name: { common: 'Japan' },
        currencies: { JPY: { name: 'Japanese Yen', symbol: '¥' } },
      },
    ];

    mockFetchResponse(mockCountries);

    const result = await fetchSuggestions('yen');

    expect(result).toEqual([
      { id: 'JPY', name: '🇯🇵 Japanese Yen (¥)' },
    ]);
  });

  it('handles countries without currencies', async () => {
    const mockCountries: Array<Country> = [
      {
        flag: '🇺🇸',
        name: { common: 'United States' },
        currencies: { USD: { name: 'United States Dollar', symbol: '$' } },
      },
      {
        flag: '🇦🇶',
        name: { common: 'Antarctica' },
        currencies: undefined,
      },
    ];

    mockFetchResponse(mockCountries);

    const result = await fetchSuggestions('');

    expect(result).toEqual([
      { id: 'USD', name: '🇺🇸 United States Dollar ($)' },
    ]);
  });

  it('handles fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await fetchSuggestions('test');

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching country and currency suggestions:',
      expect.any(Error)
    );
  });

  it('handles empty response', async () => {
    mockFetchResponse([]);

    const result = await fetchSuggestions('test');

    expect(result).toEqual([]);
  });

  it('is case insensitive when filtering suggestions', async () => {
    const mockCountries: Array<Country> = [
      {
        flag: '🇺🇸',
        name: { common: 'United States' },
        currencies: { USD: { name: 'United States Dollar', symbol: '$' } },
      },
    ];

    mockFetchResponse(mockCountries);

    const result = await fetchSuggestions('united');
    const resultUpperCase = await fetchSuggestions('UNITED');

    expect(result).toEqual(resultUpperCase);
    expect(result).toEqual([
      { id: 'USD', name: '🇺🇸 United States Dollar ($)' },
    ]);
  });
});