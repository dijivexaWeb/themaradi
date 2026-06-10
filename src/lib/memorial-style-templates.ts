export type Lang = 'tr' | 'en' | 'ka' | 'ru'

export type TemplateKey =
  | 'universal' | 'islamic' | 'christian' | 'orthodox'
  | 'catholic' | 'jewish' | 'buddhist_spiritual' | 'secular'
  | 'honor_gratitude' | 'child_angel' | 'custom'

export type ActionIcon =
  | 'flower' | 'heart' | 'candle' | 'prayer' | 'star'
  | 'stone' | 'flag' | 'angel' | 'light' | 'message' | 'silence'

export const ACTION_ICON_MAP: Record<ActionIcon, string> = {
  flower:  '🌹',
  heart:   '❤️',
  candle:  '🕯️',
  prayer:  '🤲',
  star:    '⭐',
  stone:   '🪨',
  flag:    '🏳️',
  angel:   '👼',
  light:   '✨',
  message: '💬',
  silence: '🙏',
}

export const ACTION_ICONS: ActionIcon[] = Object.keys(ACTION_ICON_MAP) as ActionIcon[]

export interface TemplateActionDef {
  icon: ActionIcon
  label: Record<Lang, string>
}

export interface MemorialStyleTemplate {
  key: TemplateKey
  emoji: string
  name: Record<Lang, string>
  description: Record<Lang, string>
  actions: TemplateActionDef[]
}

export const MEMORIAL_STYLE_TEMPLATES: MemorialStyleTemplate[] = [
  {
    key: 'universal',
    emoji: '🌿',
    name: { tr: 'Evrensel Anma', en: 'Universal Memorial', ka: 'უნივერსალური მოხსენება', ru: 'Универсальное поминовение' },
    description: {
      tr: 'Dini çağrışımı az, herkese uygun sade anma tarzı.',
      en: 'Simple, inclusive memorial style with minimal religious connotations.',
      ka: 'მარტივი, ყველასათვის შესაფერისი სამგლოვიარო სტილი.',
      ru: 'Простой, универсальный стиль поминовения с минимальным религиозным подтекстом.',
    },
    actions: [
      { icon: 'flower',  label: { tr: 'Çiçek bırak',        en: 'Leave a flower',   ka: 'ყვავილი დაამატე',   ru: 'Оставить цветок' } },
      { icon: 'heart',   label: { tr: 'Kalp bırak',         en: 'Leave a heart',    ka: 'გული დაამატე',      ru: 'Оставить сердце' } },
      { icon: 'silence', label: { tr: 'Sessizce andım',      en: 'Remembered in silence', ka: 'სიჩუმით ვიხსენე', ru: 'Вспомнил в тишине' } },
      { icon: 'message', label: { tr: 'Hatıra mesajı yaz',  en: 'Write a memory',   ka: 'მოგონება დაწერე',   ru: 'Написать воспоминание' } },
    ],
  },
  {
    key: 'christian',
    emoji: '✝️',
    name: { tr: 'Hristiyan Anma', en: 'Christian Memorial', ka: 'ქრისტიანული მოხსენება', ru: 'Христианское поминовение' },
    description: {
      tr: 'Mum, dua ve sevgiyle hatırlama odaklı anma tarzı.',
      en: 'Candle, prayer and loving remembrance style.',
      ka: 'სანთლის, ლოცვის და სიყვარულით გახსენების სტილი.',
      ru: 'Стиль со свечами, молитвой и любовным поминовением.',
    },
    actions: [
      { icon: 'candle',  label: { tr: 'Mum yak',           en: 'Light a candle',    ka: 'სანთელი დაანთე',    ru: 'Зажечь свечу' } },
      { icon: 'silence', label: { tr: 'Dua ettim',          en: 'Said a prayer',     ka: 'ვილოცე',            ru: 'Помолился' } },
      { icon: 'flower',  label: { tr: 'Çiçek bırak',        en: 'Leave a flower',    ka: 'ყვავილი დაამატე',   ru: 'Оставить цветок' } },
      { icon: 'star',    label: { tr: 'Huzur içinde uyu',   en: 'Rest in peace',     ka: 'მშვიდობით გეძინოს', ru: 'Покойся с миром' } },
    ],
  },
  {
    key: 'orthodox',
    emoji: '🕯️',
    name: { tr: 'Ortodoks Anma', en: 'Orthodox Memorial', ka: 'მართლმადიდებლური მოხსენება', ru: 'Православное поминовение' },
    description: {
      tr: 'Gürcistan ve Ortodoks kültürüne uygun mum ve dua odaklı anma tarzı.',
      en: 'Candle and prayer memorial aligned with Orthodox tradition.',
      ka: 'სანთლისა და ლოცვის სამგლოვიარო სტილი, ქართული მართლმადიდებლური ტრადიციის შესაბამისად.',
      ru: 'Православный стиль поминовения со свечами и молитвой.',
    },
    actions: [
      { icon: 'candle',  label: { tr: 'Mum yak',               en: 'Light a candle',       ka: 'სანთელი დაანთე',       ru: 'Зажечь свечу' } },
      { icon: 'silence', label: { tr: 'Dua ettim',              en: 'Said a prayer',        ka: 'ვილოცე',               ru: 'Помолился' } },
      { icon: 'star',    label: { tr: 'Anısını onurlandırdım',  en: 'Honored the memory',   ka: 'ხსოვნა პატივი ვეცი',   ru: 'Почтил память' } },
      { icon: 'flower',  label: { tr: 'Çiçek bırak',            en: 'Leave a flower',       ka: 'ყვავილი დაამატე',      ru: 'Оставить цветок' } },
    ],
  },
  {
    key: 'catholic',
    emoji: '🌹',
    name: { tr: 'Katolik Anma', en: 'Catholic Memorial', ka: 'კათოლიკური მოხსენება', ru: 'Католическое поминовение' },
    description: {
      tr: 'Avrupa ve Latin kültürlerine uygun dua ve mum odaklı anma tarzı.',
      en: 'Prayer and candle memorial suited to European and Latin cultures.',
      ka: 'ლოცვისა და სანთლის სამგლოვიარო სტილი, ევროპული და ლათინური კულტურისთვის.',
      ru: 'Молитвенный стиль поминовения со свечами для европейской и латинской культур.',
    },
    actions: [
      { icon: 'candle',  label: { tr: 'Mum yaktım',      en: 'Lit a candle',      ka: 'სანთელი დავანთე',   ru: 'Зажёг свечу' } },
      { icon: 'silence', label: { tr: 'Dua gönderdim',   en: 'Sent a prayer',     ka: 'ლოცვა გავუგზავნე', ru: 'Помолился' } },
      { icon: 'flower',  label: { tr: 'Çiçek bıraktım',  en: 'Left a flower',     ka: 'ყვავილი დავტოვე',   ru: 'Оставил цветок' } },
      { icon: 'heart',   label: { tr: 'Sevgiyle andım',  en: 'Remembered with love', ka: 'სიყვარულით ვიხსენე', ru: 'Вспомнил с любовью' } },
    ],
  },
  {
    key: 'islamic',
    emoji: '🤲',
    name: { tr: 'İslami Anma', en: 'Islamic Memorial', ka: 'ისლამური მოხსენება', ru: 'Исламское поминовение' },
    description: {
      tr: 'Dua, rahmet ve Fatiha odaklı anma tarzı.',
      en: 'Prayer and mercy-focused memorial style.',
      ka: 'ლოცვა- და მოწყალებაზე ორიენტირებული სამგლოვიარო სტილი.',
      ru: 'Стиль поминовения, ориентированный на молитву и милосердие.',
    },
    actions: [
      { icon: 'prayer',  label: { tr: 'Fatiha okudum',   en: 'Recited Al-Fatiha', ka: 'ფათიჰა წავიკითხე',  ru: 'Прочитал Аль-Фатиху' } },
      { icon: 'silence', label: { tr: 'Dua ettim',       en: 'Said a prayer',     ka: 'ვილოცე',           ru: 'Помолился' } },
      { icon: 'heart',   label: { tr: 'Rahmet diledim',  en: 'Prayed for mercy',  ka: 'მოწყალება ვითხოვე', ru: 'Помолился о милости' } },
      { icon: 'message', label: { tr: 'Taziye mesajı yaz', en: 'Write condolences', ka: 'თანაგრძნობა დაწერე', ru: 'Написать соболезнование' } },
    ],
  },
  {
    key: 'jewish',
    emoji: '✡️',
    name: { tr: 'Yahudi Anma', en: 'Jewish Memorial', ka: 'ებრაული მოხსენება', ru: 'Еврейское поминовение' },
    description: {
      tr: 'Anıyı onurlandırma ve taş bırakma sembolüyle uyumlu anma tarzı.',
      en: 'Memorial style aligned with honoring memory and the stone-leaving tradition.',
      ka: 'ხსოვნის პატივისცემის და ქვის დატოვების ტრადიციის სამგლოვიარო სტილი.',
      ru: 'Стиль поминовения, связанный с почитанием памяти и традицией оставления камня.',
    },
    actions: [
      { icon: 'star',    label: { tr: 'Anısını onurlandırdım', en: 'Honored the memory', ka: 'ხსოვნა პატივი ვეცი', ru: 'Почтил память' } },
      { icon: 'stone',   label: { tr: 'Taş bıraktım',          en: 'Left a stone',       ka: 'ქვა დავტოვე',      ru: 'Оставил камень' } },
      { icon: 'silence', label: { tr: 'Dua ettim',             en: 'Said a prayer',      ka: 'ვილოცე',           ru: 'Помолился' } },
      { icon: 'message', label: { tr: 'Hatıra yazdım',         en: 'Wrote a memory',     ka: 'მოგონება დავწერე', ru: 'Написал воспоминание' } },
    ],
  },
  {
    key: 'buddhist_spiritual',
    emoji: '✨',
    name: { tr: 'Budist / Spiritüel Anma', en: 'Buddhist / Spiritual Memorial', ka: 'ბუდისტური / სულიერი მოხსენება', ru: 'Буддийское / Духовное поминовение' },
    description: {
      tr: 'Huzur, ışık ve sessiz anma odaklı manevi tarz.',
      en: 'Spiritual style focused on peace, light and silent remembrance.',
      ka: 'სულიერი სტილი, ორიენტირებული სიმშვიდეზე, შუქზე და მდუმარე გახსენებაზე.',
      ru: 'Духовный стиль, сосредоточенный на покое, свете и тихом поминовении.',
    },
    actions: [
      { icon: 'light',   label: { tr: 'Işık gönderdim',   en: 'Sent light',         ka: 'სინათლე გავუგზავნე', ru: 'Послал свет' } },
      { icon: 'silence', label: { tr: 'Sessizce andım',   en: 'Remembered silently', ka: 'სიჩუმით ვიხსენე',   ru: 'Вспомнил в тишине' } },
      { icon: 'star',    label: { tr: 'Huzur diledim',    en: 'Wished peace',        ka: 'სიმშვიდე ვუსურვე',  ru: 'Пожелал мира' } },
      { icon: 'flower',  label: { tr: 'Çiçek bıraktım',  en: 'Left a flower',       ka: 'ყვავილი დავტოვე',   ru: 'Оставил цветок' } },
    ],
  },
  {
    key: 'secular',
    emoji: '💙',
    name: { tr: 'Seküler / İnançsız Anma', en: 'Secular Memorial', ka: 'სეკულარული მოხსენება', ru: 'Светское поминовение' },
    description: {
      tr: 'Dini ifade kullanmadan sevgi ve hatıra odaklı anma tarzı.',
      en: 'Love and memory-focused style without religious expressions.',
      ka: 'სიყვარულსა და მოგონებებზე ორიენტირებული სტილი, რელიგიური გამოხატვის გარეშე.',
      ru: 'Стиль, ориентированный на любовь и память, без религиозных выражений.',
    },
    actions: [
      { icon: 'star',    label: { tr: 'Anısını yaşattım', en: 'Kept memory alive',  ka: 'ხსოვნა ვაცოცხლე',   ru: 'Сохранил память' } },
      { icon: 'heart',   label: { tr: 'Kalp bıraktım',   en: 'Left a heart',       ka: 'გული დავტოვე',      ru: 'Оставил сердце' } },
      { icon: 'message', label: { tr: 'Hatıra yazdım',   en: 'Wrote a memory',     ka: 'მოგონება დავწერე',  ru: 'Написал воспоминание' } },
      { icon: 'silence', label: { tr: 'Sessizce andım',  en: 'Remembered silently', ka: 'სიჩუმით ვიხსენე',  ru: 'Вспомнил в тишине' } },
    ],
  },
  {
    key: 'honor_gratitude',
    emoji: '🏛️',
    name: { tr: 'Saygı ve Minnet Anması', en: 'Honor & Gratitude Memorial', ka: 'პატივისცემის მოხსენება', ru: 'Поминовение с почестями' },
    description: {
      tr: 'Şehit, asker, polis veya toplum için değerli kişiler için uygun tarz.',
      en: 'Style suited for veterans, public servants and community heroes.',
      ka: 'სტილი, რომელიც შესაფერისია ვეტერანებისთვის, სახელმწიფო მოხელეებისა და საზოგადოებრივი გმირებისთვის.',
      ru: 'Стиль, подходящий для ветеранов, государственных служащих и героев.',
    },
    actions: [
      { icon: 'silence', label: { tr: 'Saygıyla andım',       en: 'Honored with respect',  ka: 'პატივისცემით ვიხსენე',  ru: 'Почтил с уважением' } },
      { icon: 'flag',    label: { tr: 'Bayrak bıraktım',      en: 'Left a flag',           ka: 'დროშა დავტოვე',         ru: 'Оставил флаг' } },
      { icon: 'message', label: { tr: 'Minnet mesajı yazdım', en: 'Wrote a gratitude note', ka: 'მადლიერების წერილი',    ru: 'Написал слова благодарности' } },
      { icon: 'prayer',  label: { tr: 'Dua ettim',            en: 'Said a prayer',         ka: 'ვილოცე',                ru: 'Помолился' } },
    ],
  },
  {
    key: 'child_angel',
    emoji: '👼',
    name: { tr: 'Çocuk / Melek Anması', en: 'Child & Angel Memorial', ka: 'ბავშვის / ანგელოზის მოხსენება', ru: 'Поминовение ребёнка / Ангела' },
    description: {
      tr: 'Çocuk kayıpları için hassas, sevgi dolu ve yumuşak dil kullanılan tarz.',
      en: 'Gentle, loving style for the loss of a child.',
      ka: 'ნაზი, სავსე სიყვარულით სტილი ბავშვის დაკარგვისთვის.',
      ru: 'Нежный, любящий стиль для потери ребёнка.',
    },
    actions: [
      { icon: 'angel',   label: { tr: 'Melek kalp bıraktım',     en: 'Left an angel heart',    ka: 'ანგელოზის გული დავტოვე', ru: 'Оставил сердце ангела' } },
      { icon: 'heart',   label: { tr: 'Sevgi gönderdim',         en: 'Sent love',              ka: 'სიყვარული გავუგზავნე',   ru: 'Послал любовь' } },
      { icon: 'flower',  label: { tr: 'Çiçek bıraktım',          en: 'Left a flower',          ka: 'ყვავილი დავტოვე',        ru: 'Оставил цветок' } },
      { icon: 'message', label: { tr: 'Aileye destek mesajı yazdım', en: 'Wrote to the family', ka: 'ოჯახს შეტყობინება',      ru: 'Написал семье поддержку' } },
    ],
  },
  {
    key: 'custom',
    emoji: '⚙️',
    name: { tr: 'Özel Anma Tarzı', en: 'Custom Memorial Style', ka: 'მორგებული სტილი', ru: 'Особый стиль поминовения' },
    description: {
      tr: 'Kendi anma butonlarınızı tamamen sıfırdan oluşturun.',
      en: 'Create your own memorial buttons from scratch.',
      ka: 'შექმენით თქვენი საკუთარი სამგლოვიარო ღილაკები ნულიდან.',
      ru: 'Создайте собственные кнопки поминовения с нуля.',
    },
    actions: [],
  },
]
