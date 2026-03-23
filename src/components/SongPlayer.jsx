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
  const [offset, setOffset] = useState(0);
  const [tapMode, setTapMode] = useState(false);
  const [popup, setPopup] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [openLearnIdx, setOpenLearnIdx] = useState(null);
  const intervalRef = useRef(null);
  const activeRowRef = useRef(null);

  // Compute active lyric index accounting for offset
  const adjustedTime = currentTime + offset;
  const activeIdx = song.lyrics.reduce((acc, line, i) => {
    return adjustedTime >= line.time ? i : acc;
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
              }, 250);
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

  function handleTap() {
    if (!playerRef.current) return;
    const videoTime = playerRef.current.getCurrentTime();
    const firstLyricTime = song.lyrics[0].time;
    setOffset(videoTime - firstLyricTime);
    setTapMode(false);
  }

  function handleToggleLearn(idx) {
    setOpenLearnIdx((prev) => (prev === idx ? null : idx));
  }

  const offsetLabel = offset === 0
    ? '0s'
    : offset > 0
    ? `+${offset.toFixed(1)}s`
    : `${offset.toFixed(1)}s`;

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

      {/* Sync controls */}
      <div className="sync-bar">
        <div className="sync-offset">
          <label className="sync-label">Lyric offset</label>
          <input
            type="range"
            className="sync-slider"
            min={-20}
            max={20}
            step={0.5}
            value={offset}
            onChange={(e) => setOffset(parseFloat(e.target.value))}
          />
          <span className="sync-value">{offsetLabel}</span>
          <button
            className="sync-reset"
            onClick={() => setOffset(0)}
            disabled={offset === 0}
          >
            Reset
          </button>
        </div>
        <div className="sync-tap-area">
          {tapMode ? (
            <>
              <span className="sync-tap-hint">
                Tap when you hear: <em>「{song.lyrics[0].jp}」</em>
              </span>
              <button className="sync-tap-btn sync-tap-btn--active" onClick={handleTap}>
                TAP NOW
              </button>
              <button className="sync-tap-cancel" onClick={() => setTapMode(false)}>Cancel</button>
            </>
          ) : (
            <button className="sync-tap-btn" onClick={() => setTapMode(true)}>
              🎵 Tap to Sync
            </button>
          )}
        </div>
      </div>

      <div className="player__lyrics-wrap">
        <table className="lyrics-table">
          <thead>
            <tr>
              <th>Japanese</th>
              <th>Romaji</th>
              <th>English</th>
              <th></th>
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
                learnOpen={openLearnIdx === i}
                onToggleLearn={() => handleToggleLearn(i)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="player__bottom-bar">
        <button
          className="player__quiz-btn"
          onClick={() => {
            onComplete(song.id);
            setShowQuiz(true);
          }}
        >
          📝 Take Vocab Quiz
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
