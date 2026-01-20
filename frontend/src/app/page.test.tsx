// Sample test file demonstrating TDD approach
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home', () => {
  it('should render welcome message', () => {
    render(<Home />);
    const welcomeElement = screen.getByText(/Welcome to/i);
    expect(welcomeElement).toBeInTheDocument();
  });
});