'use client'
import type { PayloadClientReactComponent, SanitizedConfig } from 'payload'

import { useConfig } from '@payloadcms/ui'
import React, { useState } from 'react'

import styles from './index.module.css'

export const AfterDashboardClient: PayloadClientReactComponent<
  SanitizedConfig['admin']['components']['afterDashboard'][0]
> = () => {
  const { config } = useConfig()
  const [clickCount, setClickCount] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [userInfo, setUserInfo] = useState<null | Record<string, any>>(null)
  const [loading, setLoading] = useState(false)
  const [showPages, setShowPages] = useState(false)
  const [pagesData, setPagesData] = useState<null | Record<string, any>>(null)
  const [loadingPages, setLoadingPages] = useState(false)

  const fetchUserInfo = async () => {
    if (showUserInfo && userInfo) {
      setShowUserInfo(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${config?.routes?.api}/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // User info response
        setUserInfo(data.user)
        setShowUserInfo(true)
      }
    } catch {
      // Failed to fetch user info
    } finally {
      setLoading(false)
    }
  }

  const fetchPagesGraphQL = async () => {
    if (showPages && pagesData) {
      setShowPages(false)
      return
    }

    setLoadingPages(true)
    try {
      const response = await fetch(`${config?.routes?.api}/${config?.routes?.graphQL || 'graphql'}`, {
        body: JSON.stringify({
          query: `
            query GetPages {
              Pages {
                docs {
                  id
                  title
                  createdAt
                  updatedAt
                }
                totalDocs
              }
            }
          `
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setPagesData(data.data)
        setShowPages(true)
      }
    } catch {
      // Failed to fetch pages
    } finally {
      setLoadingPages(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className={styles.afterDashboardClient}>
      <div className={styles.header}>
        <h4>Client Component Example</h4>
        <span className={styles.badge}>Interactive</span>
      </div>

      <div className={styles.content}>
        <p className={styles.description}>
          This component runs in the browser and demonstrates client-side interactivity.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>React hooks</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>Browser APIs</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>User interactions</span>
          </div>
          <div className={styles.featureDisabled}>
            <span className={styles.featureIconDisabled}>×</span>
            <span>No database access</span>
          </div>
          <div className={styles.featureDisabled}>
            <span className={styles.featureIconDisabled}>×</span>
            <span>No server secrets</span>
          </div>
        </div>

        <div className={styles.demo}>
          <h5>Interactive Demo</h5>
          <div className={styles.demoButtons}>
            <button
              className={styles.button}
              onClick={() => setClickCount(clickCount + 1)}
              type="button"
            >
              Clicked {clickCount} times
            </button>

            <button
              className={styles.buttonSecondary}
              onClick={() => setShowDetails(!showDetails)}
              type="button"
            >
              {showDetails ? 'Hide' : 'Show'} Config
            </button>

            <button
              className={styles.buttonSecondary}
              disabled={loading}
              onClick={fetchUserInfo}
              type="button"
            >
              {loading ? 'Loading...' : showUserInfo && userInfo ? 'Hide' : 'Fetch & Show'} User Info
            </button>

            <button
              className={styles.buttonSecondary}
              disabled={loadingPages}
              onClick={fetchPagesGraphQL}
              type="button"
            >
              {loadingPages ? 'Loading...' : showPages && pagesData ? 'Hide' : 'Fetch'} Pages (GraphQL)
            </button>
          </div>
        </div>

        {showDetails && (
          <div className={styles.config}>
            <h5>Payload Configuration</h5>
            <dl className={styles.configList}>
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

        {showUserInfo && userInfo ? (
          <div className={styles.userDemo}>
            <h5>Client-Side Data Fetching (REST)</h5>
            <div className={styles.userInfo}>
              <div className={styles.userHeader}>
                <span aria-label="User icon" className={styles.userIcon} role="img">👤</span>
                <span className={styles.userTitle}>Current User</span>
              </div>
              <dl className={styles.userDetails}>
                <dt>Email</dt>
                <dd data-label="Email">{userInfo?.email}</dd>

                <dt>User ID</dt>
                <dd data-label="User ID">
                  <span className={styles.mono}>{userInfo.id}</span>
                </dd>

                <dt>Created</dt>
                <dd data-label="Created">{formatDate(userInfo.createdAt)}</dd>

                <dt>Last Updated</dt>
                <dd data-label="Last Updated">{formatDate(userInfo.updatedAt)}</dd>

                <dt>Collections Access</dt>
                <dd data-label="Collections">
                  {Array.isArray(userInfo.collection) ? userInfo.collection.length : 'All'}{' '}
                  collections
                </dd>
              </dl>
              <div className={styles.note}>Fetched client-side via REST API</div>
            </div>
          </div>
        ) : null}

        {showPages && pagesData ? (
          <div className={styles.pagesDemo}>
            <h5>GraphQL Query Result</h5>
            <div className={styles.pagesInfo}>
              <div className={styles.pagesHeader}>
                <span aria-label="Pages icon" className={styles.pagesIcon} role="img">📄</span>
                <span className={styles.pagesTitle}>Pages Collection</span>
                <span className={styles.badge}>{pagesData.Pages?.totalDocs || 0} total</span>
              </div>
              {pagesData.Pages?.docs && pagesData.Pages.docs.length > 0 ? (
                <div className={styles.pagesList}>
                  {pagesData.Pages.docs.map((page: any) => (
                    <div className={styles.pageItem} key={page.id}>
                      <div className={styles.pageTitle}>{page.title || 'Untitled'}</div>
                      <div className={styles.pageMeta}>
                        <span>ID: {page.id}</span>
                        <span>Created: {new Date(page.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noPages}>
                  No pages found. Create some pages first!
                </div>
              )}
              <div className={styles.note}>Fetched via GraphQL API</div>
            </div>
          </div>
        ) : null}

        <div className={styles.info}>
          <strong>Best for:</strong> Forms, modals, real-time updates, interactive UI elements
        </div>
      </div>
    </div>
  )
}
