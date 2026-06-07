import LegalPage from '@/components/legal/LegalPage'

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms of Service"
      description="These terms define the basic rules for using themaradi. They should be reviewed by legal counsel before production launch."
      sections={[
        {
          title: 'Service',
          body: [
            'themaradi provides digital vault, trusted person, memorial page, guestbook and QR redirect features.',
            'Some features are marked as upcoming and may change before general availability.',
          ],
        },
        {
          title: 'User responsibilities',
          body: [
            'Users are responsible for uploading lawful content and keeping account credentials secure.',
            'Users must not upload harmful, illegal, misleading or rights-infringing material.',
          ],
        },
        {
          title: 'Plans and payments',
          body: [
            'The free plan allows users to start using the service. Premium and lifetime plans may be introduced later.',
            'Pricing, storage limits and plan details may change with notice.',
          ],
        },
        {
          title: 'Availability',
          body: [
            'We aim to provide a reliable service, but no online service can be guaranteed to be uninterrupted at all times.',
          ],
        },
      ]}
    />
  )
}
