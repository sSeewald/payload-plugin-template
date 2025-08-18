import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'

import { AfterDashboard, AfterDashboardClient  } from '../../components'

// Mock the useConfig hook from @payloadcms/ui
jest.mock('@payloadcms/ui', () => ({
  useConfig: jest.fn(() => ({
    config: {
      serverURL: 'http://localhost:3000',
      admin: {
        user: 'users',
      },
    },
  })),
}))

describe('AfterDashboard Component', () => {
  it('should render the AfterDashboard component', () => {
    // @ts-expect-error Missing properties are not required
    render(<AfterDashboard />)

    expect(screen.getByText('Server Component Example')).toBeInTheDocument()
    expect(screen.getByText('SSR')).toBeInTheDocument()
    expect(screen.getByText(/This component runs on the server/)).toBeInTheDocument()
    expect(screen.getByText('Direct database queries')).toBeInTheDocument()
    expect(screen.getByText('File system access')).toBeInTheDocument()
    expect(screen.getByText('Server-only APIs')).toBeInTheDocument()
    expect(screen.getByText('No browser APIs')).toBeInTheDocument()
    expect(screen.getByText('No React hooks')).toBeInTheDocument()
  })

  it('should have the correct base class', () => {
    // @ts-expect-error Missing properties are not required
    const { container } = render(<AfterDashboard />)
    const element = container.querySelector('.after-dashboard')

    expect(element).toBeInTheDocument()
  })

  it('should render heading and paragraph elements', () => {
    // @ts-expect-error Missing properties are not required
    render(<AfterDashboard />)

    const heading = screen.getByRole('heading', { level: 4 })
    expect(heading).toHaveTextContent('Server Component Example')

    const paragraph = screen.getByText(/server-side capabilities/)
    expect(paragraph).toBeInTheDocument()
  })
})

describe('AfterDashboardClient Component', () => {
  it('should render the AfterDashboardClient component', () => {
    render(<AfterDashboardClient />)

    expect(screen.getByText('Client Component Example')).toBeInTheDocument()
    expect(screen.getByText('Interactive')).toBeInTheDocument()
    expect(screen.getByText(/This component runs in the browser/)).toBeInTheDocument()
    expect(screen.getByText('React hooks')).toBeInTheDocument()
    expect(screen.getByText('Browser APIs')).toBeInTheDocument()
    expect(screen.getByText('User interactions')).toBeInTheDocument()
  })

  it('should use the useConfig hook', () => {
    const { useConfig } = require('@payloadcms/ui')

    render(<AfterDashboardClient />)

    expect(useConfig).toHaveBeenCalled()
  })

  it('should render without errors when config is available', () => {
    const { container } = render(<AfterDashboardClient />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should handle undefined config gracefully', () => {
    const { useConfig } = require('@payloadcms/ui')
    useConfig.mockReturnValueOnce({ config: undefined })

    // Should not throw error
    expect(() => render(<AfterDashboardClient />)).not.toThrow()
  })

  it('should handle button clicks and update state', () => {
    render(<AfterDashboardClient />)
    
    // Find and click the counter button
    const counterButton = screen.getByText('Clicked 0 times')
    expect(counterButton).toBeInTheDocument()
    
    // Click the button
    fireEvent.click(counterButton)
    
    // Check that the text updated
    expect(screen.getByText('Clicked 1 times')).toBeInTheDocument()
  })

  it('should toggle config details visibility', () => {
    render(<AfterDashboardClient />)
    
    // Config should not be visible initially
    expect(screen.queryByText('Server URL')).not.toBeInTheDocument()
    
    // Click the show config button - need to find the button that contains "Show"
    const toggleButton = screen.getByRole('button', { name: /Show Config/i })
    fireEvent.click(toggleButton)
    
    // Config should now be visible
    expect(screen.getByText('Server URL')).toBeInTheDocument()
    expect(screen.getByText('Admin Path')).toBeInTheDocument()
    expect(screen.getByText('API Path')).toBeInTheDocument()
    
    // Button text should change - find button that contains "Hide"
    expect(screen.getByRole('button', { name: /Hide Config/i })).toBeInTheDocument()
  })
})
