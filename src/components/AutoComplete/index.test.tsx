import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from './index';
import { fetchSuggestions } from '@/services';
import { useDebounce } from '@/hooks';

jest.mock('@/services');
jest.mock('@/hooks');

const mockedFetchSuggestions = fetchSuggestions as jest.MockedFunction<typeof fetchSuggestions>;
const mockedUseDebounce = useDebounce as jest.MockedFunction<typeof useDebounce>;

describe('Autocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDebounce.mockImplementation((value) => value);
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('renders with default placeholder', () => {
    render(<Autocomplete />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<Autocomplete placeholder="Custom placeholder" />);
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('shows loading state while fetching suggestions', async () => {
    mockedFetchSuggestions.mockImplementation(() => new Promise(() => {}));
    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays suggestions when API returns results', async () => {
    const mockSuggestions = [
      { id: '1', name: 'Suggestion 1' },
      { id: '2', name: 'Suggestion 2' },
    ];
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
    });
  });

  it('shows "No results found" when API returns empty array', async () => {
    mockedFetchSuggestions.mockResolvedValue([]);

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('highlights matching text in suggestions', async () => {
    const mockSuggestions = [{ id: '1', name: 'Test Suggestion' }];
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    await waitFor(() => {
      const highlightedText = screen.getByText('Test');
      expect(highlightedText.tagName).toBe('MARK');
    });
  });

  it('handles arrow key navigation', async () => {
    const mockSuggestions = [
      { id: '1', name: 'Suggestion 1' },
      { id: '2', name: 'Suggestion 2' },
    ];
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Suggestion 1').closest('li')).toHaveClass('selected');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Suggestion 2').closest('li')).toHaveClass('selected');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByText('Suggestion 1').closest('li')).toHaveClass('selected');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.queryByText('Suggestion 1').closest('li')).not.toHaveClass('selected');
    expect(screen.queryByText('Suggestion 2').closest('li')).not.toHaveClass('selected');
  });

  it('selects suggestion on Enter key press', async () => {
    const mockSuggestions = [
      { id: '1', name: 'Suggestion 1' },
      { id: '2', name: 'Suggestion 2' },
    ];
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(input).toHaveValue('Suggestion 1');
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
  });

  it('selects suggestion on click', async () => {
    const mockSuggestions = [
      { id: '1', name: 'Suggestion 1' },
      { id: '2', name: 'Suggestion 2' },
    ];
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Suggestion 2'));

    expect(input).toHaveValue('Suggestion 2');
    expect(screen.queryByText('Suggestion 2')).not.toBeInTheDocument();
  });

  // it('does not fetch suggestions when a selection is made', async () => {
  //   const mockSuggestions = [{ id: '1', name: 'Suggestion 1' }];
  //   mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
  //
  //   render(<Autocomplete />);
  //   const input = screen.getByPlaceholderText('Search...');
  //
  //   // Type initial query
  //   await userEvent.type(input, 'test');
  //
  //   await waitFor(() => {
  //     expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
  //   });
  //
  //   mockedFetchSuggestions.mockClear();
  //
  //   // Select suggestion
  //   await userEvent.click(screen.getByText('Suggestion 1'));
  //
  //   // Simulate typing after selection
  //   await userEvent.type(input, ' additional');
  //
  //   // Wait for any potential debounced calls
  //   await waitFor(() => {}, { timeout: 1000 });
  //
  //   expect(mockedFetchSuggestions).not.toHaveBeenCalled();
  // });

  it('handles error when fetching suggestions', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedFetchSuggestions.mockRejectedValue(new Error('API error'));

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching suggestions:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('clears suggestions when input is cleared', async () => {
    const mockSuggestions = [{ id: '1', name: 'Suggestion 1' }];
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    await userEvent.clear(input);

    expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
  });

  it('does not show suggestions list when query is empty', async () => {
    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');
    await userEvent.clear(input);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('scrolls selected item into view', async () => {
    const mockSuggestions = Array.from({ length: 20 }, (_, i) => ({ id: `${i}`, name: `Suggestion ${i}` }));
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);

    render(<Autocomplete />);
    const input = screen.getByPlaceholderText('Search...');

    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText('Suggestion 0')).toBeInTheDocument();
    });

    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(10);
    expect(scrollIntoViewMock).toHaveBeenLastCalledWith({ block: 'nearest', behavior: 'smooth' });
  });
});