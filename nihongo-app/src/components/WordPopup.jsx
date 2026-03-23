import { useEffect, useRef } from 'react';
import './WordPopup.css';

export default function WordPopup({ word, position, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (!word) return null;

  const style = {
    top: position.y + 12,
    left: position.x,
  };

  return (
    <div className="word-popup" style={style} ref={ref}>
      <button className="word-popup__close" onClick={onClose}>×</button>
      <div className="word-popup__word">{word.word}</div>
      <div className="word-popup__reading">{word.reading}</div>
      <div className="word-popup__meaning">{word.meaning}</div>
    </div>
  );
}
