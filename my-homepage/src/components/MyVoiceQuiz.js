import { useEffect, useMemo, useRef, useState } from 'react';
import myVoicePatterns from '../data/my_voice_pattern.json';

const SOLFEGE_NOTES = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'];

export default function MyVoiceQuiz() {
  const [mode, setMode] = useState('2'); // default to 2
  const [numQuestions, setNumQuestions] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPattern, setCurrentPattern] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  const availableModes = useMemo(() => {
    return Object.keys(myVoicePatterns)
      .filter((k) => k !== 'notes')
      .sort((a, b) => Number(a) - Number(b));
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }
    if (String(mode) === '1') {
      // one select for letter notes like C3, D3
      setUserAnswer(['']);
    } else if (String(mode) === '2') {
      // two-note patterns always start with 'do'; don't ask user for it
      setUserAnswer(['do', '']);
    } else {
      // solfege answers
      setUserAnswer(new Array(Number(mode)).fill(''));
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isRunning, mode]);

  function pickRandomPattern() {
    const list = myVoicePatterns[mode] || [];
    if (list.length === 0) {
      return [];
    }
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  // Builds an Audio object for the current pattern based on mode
  function createAudioForPattern(pattern) {
    if (!pattern || pattern.length === 0) return null;
    if (String(mode) === '1') {
      // choose a random variant 1..3
      const variants = [1, 2, 3];
      const chosen = variants[Math.floor(Math.random() * variants.length)];
      const letter = pattern[0]; // e.g., "C3"
      return new Audio(`/my_voice_normalized/${letter}_${chosen}.wav`);
    }
    // 2/3/4: use prefixed file like "2_do+re.wav"
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
    setIsPlaying(true);
    await new Promise((resolve) => {
      const handleEnded = () => {
        audio.removeEventListener('ended', handleEnded);
        resolve();
      };
      audio.addEventListener('ended', handleEnded);
      audio.play().catch(() => resolve());
    });
    setIsPlaying(false);
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
      setFeedback(`Incorrect. Correct: ${currentPattern.join(' - ')}`);
    }
  }

  function nextQuestion() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= numQuestions) {
      setIsRunning(false);
      setHasSubmitted(false);
      setFeedback('');
      setCurrentPattern([]);
      return;
    }
    setCurrentIndex(nextIndex);
    setHasSubmitted(false);
    setFeedback('');
    if (String(mode) === '1') {
      setUserAnswer(['']);
    } else if (String(mode) === '2') {
      setUserAnswer(['do', '']);
    } else {
      setUserAnswer(new Array(Number(mode)).fill(''));
    }
    setCurrentPattern(pickRandomPattern());
  }

  const solfegeOptions = SOLFEGE_NOTES;
  const letterOptions = myVoicePatterns['1'] ? myVoicePatterns['1'].map((x) => x[0]) : [];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      {!isRunning && (
        <div style={{ border: '1px solid #444', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label>
              Mode:{' '}
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
            <button onClick={() => playPattern(currentPattern)} disabled={isPlaying}>
              {isPlaying ? 'Playing...' : 'Play'}
            </button>
            <button onClick={stopQuiz} style={{ marginLeft: 8 }}>
              Stop
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {userAnswer.map((value, idx) => {
              const isFixedDo = String(mode) === '2' && idx === 0;
              if (isFixedDo) {
                return (
                  <select key={idx} value="do" disabled>
                    <option value="do">do</option>
                  </select>
                );
              }
              return (
                <select
                  key={idx}
                  value={value}
                  onChange={(e) => onAnswerChange(idx, e.target.value)}
                  disabled={hasSubmitted}
                >
                  <option value="">?</option>
                  {(String(mode) === '1' ? letterOptions : solfegeOptions).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              );
            })}
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
        </div>
      )}
    </div>
  );
}


