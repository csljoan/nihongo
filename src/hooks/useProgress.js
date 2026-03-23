import { useState, useCallback } from 'react';

const STORAGE_KEY = 'nihongo_completed_songs';

function getCompleted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState(getCompleted);

  const markCompleted = useCallback((songId) => {
    setCompleted((prev) => {
      if (prev.includes(songId)) return prev;
      const next = [...prev, songId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (songId) => completed.includes(songId),
    [completed]
  );

  return { completed, markCompleted, isCompleted };
}
