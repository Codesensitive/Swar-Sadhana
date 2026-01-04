# स्वरसाधना (SwarSadhana)

🎵 **Indian Classical Music Vocal Trainer** - Practice Sa Re Ga Ma Pa Da Ni with real-time pitch detection

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tone.js](https://img.shields.io/badge/Tone.js-F734AD?style=flat)](https://tonejs.github.io/)

## Features

- 🎤 **Real-time Pitch Detection** - Accurate voice recognition with YIN algorithm
- 🎹 **Sa Re Ga Ma Pa Da Ni** - Practice using Indian Sargam notation
- 🎻 **Tanpura Drone** - Authentic Sa-Pa drone accompaniment
- 📀 **5 Popular Ragas** - Bilawal, Yaman, Bhairav, Kafi, Bhairavi
- 🎯 **Visual Feedback** - See your pitch accuracy in real-time
- 🌙 **Beautiful Indian Theme** - Saffron/maroon color palette with Devanagari script

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at **http://localhost:5174/**

## How to Use

1. **Go to Practice (अभ्यास)** screen
2. **Click any Swar key** (Sa, Re, Ga, Ma, Pa, Da, Ni)
3. **Listen to the reference note** that plays automatically
4. **Sing the note** - the app will detect your pitch!
5. **Watch the feedback** - it shows:
   - Your detected Swar in Devanagari (सा, रे, ग...)
   - Cents deviation from perfect pitch
   - Direction hints (sing higher/lower)

### Tanpura Drone

Click the 🎻 **Tanpura** button to play a continuous Sa-Pa drone while you practice.

### Raga Practice

Choose from 5 classical ragas:

| Raga | Hindi | Time | Notes |
|------|-------|------|-------|
| Bilawal | बिलावल | Morning | All Shuddha (Natural) |
| Yaman | यमन | Evening | Tivra Ma (Sharp 4th) |
| Bhairav | भैरव | Early Morning | Komal Re, Da |
| Kafi | काफी | Late Night | Komal Ga, Ni |
| Bhairavi | भैरवी | Morning | All Komal except Ma |

## Tech Stack

- **Vite** - Fast build tool
- **Tone.js** - Audio synthesis (Tanpura drone, reference notes)
- **pitchfinder** - YIN algorithm for pitch detection
- **Vanilla JS** - No framework bloat
- **Noto Sans Devanagari** - Beautiful Hindi typography

## Project Structure

```
SwarSadhana/
├── src/
│   ├── audio/
│   │   ├── AudioEngine.js      # Microphone handling
│   │   ├── PitchDetector.js    # YIN pitch detection
│   │   ├── TanpuraSynth.js     # Tanpura drone
│   │   └── SwarSynthesizer.js  # Reference note playback
│   ├── components/
│   │   ├── SwarDisplay.js      # Pitch display (Devanagari)
│   │   ├── SwarKeyboard.js     # Interactive Swar keys
│   │   ├── AccuracyMeter.js    # Visual accuracy gauge
│   │   └── WaveformVisualizer.js
│   ├── utils/
│   │   ├── swarUtils.js        # Indian music theory
│   │   ├── ragaDatabase.js     # 5 raga definitions
│   │   └── storageUtils.js     # Progress persistence
│   ├── styles/
│   │   └── index.css           # Indian theme
│   └── main.js                 # Main application
├── index.html
├── package.json
└── vite.config.js
```

## Music Theory

The app uses the 12-semitone equal temperament (12-TET) system:

| Swar | Semitone | Frequency (C4 base) |
|------|----------|---------------------|
| Sa | 0 | 261.63 Hz |
| Re (Shuddha) | 2 | 293.66 Hz |
| Ga (Shuddha) | 4 | 329.63 Hz |
| Ma (Shuddha) | 5 | 349.23 Hz |
| Pa | 7 | 392.00 Hz |
| Da (Shuddha) | 9 | 440.00 Hz |
| Ni (Shuddha) | 11 | 493.88 Hz |

Komal (flat) and Tivra (sharp) variants are supported for all applicable notes.

## License

MIT

---

Made with ❤️ for Indian Classical Music enthusiasts
