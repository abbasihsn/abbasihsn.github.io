import { useMemo, useRef, useState } from 'react';
import patternsData from '../data/patterns.json';

const NOTE_NAMES = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'];

function buildNoteToUrlMap() {
  const map = {};
  NOTE_NAMES.forEach((name) => {
    map[name] = `/artifacts/${name}.mp3`;
  });
  return map;
}

export default function PatternLibrary() {
  const [mode, setMode] = useState('4');
  const [isPlaying, setIsPlaying] = useState(false);
  const noteToUrl = useMemo(() => buildNoteToUrlMap(), []);
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

  async function playNote(name) {
    return new Promise((resolve) => {
      const audio = new Audio(noteToUrl[name]);
      audioRef.current = audio;
      try {
        audio.currentTime = 0;
      } catch (_e) {
        // no-op
      }
      const timer = setTimeout(() => {
        try {
          audio.pause();
        } catch (_e) {
          // no-op
        }
        resolve();
      }, 1000);
      audio.play().catch(() => {
        // ignore autoplay issue; timer will resolve anyway
      });
      // if playback is cancelled mid-note, resolve on next tick after pause
      if (cancelPlaybackRef.current) {
        clearTimeout(timer);
        try {
          audio.pause();
        } catch (_e) {
          // no-op
        }
        resolve();
      }
    });
  }

  async function playSequence(sequence) {
    if (!sequence || sequence.length === 0) {
      return;
    }
    for (let i = 0; i < sequence.length; i += 1) {
      if (cancelPlaybackRef.current) {
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await playNote(sequence[i]); // ~1s per note, no extra gap
      if (cancelPlaybackRef.current) {
        break;
      }
    }
  }

  async function handlePlay(pattern) {
    cancelPlaybackRef.current = false;
    setIsPlaying(true);
    await playSequence(pattern);
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
      await playSequence(list[i]);
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


