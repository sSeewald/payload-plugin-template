import type { PayloadServerReactComponent, SanitizedConfig } from 'payload'

import React from 'react'

import './index.scss'

const baseClass = 'after-dashboard'

export const AfterDashboard: PayloadServerReactComponent<
  SanitizedConfig['admin']['components']['afterDashboard'][0]
> = () => {
  return (
    <div className={baseClass}>
      <div className={`${baseClass}__header`}>
        <h4>Server Component Example</h4>
        <span className={`${baseClass}__badge`}>SSR</span>
      </div>

      <div className={`${baseClass}__content`}>
        <p className={`${baseClass}__description`}>
          This component runs on the server during SSR and demonstrates server-side capabilities.
        </p>
        
        <div className={`${baseClass}__features`}>
          <div className={`${baseClass}__feature`}>
            <span className={`${baseClass}__feature-icon`}>✓</span>
            <span>Direct database queries</span>
          </div>
          <div className={`${baseClass}__feature`}>
            <span className={`${baseClass}__feature-icon`}>✓</span>
            <span>File system access</span>
          </div>
          <div className={`${baseClass}__feature`}>
            <span className={`${baseClass}__feature-icon`}>✓</span>
            <span>Server-only APIs</span>
          </div>
          <div className={`${baseClass}__feature ${baseClass}__feature--disabled`}>
            <span className={`${baseClass}__feature-icon`}>×</span>
            <span>No browser APIs</span>
          </div>
          <div className={`${baseClass}__feature ${baseClass}__feature--disabled`}>
            <span className={`${baseClass}__feature-icon`}>×</span>
            <span>No React hooks</span>
          </div>
        </div>

        <div className={`${baseClass}__info`}>
          <strong>Best for:</strong> Data fetching, static content, configuration displays
        </div>
      </div>
    </div>
  )
}