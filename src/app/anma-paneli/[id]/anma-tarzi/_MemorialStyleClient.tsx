'use client'

import { useState, useTransition } from 'react'
import { useLang } from '@/i18n/context'
import {
  MEMORIAL_STYLE_TEMPLATES,
  ACTION_ICON_MAP,
  ACTION_ICONS,
  type TemplateKey,
  type ActionIcon,
} from '@/lib/memorial-style-templates'
import { saveMemorialStyleAction, type MemorialActionInput } from '../actions'

type Lang = 'tr' | 'en' | 'ka' | 'ru'

const copy: Record<Lang, {
  title: string
  subtitle: string
  templateSectionTitle: string
  templateHint: string
  useTemplate: string
  selected: string
  deselect: string
  maxReached: string
  appendConfirm: string
  replaceConfirm: string
  editSectionTitle: string
  editSectionDesc: string
  colActive: string
  colLabel: string
  colIcon: string
  colCounter: string
  addTitle: string
  addPlaceholder: string
  addBtn: string
  saveBtn: string
  saving: string
  saved: string
  noActions: string
}> = {
  tr: {
    title: 'Anma Tarzı',
    subtitle: 'Ziyaretçilerin bu anma sayfasında nasıl anma yapabileceğini seçin. En fazla 2 şablon seçebilir veya kendi özel butonlarınızı oluşturabilirsiniz.',
    templateSectionTitle: 'Şablon Seçin',
    templateHint: 'En fazla 2 şablon seçilebilir. İkinci şablon seçilince butonları mevcut listeye eklenir.',
    useTemplate: 'Seç',
    selected: '✓ Seçili',
    deselect: 'Kaldır',
    maxReached: 'En fazla 2 şablon seçilebilir. Birini kaldırın.',
    appendConfirm: 'Bu şablonun butonları mevcut listeye eklenecek. Devam?',
    replaceConfirm: 'Mevcut butonlar bu şablonun butonlarıyla değiştirilecek. Devam?',
    editSectionTitle: 'Anma Butonlarını Düzenle',
    editSectionDesc: 'Aktif butonlar public sayfada görünür. Metni düzenleyebilir, kapatabilir veya silebilirsiniz.',
    colActive: 'Aktif',
    colLabel: 'Buton Metni',
    colIcon: 'İkon',
    colCounter: 'Sayaç',
    addTitle: 'Yeni Anma Butonu Ekle',
    addPlaceholder: 'Buton metni (örn: Çiçek bıraktım)',
    addBtn: '+ Ekle',
    saveBtn: 'Kaydet',
    saving: 'Kaydediliyor...',
    saved: 'Kaydedildi ✓',
    noActions: 'Henüz hiç buton eklenmedi. Bir şablon seçin veya manuel ekleyin.',
  },
  en: {
    title: 'Memorial Style',
    subtitle: 'Choose how visitors pay their respects. Select up to 2 templates or create custom buttons.',
    templateSectionTitle: 'Choose Templates',
    templateHint: 'Up to 2 templates can be selected. The second template\'s buttons are added to the list.',
    useTemplate: 'Select',
    selected: '✓ Selected',
    deselect: 'Remove',
    maxReached: 'Maximum 2 templates allowed. Remove one first.',
    appendConfirm: 'This template\'s buttons will be added to the current list. Continue?',
    replaceConfirm: 'Current buttons will be replaced by this template. Continue?',
    editSectionTitle: 'Edit Memorial Buttons',
    editSectionDesc: 'Active buttons appear on the public page.',
    colActive: 'Active',
    colLabel: 'Button Label',
    colIcon: 'Icon',
    colCounter: 'Counter',
    addTitle: 'Add New Button',
    addPlaceholder: 'Button text (e.g. Left a flower)',
    addBtn: '+ Add',
    saveBtn: 'Save',
    saving: 'Saving...',
    saved: 'Saved ✓',
    noActions: 'No buttons yet. Choose a template or add manually.',
  },
  ka: {
    title: 'მოხსენების სტილი',
    subtitle: 'აირჩიეთ, როგორ შეძლებენ ვიზიტორები პატივი სცენ ამ გვერდზე. შეგიძლიათ 2 შაბლონამდე.',
    templateSectionTitle: 'შაბლონის არჩევა',
    templateHint: 'მაქსიმუმ 2 შაბლონი. მეორე შაბლონი ემატება სიას.',
    useTemplate: 'არჩევა',
    selected: '✓ არჩეული',
    deselect: 'მოხსნა',
    maxReached: 'მაქსიმუმ 2 შაბლონი. ერთი გადაიტანეთ.',
    appendConfirm: 'ეს შაბლონი ემატება არსებულ სიას. გაგრძელება?',
    replaceConfirm: 'არსებული ღილაკები შეიცვლება. გაგრძელება?',
    editSectionTitle: 'ღილაკების რედაქტირება',
    editSectionDesc: 'აქტიური ღილაკები ნაჩვენებია საჯარო გვერდზე.',
    colActive: 'აქტიური',
    colLabel: 'ტექსტი',
    colIcon: 'ხატულა',
    colCounter: 'მრიცხველი',
    addTitle: 'ახალი ღილაკის დამატება',
    addPlaceholder: 'ღილაკის ტექსტი',
    addBtn: '+ დამატება',
    saveBtn: 'შენახვა',
    saving: 'ინახება...',
    saved: 'შენახულია ✓',
    noActions: 'ჯერ ღილაკები არ არის.',
  },
  ru: {
    title: 'Стиль поминовения',
    subtitle: 'Выберите, как посетители смогут отдать дань уважения. Можно выбрать до 2 шаблонов.',
    templateSectionTitle: 'Выбор шаблона',
    templateHint: 'Максимум 2 шаблона. Кнопки второго шаблона добавляются к списку.',
    useTemplate: 'Выбрать',
    selected: '✓ Выбран',
    deselect: 'Убрать',
    maxReached: 'Максимум 2 шаблона. Сначала уберите один.',
    appendConfirm: 'Кнопки этого шаблона будут добавлены к текущему списку. Продолжить?',
    replaceConfirm: 'Существующие кнопки будут заменены. Продолжить?',
    editSectionTitle: 'Редактировать кнопки',
    editSectionDesc: 'Активные кнопки отображаются на публичной странице.',
    colActive: 'Активна',
    colLabel: 'Текст кнопки',
    colIcon: 'Иконка',
    colCounter: 'Счётчик',
    addTitle: 'Добавить кнопку',
    addPlaceholder: 'Текст кнопки (напр. Оставил цветок)',
    addBtn: '+ Добавить',
    saveBtn: 'Сохранить',
    saving: 'Сохранение...',
    saved: 'Сохранено ✓',
    noActions: 'Кнопок пока нет.',
  },
}

interface ActionRow extends MemorialActionInput {
  _localId: string
}

interface Props {
  vaultId: string
  initialTemplateKey: string | null
  initialActions: Array<{
    id: string
    label: string
    icon: string
    is_active: boolean
    show_counter: boolean
    count: number
    sort_order: number
  }>
}

let _localIdCounter = 0
function newLocalId() { return `local_${++_localIdCounter}` }

function parseKeys(raw: string | null): TemplateKey[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as TemplateKey[]
  } catch { /* not JSON */ }
  // fallback: single key or comma-separated
  return raw.split(',').filter(Boolean) as TemplateKey[]
}

export default function MemorialStyleClient({ vaultId, initialTemplateKey, initialActions }: Props) {
  const { lang } = useLang()
  const c = copy[lang as Lang] ?? copy.tr
  const [isPending, startTransition] = useTransition()
  const [savedOk, setSavedOk] = useState(false)
  const [maxAlert, setMaxAlert] = useState(false)

  const [selectedKeys, setSelectedKeys] = useState<TemplateKey[]>(parseKeys(initialTemplateKey))
  const [actions, setActions] = useState<ActionRow[]>(
    initialActions.map(a => ({ _localId: a.id, id: a.id, label: a.label, icon: a.icon, is_active: a.is_active, show_counter: a.show_counter, sort_order: a.sort_order }))
  )

  const [newLabel, setNewLabel] = useState('')
  const [newIcon, setNewIcon] = useState<ActionIcon>('flower')
  const [newCounter, setNewCounter] = useState(true)

  function handleTemplateClick(key: TemplateKey) {
    setMaxAlert(false)
    const isSelected = selectedKeys.includes(key)

    if (isSelected) {
      // Deselect — sadece seçimi kaldır, butonlara dokunma
      setSelectedKeys(prev => prev.filter(k => k !== key))
      setSavedOk(false)
      return
    }

    if (selectedKeys.length >= 2) {
      setMaxAlert(true)
      return
    }

    const template = MEMORIAL_STYLE_TEMPLATES.find(t => t.key === key)
    if (!template) return

    const newRows = template.actions.map((a, i) => ({
      _localId: newLocalId(),
      id: null,
      label: a.label[lang as Lang] ?? a.label.tr,
      icon: a.icon,
      is_active: true,
      show_counter: true,
      sort_order: actions.length + i,
    }))

    if (selectedKeys.length === 0) {
      // İlk şablon — mevcut varsa onayla, sonra değiştir
      if (actions.length > 0) {
        if (!window.confirm(c.replaceConfirm)) return
        setActions(newRows.map((r, i) => ({ ...r, sort_order: i })))
      } else {
        setActions(newRows)
      }
    } else {
      // İkinci şablon — listeye ekle
      if (!window.confirm(c.appendConfirm)) return
      setActions(prev => [...prev, ...newRows])
    }

    setSelectedKeys(prev => [...prev, key])
    setSavedOk(false)
  }

  function updateAction(localId: string, patch: Partial<ActionRow>) {
    setActions(prev => prev.map(a => a._localId === localId ? { ...a, ...patch } : a))
    setSavedOk(false)
  }

  function removeAction(localId: string) {
    setActions(prev => prev.filter(a => a._localId !== localId))
    setSavedOk(false)
  }

  function addNewAction() {
    if (!newLabel.trim()) return
    setActions(prev => [
      ...prev,
      { _localId: newLocalId(), id: null, label: newLabel.trim(), icon: newIcon, is_active: true, show_counter: newCounter, sort_order: prev.length },
    ])
    setNewLabel('')
    setNewIcon('flower')
    setNewCounter(true)
    setSavedOk(false)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveMemorialStyleAction(
        vaultId,
        JSON.stringify(selectedKeys.length ? selectedKeys : ['custom']),
        actions.map((a, i) => ({ id: a.id, label: a.label, icon: a.icon, is_active: a.is_active, show_counter: a.show_counter, sort_order: i }))
      )
      if (result.success) setSavedOk(true)
    })
  }

  return (
    <div className="min-h-screen bg-[#fbf8f0] px-4 py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-3xl">

        {/* Başlık */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl text-[#173d31]">{c.title}</h1>
          <p className="mt-2 text-sm text-[#69766f] leading-relaxed">{c.subtitle}</p>
        </div>

        {/* Şablon Seçimi */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#adb5ab]">
              {c.templateSectionTitle}
            </h2>
            <span className={`text-xs font-semibold rounded-full px-3 py-1 ${
              selectedKeys.length === 2 ? 'bg-[#174f35] text-white' : 'bg-[#f0ebe0] text-[#69766f]'
            }`}>
              {selectedKeys.length}/2
            </span>
          </div>
          <p className="mb-4 text-xs text-[#adb5ab]">{c.templateHint}</p>

          {maxAlert && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {c.maxReached}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {MEMORIAL_STYLE_TEMPLATES.map(tmpl => {
              const isSelected = selectedKeys.includes(tmpl.key)
              const isDisabled = !isSelected && selectedKeys.length >= 2
              return (
                <div
                  key={tmpl.key}
                  className={`rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-[#174f35] bg-[#edf5f0] shadow-sm'
                      : isDisabled
                        ? 'border-[#e5dccb] bg-[#f9f7f2] opacity-50'
                        : 'border-[#e5dccb] bg-white hover:border-[#b5cec0]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{tmpl.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-sm text-[#173d31]">
                        {tmpl.name[lang as Lang] ?? tmpl.name.tr}
                      </span>
                      <p className="mt-0.5 text-xs text-[#8a9e96] leading-relaxed">
                        {tmpl.description[lang as Lang] ?? tmpl.description.tr}
                      </p>
                      {tmpl.actions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tmpl.actions.map((a, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[#f5efdf] px-2 py-0.5 text-[10px] text-[#5a6e66]">
                              {ACTION_ICON_MAP[a.icon]} {a.label[lang as Lang] ?? a.label.tr}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleTemplateClick(tmpl.key)}
                    disabled={isDisabled}
                    className={`mt-3 w-full rounded-xl py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-[#174f35] text-white hover:bg-[#cc3b2e]'
                        : 'bg-[#f5efdf] text-[#174f35] hover:bg-[#ead4a5]'
                    }`}
                  >
                    {isSelected ? `${c.selected} — ${c.deselect}` : c.useTemplate}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Buton Düzenleyici */}
        <section className="mb-8 rounded-2xl border border-[#e5dccb] bg-white p-6">
          <div className="mb-4">
            <h2 className="font-semibold text-[#173d31]">{c.editSectionTitle}</h2>
            <p className="mt-0.5 text-xs text-[#8a9e96]">{c.editSectionDesc}</p>
          </div>

          {actions.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#adb5ab]">{c.noActions}</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr_110px_48px_48px_28px] items-center gap-2 border-b border-[#f0ebe0] pb-2 text-[10px] font-bold uppercase tracking-widest text-[#adb5ab]">
                <span>{c.colActive}</span>
                <span>{c.colLabel}</span>
                <span>{c.colIcon}</span>
                <span className="text-center">{c.colCounter}</span>
                <span />
                <span />
              </div>

              {actions.map(row => (
                <div key={row._localId} className="grid grid-cols-[auto_1fr_110px_48px_48px_28px] items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateAction(row._localId, { is_active: !row.is_active })}
                    className={`h-5 w-9 rounded-full transition-colors ${row.is_active ? 'bg-[#174f35]' : 'bg-[#dde3dc]'}`}
                  >
                    <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${row.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>

                  <input
                    value={row.label}
                    onChange={e => updateAction(row._localId, { label: e.target.value })}
                    className="rounded-lg border border-[#e5dccb] bg-[#fdfaf5] px-3 py-1.5 text-sm text-[#173d31] focus:border-[#174f35] focus:outline-none"
                  />

                  <select
                    value={row.icon}
                    onChange={e => updateAction(row._localId, { icon: e.target.value })}
                    className="rounded-lg border border-[#e5dccb] bg-[#fdfaf5] px-2 py-1.5 text-sm text-[#173d31] focus:border-[#174f35] focus:outline-none"
                  >
                    {ACTION_ICONS.map(ic => (
                      <option key={ic} value={ic}>{ACTION_ICON_MAP[ic]} {ic}</option>
                    ))}
                  </select>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => updateAction(row._localId, { show_counter: !row.show_counter })}
                      className={`h-5 w-9 rounded-full transition-colors ${row.show_counter ? 'bg-[#174f35]' : 'bg-[#dde3dc]'}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${row.show_counter ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div />
                  <button
                    type="button"
                    onClick={() => removeAction(row._localId)}
                    className="text-[#c0a99a] hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-[#f0ebe0] pt-5">
            <p className="mb-3 text-xs font-semibold text-[#69766f]">{c.addTitle}</p>
            <div className="flex flex-wrap items-end gap-2">
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNewAction()}
                placeholder={c.addPlaceholder}
                className="flex-1 min-w-[180px] rounded-xl border border-[#e5dccb] bg-[#fdfaf5] px-3 py-2 text-sm text-[#173d31] focus:border-[#174f35] focus:outline-none"
              />
              <select
                value={newIcon}
                onChange={e => setNewIcon(e.target.value as ActionIcon)}
                className="rounded-xl border border-[#e5dccb] bg-[#fdfaf5] px-3 py-2 text-sm text-[#173d31] focus:border-[#174f35] focus:outline-none"
              >
                {ACTION_ICONS.map(ic => (
                  <option key={ic} value={ic}>{ACTION_ICON_MAP[ic]} {ic}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs text-[#69766f] select-none cursor-pointer">
                <input type="checkbox" checked={newCounter} onChange={e => setNewCounter(e.target.checked)} className="accent-[#174f35]" />
                Sayaç
              </label>
              <button
                type="button"
                onClick={addNewAction}
                disabled={!newLabel.trim()}
                className="rounded-xl bg-[#174f35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1a6040] disabled:opacity-40"
              >
                {c.addBtn}
              </button>
            </div>
          </div>
        </section>

        {/* Kaydet */}
        <div className="flex items-center justify-end gap-4">
          {savedOk && <span className="text-sm font-medium text-[#174f35]">{c.saved}</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-2xl bg-[#174f35] px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1a6040] disabled:opacity-50"
          >
            {isPending ? c.saving : c.saveBtn}
          </button>
        </div>

      </div>
    </div>
  )
}
