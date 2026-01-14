jest.mock('react-apexcharts', () => {
  // Avoid pulling ApexCharts into jsdom (it depends on unimplemented SVG APIs).
  return function MockApexChart() {
    return require('react').createElement('div', { 'data-testid': 'apexchart' });
  };
});

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard header', () => {
  render(<App />);

  // App header text rendered on initial route.
  expect(screen.getByText(/Movet Dashboard/i)).toBeInTheDocument();
});
