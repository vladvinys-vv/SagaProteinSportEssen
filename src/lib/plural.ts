/**
 * Русские склонения для счётчиков в интерфейсе: 1 запись, 2 записи, 72 записи,
 * 5 записей. Формы передаются в порядке «одна / две / много».
 */
export const pluralWord = (count: number, one: string, few: string, many: string): string => {
  const abs = Math.abs(Math.trunc(count)) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
};

/** Число вместе со словом: 2 записи, 7 записей. */
export const plural = (count: number, one: string, few: string, many: string): string =>
  `${count} ${pluralWord(count, one, few, many)}`;

/**
 * Дробные значения в русском идут в родительном падеже единственного числа:
 * 1,6 дозы, 2,5 дня. Для целых работает обычное склонение.
 */
export const pluralDecimal = (value: number, one: string, few: string, many: string, fraction: string): string => {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
  return `${text} ${Number.isInteger(value) ? pluralWord(value, one, few, many) : fraction}`;
};
