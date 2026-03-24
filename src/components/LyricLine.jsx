import { forwardRef } from 'react';
import { toRomaji } from '../utils/toRomaji.js';
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
      <tr
        ref={ref}
        className={`lyric-row${active ? ' lyric-row--active' : ''}${hasLearn ? ' lyric-row--learnable' : ''}${learnOpen ? ' lyric-row--learn-open' : ''}`}
        onClick={hasLearn ? onToggleLearn : undefined}
      >
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
            <span className={`learn-indicator${learnOpen ? ' learn-indicator--open' : ''}`}>
              {learnOpen ? '▲' : '▼'}
            </span>
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
      <section className="learn-section learn-section--breakdown">
        <h4 className="learn-section__title">Breakdown</h4>
        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Word</th>
              <th>Reading</th>
              <th>Romaji</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {learn.breakdown.map((item, i) => (
              <tr key={i}>
                <td className="breakdown-table__word">{item.word}</td>
                <td className="breakdown-table__reading">{item.reading || '—'}</td>
                <td className="breakdown-table__romaji">{item.romaji || (item.reading ? toRomaji(item.reading) : '—')}</td>
                <td className="breakdown-table__meaning">{item.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="learn-section">
        <h4 className="learn-section__title">Grammar</h4>
        <p className="learn-grammar">{learn.grammar}</p>
      </section>

      <section className="learn-section">
        <h4 className="learn-section__title">Literal</h4>
        <p className="learn-literal">"{learn.literal}"</p>
      </section>

      {learn.example && (
        <section className="learn-section">
          <h4 className="learn-section__title">Example</h4>
          <div className="example-sentence">
            <div className="example-sentence__jp">{learn.example.jp}</div>
            <div className="example-sentence__romaji">{learn.example.romaji}</div>
            <div className="example-sentence__en">{learn.example.en}</div>
          </div>
        </section>
      )}
    </div>
  );
}

export default LyricLine;
