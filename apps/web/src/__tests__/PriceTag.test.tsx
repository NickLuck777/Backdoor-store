import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PriceTag } from '@/components/product/PriceTag';

describe('PriceTag', () => {
  it('renders price in RUB format', () => {
    render(<PriceTag price={1500} />);
    // Intl.NumberFormat formats 1500 as "1 500 ₽" or "1500 ₽" depending on locale
    const priceText = screen.getByText(/1[\s\u00a0]?500/);
    expect(priceText).toBeInTheDocument();
  });

  it('shows discount badge when discount provided', () => {
    render(<PriceTag price={1000} originalPrice={2000} discount={50} />);
    expect(screen.getByText('-50%')).toBeInTheDocument();
  });

  it('shows strikethrough original price when discount provided', () => {
    render(<PriceTag price={1000} originalPrice={2000} discount={50} />);
    // Original price 2000 should appear somewhere in the DOM
    const originalText = screen.getByText(/2[\s\u00a0]?000/);
    expect(originalText).toBeInTheDocument();
    expect(originalText).toHaveClass('line-through');
  });

  it('does not show discount badge when discount not provided', () => {
    render(<PriceTag price={1500} />);
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('does not show original price when no discount', () => {
    render(<PriceTag price={1500} />);
    // With no discount, only one price element should render
    const percentElements = screen.queryAllByText(/%/);
    expect(percentElements).toHaveLength(0);
  });

  it('does not show discount badge when discount is 0', () => {
    render(<PriceTag price={1500} originalPrice={1500} discount={0} />);
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('renders without crashing for large prices', () => {
    render(<PriceTag price={10000} />);
    expect(screen.getByText(/10[\s\u00a0]?000/)).toBeInTheDocument();
  });

  it('accepts size prop without crashing', () => {
    const { rerender } = render(<PriceTag price={1000} size="sm" />);
    rerender(<PriceTag price={1000} size="lg" />);
    expect(screen.getByText(/1[\s\u00a0]?000/)).toBeInTheDocument();
  });
});
