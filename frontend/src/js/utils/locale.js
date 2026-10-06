const rules = new Intl.PluralRules('pl-PL');

export function count(value, one, few, many) {
  const forms = { one, few, many, other: many };
  return `${new Intl.NumberFormat('pl-PL').format(value)} ${forms[rules.select(value)]}`;
}
