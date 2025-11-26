import { useEffect, useMemo, useRef, useState } from 'react';
import patternsData from '../data/patterns.json';

const NOTE_NAMES = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'];

function buildNoteToUrlMap() {
  const map = {};
  NOTE_NAMES.forEach((name) => {
    map[name] = `/artifacts/${name}.mp3`;
  });
  return map;
}

function shuffleArray(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export default function PianoQuiz() {
  const [mode, setMode] = useState('4'); // number of notes in the pattern, as string key
  const [numQuestions, setNumQuestions] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPattern, setCurrentPattern] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const noteToUrl = useMemo(() => buildNoteToUrlMap(), []);
  const audioRef = useRef(null);
  const cancelPlaybackRef = useRef(false);
  const referenceAudioRef = useRef(null);

  const availableModes = useMemo(() => {
    return Object.keys(patternsData)
      .filter((k) => k !== 'notes')
      .sort((a, b) => Number(a) - Number(b));
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }
    // Prepare a fresh answer input based on selected mode
    setUserAnswer(new Array(Number(mode)).fill(''));
    // eslint-disable-next-line consistent-return
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isRunning, mode]);

  function pickRandomPattern() {
    const list = patternsData[mode] || [];
    if (list.length === 0) {
      return [];
    }
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  async function playNote(name) {
    return new Promise((resolve) => {
      const audio = new Audio(noteToUrl[name]);
      audioRef.current = audio;
      // Ensure we start from the beginning
      try {
        audio.currentTime = 0;
      } catch (_e) {
        // no-op
      }
      // Play and stop after 1 second regardless of file length
      const stopAfter = setTimeout(() => {
        try {
          audio.pause();
        } catch (_e) {
          // no-op
        }
        resolve();
      }, 1000);
      audio.play().catch(() => {
        // If autoplay is blocked, still keep the 1s timing window
        // We already scheduled stopAfter, so just let it resolve
      });
    });
  }

  async function playSequence(sequence) {
    if (!sequence || sequence.length === 0) {
      return;
    }
    cancelPlaybackRef.current = false;
    setIsPlaying(true);
    for (let i = 0; i < sequence.length; i += 1) {
      if (cancelPlaybackRef.current) {
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await playNote(sequence[i]); // exactly ~1s per note, no extra gap
      if (cancelPlaybackRef.current) {
        break;
      }
    }
    setIsPlaying(false);
  }

  function playReferenceDo() {
    const audio = new Audio(noteToUrl['do']);
    referenceAudioRef.current = audio;
    try {
      audio.currentTime = 0;
    } catch (_e) {
      // no-op
    }
    setTimeout(() => {
      try {
        audio.pause();
      } catch (_e) {
        // no-op
      }
    }, 1000);
    audio.play().catch(() => {
      // ignore autoplay blocks; user clicked the button so it should play
    });
  }

  function startQuiz() {
    setScore(0);
    setCurrentIndex(0);
    setFeedback('');
    setHasSubmitted(false);
    setIsRunning(true);
    const pattern = pickRandomPattern();
    setCurrentPattern(pattern);
  }

  function stopQuiz() {
    // Stop only playback, keep quiz state
    cancelPlaybackRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }

  function onAnswerChange(position, value) {
    const next = userAnswer.slice();
    next[position] = value;
    setUserAnswer(next);
  }

  function isAnswerComplete() {
    return userAnswer.length === Number(mode) && userAnswer.every((v) => v);
  }

  function submitAnswer() {
    if (!isAnswerComplete() || hasSubmitted) {
      return;
    }
    const correct = currentPattern.join(',') === userAnswer.join(',');
    setHasSubmitted(true);
    if (correct) {
      setScore((s) => s + 1);
      setFeedback('Correct!');
    } else {
      setFeedback(`Incorrect. Correct sequence: ${currentPattern.join(' - ')}`);
    }
  }

  function nextQuestion() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= numQuestions) {
      // End of quiz
      setIsRunning(false);
      setHasSubmitted(false);
      setFeedback('');
      setCurrentPattern([]);
      return;
    }
    setCurrentIndex(nextIndex);
    setHasSubmitted(false);
    setFeedback('');
    setUserAnswer(new Array(Number(mode)).fill(''));
    setCurrentPattern(pickRandomPattern());
  }

  // Build options (we can randomize to reduce positional hints)
  const noteOptions = useMemo(() => shuffleArray(NOTE_NAMES), []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <strong>Reference:</strong>
        <button onClick={playReferenceDo}>Play DO (Reference)</button>
      </div>
      {!isRunning && (
        <div style={{ border: '1px solid #444', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Piano Quiz</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label>
              Mode (number of notes):{' '}
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                {availableModes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              Number of questions:{' '}
              <input
                type="number"
                min={1}
                max={50}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                style={{ width: 80 }}
              />
            </label>
            <button onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {isRunning && (
        <div style={{ border: '1px solid #444', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              Question {currentIndex + 1} / {numQuestions}
            </div>
            <div>Score: {score}</div>
          </div>

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <button onClick={() => playSequence(currentPattern)} disabled={isPlaying}>
              {isPlaying ? 'Playing...' : 'Play Sequence'}
            </button>
            <button onClick={stopQuiz} style={{ marginLeft: 8 }}>
              Stop
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {userAnswer.map((value, idx) => (
              <select
                key={idx}
                value={value}
                onChange={(e) => onAnswerChange(idx, e.target.value)}
                disabled={hasSubmitted}
              >
                <option value="">?</option>
                {noteOptions.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            ))}
            <button
              onClick={submitAnswer}
              disabled={!isAnswerComplete() || hasSubmitted}
            >
              Submit
            </button>
            {hasSubmitted && (
              <button onClick={nextQuestion} style={{ marginLeft: 8 }}>
                {currentIndex + 1 === numQuestions ? 'Finish' : 'Next'}
              </button>
            )}
          </div>

          {feedback && (
            <div style={{ marginTop: 12 }}>
              {feedback}
            </div>
          )}
        </div>
      )}

      {!isRunning && currentIndex >= numQuestions && (
        <div style={{ marginTop: 12 }}>
          <strong>Quiz complete.</strong> Final score: {score} / {numQuestions}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => { setCurrentIndex(0); setScore(0); }}>
              Reset Score
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


