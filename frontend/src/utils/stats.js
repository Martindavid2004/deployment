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
      // 4 rounds * 25 = 100 XP
      xp += 100;
      
      // Completion bonus based on difficulty
      const prob = (problems || []).find((p) => p.id === problemId);
      const diff = prob ? String(prob.difficulty).toLowerCase() : "easy";
      if (diff === "medium") {
        xp += 200;
      } else if (diff === "hard") {
        xp += 300;
      } else {
        xp += 100; // easy
      }

      if (attempt.totalTimeSeconds && attempt.totalTimeSeconds < bestTime) {
        bestTime = attempt.totalTimeSeconds;
      }
      if (!langsPerProblem[problemId]) langsPerProblem[problemId] = new Set();
      langsPerProblem[problemId].add(lang);
    } else {
      Object.values(rounds).forEach((done) => {
        if (done) xp += 25;
      });
    }
  });

  const multiLang = Object.values(langsPerProblem).some(
    (set) => set.size >= 2
  );
  const fastSolve = bestTime < 60;
  const safeBestTime = Number.isFinite(bestTime) ? bestTime : null;

  // 500 XP per level
  const level = Math.floor(xp / 500) + 1;
  const levelBaseXp = (level - 1) * 500;
  const currentLevelXp = Math.max(0, xp - levelBaseXp);
  const levelProgress = Math.min(100, (currentLevelXp / 500) * 100);

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
