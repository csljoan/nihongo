import songs from '../songs/index.js';
import './SongLibrary.css';

const LEVEL_COLORS = {
  N5: '#4caf8e',
  N4: '#3d8ee8',
  N3: '#e8456a',
  N2: '#9c59e8',
  N1: '#e87d45',
};

export default function SongLibrary({ onSelectSong, isCompleted }) {
  return (
    <div className="library">
      <header className="library__header">
        <div className="library__logo">
          <span className="library__logo-jp">日本語</span>
          <span className="library__logo-en">Music</span>
        </div>
        <p className="library__subtitle">Learn Japanese through songs</p>
      </header>
      <div className="library__grid">
        {songs.map((song) => (
          <button
            key={song.id}
            className={`song-card${isCompleted(song.id) ? ' song-card--done' : ''}`}
            onClick={() => onSelectSong(song)}
          >
            {isCompleted(song.id) && (
              <div className="song-card__check">✓</div>
            )}
            <div
              className="song-card__thumb"
              style={{ backgroundImage: `url(https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg)` }}
            />
            <div className="song-card__body">
              <span
                className="song-card__level"
                style={{ background: LEVEL_COLORS[song.level] || '#555' }}
              >
                {song.level}
              </span>
              <div className="song-card__title">{song.title}</div>
              <div className="song-card__artist">{song.artist}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
