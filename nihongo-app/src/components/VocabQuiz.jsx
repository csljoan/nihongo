import { useState, useMemo } from 'react';
import './VocabQuiz.css';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(vocab, count = 5) {
  const pool = shuffle(vocab).slice(0, count);
  return pool.map((item) => {
    const distractors = shuffle(vocab.filter((v) => v.word !== item.word)).slice(0, 3);
    const choices = shuffle([item, ...distractors]);
    return { item, choices };
  });
}

export default function VocabQuiz({ vocab, onClose }) {
  const questions = useMemo(() => buildQuestions(vocab), [vocab]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  function handleChoice(choice) {
    if (selected) return;
    setSelected(choice);
    if (choice.word === q.item.word) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  function handleReplay() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-score-title">Quiz Complete!</div>
          <div className="quiz-score">{score} / {questions.length}</div>
          <div className="quiz-score-msg">
            {score === questions.length ? '完璧！Perfect score! 🎉' :
             score >= questions.length * 0.6 ? 'Great job! Keep it up!' :
             'Keep studying! You can do it!'}
          </div>
          <div className="quiz-actions">
            <button className="quiz-btn quiz-btn--secondary" onClick={handleReplay}>Try Again</button>
            <button className="quiz-btn quiz-btn--primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-overlay">
      <div className="quiz-card">
        <div className="quiz-header">
          <span className="quiz-progress">Question {current + 1} / {questions.length}</span>
          <button className="quiz-x" onClick={onClose}>×</button>
        </div>
        <div className="quiz-prompt">What does this word mean?</div>
        <div className="quiz-word">{q.item.word}</div>
        <div className="quiz-reading">{q.item.reading}</div>
        <div className="quiz-choices">
          {q.choices.map((choice) => {
            let cls = 'quiz-choice';
            if (selected) {
              if (choice.word === q.item.word) cls += ' quiz-choice--correct';
              else if (choice.word === selected.word) cls += ' quiz-choice--wrong';
            }
            return (
              <button
                key={choice.word}
                className={cls}
                onClick={() => handleChoice(choice)}
              >
                {choice.meaning}
              </button>
            );
          })}
        </div>
        {selected && (
          <button className="quiz-btn quiz-btn--primary quiz-next" onClick={handleNext}>
            {current + 1 < questions.length ? 'Next →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
