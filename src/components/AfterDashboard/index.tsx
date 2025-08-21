import type { PayloadServerReactComponent, SanitizedConfig } from 'payload'
import React from 'react'

import styles from './index.module.scss'

export const AfterDashboard: PayloadServerReactComponent<
  SanitizedConfig['admin']['components']['afterDashboard'][0]
> = async ({ payload, user }) => {
  // Fetch current user with full details
  let currentUser: any = null
  if (user) {
    try {
      const userResult = await payload.findByID({
        id: user.id,
        collection: 'users',
      })
      currentUser = userResult
    } catch {
      // Failed to fetch user
    }
  }

  // Format date for display
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
    <div className={styles.afterDashboard}>
      <div className={styles.header}>
        <h4>Server Component Example</h4>
        <span className={styles.badge}>SSR</span>
      </div>

      <div className={styles.content}>
        <p className={styles.description}>
          This component runs on the server during SSR and demonstrates server-side capabilities.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>Direct database queries</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>File system access</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>Server-only APIs</span>
          </div>
          <div className={styles.featureDisabled}>
            <span className={styles.featureIconDisabled}>×</span>
            <span>No browser APIs</span>
          </div>
          <div className={styles.featureDisabled}>
            <span className={styles.featureIconDisabled}>×</span>
            <span>No React hooks</span>
          </div>
        </div>

        <div className={styles.demo}>
          <h5>Server Data Demo</h5>
          {currentUser ? (
            <div className={styles.userInfo}>
              <div className={styles.userHeader}>
                <span aria-label="User icon" className={styles.userIcon} role="img">👤</span>
                <span className={styles.userTitle}>Current User</span>
              </div>
              <dl className={styles.userDetails}>
                <dt>Email</dt>
                <dd data-label="Email">{currentUser.email}</dd>

                <dt>User ID</dt>
                <dd data-label="User ID">
                  <span className={styles.mono}>{currentUser.id}</span>
                </dd>

                <dt>Created</dt>
                <dd data-label="Created">{formatDate(currentUser.createdAt)}</dd>

                <dt>Last Updated</dt>
                <dd data-label="Last Updated">{formatDate(currentUser.updatedAt)}</dd>

                <dt>Collections Access</dt>
                <dd data-label="Collections">
                  {Array.isArray(currentUser.collection) ? currentUser.collection.length : 'All'}{' '}
                  collections
                </dd>
              </dl>
              <div className={styles.note}>Fetched server-side using Payload API</div>
            </div>
          ) : (
            <div className={styles.noUser}>
              No user session found. This demo requires authentication.
            </div>
          )}
        </div>

        <div className={styles.info}>
          <strong>Best for:</strong> Data fetching, static content, configuration displays
        </div>
      </div>
    </div>
  )
}
