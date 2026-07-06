'use client'

import { useActionState } from 'react'
import { sendBulkEmailAction, type BulkEmailSummary } from './actions'

const DEFAULT_SUBJECT = 'თანამშრომლობის შეთავაზება — QR კოდიანი მოგონების დაფა თქვენი მომხმარებლებისთვის'

const DEFAULT_BODY = `გამარჯობა,

ჩვენ ვართ The Eternal Memory — პლატფორმა, რომელიც ქმნის ციფრულ მოგონების გვერდებს გარდაცვლილთა ხსოვნისთვის, საფლავის ქვაზე დამონტაჟებული QR კოდის მეშვეობით ხელმისაწვდომს.

გვინდა შემოგთავაზოთ თანამშრომლობა: თქვენი მომხმარებლები, ვინც საფლავის ქვას ან ძეგლს გიკვეთენ, დამატებით შეძლებენ შეუკვეთონ ციფრული მოგონების გვერდი და QR კოდიანი დაფა — რომელიც შეიცავს ფოტოებს, ცხოვრების ისტორიას, ვიდეოსა და ხმოვან ჩანაწერებს.

რას გთავაზობთ:
✦ თქვენს მომხმარებლებს დამატებითი, თანამედროვე სერვისი — მეტი ღირებულება ერთი შეკვეთის ფარგლებში
✦ თითოეულ მოზიდულ მომხმარებელზე საკომისიო/პარტნიორული ანაზღაურება
✦ არანაირი დამატებითი ვალდებულება თქვენი მხრიდან — ჩვენ ვამზადებთ პროფილს, ვაწარმოებთ QR დაფას და ვაგზავნით პირდაპირ თქვენს მისამართზე
✦ თქვენი მომხმარებლისთვის მოწოდებული ინფორმაციის მასალები (ფლაერი/ბროშურა), რომ ადვილად აუხსნათ სერვისი

ეს არის მარტივი, დამატებით შემოსავლის შესაძლებლობა — რომელიც არ საჭიროებს თქვენი ბიზნეს-პროცესის შეცვლას.

გვსურს მოკლე საუბარი — გვითხარით, როდის იქნებით ხელმისაწვდომი 10-15 წუთიანი ზარისთვის, ან უბრალოდ დაგვიკავშირდით WhatsApp-ზე.

პატივისცემით,
The Eternal Memory გუნდი
📞 +995 555 511 884
✉️ info@theeternalmemory.com
🌐 theeternalmemory.com`

const initialState: BulkEmailSummary = {}

export default function BulkEmailForm({ disabled }: { disabled: boolean }) {
  const [state, formAction, isPending] = useActionState(sendBulkEmailAction, initialState)

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
          Alıcılar <span className="text-slate-400 font-normal">(her satıra bir e-posta, ya da virgülle ayırın)</span>
        </label>
        <textarea
          name="recipients"
          required
          rows={6}
          placeholder={'firma1@ornek.com\nfirma2@ornek.com\nfirma3@ornek.com'}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Konu</label>
        <input
          type="text"
          name="subject"
          required
          defaultValue={DEFAULT_SUBJECT}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">İçerik</label>
        <textarea
          name="body"
          required
          rows={16}
          defaultValue={DEFAULT_BODY}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />
        <p className="mt-1 text-xs text-slate-400">Düz metin olarak yazın — satır sonları otomatik olarak korunur.</p>
      </div>

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      {state.results && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">
            <span className="text-emerald-600">{state.sent} başarılı</span>
            {(state.failed ?? 0) > 0 && <span className="text-red-600 ml-2">{state.failed} başarısız</span>}
          </p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {state.results.map((r) => (
              <div key={r.email} className={`text-xs flex items-center gap-2 ${r.success ? 'text-emerald-700' : 'text-red-600'}`}>
                <span>{r.success ? '✓' : '✗'}</span>
                <span className="font-mono">{r.email}</span>
                {r.error && <span className="text-slate-400">— {r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || isPending}
        className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Gönderiliyor...' : 'Maili Gönder'}
      </button>
    </form>
  )
}
