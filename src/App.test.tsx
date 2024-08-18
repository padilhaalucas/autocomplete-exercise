import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Autocomplete component
jest.mock('./components/AutoComplete', () => ({
  Autocomplete: () => <div data-testid="mock-autocomplete">Mocked Autocomplete</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Currency autocomplete 🪙')).toBeInTheDocument();
  });

  it('renders the header with correct text', () => {
    render(<App />);
    const headerElement = screen.getByRole('heading', { level: 1 });
    expect(headerElement).toHaveTextContent('Currency autocomplete 🪙');
  });

  it('renders the Autocomplete component', () => {
    render(<App />);
    expect(screen.getByTestId('mock-autocomplete')).toBeInTheDocument();
  });

  it('has the correct structure', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.app-container')).toBeInTheDocument();
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('.autocomplete-section')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<App />);

    expect(container.firstChild).toHaveClass('app-container');
    expect(container.querySelector('section')).toHaveClass('autocomplete-section');
  });
});