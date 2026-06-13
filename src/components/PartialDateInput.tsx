'use client'

import { useState } from 'react'
import { MONTHS_TR } from '@/lib/dateUtils'

interface Props {
  /** FormData field name. A companion "{name}_precision" hidden input is also emitted. */
  name: string
  /** Existing YYYY-MM-DD string (from DB) */
  defaultDate?: string | null
  /** Existing precision value ('year' | 'month' | 'day') */
  defaultPrecision?: string | null
  disabled?: boolean
  inputCls?: string
  selectCls?: string
  /** Called whenever the value changes (controlled usage — e.g. biyografi page). */
  onChange?: (date: string, precision: string) => void
}

export default function PartialDateInput({
  name,
  defaultDate,
  defaultPrecision,
  disabled = false,
  inputCls = '',
  selectCls = '',
  onChange,
}: Props) {
  function parseDefaults() {
    if (!defaultDate) return { y: '', m: '', d: '' }
    const parts = defaultDate.split('-').map(Number)
    const prec = defaultPrecision || 'day'
    return {
      y: parts[0] ? String(parts[0]) : '',
      m: prec !== 'year' && parts[1] ? String(parts[1]) : '',
      d: prec === 'day' && parts[2] ? String(parts[2]) : '',
    }
  }

  const init = parseDefaults()
  const [year, setYear] = useState(init.y)
  const [month, setMonth] = useState(init.m)
  const [day, setDay] = useState(init.d)

  const hasYear = Boolean(year && parseInt(year, 10) > 0)
  const hasMonth = hasYear && Boolean(month && parseInt(month, 10) > 0)
  const hasDay = hasMonth && Boolean(day && parseInt(day, 10) > 0)

  const composedDate = hasYear
    ? `${year.padStart(4, '0')}-${hasMonth ? month.padStart(2, '0') : '01'}-${hasDay ? day.padStart(2, '0') : '01'}`
    : ''
  const precision = hasYear ? (hasDay ? 'day' : hasMonth ? 'month' : 'year') : ''

  return (
    <div className="space-y-1.5">
      <input type="hidden" name={name} value={composedDate} />
      {composedDate && <input type="hidden" name={`${name}_precision`} value={precision} />}

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-semibold opacity-60">Yıl *</label>
          <input
            type="number"
            min={1800}
            max={2099}
            placeholder="örn. 1945"
            value={year}
            disabled={disabled}
            onChange={e => {
              const newYear = e.target.value
              const newMonth = newYear ? month : ''
              const newDay = newYear ? day : ''
              setYear(newYear)
              if (!newYear) { setMonth(''); setDay('') }
              const hy = Boolean(newYear && parseInt(newYear, 10) > 0)
              const hm = hy && Boolean(newMonth && parseInt(newMonth, 10) > 0)
              const hd = hm && Boolean(newDay && parseInt(newDay, 10) > 0)
              const cd = hy ? `${newYear.padStart(4,'0')}-${hm ? newMonth.padStart(2,'0') : '01'}-${hd ? newDay.padStart(2,'0') : '01'}` : ''
              const prec = hy ? (hd ? 'day' : hm ? 'month' : 'year') : ''
              onChange?.(cd, prec)
            }}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold opacity-60">Ay</label>
          <select
            value={month}
            disabled={disabled || !hasYear}
            onChange={e => {
              const newMonth = e.target.value
              const newDay = newMonth ? day : ''
              setMonth(newMonth)
              if (!newMonth) setDay('')
              const hm = Boolean(newMonth && parseInt(newMonth, 10) > 0)
              const hd = hm && Boolean(newDay && parseInt(newDay, 10) > 0)
              const cd = year ? `${year.padStart(4,'0')}-${hm ? newMonth.padStart(2,'0') : '01'}-${hd ? newDay.padStart(2,'0') : '01'}` : ''
              const prec = year ? (hd ? 'day' : hm ? 'month' : 'year') : ''
              onChange?.(cd, prec)
            }}
            className={selectCls || inputCls}
          >
            <option value="">— bilinmiyor</option>
            {MONTHS_TR.map((label, i) => (
              <option key={i + 1} value={String(i + 1)}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold opacity-60">Gün</label>
          <input
            type="number"
            min={1}
            max={31}
            placeholder="—"
            value={day}
            disabled={disabled || !hasMonth}
            onChange={e => {
              const newDay = e.target.value
              setDay(newDay)
              const hd = Boolean(newDay && parseInt(newDay, 10) > 0)
              const cd = year ? `${year.padStart(4,'0')}-${month.padStart(2,'0')}-${hd ? newDay.padStart(2,'0') : '01'}` : ''
              const prec = year ? (hd ? 'day' : 'month') : ''
              onChange?.(cd, prec)
            }}
            className={inputCls}
          />
        </div>
      </div>

      {composedDate && (
        <p className="text-[10px] opacity-40">
          Kaydedilecek:{' '}
          {precision === 'year' && year}
          {precision === 'month' && `${MONTHS_TR[parseInt(month, 10) - 1]} ${year}`}
          {precision === 'day' && `${day} ${MONTHS_TR[parseInt(month, 10) - 1]} ${year}`}
        </p>
      )}
    </div>
  )
}
