import LegalPage from '@/components/legal/LegalPage'

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Cookies"
      title="Cookie Policy"
      description="This page explains how cookies and local browser storage may be used on themaradi."
      sections={[
        {
          title: 'Essential cookies',
          body: [
            'Authentication and session cookies are required for login, dashboard access and account security.',
          ],
        },
        {
          title: 'Local preferences',
          body: [
            'Language preference may be stored in local browser storage so the selected language persists across visits.',
          ],
        },
        {
          title: 'Analytics',
          body: [
            'QR scans may store limited technical analytics such as timestamp, device type and approximate location headers when available.',
          ],
        },
        {
          title: 'Control',
          body: [
            'Users can manage cookies through browser settings. Blocking essential cookies may prevent login or dashboard access.',
          ],
        },
      ]}
    />
  )
}
