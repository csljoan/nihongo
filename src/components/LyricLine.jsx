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

const LyricLine = forwardRef(function LyricLine(
  { line, vocab, active, onWordClick, learnOpen, onToggleLearn },
  ref
) {
  const tokens = tokenize(line.jp, vocab);
  const hasLearn = !!line.learn;

  function handleWordClick(e, v) {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    onWordClick(v, { x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY });
  }

  return (
    <>
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
        <td className="lyric-cell lyric-cell--learn-btn">
          {hasLearn && (
            <button
              className={`learn-toggle${learnOpen ? ' learn-toggle--open' : ''}`}
              onClick={onToggleLearn}
              title="Learn this line"
            >
              🎓
            </button>
          )}
        </td>
      </tr>
      {hasLearn && learnOpen && (
        <tr className="learn-row">
          <td colSpan={4} className="learn-cell">
            <LearnPanel learn={line.learn} />
          </td>
        </tr>
      )}
    </>
  );
});

function LearnPanel({ learn }) {
  return (
    <div className="learn-panel">
      <section className="learn-section">
        <h4 className="learn-section__title">Word Breakdown</h4>
        <div className="breakdown-list">
          {learn.breakdown.map((item, i) => (
            <div key={i} className="breakdown-item">
              <span className="breakdown-word">{item.word}</span>
              {item.reading && (
                <span className="breakdown-reading">（{item.reading}）</span>
              )}
              <span className="breakdown-eq">=</span>
              <span className="breakdown-meaning">{item.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="learn-section">
        <h4 className="learn-section__title">Grammar Note</h4>
        <p className="learn-grammar">{learn.grammar}</p>
      </section>

      <section className="learn-section">
        <h4 className="learn-section__title">Natural vs Literal</h4>
        <div className="translation-compare">
          <div className="translation-compare__col">
            <div className="translation-compare__label">Literal</div>
            <div className="translation-compare__text translation-compare__text--literal">
              "{learn.literal}"
            </div>
          </div>
          <div className="translation-compare__arrow">→</div>
          <div className="translation-compare__col">
            <div className="translation-compare__label">Natural</div>
            <div className="translation-compare__text translation-compare__text--natural">
              "{learn.example ? learn.example.en : ''}"
            </div>
          </div>
        </div>
      </section>

      <section className="learn-section">
        <h4 className="learn-section__title">Example Sentence</h4>
        <div className="example-sentence">
          <div className="example-sentence__jp">{learn.example.jp}</div>
          <div className="example-sentence__romaji">{learn.example.romaji}</div>
          <div className="example-sentence__en">{learn.example.en}</div>
        </div>
      </section>
    </div>
  );
}

export default LyricLine;
