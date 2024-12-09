class Game {

    constructor(
        gameName = '',
        startDate = null,
        endDate = null,
        maxPlayers = ''
    ) {
        this.gameName = gameName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.maxPlayers = maxPlayers;
    }

    isValidStartDate() {
        const today = new Date();
        const start = new Date(this.startDate);
        return start > today;
    }

    isValidEndDate() {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        return end > start;
    }
}

export default Game;