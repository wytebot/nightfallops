// Entirely procedural audio: no downloads, no remote fonts/assets, works offline after the first gesture.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let enabled = true;
let masterLevel = 0.8;
let musicLevel = 0.34;
let sfxLevel = 0.8;
let ambientTimer: number | undefined;
let ambienceNodes: AudioNode[] = [];
let ambienceOscillators: OscillatorNode[] = [];
let ambienceLocation = '';
let combatIntensity = 0;
const noiseCache = new Map<string, AudioBuffer>();

function audio(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null;
  const C = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
  if (!C) return null;
  if (!ctx) {
    ctx = new C();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 16;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.18;
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(compressor);
    compressor.connect(ctx.destination);
    applyLevels();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
function applyLevels() {
  if (!ctx || !master || !musicBus || !sfxBus) return;
  const now = ctx.currentTime;
  master.gain.setTargetAtTime(enabled ? masterLevel : 0, now, 0.035);
  musicBus.gain.setTargetAtTime(musicLevel, now, 0.08);
  sfxBus.gain.setTargetAtTime(sfxLevel, now, 0.025);
}
export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (!value) stopAmbient();
  else if (ambienceLocation) startAmbient(ambienceLocation);
  applyLevels();
}
export function setAudioLevels(levels: { master?: number; music?: number; sfx?: number }) {
  if (levels.master !== undefined) masterLevel = Math.max(0, Math.min(1, levels.master));
  if (levels.music !== undefined) musicLevel = Math.max(0, Math.min(1, levels.music));
  if (levels.sfx !== undefined) sfxLevel = Math.max(0, Math.min(1, levels.sfx));
  audio(); applyLevels();
}
function destination(bus: 'music' | 'sfx' = 'sfx'): AudioNode | null {
  audio(); return bus === 'music' ? musicBus : sfxBus;
}
export function tone(freq: number, duration = 0.08, wave: OscillatorType = 'sine', volume = 0.035, slide = 0, bus: 'music' | 'sfx' = 'sfx') {
  const c = audio(), dest = destination(bus);
  if (!c || !dest) return;
  const oscillator = c.createOscillator(), gain = c.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(Math.max(25, freq), c.currentTime);
  if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, freq + slide), c.currentTime + duration);
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), c.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  oscillator.connect(gain); gain.connect(dest); oscillator.start(); oscillator.stop(c.currentTime + duration + 0.025);
}
function getNoiseBuffer(c: AudioContext, duration: number): AudioBuffer {
  const frames = Math.max(1, Math.floor(c.sampleRate * duration));
  const key = `${c.sampleRate}:${frames}`;
  const cached = noiseCache.get(key); if (cached) return cached;
  const buffer = c.createBuffer(1, frames, c.sampleRate), data = buffer.getChannelData(0);
  // Cached brown-ish noise; taper edges to avoid clicks.
  let brown = 0;
  for (let i = 0; i < frames; i++) { brown = (brown + (Math.random() * 2 - 1) * 0.08) / 1.02; const edge = Math.min(1, i / (c.sampleRate * 0.02), (frames - i) / (c.sampleRate * 0.04)); data[i] = brown * 3.5 * edge; }
  noiseCache.set(key, buffer); return buffer;
}
export function noise(duration = 0.12, volume = 0.04, filter = 1200, bus: 'music' | 'sfx' = 'sfx') {
  const c = audio(), dest = destination(bus); if (!c || !dest) return;
  const source = c.createBufferSource(), band = c.createBiquadFilter(), gain = c.createGain();
  source.buffer = getNoiseBuffer(c, duration); band.type = 'lowpass'; band.frequency.value = filter;
  gain.gain.setValueAtTime(volume, c.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  source.connect(band); band.connect(gain); gain.connect(dest); source.start(); source.stop(c.currentTime + duration + 0.02);
}
function stopAmbienceNodes() {
  if (ambientTimer !== undefined) window.clearInterval(ambientTimer);
  ambientTimer = undefined;
  ambienceOscillators.forEach(o => { try { o.stop(); } catch { /* already stopped */ } });
  ambienceOscillators = []; ambienceNodes.forEach(n => { try { n.disconnect(); } catch { /* already disconnected */ } }); ambienceNodes = [];
}
export function startAmbient(location = 'Blackroot Jungle') {
  ambienceLocation = location;
  if (ambientTimer || !enabled) return;
  const c = audio(), bus = destination('music'); if (!c || !bus) return;
  const low = c.createOscillator(), filter = c.createBiquadFilter(), gain = c.createGain();
  low.type = 'triangle'; low.frequency.value = location.includes('Street') || location.includes('School') ? 46 : 38;
  filter.type = 'lowpass'; filter.frequency.value = 130 + combatIntensity * 620;
  gain.gain.value = 0.04 + combatIntensity * 0.045;
  low.connect(filter); filter.connect(gain); gain.connect(bus); low.start();
  ambienceOscillators.push(low); ambienceNodes.push(filter, gain);
  // A second quiet filtered wind layer; all buffers and oscillators are generated locally.
  const wind = c.createOscillator(), windFilter = c.createBiquadFilter(), windGain = c.createGain();
  wind.type = 'sawtooth'; wind.frequency.value = location.includes('Highlands') ? 76 : 54;
  windFilter.type = 'lowpass'; windFilter.frequency.value = 190;
  windGain.gain.value = 0.008; wind.connect(windFilter); windFilter.connect(windGain); windGain.connect(bus); wind.start();
  ambienceOscillators.push(wind); ambienceNodes.push(windFilter, windGain);
  const chirp = () => {
    if (!enabled) return;
    if (location.includes('River')) noise(.32, .009, 540, 'music');
    else if (location.includes('Highlands')) { noise(.22, .006, 900, 'music'); if(Math.random()<.06){noise(.85,.018,150,'music');tone(54,.9,'sine',.018,-20,'music');} }
    else if (location.includes('Flooded')) { tone(150 + Math.random() * 30, .12, 'sine', .003, -15, 'music'); tone(2100 + Math.random() * 500, .025, 'sine', .002, -200, 'music'); }
    else { tone(2050 + Math.random() * 950, .035, 'sine', location.includes('Ashen') ? .001 : .0025, -300, 'music'); if (Math.random() < .2) tone(150 + Math.random() * 50, .28, 'sine', .003, -35, 'music'); }
  };
  chirp(); ambientTimer = window.setInterval(chirp, location.includes('School') ? 3200 : 1900);
}
export function setCombatIntensity(active: boolean) {
  combatIntensity = active ? 1 : 0;
  if (!ctx || !ambienceNodes.length) return;
  const filter = ambienceNodes.find(n => n instanceof BiquadFilterNode) as BiquadFilterNode | undefined;
  if (filter) filter.frequency.setTargetAtTime(active ? 760 : 190, ctx.currentTime, 0.25);
}
export function stopAmbient() { stopAmbienceNodes(); }
export const sfx = {
  click: () => tone(620, .035, 'square', .018, -100),
  select: () => { tone(420, .05, 'triangle', .025); setTimeout(() => tone(660, .07, 'triangle', .02), 45); },
  shoot: () => { noise(.085, .09, 1800); tone(95, .09, 'sawtooth', .045, -35); },
  assault: () => { noise(.052, .072, 2200); tone(118, .06, 'sawtooth', .038, -42); },
  shotgun: () => { noise(.19, .13, 1100); tone(68, .2, 'sawtooth', .065, -48); tone(880, .035, 'square', .012, -550); },
  launcher: () => { noise(.16, .11, 850); tone(92, .22, 'sawtooth', .05, -45); tone(420, .12, 'triangle', .025, -260); },
  flame: () => { noise(.11, .055, 1500); tone(165, .12, 'sawtooth', .022, 85); },
  reload: () => { tone(480, .025, 'square', .012, -160); setTimeout(() => tone(740, .045, 'triangle', .018, -100), 110); },
  enemyShot: () => { noise(.07, .045, 1500); tone(125, .06, 'square', .018, -25); },
  hit: () => { noise(.09, .055, 700); tone(180, .1, 'sawtooth', .025, -90); },
  death: () => { tone(145, .65, 'sawtooth', .055, -100); setTimeout(() => tone(78, .9, 'sine', .035, -30), 240); },
  step: (surface = 'earth') => { noise(.055, surface === 'water' ? .016 : .012, surface === 'rock' ? 780 : 420); },
  bomb: () => { noise(.5, .14, 600); tone(70, .48, 'sawtooth', .065, -45); setTimeout(() => noise(.38, .035, 320), 140); },
  coin: () => { tone(880, .08, 'sine', .045); setTimeout(() => tone(1320, .12, 'sine', .04), 70); },
  success: () => { tone(520, .12, 'triangle', .04); setTimeout(() => tone(780, .15, 'triangle', .04), 110); setTimeout(() => tone(1040, .22, 'triangle', .04), 240); },
  alert: () => { tone(260, .12, 'square', .025); setTimeout(() => tone(330, .14, 'square', .025), 130); },
  breath: () => { noise(.48, .012, 380); tone(78, .42, 'sine', .012, -12); },
  heartbeat: () => { tone(58, .09, 'sine', .04, -12); setTimeout(() => tone(52, .11, 'sine', .035, -10), 150); },
  levelUp: () => { tone(440, .08, 'triangle', .035, 80); setTimeout(() => tone(660, .1, 'triangle', .04, 100), 100); setTimeout(() => tone(990, .18, 'triangle', .045, 150), 230); },
};
