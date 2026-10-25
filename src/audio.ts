// Audio engine: recorded samples bundled in /public/audio (background music loop, gunshots, footsteps, UI click)
// with the original procedural synth kept as an automatic fallback. Everything is local, so it works offline.
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

// ---- Recorded samples ------------------------------------------------------------------------
const SAMPLE_FILES: Record<string, string> = {
  music: '/audio/music-action-loop.mp3', click: '/audio/sfx-click.mp3', bombExplosion: '/audio/sfx-bomb-explosion.mp3', bulletWhiz: '/audio/sfx-bullet-whiz.mp3', enemyPain: '/audio/sfx-enemy-pain.mp3',
  gun1: '/audio/sfx-gun-1.mp3', gun2: '/audio/sfx-gun-2.mp3', gun3: '/audio/sfx-gun-3.mp3', gunHeavy: '/audio/sfx-gun-heavy.mp3',
  step1: '/audio/sfx-step-1.mp3', step2: '/audio/sfx-step-2.mp3', step3: '/audio/sfx-step-3.mp3',
  step4: '/audio/sfx-step-4.mp3', step5: '/audio/sfx-step-5.mp3', step6: '/audio/sfx-step-6.mp3'
};
const MUSIC_LOOP_SECONDS = 16;      // exact musical length of the loop (MP3 encoder padding is ignored)
const MUSIC_TRIM = 1.6;             // sample gain so the default Music slider (34%) sits clearly under gunfire
const MUSIC_MENU_SCALE = 0.6;       // quieter bed while browsing menus
const samples = new Map<string, AudioBuffer>();
const weaponSamples = new Map<string, AudioBuffer>();
const weaponSampleLoads = new Map<string, Promise<void>>();
const BASE = import.meta.env.BASE_URL || '/';
const assetUrl = (path: string) => `${BASE}${path.replace(/^\//, '')}`;
const WEAPON_IDS = ['pistol','revolver','smg','assault-rifle','carbine','marksman','machine-gun','shotgun','anti-material-rifle','minigun','rpg','grenade-launcher','hand-grenade','flamethrower','plasma-rifle','rail-cannon','legendary'];
function loadWeaponSample(id: string) {
  if (weaponSamples.has(id) || weaponSampleLoads.has(id)) return weaponSampleLoads.get(id);
  const c = audio(); if (!c) return;
  const task = fetch(assetUrl(`/audio/weapons/${id}/fire.mp3`)).then(r => { if (!r.ok) throw new Error('missing slot'); return r.arrayBuffer(); }).then(data => decode(c, data)).then(buffer => { weaponSamples.set(id, buffer); }).catch(() => { /* shared samples and synth remain the guaranteed fallback */ }).finally(() => { weaponSampleLoads.delete(id); });
  weaponSampleLoads.set(id, task); return task;
}
export function checkWeaponAudioSlots() {
  const report = WEAPON_IDS.map(id => ({ id, loaded: weaponSamples.has(id), expected: assetUrl(`/audio/weapons/${id}/fire.mp3`) }));
  if (typeof console !== 'undefined') console.info('[Nightfall audio] Per-weapon slots are loaded on demand; shared fallback is active for any missing slot.', report);
  return report;
}
let samplesLoading: Promise<void> | null = null;
let musicSource: AudioBufferSourceNode | null = null;
let musicGain: GainNode | null = null;
let musicScene: 'menu' | 'mission' = 'menu';
let activeVoices = 0;
let gunVariant = 0;

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
function decode(c: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  // Callback form keeps older WebViews/Safari working as well as the promise form.
  return new Promise((resolve, reject) => { c.decodeAudioData(data, resolve, reject); });
}
function loadSamples(): Promise<void> {
  if (samplesLoading) return samplesLoading;
  const c = audio(); if (!c) return Promise.resolve();
  samplesLoading = Promise.all(Object.entries(SAMPLE_FILES).map(async ([key, url]) => {
    try { const res = await fetch(url); if (!res.ok) return; samples.set(key, await decode(c, await res.arrayBuffer())); }
    catch { /* missing or undecodable file: the procedural synth fallback keeps working */ }
  })).then(() => { if (enabled) startMusic(); });
  return samplesLoading;
}
function playSample(key: string, opts: { volume?: number; rate?: number; bus?: 'music' | 'sfx'; lowpass?: number; maxVoices?: number } = {}): boolean {
  const c = audio(), buffer = samples.get(key), dest = destination(opts.bus ?? 'sfx');
  if (!c || !buffer || !dest) return false;
  if (activeVoices >= (opts.maxVoices ?? 10)) return true; // voice limit: skip quietly so fast weapons never pile up
  const source = c.createBufferSource(), gain = c.createGain();
  source.buffer = buffer; source.playbackRate.value = opts.rate ?? 1; gain.gain.value = opts.volume ?? 1;
  let node: AudioNode = source;
  if (opts.lowpass) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.lowpass; source.connect(f); node = f; }
  node.connect(gain); gain.connect(dest);
  activeVoices++;
  source.onended = () => { activeVoices = Math.max(0, activeVoices - 1); try { gain.disconnect(); } catch { /* already disconnected */ } };
  source.start();
  return true;
}
function playWeaponSlot(id: string, volume: number, rate: number): boolean {
  const c = audio(), buffer = weaponSamples.get(id), dest = destination('sfx');
  if (!c || !buffer || !dest) return false;
  if (activeVoices >= 10) return true;
  const source = c.createBufferSource(), gain = c.createGain(); source.buffer = buffer;
  source.playbackRate.value = rate * (1 + (Math.random() - .5) * .045); gain.gain.value = volume;
  source.connect(gain); gain.connect(dest); activeVoices++;
  source.onended = () => { activeVoices = Math.max(0, activeVoices - 1); try { gain.disconnect(); } catch { /* already disconnected */ } };
  source.start(); return true;
}
function applyMusicScene(fade = 0.6) {
  if (!ctx || !musicGain) return;
  const target = MUSIC_TRIM * (musicScene === 'mission' ? 1 + combatIntensity * 0.12 : MUSIC_MENU_SCALE);
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setTargetAtTime(target, ctx.currentTime, Math.max(0.05, fade / 3));
}
function startMusic() {
  if (musicSource || !enabled) return;
  const c = audio(), buffer = samples.get('music'), bus = destination('music');
  if (!c || !buffer || !bus) return;
  musicGain = c.createGain(); musicGain.gain.value = 0;
  const source = c.createBufferSource();
  source.buffer = buffer; source.loop = true; source.loopStart = 0; source.loopEnd = Math.min(buffer.duration, MUSIC_LOOP_SECONDS);
  source.connect(musicGain); musicGain.connect(bus); source.start();
  musicSource = source; applyMusicScene(1.4);
}
function stopMusic() {
  if (musicSource) { try { musicSource.stop(); } catch { /* already stopped */ } try { musicSource.disconnect(); } catch { /* ok */ } musicSource = null; }
  if (musicGain) { try { musicGain.disconnect(); } catch { /* ok */ } musicGain = null; }
}
/** Menus play the action loop softly; missions play it at full level and lift it slightly in combat. */
export function setMusicScene(scene: 'menu' | 'mission') { musicScene = scene; applyMusicScene(0.9); }
export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (!value) { stopAmbient(); stopMusic(); }
  else { if (ambienceLocation) startAmbient(ambienceLocation); void loadSamples().then(startMusic); }
  applyLevels();
}
if (typeof window !== 'undefined') {
  // Browsers/WebViews only allow audio after a gesture: load samples and start the loop on the first tap or key press.
  const unlock = () => { if (!enabled) return; audio(); void loadSamples(); };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  // Never keep playing while the app is backgrounded or the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend(); else if (enabled) void ctx.resume();
  });
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
  if (!samples.has('music')) {
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
  }
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
  applyMusicScene(0.5);
  if (!ctx || !ambienceNodes.length) return;
  const filter = ambienceNodes.find(n => n instanceof BiquadFilterNode) as BiquadFilterNode | undefined;
  if (filter) filter.frequency.setTargetAtTime(active ? 760 : 190, ctx.currentTime, 0.25);
}
export function stopAmbient() { stopAmbienceNodes(); }
type GunProfile = { rate: number; volume: number; heavy?: boolean };
// Sound character per weapon: pitch (playback rate) and loudness over the recorded shot samples.
const GUN_PROFILES: Record<string, GunProfile> = {
  pistol: { rate: 1.08, volume: 0.7 }, revolver: { rate: 0.86, volume: 0.9 }, smg: { rate: 1.32, volume: 0.5 },
  'assault-rifle': { rate: 1.0, volume: 0.62 }, carbine: { rate: 1.1, volume: 0.6 }, marksman: { rate: 0.82, volume: 0.8 },
  'machine-gun': { rate: 1.18, volume: 0.55 }, 'anti-material-rifle': { rate: 0.62, volume: 1, heavy: true },
  minigun: { rate: 1.42, volume: 0.42 }, shotgun: { rate: 0.74, volume: 0.95, heavy: true }
};
function playGun(profile: GunProfile, volumeScale = 1) {
  const key = profile.heavy ? 'gunHeavy' : (['gun1', 'gun2', 'gun3'] as const)[gunVariant++ % 3];
  playSample(key, { volume: profile.volume * volumeScale, rate: profile.rate * (1 + (Math.random() - 0.5) * 0.08), maxVoices: 8 });
}
export const sfx = {
  click: () => { if (!playSample('click', { volume: 0.55 })) tone(620, .035, 'square', .018, -100); },
  select: () => { if (!playSample('click', { volume: 0.7, rate: 1.3 })) { tone(420, .05, 'triangle', .025); setTimeout(() => tone(660, .07, 'triangle', .02), 45); } },
  /** Weapon fire. `volumeScale` lets squad members fire quieter than the player. */
  weapon: (id: string, kind?: string, volumeScale = 1) => {
    if (kind === 'rocket') { playSample('gunHeavy', { volume: 0.58 * volumeScale, rate: 0.5, maxVoices: 6 }); sfx.launcher(); return; }
    if (kind === 'grenade' || id === 'hand-grenade' || id === 'grenade-launcher') { sfx.launcher(); void loadWeaponSample(id); return; }
    if (kind === 'flame' || id === 'flamethrower') { sfx.flame(); void loadWeaponSample(id); return; }
    const profile = GUN_PROFILES[id] || ({'plasma-rifle':{rate:1.12,volume:.56},'rail-cannon':{rate:.58,volume:.95,heavy:true},legendary:{rate:.9,volume:.82},rpg:{rate:.52,volume:.9,heavy:true},'grenade-launcher':{rate:.7,volume:.8,heavy:true}} as Record<string,GunProfile>)[id];
    if (playWeaponSlot(id, (profile?.volume ?? .62) * volumeScale, profile?.rate ?? 1)) return;
    void loadWeaponSample(id);
    if (profile && samples.has('gun1')) { playGun(profile, volumeScale); return; }
    if (id === 'shotgun') sfx.shotgun(); else sfx.assault();
  },
  shoot: () => { noise(.085, .09, 1800); tone(95, .09, 'sawtooth', .045, -35); },
  assault: () => { noise(.052, .072, 2200); tone(118, .06, 'sawtooth', .038, -42); },
  shotgun: () => { noise(.19, .13, 1100); tone(68, .2, 'sawtooth', .065, -48); tone(880, .035, 'square', .012, -550); },
  launcher: () => { noise(.16, .11, 850); tone(92, .22, 'sawtooth', .05, -45); tone(420, .12, 'triangle', .025, -260); },
  flame: () => { noise(.11, .055, 1500); tone(165, .12, 'sawtooth', .022, 85); },
  reload: () => { tone(480, .025, 'square', .012, -160); setTimeout(() => tone(740, .045, 'triangle', .018, -100), 110); },
  enemyShot: () => { if (!playSample('gun3', { volume: 0.3, rate: 1.3, maxVoices: 8 })) { noise(.07, .045, 1500); tone(125, .06, 'square', .018, -25); } },
  hit: () => { noise(.09, .055, 700); tone(180, .1, 'sawtooth', .025, -90); },
  death: () => { if (playSample('enemyPain', { volume: .34, rate: .92 + Math.random() * .16, maxVoices: 3 })) return; tone(145, .65, 'sawtooth', .055, -100); setTimeout(() => tone(78, .9, 'sine', .035, -30), 240); },
  step: (surface = 'earth') => {
    if (surface !== 'water' && samples.has('step1')) {
      const rock = surface === 'rock';
      playSample(`step${1 + Math.floor(Math.random() * 6)}`, { volume: rock ? 0.5 : 0.34, rate: (rock ? 1 : 0.82) * (1 + (Math.random() - 0.5) * 0.1), lowpass: rock ? undefined : 2200, maxVoices: 4 });
      return;
    }
    noise(.055, surface === 'water' ? .016 : .012, surface === 'rock' ? 780 : 420);
  },
  bomb: () => { if (playSample('bombExplosion', { volume: .72, rate: .88 + Math.random() * .18, maxVoices: 3 })) return; noise(.5, .14, 600); tone(70, .48, 'sawtooth', .065, -45); setTimeout(() => noise(.38, .035, 320), 140); },
  coin: () => { tone(880, .08, 'sine', .045); setTimeout(() => tone(1320, .12, 'sine', .04), 70); },
  success: () => { tone(520, .12, 'triangle', .04); setTimeout(() => tone(780, .15, 'triangle', .04), 110); setTimeout(() => tone(1040, .22, 'triangle', .04), 240); },
  alert: () => { tone(260, .12, 'square', .025); setTimeout(() => tone(330, .14, 'square', .025), 130); },
  breath: () => { noise(.48, .012, 380); tone(78, .42, 'sine', .012, -12); },
  heartbeat: () => { tone(58, .09, 'sine', .04, -12); setTimeout(() => tone(52, .11, 'sine', .035, -10), 150); },
  levelUp: () => { tone(440, .08, 'triangle', .035, 80); setTimeout(() => tone(660, .1, 'triangle', .04, 100), 100); setTimeout(() => tone(990, .18, 'triangle', .045, 150), 230); },
};
