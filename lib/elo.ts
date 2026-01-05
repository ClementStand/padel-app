// Basic ELO implementation
// K Factor determines volatility. 32 is standard for club play.
const K_FACTOR = 32;

/**
 * Calculates the expected score for Team A against Team B
 * @param ratingA Average rating of Team A
 * @param ratingB Average rating of Team B
 * @returns Expected win probability (0 to 1)
 */
export function getExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates new ratings for a 2v2 Padel Match.
 * Takes 4 individual ratings, calculates team averages, and returns 4 new ratings.
 */
export function calculatePadelMatchElo(
    p1Rating: number, p2Rating: number, // Team 1 Players
    p3Rating: number, p4Rating: number, // Team 2 Players
    winner: 1 | 2 // 1 means Team 1 won, 2 means Team 2 won
) {
    // 1. Calculate Team Averages
    const team1Avg = (p1Rating + p2Rating) / 2;
    const team2Avg = (p3Rating + p4Rating) / 2;

    // 2. Calculate Expected Score based on the Averages
    const expectedScore1 = getExpectedScore(team1Avg, team2Avg);

    // 3. Determine Actual Score (1 for win, 0 for loss)
    const actualScore1 = winner === 1 ? 1 : 0;

    // 4. Calculate the Rating Delta
    // This is the amount of points exchanged
    const ratingChange = Math.round(K_FACTOR * (actualScore1 - expectedScore1));

    // 5. Apply the change to ALL individuals
    // Team 1 players gain/lose the same amount
    // Team 2 players gain/lose the inverse
    return {
        // Team 1 Updates
        p1New: p1Rating + ratingChange,
        p2New: p2Rating + ratingChange,

        // Team 2 Updates
        p3New: p3Rating - ratingChange,
        p4New: p4Rating - ratingChange,

        // Metadata for UI
        pointsExchanged: Math.abs(ratingChange)
    };
}