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
      routes: {
        api: '/api',
        admin: '/admin',
        graphQL: 'graphql',
      },
      collections: [],
    },
  })),
}))

describe('AfterDashboard Component', () => {
  it('should be a valid async function component', () => {
    expect(typeof AfterDashboard).toBe('function')
  })

  it('should be an async function', () => {
    // Check if it's an async function by checking its constructor
    expect(AfterDashboard.constructor.name).toBe('AsyncFunction')
  })

  it('should have correct function signature', () => {
    // The component should accept props
    expect(AfterDashboard.length).toBeLessThanOrEqual(1)
  })
})

describe('AfterDashboardClient Component', () => {
  it('should render without errors', () => {
    const { container } = render(<AfterDashboardClient />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should be a valid React component', () => {
    expect(typeof AfterDashboardClient).toBe('function')
  })

  it('should use the useConfig hook', () => {
    const { useConfig } = require('@payloadcms/ui')
    render(<AfterDashboardClient />)
    expect(useConfig).toHaveBeenCalled()
  })

  it('should handle undefined config gracefully', () => {
    const { useConfig } = require('@payloadcms/ui')
    useConfig.mockReturnValueOnce({ config: undefined })
    expect(() => render(<AfterDashboardClient />)).not.toThrow()
  })

  it('should handle state changes from user interactions', () => {
    const { container } = render(<AfterDashboardClient />)
    
    // Find any button element
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // Test that clicking a button doesn't cause errors
    if (buttons[0]) {
      fireEvent.click(buttons[0])
      expect(container.firstChild).toBeTruthy()
    }
  })

  it('should manage multiple state values', () => {
    const { container } = render(<AfterDashboardClient />)
    
    // Component should have buttons for interaction
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // Test multiple clicks don't break the component
    buttons.forEach(button => {
      fireEvent.click(button)
    })
    
    expect(container.firstChild).toBeTruthy()
  })
})
