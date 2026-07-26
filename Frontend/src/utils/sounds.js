let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function osc(type, freq, duration, volume = 0.08) {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(volume, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + duration);
}

function noise(duration, volume = 0.04) {
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.setValueAtTime(volume, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  src.connect(g);
  g.connect(c.destination);
  src.start(c.currentTime);
}

function quickTone(freq1, freq2, duration, volume = 0.06) {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq1, c.currentTime);
  o.frequency.linearRampToValueAtTime(freq2, c.currentTime + duration);
  g.gain.setValueAtTime(volume, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + duration);
}

const SOUNDS = {
  click() { osc("square", 800, 0.04, 0.06); },
  nav() { osc("sine", 600, 0.06, 0.04); },
  select() { quickTone(500, 900, 0.1, 0.07); },
  vote() {
    osc("sine", 700, 0.06, 0.06);
    setTimeout(() => osc("sine", 1000, 0.08, 0.05), 60);
  },
  add() { quickTone(400, 800, 0.12, 0.07); },
  remove() { quickTone(600, 300, 0.1, 0.06); },
  success() {
    osc("sine", 523, 0.1, 0.06);
    setTimeout(() => osc("sine", 659, 0.1, 0.06), 100);
    setTimeout(() => osc("sine", 784, 0.15, 0.06), 200);
  },
  error() { noise(0.15, 0.06); },
  tierdrop() { osc("triangle", 200, 0.08, 0.07); },
  hover() { osc("sine", 1200, 0.02, 0.02); },
};

export function playSound(type) {
  const fn = SOUNDS[type];
  if (fn) fn();
}

export function initAudio() {
  getCtx();
}
