/**
 * SwarSadhana Pro - Indian Classical Music Vocal Trainer
 * Main Application Entry Point with anime.js animations
 * स्वरसाधना - भारतीय शास्त्रीय संगीत स्वर प्रशिक्षण
 */

import anime from 'animejs/lib/anime.es.js';
import { getAudioEngine } from './audio/AudioEngine.js';
import { PitchDetector } from './audio/PitchDetector.js';
import { getSynthesizer } from './audio/SwarSynthesizer.js';
import { getTanpura } from './audio/TanpuraSynth.js';
import { SwarDisplay } from './components/SwarDisplay.js';
import { WaveformVisualizer } from './components/WaveformVisualizer.js';
import { SwarKeyboard } from './components/SwarKeyboard.js';
import { AccuracyMeter } from './components/AccuracyMeter.js';
import { ScaleSelector } from './components/ScaleSelector.js';
import { SHRUTI_MAP, DEFAULT_SA_FREQUENCY, generateShuddhaScale, compareToTarget } from './utils/swarUtils.js';
import { RAGA_DATABASE, getAllRagas, generateRagaScale, getRandomRagaNote, getPakadDisplay } from './utils/ragaDatabase.js';
import { getSettings, getProgress, recordSession, getOverallAccuracy, getBaseSaFrequency } from './utils/storageUtils.js';
import animationEngine from './utils/AnimationEngine.js';

class SwarSadhanaApp {
  constructor() {
    this.audioEngine = getAudioEngine();
    this.synthesizer = getSynthesizer();
    this.tanpura = getTanpura();
    this.pitchDetector = null;

    this.isListening = false;
    this.currentScreen = 'home';
    this.targetSwar = null;
    this.targetFrequency = null;
    this.exerciseMode = null;
    this.currentRaga = null;
    this.baseSa = getBaseSaFrequency() || DEFAULT_SA_FREQUENCY;

    // Session tracking
    this.sessionStats = {
      exerciseCount: 0,
      correctCount: 0,
      streak: 0,
      maxStreak: 0
    };

    // Track if current swar has been matched successfully
    this.swarCompleted = false;
    this.matchStartTime = null;
    this.requiredMatchDuration = 500; // ms to hold note

    this.init();
  }

  init() {
    this.synthesizer.setBaseSa(this.baseSa);
    this.tanpura.setBaseSa(this.baseSa);
    this.renderApp();
    this.setupEventListeners();
    this.setupButtonRipples();
    this.initScaleSelectors();
    this.showScreen('home');

    // Initialize particles after a short delay for smooth load
    setTimeout(() => {
      animationEngine.initParticles();
    }, 100);
  }

  initScaleSelectors() {
    const scaleChangeHandler = (frequency, committed) => {
      this.updateBaseSa(frequency);
    };

    // Home screen scale selector
    const homeContainer = document.getElementById('homeScaleSelector');
    if (homeContainer) {
      this.homeScaleSelector = new ScaleSelector(homeContainer, {
        onScaleChange: scaleChangeHandler
      });
    }

    // Abhyas (Practice) screen scale selector
    const abhyasContainer = document.getElementById('abhyasScaleSelector');
    if (abhyasContainer) {
      this.abhyasScaleSelector = new ScaleSelector(abhyasContainer, {
        onScaleChange: scaleChangeHandler
      });
    }

    // Exercise mode scale selector
    const exerciseContainer = document.getElementById('exerciseScaleSelector');
    if (exerciseContainer) {
      this.exerciseScaleSelector = new ScaleSelector(exerciseContainer, {
        onScaleChange: scaleChangeHandler
      });
    }

    // Raga screen scale selector
    const ragaContainer = document.getElementById('ragaScaleSelector');
    if (ragaContainer) {
      this.ragaScaleSelector = new ScaleSelector(ragaContainer, {
        onScaleChange: scaleChangeHandler
      });
    }
  }

  updateBaseSa(frequency) {
    this.baseSa = frequency;

    // Update synthesizer and tanpura
    this.synthesizer.setBaseSa(frequency);
    this.tanpura.setBaseSa(frequency);

    // Update pitch detector if active
    if (this.pitchDetector) {
      this.pitchDetector.setBaseSa(frequency);
    }

    // Update swar keyboard if exists
    if (this.swarKeyboard) {
      this.swarKeyboard.setBaseSa(frequency);
    }

    // Sync all scale selectors
    if (this.homeScaleSelector) {
      this.homeScaleSelector.setScale(frequency);
    }
    if (this.abhyasScaleSelector) {
      this.abhyasScaleSelector.setScale(frequency);
    }
    if (this.ragaScaleSelector) {
      this.ragaScaleSelector.setScale(frequency);
    }
    if (this.exerciseScaleSelector) {
      this.exerciseScaleSelector.setScale(frequency);
    }

    console.log(`Base Sa updated to: ${frequency.toFixed(2)} Hz`);
  }

  setupButtonRipples() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        animationEngine.buttonPress(btn, e);
      });
    });
  }

  renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <!-- Navigation -->
      <nav class="nav">
        <div class="nav-brand">
          <div class="logo">ॐ</div>
          <div>
            <span>SwarSadhana</span>
            <div class="brand-hindi">स्वरसाधना</div>
          </div>
        </div>
        <div class="nav-links">
          <a href="#" class="nav-link active" data-screen="home">गृह Home</a>
          <a href="#" class="nav-link" data-screen="abhyas">अभ्यास Practice</a>
          <a href="#" class="nav-link" data-screen="raga">राग Ragas</a>
          <a href="#" class="nav-link" data-screen="pragati">प्रगति Progress</a>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Home Screen -->
        <section class="screen active" id="homeScreen">
          <div class="hero">
            <h1>स्वरसाधना</h1>
            <div class="hindi-title">SwarSadhana</div>
            <p>Master Indian Classical Music with real-time pitch detection. Practice Sa Re Ga Ma Pa Da Ni with authentic Tanpura accompaniment.</p>
            <button class="btn btn-primary btn-lg" id="startPracticeBtn">
              🎵 अभ्यास शुरू करें (Start Practice)
            </button>
          </div>

          <div id="homeScaleSelector" class="mt-4"></div>

          <div class="grid grid-4 mt-8">
            <div class="card exercise-card" data-exercise="swar-matching">
              <div class="icon">🎯</div>
              <h3>Swar Matching</h3>
              <div class="hindi-name">स्वर मिलान</div>
              <p>Match your voice to Sa Re Ga Ma Pa Da Ni</p>
            </div>
            <div class="card exercise-card" data-exercise="bilawal">
              <div class="icon">🎹</div>
              <h3>Bilawal Scale</h3>
              <div class="hindi-name">बिलावल थाट</div>
              <p>Practice the fundamental major scale</p>
            </div>
            <div class="card exercise-card" data-exercise="yaman">
              <div class="icon">🌙</div>
              <h3>Raga Yaman</h3>
              <div class="hindi-name">राग यमन</div>
              <p>Evening raga with Tivra Ma</p>
            </div>
            <div class="card exercise-card" data-exercise="alankar">
              <div class="icon">🎼</div>
              <h3>Alankar</h3>
              <div class="hindi-name">अलंकार</div>
              <p>Traditional practice patterns</p>
            </div>
          </div>

          <div class="score-display mt-8" id="homeStats">
            <div class="score-item">
              <div class="score-value" id="totalSessions">0</div>
              <div class="score-label">सत्र Sessions</div>
            </div>
            <div class="score-item">
              <div class="score-value" id="totalAccuracy">0%</div>
              <div class="score-label">शुद्धता Accuracy</div>
            </div>
            <div class="score-item">
              <div class="score-value" id="bestStreak">0</div>
              <div class="score-label">श्रृंखला Streak</div>
            </div>
          </div>
        </section>

        <!-- Abhyas (Practice) Screen -->
        <section class="screen" id="abhyasScreen">
          <div class="text-center mb-8">
            <h2>स्वतंत्र अभ्यास</h2>
            <p class="text-muted">Click any Swar to hear it, then sing along! The mic will auto-start.</p>
          </div>

          <div class="tanpura-controls">
            <button class="tanpura-btn" id="tanpuraToggleBtn">
              🎻 तानपूरा (Tanpura)
            </button>
          </div>

          <div id="abhyasScaleSelector"></div>

          <div class="card">
            <div id="swarDisplayContainer"></div>
            <div id="waveformContainer"></div>
            <div id="accuracyMeterContainer"></div>
          </div>

          <div class="card mt-8">
            <h4 class="mb-4 text-center">🎹 स्वर चुनें (Click a Swar to practice)</h4>
            <div id="swarKeyboardContainer"></div>
          </div>
        </section>

        <!-- Raga Screen -->
        <section class="screen" id="ragaScreen">
          <div class="text-center mb-8">
            <h2>राग अभ्यास</h2>
            <p class="text-muted">Raga Practice - Learn traditional Indian scales</p>
          </div>

          <div id="ragaScaleSelector"></div>

          <div class="grid grid-3">
            ${getAllRagas().map(raga => `
              <div class="card raga-card" data-raga="${raga.id}">
                <div class="raga-time">${raga.time}</div>
                <div class="raga-hindi">${raga.hindi}</div>
                <div class="raga-name">${raga.name}</div>
                <div class="raga-description">${raga.description}</div>
                <button class="btn btn-primary mt-4">अभ्यास करें (Practice)</button>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Exercise Mode Screen -->
        <section class="screen" id="exerciseModeScreen">
          <div class="text-center mb-4">
            <button class="btn btn-secondary" id="backToHomeBtn">← वापस (Back)</button>
          </div>
          
          <div class="tanpura-controls">
            <button class="tanpura-btn" id="exerciseTanpuraBtn">
              🎻 तानपूरा (Tanpura)
            </button>
          </div>

          <div id="exerciseScaleSelector"></div>

          <div class="card">
            <div class="text-center mb-4">
              <h3 id="exerciseTitle">स्वर मिलान</h3>
              <p class="text-muted" id="exerciseInstruction">Match your voice to the target Swar</p>
            </div>

            <div class="target-display">
              <div class="target-label">लक्ष्य स्वर (Target Swar):</div>
              <div class="target-swar" id="targetSwarDisplay">सा</div>
            </div>

            <div class="pakad-display" id="pakadSection" style="display: none;">
              <div class="pakad-label">पकड़ (Pakad - Characteristic Phrase):</div>
              <div class="pakad-notes" id="pakadNotes">--</div>
              <button class="btn btn-secondary btn-sm" id="playPakadBtn">
                🎵 पकड़ सुनें (Play Pakad)
              </button>
            </div>

            <div id="exerciseSwarDisplay"></div>
            <div id="exerciseWaveform"></div>
            <div id="exerciseAccuracy"></div>
          </div>

          <div class="score-display mt-8">
            <div class="score-item">
              <div class="score-value" id="exerciseCorrect">0</div>
              <div class="score-label">सही Correct</div>
            </div>
            <div class="score-item">
              <div class="score-value" id="exerciseStreak">0</div>
              <div class="score-label">श्रृंखला Streak</div>
            </div>
            <div class="score-item">
              <div class="score-value" id="exerciseTotal">0</div>
              <div class="score-label">कुल Total</div>
            </div>
          </div>

          <div class="text-center mt-8">
            <button class="btn btn-primary btn-lg" id="playTargetBtn">
              🔊 स्वर सुनें (Play Target)
            </button>
            <button class="btn btn-secondary btn-lg" id="nextSwarBtn" style="margin-left: 16px;">
              अगला स्वर (Next) →
            </button>
          </div>
        </section>

        <!-- Pragati (Progress) Screen -->
        <section class="screen" id="pragatiScreen">
          <div class="text-center mb-8">
            <h2>आपकी प्रगति</h2>
            <p class="text-muted">Your Progress - Track your vocal training journey</p>
          </div>

          <div class="score-display">
            <div class="score-item">
              <div class="score-value" id="progressSessions">0</div>
              <div class="score-label">कुल सत्र Total Sessions</div>
            </div>
            <div class="score-item">
              <div class="score-value" id="progressExercises">0</div>
              <div class="score-label">अभ्यास Exercises</div>
            </div>
            <div class="score-item">
              <div class="score-value" id="progressAccuracy">0%</div>
              <div class="score-label">शुद्धता Accuracy</div>
            </div>
            <div class="score-item">
              <div class="score-value" id="progressStreak">0</div>
              <div class="score-label">सर्वश्रेष्ठ श्रृंखला Best Streak</div>
            </div>
          </div>

          <div class="card mt-8 text-center">
            <h3 class="mb-4">नियमित अभ्यास करें!</h3>
            <p class="text-muted">Consistent daily practice is the key to mastering Swar and improving pitch accuracy.</p>
            <button class="btn btn-primary btn-lg mt-4" id="progressStartBtn">
              🎵 नया सत्र शुरू करें (Start New Session)
            </button>
          </div>
        </section>
      </main>
    `;
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const screen = e.target.dataset.screen;
        this.showScreen(screen);
      });
    });

    // Home screen buttons
    document.getElementById('startPracticeBtn')?.addEventListener('click', () => {
      this.showScreen('abhyas');
      this.startPractice();
    });

    // Exercise cards
    document.querySelectorAll('.exercise-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const exercise = card.dataset.exercise;
        if (exercise) {
          this.startExercise(exercise);
        }
      });
    });

    // Raga cards
    document.querySelectorAll('.raga-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const ragaId = card.dataset.raga;
        if (ragaId) {
          this.startExercise(ragaId);
        }
      });
    });

    // Tanpura button
    document.getElementById('tanpuraToggleBtn')?.addEventListener('click', () => {
      this.toggleTanpura('tanpuraToggleBtn');
    });

    // Exercise mode buttons
    document.addEventListener('click', (e) => {
      if (e.target.id === 'backToHomeBtn' || e.target.closest('#backToHomeBtn')) {
        this.stopExercise();
        this.showScreen('home');
      }
    });

    document.getElementById('playTargetBtn')?.addEventListener('click', () => {
      if (this.targetFrequency) {
        this.synthesizer.playFrequency(this.targetFrequency, 1.5);
      }
    });

    document.getElementById('nextSwarBtn')?.addEventListener('click', () => {
      this.nextExerciseSwar();
    });

    document.getElementById('exerciseTanpuraBtn')?.addEventListener('click', () => {
      this.toggleTanpura('exerciseTanpuraBtn');
    });

    document.getElementById('playPakadBtn')?.addEventListener('click', () => {
      this.playPakad();
    });

    // Progress screen
    document.getElementById('progressStartBtn')?.addEventListener('click', () => {
      this.showScreen('abhyas');
      this.startPractice();
    });
  }

  showScreen(screenName) {
    // Cleanup only if navigating away from current context
    if (this.isListening && screenName !== 'exerciseMode') {
      this.stopListening();
      const toggleBtn = document.getElementById('toggleListenBtn');
      if (toggleBtn) {
        toggleBtn.textContent = '🎤 सुनना शुरू करें (Start Listening)';
      }
    }
    // Only stop exercise if navigating AWAY from exerciseMode
    if (this.exerciseMode && screenName !== 'exerciseMode') {
      this.stopExercise();
    }

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.screen === screenName) {
        link.classList.add('active');
      }
    });

    // Show selected screen
    const screen = document.getElementById(`${screenName}Screen`);
    if (screen) {
      screen.classList.add('active');

      // Animate screen elements
      this.animateScreenEntrance(screenName);
    }

    this.currentScreen = screenName;

    // Initialize screen-specific components
    if (screenName === 'abhyas') {
      this.initPracticeScreen();
    } else if (screenName === 'home') {
      this.updateHomeStats();
      this.animateHomeStats();
    } else if (screenName === 'pragati') {
      this.updateProgressStats();
      this.animateProgressStats();
    }
  }

  animateScreenEntrance(screenName) {
    const screen = document.getElementById(`${screenName}Screen`);
    if (!screen) return;

    // Animate hero if present
    const hero = screen.querySelector('.hero');
    if (hero) {
      animationEngine.heroReveal(hero);
    }

    // Animate cards with stagger
    const cards = screen.querySelectorAll('.card');
    if (cards.length > 0) {
      animationEngine.cardEntrance(cards);
    }
  }

  animateHomeStats() {
    const progress = getProgress();

    setTimeout(() => {
      const sessionsEl = document.getElementById('totalSessions');
      const accuracyEl = document.getElementById('totalAccuracy');
      const streakEl = document.getElementById('bestStreak');

      if (sessionsEl) {
        animationEngine.countUp(sessionsEl, progress.totalSessions);
      }
      if (accuracyEl) {
        animationEngine.countUp(accuracyEl, getOverallAccuracy(), { suffix: '%' });
      }
      if (streakEl) {
        animationEngine.countUp(streakEl, progress.bestStreak);
      }
    }, 400);
  }

  animateProgressStats() {
    const progress = getProgress();

    setTimeout(() => {
      animationEngine.countUp(
        document.getElementById('progressSessions'),
        progress.totalSessions
      );
      animationEngine.countUp(
        document.getElementById('progressExercises'),
        progress.totalExercises
      );
      animationEngine.countUp(
        document.getElementById('progressAccuracy'),
        getOverallAccuracy(),
        { suffix: '%' }
      );
      animationEngine.countUp(
        document.getElementById('progressStreak'),
        progress.bestStreak
      );
    }, 300);
  }

  initPracticeScreen() {
    if (!this.swarDisplay) {
      const swarContainer = document.getElementById('swarDisplayContainer');
      const waveformContainer = document.getElementById('waveformContainer');
      const meterContainer = document.getElementById('accuracyMeterContainer');
      const keyboardContainer = document.getElementById('swarKeyboardContainer');

      this.swarDisplay = new SwarDisplay(swarContainer);
      this.waveformVisualizer = new WaveformVisualizer(waveformContainer);
      this.accuracyMeter = new AccuracyMeter(meterContainer);
      this.swarKeyboard = new SwarKeyboard(keyboardContainer, {
        baseSa: this.baseSa,
        onSwarSelect: async (swarData) => {
          if (swarData) {
            this.targetSwar = swarData;
            this.targetFrequency = swarData.frequency;

            // Auto-start listening when a note is selected
            if (!this.isListening) {
              await this.startListeningForPractice();
            }
          } else {
            this.targetSwar = null;
            this.targetFrequency = null;
          }
        },
        onSwarPlay: (swarData) => {
          // Play the reference note
          this.synthesizer.playSemitone(swarData.semitone, 1.5);
        }
      });

      this.swarDisplay.showReady();
    }
  }

  /**
   * Start listening for practice mode (auto-triggered)
   */
  async startListeningForPractice() {
    try {
      await this.audioEngine.init();
      await this.audioEngine.startListening();

      this.pitchDetector = new PitchDetector(this.audioEngine, { baseSa: this.baseSa });
      this.pitchDetector.onPitchDetected = (pitchData) => {
        this.handlePitchDetected(pitchData);
      };
      this.pitchDetector.onSilence = () => {
        this.swarDisplay.showSilence();
      };
      this.pitchDetector.start();

      this.waveformVisualizer.start(this.audioEngine);
      this.isListening = true;

      console.log('Practice listening started');
    } catch (error) {
      console.error('Failed to start listening:', error);
      alert(error.message);
    }
  }

  async startPractice() {
    try {
      await this.audioEngine.init();
      this.swarDisplay.showWaiting();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      alert(error.message);
    }
  }

  async toggleListening() {
    const btn = document.getElementById('toggleListenBtn');

    if (this.isListening) {
      this.stopListening();
      btn.textContent = '🎤 सुनना शुरू करें (Start Listening)';
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    } else {
      try {
        await this.audioEngine.startListening();

        this.pitchDetector = new PitchDetector(this.audioEngine, { baseSa: this.baseSa });
        this.pitchDetector.onPitchDetected = (pitchData) => {
          this.handlePitchDetected(pitchData);
        };
        this.pitchDetector.onSilence = () => {
          this.swarDisplay.showSilence();
        };
        this.pitchDetector.start();

        this.waveformVisualizer.start(this.audioEngine);

        this.isListening = true;
        btn.textContent = '⏹ रुकें (Stop Listening)';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
      } catch (error) {
        console.error('Failed to start listening:', error);
        alert(error.message);
      }
    }
  }

  stopListening() {
    if (this.pitchDetector) {
      this.pitchDetector.stop();
    }
    this.audioEngine.stopListening();
    this.waveformVisualizer?.stop();
    this.swarDisplay?.showWaiting();
    this.isListening = false;
  }

  handlePitchDetected(pitchData) {
    if (this.targetFrequency) {
      const comparison = compareToTarget(pitchData.frequency, this.targetFrequency);
      this.swarDisplay.updateWithTarget(pitchData, comparison, this.targetSwar);
      this.accuracyMeter.updateFromCents(comparison.cents);
    } else {
      this.swarDisplay.update(pitchData);
      this.accuracyMeter.updateFromCents(pitchData.cents);
    }
  }

  playReferenceSwar() {
    if (this.targetFrequency) {
      this.synthesizer.playFrequency(this.targetFrequency, 1.5);
    } else {
      // Play Sa as default
      this.synthesizer.playSemitone(0, 1.5);
    }
  }

  /**
   * Play the pakad phrase for the current raga
   */
  async playPakad() {
    if (!this.currentRaga || !this.currentRaga.pakad) return;

    const pakad = this.currentRaga.pakad;

    // Play each note in sequence
    await this.synthesizer.playSequence(pakad, 0.5, 0.1, (shrutiData, index, semitone) => {
      console.log(`Playing pakad note ${index + 1}: ${shrutiData.hindi}`);
    });
  }

  toggleTanpura(buttonId) {
    const btn = document.getElementById(buttonId);

    if (this.tanpura.getIsPlaying()) {
      this.tanpura.stop();
      btn.classList.remove('active');
    } else {
      this.tanpura.start();
      btn.classList.add('active');
    }
  }

  async startExercise(type) {
    this.exerciseMode = type;
    this.sessionStats = { exerciseCount: 0, correctCount: 0, streak: 0, maxStreak: 0 };

    // Determine raga or exercise type
    const raga = RAGA_DATABASE[type];
    if (raga) {
      this.currentRaga = raga;
    }

    this.showScreen('exerciseMode');

    // Initialize exercise components
    const swarContainer = document.getElementById('exerciseSwarDisplay');
    const waveformContainer = document.getElementById('exerciseWaveform');
    const accuracyContainer = document.getElementById('exerciseAccuracy');

    this.exerciseSwarDisplay = new SwarDisplay(swarContainer);
    this.exerciseWaveform = new WaveformVisualizer(waveformContainer);
    this.exerciseAccuracy = new AccuracyMeter(accuracyContainer);

    // Set exercise title
    const titles = {
      'swar-matching': { title: 'स्वर मिलान (Swar Matching)', instruction: 'Match your voice to the target Swar' },
      'alankar': { title: 'अलंकार (Alankar)', instruction: 'Practice traditional patterns' },
      'bilawal': { title: 'बिलावल (Bilawal)', instruction: 'Practice the Bilawal scale' },
      'yaman': { title: 'यमन (Yaman)', instruction: 'Practice Raga Yaman with Tivra Ma' },
      'bhairav': { title: 'भैरव (Bhairav)', instruction: 'Practice Raga Bhairav' },
      'kafi': { title: 'काफी (Kafi)', instruction: 'Practice Raga Kafi' },
      'bhairavi': { title: 'भैरवी (Bhairavi)', instruction: 'Practice Raga Bhairavi' }
    };

    const exerciseInfo = titles[type] || { title: 'अभ्यास (Practice)', instruction: 'Match your voice to the target' };
    document.getElementById('exerciseTitle').textContent = exerciseInfo.title;
    document.getElementById('exerciseInstruction').textContent = exerciseInfo.instruction;

    // Show pakad if this is a raga exercise
    const pakadSection = document.getElementById('pakadSection');
    const pakadNotes = document.getElementById('pakadNotes');

    if (this.currentRaga && this.currentRaga.pakad) {
      const pakadData = getPakadDisplay(this.currentRaga.id);
      if (pakadData) {
        pakadNotes.innerHTML = `
          <span class="pakad-hindi">${pakadData.hindi}</span>
          <span class="pakad-roman">(${pakadData.roman})</span>
        `;
        pakadSection.style.display = 'block';
      }
    } else {
      pakadSection.style.display = 'none';
    }

    // Start listening
    try {
      await this.audioEngine.init();
      await this.audioEngine.startListening();

      this.pitchDetector = new PitchDetector(this.audioEngine, { baseSa: this.baseSa });
      this.pitchDetector.onPitchDetected = (pitchData) => {
        this.handleExercisePitch(pitchData);
      };
      this.pitchDetector.onSilence = () => {
        this.exerciseSwarDisplay.showSilence();
      };
      this.pitchDetector.start();

      this.exerciseWaveform.start(this.audioEngine);
      this.isListening = true;

      // Start tanpura
      this.tanpura.start();
      document.getElementById('exerciseTanpuraBtn')?.classList.add('active');

      // Generate first swar
      this.nextExerciseSwar();

      // Play the target
      setTimeout(() => {
        if (this.targetFrequency) {
          this.synthesizer.playFrequency(this.targetFrequency, 1.5);
        }
      }, 500);
    } catch (error) {
      console.error('Failed to start exercise:', error);
      alert(error.message);
    }
  }

  nextExerciseSwar() {
    this.swarCompleted = false;
    this.matchStartTime = null;

    let semitone, shrutiData;

    if (this.currentRaga) {
      // Pick from raga's notes
      const noteData = getRandomRagaNote(this.currentRaga.id, this.baseSa);
      semitone = noteData.semitone;
      this.targetFrequency = noteData.frequency;
    } else {
      // Random from Bilawal (major) scale for basic exercise
      const bilawalSemitones = [0, 2, 4, 5, 7, 9, 11];
      semitone = bilawalSemitones[Math.floor(Math.random() * bilawalSemitones.length)];
      this.targetFrequency = this.baseSa * Math.pow(2, semitone / 12);
    }

    shrutiData = SHRUTI_MAP[semitone % 12];
    this.targetSwar = { ...shrutiData, semitone, frequency: this.targetFrequency };

    // Update display
    const targetDisplay = document.getElementById('targetSwarDisplay');
    targetDisplay.textContent = shrutiData.hindi;
    targetDisplay.style.color = 'var(--color-primary)';

    this.sessionStats.exerciseCount++;
    this.updateExerciseStats();

    // Play the target note
    this.synthesizer.playFrequency(this.targetFrequency, 1.5);
  }

  handleExercisePitch(pitchData) {
    const comparison = compareToTarget(pitchData.frequency, this.targetFrequency);

    this.exerciseSwarDisplay.updateWithTarget(pitchData, comparison, this.targetSwar);
    this.exerciseAccuracy.updateFromCents(comparison.cents);

    // Check for correct match
    if (comparison.isMatching && (comparison.accuracy === 'shuddha' || comparison.accuracy === 'acceptable')) {
      if (!this.swarCompleted) {
        if (!this.matchStartTime) {
          this.matchStartTime = Date.now();
        } else if (Date.now() - this.matchStartTime >= this.requiredMatchDuration) {
          this.swarCompleted = true;
          this.sessionStats.correctCount++;
          this.sessionStats.streak++;
          if (this.sessionStats.streak > this.sessionStats.maxStreak) {
            this.sessionStats.maxStreak = this.sessionStats.streak;
          }
          this.updateExerciseStats();

          // Visual feedback
          document.getElementById('targetSwarDisplay').style.color = 'var(--color-success)';
        }
      }
    } else {
      this.matchStartTime = null;
    }
  }

  updateExerciseStats() {
    document.getElementById('exerciseCorrect').textContent = this.sessionStats.correctCount;
    document.getElementById('exerciseStreak').textContent = this.sessionStats.streak;
    document.getElementById('exerciseTotal').textContent = this.sessionStats.exerciseCount;
  }

  stopExercise() {
    this.stopListening();
    this.exerciseWaveform?.stop();
    this.tanpura.stop();

    // Update tanpura button
    document.getElementById('exerciseTanpuraBtn')?.classList.remove('active');
    document.getElementById('tanpuraToggleBtn')?.classList.remove('active');

    // Save session
    if (this.sessionStats.exerciseCount > 0) {
      recordSession({
        type: this.exerciseMode,
        ragaId: this.currentRaga?.id,
        exerciseCount: this.sessionStats.exerciseCount,
        correctCount: this.sessionStats.correctCount,
        streak: this.sessionStats.maxStreak
      });
    }

    this.exerciseMode = null;
    this.currentRaga = null;
    this.targetSwar = null;
    this.targetFrequency = null;
  }

  updateHomeStats() {
    const progress = getProgress();
    document.getElementById('totalSessions').textContent = progress.totalSessions;
    document.getElementById('totalAccuracy').textContent = `${getOverallAccuracy()}%`;
    document.getElementById('bestStreak').textContent = progress.bestStreak;
  }

  updateProgressStats() {
    const progress = getProgress();
    document.getElementById('progressSessions').textContent = progress.totalSessions;
    document.getElementById('progressExercises').textContent = progress.totalExercises;
    document.getElementById('progressAccuracy').textContent = `${getOverallAccuracy()}%`;
    document.getElementById('progressStreak').textContent = progress.bestStreak;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.swarSadhana = new SwarSadhanaApp();
});
