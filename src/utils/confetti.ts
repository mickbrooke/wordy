import confetti from 'canvas-confetti';

export function fireWordConfetti() {
  confetti({
    particleCount: 24,
    spread: 55,
    origin: { y: 0.7 },
    colors: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
    disableForReducedMotion: true
  });
}

export function fireMilestoneConfetti() {
  const count = 100;
  const defaults = {
    origin: { y: 0.65 },
    disableForReducedMotion: true
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#F59E0B', '#10B981']
  });
  fire(0.2, {
    spread: 60,
    colors: ['#3B82F6', '#EC4899']
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
}
