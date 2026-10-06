export function validationMessage(input) {
  const validity = input.validity;
  if (validity.valueMissing) return 'Uzupełnij to pole.';
  if (validity.typeMismatch)
    return input.type === 'email' ? 'Podaj poprawny adres e-mail.' : 'Podaj poprawną wartość.';
  if (validity.badInput) return 'Podaj poprawną liczbę.';
  if (validity.tooShort) return `Wpisz co najmniej ${input.minLength} znaków.`;
  if (validity.tooLong) return `Wpisz nie więcej niż ${input.maxLength} znaków.`;
  if (validity.rangeUnderflow) return `Minimalna wartość to ${input.min}.`;
  if (validity.rangeOverflow) return `Maksymalna wartość to ${input.max}.`;
  if (validity.stepMismatch) return 'Podaj wartość zgodną z krokiem tego pola.';
  if (validity.patternMismatch) return 'Sprawdź format wpisanej wartości.';
  return '';
}

export function mountPolishValidation() {
  document.addEventListener(
    'invalid',
    (event) => {
      const input = event.target;
      if (typeof input.setCustomValidity !== 'function') return;
      input.setCustomValidity('');
      input.setCustomValidity(validationMessage(input));
    },
    true,
  );
  for (const eventName of ['input', 'change']) {
    document.addEventListener(eventName, (event) => {
      event.target.setCustomValidity?.('');
    });
  }
}
