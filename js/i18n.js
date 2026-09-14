// All player-facing strings, EN + KM. {x} placeholders filled via fmt().

export const STRINGS = {
  app_title:   { en: 'Play & Learn', km: 'លេង និង រៀន' },
  hub_welcome: { en: 'What do you want to play?', km: 'តើចង់លេងអ្វី?' },
  great_job:   { en: 'Great job!', km: 'ល្អណាស់!' },
  great_job_2: { en: 'Wonderful!', km: 'អស្ចារ្យ!' },
  great_job_3: { en: 'You are so clever!', km: 'ពូកែណាស់!' },
  try_again:   { en: 'Try again!', km: 'សាកម្តងទៀត!' },
  all_done:    { en: 'You did it! Amazing!', km: 'អ្នកធ្វើបានហើយ! អស្ចារ្យណាស់!' },
  go:          { en: 'Go!', km: 'ទៅ!' },
  watch_me:    { en: 'Watch me!', km: 'មើលខ្ញុំ!' },

  maze_title:  { en: 'Bunny Maze', km: 'ទន្សាយវង្វេង' },
  maze_intro:  { en: 'Help the bunny get the carrot!', km: 'ជួយទន្សាយយកការ៉ុត!' },
  maze_blocked:{ en: 'Oops! Bump!', km: 'អូ! ទង្គិចហើយ!' },
  maze_short:  { en: 'Almost! Add more arrows!', km: 'ជិតដល់ហើយ! បន្ថែមព្រួញទៀត!' },

  count_title: { en: 'Counting', km: 'រាប់លេខ' },
  count_intro: { en: 'Tap and count!', km: 'ចុចហើយរាប់!' },
  how_many:    { en: 'How many?', km: 'មានប៉ុន្មាន?' },

  colors_title:{ en: 'Colors & Shapes', km: 'ពណ៌ និង រាង' },
  find_it:     { en: 'Find the {color} {shape}!', km: 'រក{shape}ពណ៌{color}!' },

  letters_title:{ en: 'Letters ABC', km: 'អក្សរ ABC' },
  tap_letter:  { en: 'Tap the letter {letter}!', km: 'ចុចអក្សរ {letter}!' },

  color_red:    { en: 'red', km: 'ក្រហម' },
  color_blue:   { en: 'blue', km: 'ខៀវ' },
  color_green:  { en: 'green', km: 'បៃតង' },
  color_yellow: { en: 'yellow', km: 'លឿង' },
  color_purple: { en: 'purple', km: 'ស្វាយ' },
  color_orange: { en: 'orange', km: 'ទឹកក្រូច' },

  shape_circle:   { en: 'circle', km: 'រង្វង់' },
  shape_square:   { en: 'square', km: 'ការ៉េ' },
  shape_triangle: { en: 'triangle', km: 'ត្រីកោណ' },
  shape_star:     { en: 'star', km: 'ផ្កាយ' },

  num_1: { en: 'one', km: 'មួយ' },   num_2: { en: 'two', km: 'ពីរ' },
  num_3: { en: 'three', km: 'បី' },  num_4: { en: 'four', km: 'បួន' },
  num_5: { en: 'five', km: 'ប្រាំ' }, num_6: { en: 'six', km: 'ប្រាំមួយ' },
  num_7: { en: 'seven', km: 'ប្រាំពីរ' }, num_8: { en: 'eight', km: 'ប្រាំបី' },
  num_9: { en: 'nine', km: 'ប្រាំបួន' },  num_10: { en: 'ten', km: 'ដប់' },
};

let lang = localStorage.getItem('pal-lang') || 'en';

export function getLang() { return lang; }

export function setLang(l) {
  lang = l;
  localStorage.setItem('pal-lang', l);
}

export function t(key, vars = {}) {
  const entry = STRINGS[key];
  if (!entry) return key;
  let s = entry[lang] || entry.en;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

// English text for the same key — used as the spoken fallback when the
// Khmer clip for this key doesn't exist yet.
export function tEn(key, vars = {}) {
  const entry = STRINGS[key];
  if (!entry) return key;
  let s = entry.en;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
