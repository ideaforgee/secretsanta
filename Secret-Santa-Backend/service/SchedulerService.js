const schedule = require('node-schedule');
const secretSantaDao = require('../dao/SecretSantaDao');
const secretSantaService = require('./SecretSantaService');

// Configure the rule to run daily at 5:00 AM
const rule = new schedule.RecurrenceRule();
rule.hour = 5;
rule.minute = 0;

/**
 * Automatically starts or ends Secret Santa games based on their scheduled timings.
 *
 * - Fetches game IDs that need to start and calls the `startSecretSantaGame` service for each.
 * - Fetches game IDs that need to end and calls the `endGameAndDeleteData` service for each.
 *
 * @async
 * @function autoStartOrEndGame
 * @returns {Promise<void>} Resolves after processing all games.
 */
const autoStartOrEndGame = async () => {
    try {
        // const gameIdsToStart = await secretSantaDao.getGameIdsForStartByScheduler();
        // for (const gameId of gameIdsToStart) {
        //     await secretSantaService.startSecretSantaGame(gameId);
        // }

        // const gameIdsToEnd = await secretSantaDao.getGameIdsForEndByScheduler();
        // for (const gameId of gameIdsToEnd) {
        //     await secretSantaService.endGameAndDeleteData(gameId);
        // }
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message);
    }
};

/**
 * Initializes and starts the scheduler to run the `autoStartOrEndGame` function daily at 5:00 AM.
 *
 * - The scheduler runs once every day at 5:00 AM based on the defined recurrence rule.
 *
 * @function start
 * @returns {void}
 */
function start() {
    schedule.scheduleJob(rule, () => {
        autoStartOrEndGame();
    });
}

start();
