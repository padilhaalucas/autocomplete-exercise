import { useState, useEffect, useRef, useCallback } from 'react';

import { useDebounce } from '@/hooks';
import { Suggestion } from '@/types';
import { fetchSuggestions } from '@/services';

import './index.css';

interface AutocompleteProps {
  placeholder?: string;
}

const Autocomplete = ({ placeholder = 'Search...' }: AutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSelectionMade, setIsSelectionMade] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const fetchSuggestionsHandler = useCallback(async (searchQuery: string) => {
    if (!searchQuery || isSelectionMade) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchSuggestions(searchQuery);
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSelectionMade]);

  useEffect(() => {
    if (!isSelectionMade && debouncedQuery) {
      fetchSuggestionsHandler(debouncedQuery);
    }
  }, [debouncedQuery, isSelectionMade, fetchSuggestionsHandler]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setSelectedIndex(-1);
    setIsSelectionMade(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex > -1 ? prevIndex - 1 : -1));
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      setQuery(suggestions[selectedIndex].name);
      setSuggestions([]);
      setIsSelectionMade(true);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.name);
    setSuggestions([]);
    setIsSelectionMade(true);
    inputRef.current?.focus();
  };

  const highlightMatch = useCallback((text: string, query: string) => {
    if (query?.length > 0) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.split(regex).map((part, index) =>
        regex?.test(part) ? <mark key={index}>{part}</mark> : part
      );
    }

    return [];
  }, [query]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLLIElement;
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <div className="autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="autocomplete-input"
      />
      {isLoading && <div className="loading"><span>Loading...</span></div>}
      {query?.length > 0 && suggestions.length > 0 && (
        <ul ref={listRef} className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.id}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
            >
              {highlightMatch(suggestion.name, query)}
            </li>
          ))}
        </ul>
      )}
      {debouncedQuery?.length > 0 && !isLoading && suggestions.length === 0 && !isSelectionMade && (
        <section className="no-result">
          <p>No results found</p>
        </section>
      )}
    </div>
  );
};

export { Autocomplete };