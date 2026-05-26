import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Dashboard Analiză Food Delivery/i);
  expect(titleElement).toBeInTheDocument();
});