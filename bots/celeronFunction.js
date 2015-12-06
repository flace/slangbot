module.exports = text => {
  let array = text.split(' ');
  let newText = '';

  for (let i = 0; array.length > i; i++) {
    newText += translate(array[i]) + ' ';
  }

  function translate(word) {
    const prLetters = ['б', 'в', 'г', 'ґ', 'д', 'ж', 'з', 'й', 'к', 'л', 'м', 'н', 'п', 'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ'];
    const goLetters = ['ї', 'є', 'і', 'а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];

    let pryg = l => prLetters.indexOf(l.toLowerCase()) !== -1;
    let gol = l => goLetters.indexOf(l.toLowerCase()) !== -1;

    if (word.length === 1) {
      return word;
    }

    word = word.split('');

    let first = word[0];
    let second = word[1];
    let third = word[2];
    let fourth = word[3];

    function join(w) {
      if (first && first === first.toUpperCase()) {
        w[0] = w[0].toUpperCase();
      }
      return w.join('');
    }

    if (first && second) {
      if (pryg(first) && pryg(second)) {
        word[1] = first.toLowerCase();
        word[0] = second.toLowerCase();
        return join(word);
      }
      if (word.length === 2) {
        if ((pryg(first) || gol(first)) && (pryg(second) || gol(second))) {
          word[1] = first.toLowerCase();
          word[0] = second.toLowerCase();
          return join(word);
        }
      }
    }

    if (first && third) {
      if (pryg(first) && pryg(third)) {
        word[2] = first.toLowerCase();
        word[0] = third.toLowerCase();
        return join(word);
      }
    }

    if (second && third) {
      if (pryg(second) && pryg(third)) {
        word[2] = second.toLowerCase();
        word[1] = third.toLowerCase();
        return join(word);
      }
    }

    if (second && fourth) {
      if (pryg(second) && pryg(fourth)) {
        word[3] = second.toLowerCase();
        word[1] = fourth.toLowerCase();
        return join(word);
      }
    }

    return join(word);
  }

  return newText;
};
