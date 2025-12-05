import PianoQuiz from '../components/PianoQuiz';
import PatternLibrary from '../components/PatternLibrary';
import MyVoiceQuiz from '../components/MyVoiceQuiz';
import MyVoiceLibrary from '../components/MyVoiceLibrary';

export default function PianoQuizPage() {
  return (
    <div className="App">
      <section className="piano-quiz">
        <div className="about-container">
          <h2>Piano Notes Quiz</h2>
          <PianoQuiz />
        </div>
      </section>
      <section className="pattern-library">
        <div className="about-container">
          <h2>Learn: All Patterns</h2>
          <PatternLibrary />
        </div>
      </section>
      <section className="my-voice-quiz">
        <div className="about-container">
          <h2>My Voice Quiz</h2>
          <MyVoiceQuiz />
        </div>
      </section>
      <section className="my-voice-library">
        <div className="about-container">
          <h2>My Voice Patterns</h2>
          <MyVoiceLibrary />
        </div>
      </section>
    </div>
  );
}


