// ---------------------------------------------------------------------------
// Sound system — procedural Web Audio API synthesis, no external files
// ---------------------------------------------------------------------------

export type SoundName =
  | 'launch'
  | 'success'
  | 'fail'
  | 'levelUp'
  | 'coin'
  | 'achievement'
  | 'click'
  | 'notification'
  | 'dailyBonus'

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

interface SoundPrefs { music: boolean; sfx: boolean }

function loadPrefs(): SoundPrefs {
  try {
    const raw = localStorage.getItem('roost.sound')
    if (!raw) return { music: true, sfx: true }
    const p = JSON.parse(raw) as Partial<SoundPrefs>
    return {
      music: typeof p.music === 'boolean' ? p.music : true,
      sfx:   typeof p.sfx   === 'boolean' ? p.sfx   : true,
    }
  } catch {
    return { music: true, sfx: true }
  }
}

function savePrefs(p: SoundPrefs): void {
  try { localStorage.setItem('roost.sound', JSON.stringify(p)) } catch {}
}

let prefs: SoundPrefs = loadPrefs()

export function isMusicEnabled(): boolean { return prefs.music }
export function isSfxEnabled():   boolean { return prefs.sfx }

export function setMusicEnabled(on: boolean): void {
  prefs = { ...prefs, music: on }
  savePrefs(prefs)
  if (!on) stopAmbient()
  else      startAmbient()
}

export function setSfxEnabled(on: boolean): void {
  prefs = { ...prefs, sfx: on }
  savePrefs(prefs)
}

// ---------------------------------------------------------------------------
// AudioContext — lazy, single shared instance
// ---------------------------------------------------------------------------

let _ctx: AudioContext | null = null

function ctx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new AudioContext()
  }
  if (_ctx.state === 'suspended') {
    _ctx.resume().catch(() => {})
  }
  return _ctx
}

// ---------------------------------------------------------------------------
// Ambient pad state
// ---------------------------------------------------------------------------

let ambientOsc:  OscillatorNode | null = null
let ambientLfo:  OscillatorNode | null = null
let ambientGain: GainNode       | null = null

// ---------------------------------------------------------------------------
// Low-level synth utilities
// ---------------------------------------------------------------------------

function masterGain(ac: AudioContext, volume: number): GainNode {
  const g = ac.createGain()
  g.gain.setValueAtTime(volume, ac.currentTime)
  g.connect(ac.destination)
  return g
}

/** Sine oscillator with ADSR-like envelope via exponential ramps. */
function playSine(
  ac: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  peakGain: number,
  dest: AudioNode = ac.destination,
): OscillatorNode {
  const osc = ac.createOscillator()
  const gain = ac.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, startTime)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(gain)
  gain.connect(dest)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)
  return osc
}

/** Frequency sweep on a sine. */
function playSweep(
  ac: AudioContext,
  freqStart: number,
  freqEnd: number,
  startTime: number,
  duration: number,
  peakGain: number,
): void {
  const osc = ac.createOscillator()
  const gain = ac.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(freqStart, startTime)
  osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)
}

/** Short brown-noise burst. */
function playNoise(
  ac: AudioContext,
  startTime: number,
  duration: number,
  volume: number,
): void {
  const bufferSize = Math.ceil(ac.sampleRate * (duration + 0.02))
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  // Brown noise: integrate white noise
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }

  const src = ac.createBufferSource()
  src.buffer = buffer

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  src.connect(gain)
  gain.connect(ac.destination)
  src.start(startTime)
  src.stop(startTime + duration + 0.05)
}

/** Simple convolver-based reverb tail using impulse response synthesis. */
function createReverb(ac: AudioContext, decaySec: number): ConvolverNode {
  const len = Math.ceil(ac.sampleRate * decaySec)
  const buffer = ac.createBuffer(2, len, ac.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buffer.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2)
    }
  }
  const conv = ac.createConvolver()
  conv.buffer = buffer
  return conv
}

// ---------------------------------------------------------------------------
// Individual sound synthesizers
// ---------------------------------------------------------------------------

function soundLaunch(ac: AudioContext): void {
  // Ascending sine sweep 220Hz → 440Hz over 0.3s
  playSweep(ac, 220, 440, ac.currentTime, 0.3, 0.35)
}

function soundSuccess(ac: AudioContext): void {
  // Major chord arpeggio C5-E5-G5, each 0.15s apart
  const t = ac.currentTime
  const freqs = [523.25, 659.25, 783.99] // C5, E5, G5
  freqs.forEach((f, i) => {
    playSine(ac, f, t + i * 0.15, 0.4, 0.3)
  })
}

function soundFail(ac: AudioContext): void {
  // Descending 400Hz → 200Hz over 0.4s with tremolo
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const tremLfo = ac.createOscillator()
  const tremGain = ac.createGain()
  const gain = ac.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(400, t)
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.4)

  tremLfo.type = 'sine'
  tremLfo.frequency.setValueAtTime(12, t)
  tremGain.gain.setValueAtTime(0.15, t)

  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)

  tremLfo.connect(tremGain)
  tremGain.connect(gain.gain)
  osc.connect(gain)
  gain.connect(ac.destination)

  tremLfo.start(t)
  tremLfo.stop(t + 0.45)
  osc.start(t)
  osc.stop(t + 0.45)
}

function soundLevelUp(ac: AudioContext): void {
  // Triumphant fanfare C5, E5, G5, C6 with reverb tail
  const t = ac.currentTime
  const freqs = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  const reverb = createReverb(ac, 1.5)
  const reverbGain = ac.createGain()
  reverbGain.gain.setValueAtTime(0.25, t)
  reverb.connect(reverbGain)
  reverbGain.connect(ac.destination)

  freqs.forEach((f, i) => {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f, t + i * 0.1)
    g.gain.setValueAtTime(0.0001, t + i * 0.1)
    g.gain.exponentialRampToValueAtTime(0.4, t + i * 0.1 + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.1 + 0.5)
    osc.connect(g)
    g.connect(ac.destination)
    g.connect(reverb)
    osc.start(t + i * 0.1)
    osc.stop(t + i * 0.1 + 0.6)
  })
}

function soundCoin(ac: AudioContext): void {
  // Short crisp sine ping at 880Hz, 0.1s decay
  playSine(ac, 880, ac.currentTime, 0.1, 0.4)
}

function soundAchievement(ac: AudioContext): void {
  // Bell-like at 660Hz with long decay using harmonics
  const t = ac.currentTime
  const harmonics = [660, 1320, 1980]
  const gains      = [0.4, 0.2, 0.1]
  harmonics.forEach((f, i) => {
    playSine(ac, f, t, 1.5 - i * 0.2, gains[i])
  })
}

function soundClick(ac: AudioContext): void {
  // Very short brown noise burst 0.05s
  playNoise(ac, ac.currentTime, 0.05, 0.3)
}

function soundNotification(ac: AudioContext): void {
  // Two-tone chime: 523Hz then 659Hz
  const t = ac.currentTime
  playSine(ac, 523.25, t,        0.2, 0.3)
  playSine(ac, 659.25, t + 0.18, 0.2, 0.3)
}

function soundDailyBonus(ac: AudioContext): void {
  // Sparkly ascending arpeggio — 6 notes with slight shimmer
  const t = ac.currentTime
  const freqs = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]
  freqs.forEach((f, i) => {
    playSine(ac, f, t + i * 0.09, 0.35, 0.28)
    // Add a faint upper octave shimmer
    playSine(ac, f * 2, t + i * 0.09, 0.15, 0.08)
  })
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

const SYNTHS: Record<SoundName, (ac: AudioContext) => void> = {
  launch:       soundLaunch,
  success:      soundSuccess,
  fail:         soundFail,
  levelUp:      soundLevelUp,
  coin:         soundCoin,
  achievement:  soundAchievement,
  click:        soundClick,
  notification: soundNotification,
  dailyBonus:   soundDailyBonus,
}

export function playSound(name: SoundName): void {
  if (!prefs.sfx) return
  try {
    const ac = ctx()
    SYNTHS[name](ac)
  } catch {
    // Ignore: AudioContext might be unavailable (SSR, test environment, etc.)
  }
}

// ---------------------------------------------------------------------------
// Ambient pad — slow LFO-modulated oscillator that loops
// ---------------------------------------------------------------------------

export function startAmbient(): void {
  if (!prefs.music) return
  if (ambientOsc) return // already running

  try {
    const ac = ctx()
    const t = ac.currentTime

    // Base pad: sine at a low drone (A2 = 110 Hz)
    ambientOsc = ac.createOscillator()
    ambientOsc.type = 'sine'
    ambientOsc.frequency.setValueAtTime(110, t)

    // LFO for gentle pitch wobble
    ambientLfo = ac.createOscillator()
    ambientLfo.type = 'sine'
    ambientLfo.frequency.setValueAtTime(0.15, t) // very slow wobble

    const lfoGain = ac.createGain()
    lfoGain.gain.setValueAtTime(3, t) // ±3 Hz modulation depth

    // Master gain — low volume pad
    ambientGain = ac.createGain()
    ambientGain.gain.setValueAtTime(0.0001, t)
    ambientGain.gain.linearRampToValueAtTime(0.07, t + 2) // fade in over 2s

    ambientLfo.connect(lfoGain)
    lfoGain.connect(ambientOsc.frequency)
    ambientOsc.connect(ambientGain)
    ambientGain.connect(ac.destination)

    ambientLfo.start(t)
    ambientOsc.start(t)
  } catch {
    // Unavailable
  }
}

export function stopAmbient(): void {
  if (!ambientGain || !ambientOsc || !ambientLfo) return
  try {
    const ac = ctx()
    const t = ac.currentTime
    // Fade out over 1s before disconnecting
    ambientGain.gain.linearRampToValueAtTime(0.0001, t + 1)
    const osc  = ambientOsc
    const lfo  = ambientLfo
    const gain = ambientGain
    setTimeout(() => {
      try {
        osc.stop()
        lfo.stop()
        gain.disconnect()
      } catch {}
    }, 1100)
  } catch {}

  ambientOsc  = null
  ambientLfo  = null
  ambientGain = null
}
