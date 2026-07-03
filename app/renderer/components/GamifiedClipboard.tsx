import React, { useState, useEffect } from "react";

interface GamifiedClipboardProps {
  userId: string;
}

export const GamifiedClipboard: React.FC<GamifiedClipboardProps> = ({
  userId,
}) => {
  const [gameProfile, setGameProfile] = useState<any>(null);
  const [dailyGame, setDailyGame] = useState<any>(null);
  const [levelSystem, setLevelSystem] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);
  const [leaderboards, setLeaderboards] = useState<any>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [powerUps, setPowerUps] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameData();
    const interval = setInterval(loadGameData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const [profile, daily, level, achieve, leader, reward, str, power] =
        await Promise.all([
          window.knox.invoke("gamifiedClipboard:getGameProfile", userId),
          window.knox.invoke("gamifiedClipboard:getDailyGame", userId),
          window.knox.invoke("gamifiedClipboard:getLevelSystem", userId),
          window.knox.invoke("gamifiedClipboard:getAchievementSystem", userId),
          window.knox.invoke("gamifiedClipboard:getLeaderboardSystem"),
          window.knox.invoke("gamifiedClipboard:getRewardSystem", userId),
          window.knox.invoke("gamifiedClipboard:getStreakSystem", userId),
          window.knox.invoke("gamifiedClipboard:getPowerUpSystem", userId),
        ]);

      setGameProfile(profile);
      setDailyGame(daily);
      setLevelSystem(level);
      setAchievements(achieve);
      setLeaderboards(leader);
      setRewards(reward);
      setStreak(str);
      setPowerUps(power);
    } catch (error) {
      console.error("Error loading game data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processCopy = async (copyData: any) => {
    try {
      const result = await window.knox.invoke(
        "gamifiedClipboard:processCopyWithRewards",
        userId,
        copyData,
      );

      // Show points animation
      showPointsAnimation(result.points.total);

      // Check for achievements
      if (result.achievements.length > 0) {
        showAchievementNotification(result.achievements);
      }

      // Check for level up
      if (result.levelUpdate.leveledUp) {
        showLevelUpNotification(result.levelUpdate.newLevel);
      }

      // Refresh data
      await loadGameData();

      return result;
    } catch (error) {
      console.error("Error processing copy:", error);
    }
  };

  const showPointsAnimation = (points: number) => {
    // Create floating points animation
    const pointsElement = document.createElement("div");
    pointsElement.textContent = `+${points}`;
    pointsElement.className =
      "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-green-500 animate-bounce z-50";
    document.body.appendChild(pointsElement);

    setTimeout(() => {
      document.body.removeChild(pointsElement);
    }, 2000);
  };

  const showAchievementNotification = (achievements: any[]) => {
    achievements.forEach((achievement) => {
      alert(
        `🏆 Achievement Unlocked!\n${achievement.name}\n${achievement.description}\n+${achievement.points} points`,
      );
    });
  };

  const showLevelUpNotification = (newLevel: number) => {
    alert(`🎉 Level Up!\nYou reached level ${newLevel}!`);
  };

  const activatePowerUp = async (powerUpId: string) => {
    try {
      const result = await powerUps.activatePowerUp(powerUpId);
      if (result.success) {
        alert(
          `⚡ Power-up activated for ${Math.round(result.duration / 1000)} seconds!`,
        );
        await loadGameData();
      }
    } catch (error) {
      console.error("Error activating power-up:", error);
    }
  };

  const claimReward = async (rewardId: string) => {
    try {
      const result = await rewards.claimReward(rewardId);
      if (result.success) {
        alert("🎁 Reward claimed successfully!");
        await loadGameData();
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return "text-yellow-400";
    if (level >= 7) return "text-purple-400";
    if (level >= 5) return "text-blue-400";
    if (level >= 3) return "text-green-400";
    return "text-gray-400";
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "text-gray-500",
      uncommon: "text-green-500",
      rare: "text-blue-500",
      epic: "text-purple-500",
      legendary: "text-yellow-500",
    };
    return colors[rarity] || colors.common;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading game data...</div>
      </div>
    );
  }

  return (
    <div className="gamified-clipboard p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🎮 Gamified Clipboard</h1>
        <button
          onClick={loadGameData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Game Profile */}
      {gameProfile && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">👤 Player Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getLevelColor(gameProfile.level.current)}`}
              >
                Level {gameProfile.level.current}
              </div>
              <div className="text-sm text-gray-600">
                {gameProfile.level.title}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {gameProfile.totalPoints}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                #{gameProfile.rank}
              </div>
              <div className="text-sm text-gray-600">Global Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {gameProfile.streak}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>

          {/* Level Progress */}
          {levelSystem && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Level Progress</span>
                <span>{levelSystem.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${levelSystem.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Game */}
      {dailyGame && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📅 Daily Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">Daily Challenges</h3>
              <div className="space-y-2">
                {dailyGame.dailyChallenges
                  .slice(0, 3)
                  .map((challenge: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <div className="font-medium text-sm">
                        {challenge.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {challenge.description}
                      </div>
                      <div className="text-xs text-blue-600">
                        +{challenge.reward?.points} points
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Active Events</h3>
              {dailyGame.activeEvents.length > 0 ? (
                <div className="space-y-2">
                  {dailyGame.activeEvents
                    .slice(0, 2)
                    .map((event: any, index: number) => (
                      <div key={index} className="p-2 bg-yellow-50 rounded">
                        <div className="font-medium text-sm">{event.name}</div>
                        <div className="text-xs text-gray-600">
                          {event.description}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No active events</div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Today's Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Points Today:</span>
                  <span className="font-medium">{dailyGame.pointsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Streak:</span>
                  <span className="font-medium">{dailyGame.streak} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🏆 Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Recent Unlocked</h3>
              {achievements.unlocked.length > 0 ? (
                <div className="space-y-2">
                  {achievements.unlocked
                    .slice(-3)
                    .map((achievement: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-green-50 rounded"
                      >
                        <div className="flex-1">
                          <div
                            className={`font-medium text-sm ${getRarityColor(achievement.rarity)}`}
                          >
                            {achievement.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {achievement.description}
                          </div>
                        </div>
                        <div className="text-sm font-bold">
                          +{achievement.points}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No achievements unlocked yet
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Unlocked:</span>
                  <span className="font-medium">
                    {achievements.unlocked.length}/
                    {achievements.totalAchievements}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completion:</span>
                  <span className="font-medium">
                    {Math.round(achievements.completionRate * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${achievements.completionRate * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Power-ups */}
      {powerUps && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">⚡ Power-ups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Active Power-ups</h3>
              {powerUps.activePowerUps.length > 0 ? (
                <div className="space-y-2">
                  {powerUps.activePowerUps.map(
                    (powerUp: any, index: number) => (
                      <div key={index} className="p-2 bg-blue-50 rounded">
                        <div className="font-medium text-sm">
                          {powerUp.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          Active for {Math.round(powerUp.remainingTime / 1000)}s
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No active power-ups</div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Available Power-ups</h3>
              {powerUps.availablePowerUps.length > 0 ? (
                <div className="space-y-2">
                  {powerUps.availablePowerUps
                    .slice(0, 3)
                    .map((powerUp: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {powerUp.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {powerUp.description}
                          </div>
                        </div>
                        <button
                          onClick={() => activatePowerUp(powerUp.id)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Activate
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No power-ups available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboards */}
      {leaderboards && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🏅 Leaderboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">Global Top 10</h3>
              <div className="space-y-1">
                {leaderboards.global
                  .slice(0, 10)
                  .map((player: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        #{index + 1} {player.name}
                      </span>
                      <span className="font-medium">{player.points}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Weekly Top 5</h3>
              <div className="space-y-1">
                {leaderboards.weekly
                  .slice(0, 5)
                  .map((player: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        #{index + 1} {player.name}
                      </span>
                      <span className="font-medium">{player.points}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Your Ranks</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Global:</span>
                  <span className="font-medium">
                    #{gameProfile?.rank || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Weekly:</span>
                  <span className="font-medium">#1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly:</span>
                  <span className="font-medium">#1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rewards */}
      {rewards && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🎁 Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Available Rewards</h3>
              {rewards.availableRewards.length > 0 ? (
                <div className="space-y-2">
                  {rewards.availableRewards
                    .slice(0, 3)
                    .map((reward: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-yellow-50 rounded"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {reward.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {reward.description}
                          </div>
                        </div>
                        <button
                          onClick={() => claimReward(reward.id)}
                          className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                        >
                          Claim
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No rewards available
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Unlocked Rewards</h3>
              {rewards.unlockedRewards.length > 0 ? (
                <div className="space-y-2">
                  {rewards.unlockedRewards
                    .slice(-3)
                    .map((reward: any, index: number) => (
                      <div key={index} className="p-2 bg-green-50 rounded">
                        <div className="font-medium text-sm">{reward.name}</div>
                        <div className="text-xs text-gray-600">Unlocked</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No rewards unlocked yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Copy Button */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Test Copy Action</h3>
        <button
          onClick={() =>
            processCopy({
              contentType: "code",
              content: 'console.log("Hello World");',
              length: 28,
              isDuplicate: false,
              timestamp: Date.now(),
            })
          }
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          🎯 Simulate Copy Action
        </button>
      </div>
    </div>
  );
};
