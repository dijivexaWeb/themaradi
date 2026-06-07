import LegalPage from '@/components/legal/LegalPage'

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="This page explains how themaradi handles user data while providing digital vault, memorial page and QR redirect services."
      sections={[
        {
          title: 'Data we collect',
          body: [
            'We collect account information such as email address, authentication provider data and basic profile details.',
            'Users may upload vault content such as biography text, photos, audio, video, documents and trusted person information.',
          ],
        },
        {
          title: 'How we use data',
          body: [
            'Data is used to provide account access, vault management, memorial pages, QR routing, moderation and support.',
            'Public memorial content is shown only when the vault status and user settings allow public access.',
          ],
        },
        {
          title: 'Security',
          body: [
            'Access to dashboard routes requires authentication. Database access is separated through Supabase Row Level Security policies.',
            'Future premium encryption features may add client-side encryption for selected sensitive content.',
          ],
        },
        {
          title: 'Contact',
          body: ['For privacy requests, contact privacy@themaradi.com.'],
        },
      ]}
    />
  )
}
