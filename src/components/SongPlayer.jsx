import { useEffect, useRef, useState, useCallback } from 'react';
import LyricLine from './LyricLine.jsx';
import WordPopup from './WordPopup.jsx';
import VocabQuiz from './VocabQuiz.jsx';
import './SongPlayer.css';

function loadYTApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = resolve;
  });
}

export default function SongPlayer({ song, onBack, onComplete }) {
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [popup, setPopup] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizTriggered, setQuizTriggered] = useState(false);
  const intervalRef = useRef(null);
  const activeRowRef = useRef(null);

  const activeIdx = song.lyrics.reduce((acc, line, i) => {
    return currentTime >= line.time ? i : acc;
  }, -1);

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIdx]);

  useEffect(() => {
    let destroyed = false;

    loadYTApi().then(() => {
      if (destroyed) return;
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: song.youtubeId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange(e) {
            if (e.data === window.YT.PlayerState.PLAYING) {
              intervalRef.current = setInterval(() => {
                const t = playerRef.current.getCurrentTime();
                setCurrentTime(t);
                const lastTime = song.lyrics[song.lyrics.length - 1].time;
                if (t >= lastTime + 8) {
                  setQuizTriggered((prev) => {
                    if (!prev) {
                      setShowQuiz(true);
                      onComplete(song.id);
                    }
                    return true;
                  });
                }
              }, 300);
            } else {
              clearInterval(intervalRef.current);
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      clearInterval(intervalRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.youtubeId]);

  const handleWordClick = useCallback((vocab, position) => {
    setPopup({ vocab, position });
  }, []);

  return (
    <div className="player">
      <button className="player__back" onClick={onBack}>← Back to Library</button>

      <div className="player__info">
        <h1 className="player__title">{song.title}</h1>
        <span className="player__artist">{song.artist}</span>
      </div>

      <div className="player__video-wrap">
        <div ref={playerContainerRef} className="player__video" />
      </div>

      <div className="player__lyrics-wrap">
        <table className="lyrics-table">
          <thead>
            <tr>
              <th>Japanese</th>
              <th>Romaji</th>
              <th>English</th>
            </tr>
          </thead>
          <tbody>
            {song.lyrics.map((line, i) => (
              <LyricLine
                key={i}
                ref={i === activeIdx ? activeRowRef : null}
                line={line}
                vocab={song.vocab}
                active={i === activeIdx}
                onWordClick={handleWordClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="player__quiz-bar">
        <button className="player__quiz-btn" onClick={() => setShowQuiz(true)}>
          Vocab Quiz →
        </button>
      </div>

      {popup && (
        <WordPopup
          word={popup.vocab}
          position={popup.position}
          onClose={() => setPopup(null)}
        />
      )}

      {showQuiz && (
        <VocabQuiz vocab={song.vocab} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
}
