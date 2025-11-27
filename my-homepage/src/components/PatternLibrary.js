import { useMemo, useRef, useState } from 'react';
import patternsData from '../data/patterns.json';

export default function PatternLibrary() {
  const [mode, setMode] = useState('4');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const cancelPlaybackRef = useRef(false);

  const availableModes = useMemo(() => {
    return Object.keys(patternsData)
      .filter((k) => k !== 'notes')
      .sort((a, b) => Number(a) - Number(b));
  }, []);

  function stopPlayback() {
    cancelPlaybackRef.current = true;
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (_e) {
        // no-op
      }
      audioRef.current = null;
    }
    setIsPlaying(false);
  }

  async function playPattern(pattern) {
    if (!pattern || pattern.length === 0) return;
    const filename = `${pattern.join('+')}.mp3`;
    const audio = new Audio(`/artifacts/${filename}`);
    audioRef.current = audio;
    try {
      audio.currentTime = 0;
    } catch (_e) {
      // no-op
    }
    await new Promise((resolve) => {
      const handleEnded = () => {
        audio.removeEventListener('ended', handleEnded);
        resolve();
      };
      audio.addEventListener('ended', handleEnded);
      audio.play().catch(() => resolve());
    });
  }

  async function handlePlay(pattern) {
    cancelPlaybackRef.current = false;
    setIsPlaying(true);
    await playPattern(pattern);
    setIsPlaying(false);
  }

  async function handlePlayAll() {
    const list = patternsData[mode] || [];
    if (list.length === 0) return;
    cancelPlaybackRef.current = false;
    setIsPlaying(true);
    // Play each pattern sequentially
    for (let i = 0; i < list.length; i += 1) {
      if (cancelPlaybackRef.current) break;
      // eslint-disable-next-line no-await-in-loop
      await playPattern(list[i]);
      if (cancelPlaybackRef.current) break;
    }
    setIsPlaying(false);
  }

  const patternsList = patternsData[mode] || [];

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ marginTop: 0 }}>Pattern Library</h3>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          Mode:{' '}
          <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={isPlaying}>
            {availableModes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <button onClick={handlePlayAll} disabled={isPlaying || patternsList.length === 0}>
          {isPlaying ? 'Playing...' : 'Play All'}
        </button>
        {isPlaying && (
          <button onClick={stopPlayback}>
            Stop
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        {patternsList.map((pattern, idx) => (
          <div key={idx} style={{ display: 'contents' }}>
            <div>{pattern.join(' - ')}</div>
            <div>
              <button onClick={() => handlePlay(pattern)} disabled={isPlaying}>
                Play
              </button>
            </div>
          </div>
        ))}
        {patternsList.length === 0 && (
          <div>No patterns for selected mode.</div>
        )}
      </div>
    </div>
  );
}


