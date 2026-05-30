export function computeUserStats(attempts, problems) {
  let totalSolved = 0;
  let xp = 0;
  let bestTime = Infinity;
  const langsPerProblem = {};

  Object.entries(attempts || {}).forEach(([key, attempt]) => {
    const [problemIdStr, lang] = key.split("_");
    const problemId = Number(problemIdStr);
    const rounds = attempt.roundCompleted || {};

    if (attempt.finalCompleted) {
      totalSolved += 1;
      xp += 30;
      if (attempt.totalTimeSeconds && attempt.totalTimeSeconds < bestTime) {
        bestTime = attempt.totalTimeSeconds;
      }
      if (!langsPerProblem[problemId]) langsPerProblem[problemId] = new Set();
      langsPerProblem[problemId].add(lang);
    } else {
      Object.values(rounds).forEach((done) => {
        if (done) xp += 5;
      });
    }
  });

  const multiLang = Object.values(langsPerProblem).some(
    (set) => set.size >= 2
  );
  const fastSolve = bestTime < 60;
  const safeBestTime = Number.isFinite(bestTime) ? bestTime : null;

  const level = Math.floor(xp / 100) + 1;
  const levelBaseXp = (level - 1) * 100;
  const currentLevelXp = Math.max(0, xp - levelBaseXp);
  const levelProgress = Math.min(100, (currentLevelXp / 100) * 100);

  return {
    xp,
    level,
    totalSolved,
    fastSolve,
    multiLang,
    bestTime: safeBestTime,
    levelProgress
  };
}
