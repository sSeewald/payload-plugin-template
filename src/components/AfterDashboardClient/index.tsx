'use client'
import type { PayloadClientReactComponent, SanitizedConfig } from 'payload'

import { useConfig } from '@payloadcms/ui'
import React, { useState } from 'react'

import './index.scss'

const baseClass = 'after-dashboard-client'

export const AfterDashboardClient: PayloadClientReactComponent<
  SanitizedConfig['admin']['components']['afterDashboard'][0]
> = () => {
  const { config } = useConfig()
  const [clickCount, setClickCount] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__header`}>
        <h4>Client Component Example</h4>
        <span className={`${baseClass}__badge`}>Interactive</span>
      </div>

      <div className={`${baseClass}__content`}>
        <p className={`${baseClass}__description`}>
          This component runs in the browser and demonstrates client-side interactivity.
        </p>

        <div className={`${baseClass}__features`}>
          <div className={`${baseClass}__feature`}>
            <span className={`${baseClass}__feature-icon`}>✓</span>
            <span>React hooks</span>
          </div>
          <div className={`${baseClass}__feature`}>
            <span className={`${baseClass}__feature-icon`}>✓</span>
            <span>Browser APIs</span>
          </div>
          <div className={`${baseClass}__feature`}>
            <span className={`${baseClass}__feature-icon`}>✓</span>
            <span>User interactions</span>
          </div>
          <div className={`${baseClass}__feature ${baseClass}__feature--disabled`}>
            <span className={`${baseClass}__feature-icon`}>×</span>
            <span>No database access</span>
          </div>
          <div className={`${baseClass}__feature ${baseClass}__feature--disabled`}>
            <span className={`${baseClass}__feature-icon`}>×</span>
            <span>No server secrets</span>
          </div>
        </div>

        <div className={`${baseClass}__demo`}>
          <h5>Interactive Demo</h5>
          <div className={`${baseClass}__demo-buttons`}>
            <button
              className={`${baseClass}__button`}
              onClick={() => setClickCount(clickCount + 1)}
              type="button"
            >
              Clicked {clickCount} times
            </button>
            
            <button
              className={`${baseClass}__button ${baseClass}__button--secondary`}
              onClick={() => setShowDetails(!showDetails)}
              type="button"
            >
              {showDetails ? 'Hide' : 'Show'} Config
            </button>
          </div>
        </div>

        {showDetails && (
          <div className={`${baseClass}__config`}>
            <h5>Payload Configuration</h5>
            <dl className={`${baseClass}__config-list`}>
              <dt>Server URL</dt>
              <dd>{config?.serverURL || 'Not configured'}</dd>
              
              <dt>Admin Path</dt>
              <dd>{config?.routes?.admin || '/admin'}</dd>
              
              <dt>API Path</dt>
              <dd>{config?.routes?.api || '/api'}</dd>
              
              <dt>Collections</dt>
              <dd>{config?.collections?.length || 0} configured</dd>
            </dl>
          </div>
        )}

        <div className={`${baseClass}__info`}>
          <strong>Best for:</strong> Forms, modals, real-time updates, interactive UI elements
        </div>
      </div>
    </div>
  )
}