import { useMemo, useRef, useState } from 'react';
import myVoicePatterns from '../data/my_voice_pattern.json';

export default function MyVoiceLibrary() {
  const [mode, setMode] = useState('2');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const cancelPlaybackRef = useRef(false);

  const availableModes = useMemo(() => {
    return Object.keys(myVoicePatterns)
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

  function createAudioForPattern(pattern) {
    if (!pattern || pattern.length === 0) return null;
    if (String(mode) === '1') {
      const variants = [1, 2, 3];
      const chosen = variants[Math.floor(Math.random() * variants.length)];
      const letter = pattern[0]; // e.g., "C3"
      return new Audio(`/my_voice_normalized/${letter}_${chosen}.wav`);
    }
    const filename = `${mode}_${pattern.join('+')}.wav`;
    return new Audio(`/my_voice_normalized/${filename}`);
  }

  async function playPattern(pattern) {
    const audio = createAudioForPattern(pattern);
    if (!audio) return;
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
    const list = myVoicePatterns[mode] || [];
    if (list.length === 0) return;
    cancelPlaybackRef.current = false;
    setIsPlaying(true);
    for (let i = 0; i < list.length; i += 1) {
      if (cancelPlaybackRef.current) break;
      // eslint-disable-next-line no-await-in-loop
      await playPattern(list[i]);
      if (cancelPlaybackRef.current) break;
    }
    setIsPlaying(false);
  }

  const patternsList = myVoicePatterns[mode] || [];

  return (
    <div style={{ marginTop: 24 }}>
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


