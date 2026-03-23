import { useState } from 'react';
import SongLibrary from './components/SongLibrary.jsx';
import SongPlayer from './components/SongPlayer.jsx';
import { useProgress } from './hooks/useProgress.js';

export default function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const { isCompleted, markCompleted } = useProgress();

  return (
    <div className="app">
      {currentSong ? (
        <SongPlayer
          song={currentSong}
          onBack={() => setCurrentSong(null)}
          onComplete={markCompleted}
        />
      ) : (
        <SongLibrary
          onSelectSong={setCurrentSong}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}
