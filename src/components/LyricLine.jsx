import { forwardRef } from 'react';
import './LyricLine.css';

function tokenize(jpText, vocab) {
  const result = [];
  let i = 0;
  const sorted = [...vocab].sort((a, b) => b.word.length - a.word.length);

  while (i < jpText.length) {
    let matched = false;
    for (const v of sorted) {
      if (jpText.startsWith(v.word, i)) {
        result.push({ text: v.word, vocab: v });
        i += v.word.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (result.length && !result[result.length - 1].vocab) {
        result[result.length - 1].text += jpText[i];
      } else {
        result.push({ text: jpText[i], vocab: null });
      }
      i++;
    }
  }
  return result;
}

const LyricLine = forwardRef(function LyricLine({ line, vocab, active, onWordClick }, ref) {
  const tokens = tokenize(line.jp, vocab);

  function handleWordClick(e, v) {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    onWordClick(v, { x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY });
  }

  return (
    <tr ref={ref} className={`lyric-row${active ? ' lyric-row--active' : ''}`}>
      <td className="lyric-cell lyric-cell--jp">
        {tokens.map((tok, i) =>
          tok.vocab ? (
            <span key={i} className="lyric-word" onClick={(e) => handleWordClick(e, tok.vocab)}>
              {tok.text}
            </span>
          ) : (
            <span key={i}>{tok.text}</span>
          )
        )}
      </td>
      <td className="lyric-cell lyric-cell--romaji">{line.romaji}</td>
      <td className="lyric-cell lyric-cell--en">{line.en}</td>
    </tr>
  );
});

export default LyricLine;
