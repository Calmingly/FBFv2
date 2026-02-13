const totalTimer = document.getElementById('totalTimer');
const stepTimer = document.getElementById('stepTimer');
const exerciseName = document.getElementById('exerciseName');
const exerciseMeta = document.getElementById('exerciseMeta');
const exerciseInstructions = document.getElementById('exerciseInstructions');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const installBtn = document.getElementById('installBtn');
const statusText = document.getElementById('statusText');

let routine;
let index = 0;
let totalRemaining = 900;
let stepRemaining = 45;
let running = false;
let tickHandle;
let deferredPrompt;

const fmt = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const render = () => {
  const step = routine.steps[index];
  exerciseName.textContent = step.name;
  exerciseMeta.textContent = `${step.duration} sec`;
  exerciseInstructions.textContent = step.instructions;
  progressText.textContent = `Step ${index + 1} of ${routine.steps.length}`;
  progressBar.max = routine.steps.length;
  progressBar.value = index + 1;
  totalTimer.textContent = fmt(totalRemaining);
  stepTimer.textContent = fmt(stepRemaining);
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === routine.steps.length - 1;
};

const stopTicker = () => {
  clearInterval(tickHandle);
  running = false;
  startPauseBtn.textContent = 'Start';
};

const nextStep = () => {
  if (index < routine.steps.length - 1) {
    index += 1;
    stepRemaining = routine.steps[index].duration;
  } else {
    stopTicker();
    statusText.textContent = 'Workout complete. Great job!';
  }
  render();
};

const tick = () => {
  if (totalRemaining > 0) {
    totalRemaining -= 1;
  }
  if (stepRemaining > 0) {
    stepRemaining -= 1;
  }
  if (stepRemaining === 0 && running) {
    nextStep();
  }
  if (totalRemaining === 0) {
    stopTicker();
    statusText.textContent = '15 minutes complete. Nice work!';
  }
  render();
};

const reset = () => {
  stopTicker();
  index = 0;
  totalRemaining = routine.durationSeconds;
  stepRemaining = routine.steps[0].duration;
  statusText.textContent = 'Routine reset.';
  render();
};

prevBtn.addEventListener('click', () => {
  if (index > 0) {
    index -= 1;
    stepRemaining = routine.steps[index].duration;
    render();
  }
});

nextBtn.addEventListener('click', () => {
  nextStep();
});

startPauseBtn.addEventListener('click', () => {
  if (running) {
    stopTicker();
    return;
  }
  running = true;
  startPauseBtn.textContent = 'Pause';
  tickHandle = setInterval(tick, 1000);
});

resetBtn.addEventListener('click', reset);

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener('appinstalled', () => {
  statusText.textContent = 'App installed successfully.';
  installBtn.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      statusText.textContent = 'Offline support enabled.';
    } catch {
      statusText.textContent = 'Could not enable offline support in this browser.';
    }
  });
}

const init = async () => {
  const response = await fetch('/data/fullBodyRoutine.json');
  routine = await response.json();
  totalRemaining = routine.durationSeconds;
  stepRemaining = routine.steps[0].duration;
  render();
};

init();
