// Description: Contains the game logic and data structures.
const BLACK = 1;
const WHITE = 2;
const EMPTY = 0;

class Game {
    constructor() {
        this.board = new Board();
        this.startTime = new Date();
        this.config = new Config();
        this.whoseTurn = BLACK;
        this.history  = new Array();
    }
    getBoard() {
        return this.board.cells;
    }
    getStartTime() {
        return this.startTime;
    }
    getElapsedTime() {
        return new Date() - this.startTime;
    }
    getConfig() {
        return this.config;
    }
    getWhoseTurn() {
        return this.whoseTurn;
    }
    setCell(i, j) {
        let err = this.board.setCell(i, j, this.getWhoseTurn());
        if(err==null){
            let move = new Move(this.getWhoseTurn(), [i, j]);
            this.whoseTurn = (this.whoseTurn === BLACK ? WHITE : BLACK);
            this.history.push(move);
            if(enableAI) {
                // Call the AI to make a move
                let ai_move = nextMove(JSON.stringify(this.getBoard()));
                ai_move = JSON.parse(move);
                move = new Move(this.getWhoseTurn(), [ai_move.x, ai_move.y]);
                this.setCell(ai_move.x, ai_move.y);
                this.history.push(move);
            }
            return null;
        }
        else{
            return err;
        }
    }

}
class Move {
    constructor(playerColor, position) {
        this.playerColor = playerColor;
        this.position = position;
    }
}

/**
 * @class Board
 * @classdesc Represents the game board. Contains the game state and rules.
 */
class Board {
    constructor() {
        this.size = 15;
        this.cells = new Array(this.size).fill(null).map(() => new Array(this.size).fill(EMPTY));
    }
    /**Check the board if there contains five consecutive pieces
     * @returns {number} - The winner of the game(BLACK, WHITE), null if there is no winner
     */
    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.cells[i][j] !== EMPTY) {
                    if (this._checkFive(i, j)) {
                        return this.cells[i][j];
                    }
                }
            }
        }
        return null;
    }
    /** Check if there are five consecutive pieces in any direction of cell(x, y)
     * @param {number} x - The row index of the cell
     * @param {number} y - The column index of the cell
     * @returns {boolean} - True if there are five consecutive pieces, false otherwise
     * It's a private method, so it's not accessible from outside the class.
     */
    _checkFive(x, y) {
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for(let i = 0; i < directions.length; i++) {
            let count = 1;
            let dx = directions[i][0];
            let dy = directions[i][1];
            for (let j = 1; j < 5; j++) {
                let nx = x + dx * j;
                let ny = y + dy * j;
                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.cells[nx][ny] === this.cells[x][y]) {
                    count++;
                } else {
                    break;
                }
            }
            for (let j = 1; j < 5; j++) {
                let nx = x - dx * j;
                let ny = y - dy * j;
                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.cells[nx][ny] === this.cells[x][y]) {
                    count++;
                } else {
                    break;
                }
            }
            if (count >= 5) {
                return true;
            }
        }
    }
    /** Check the board for any illegal moves
     * @returns {string} - The reason why the move is illegal, or null if the move is legal
     */
    checkLegal(){
        let illegal = false;
        let reason = "Why its illegal";
        if(illegal) return reason;
        else return null;
    }
    /**  Set the value of a cell 
    * @param {number} i - The row index of the cell
    * @param {number} j - The column index of the cell
    * @param {number} value - The value to set the cell to(BLACK, WHITE, EMPTY)
    * @return {string} - The reason why the cell cannot be set to
    * the value, or null if the cell is set successfully
    */
    setCell(i, j, value) {
        if (this.cells[i][j] !== EMPTY) {
            return 'The cell is already occupied';
        }
        this.cells[i][j] = value;
        let err = this.checkLegal();
        if(err!=null){
            this.cells[i][j] = EMPTY;
            return err;
        }
        else {
            return null;
        }
    }

}

/**
 * @class Config
 * @classdesc Contains the game configuration.
 */
class Config {
    constructor() {
        this.loadConfig();
        this.enableConfig();
    }
    /* Update the configuration and save it in local storage */
    updateConfig(allowRegret, sound, soundVolume, playerColor, debug, enableAI, colorScheme) {
        this.allowRegret = allowRegret;
        this.sound = sound;
        this.soundVolume = soundVolume;
        this.playerColor = playerColor;
        this.debug = debug;
        this.enableAI = enableAI;
        this.colorScheme = colorScheme;
        // Save the configuration to local storage
        localStorage.setItem('config', JSON.stringify(this));
        // Enable the configuration
        this.enableConfig();
    }
    /* Load the configuration from local storage */
    loadConfig() {
        // Load the configuration from local storage
        let config = localStorage.getItem('config');
        if (config) {
            Object.assign(this, JSON.parse(config));
        }
        else {
            this.allowRegret = true;
            this.sound = true;
            this.soundVolume = 0.5;
            this.playerColor = BLACK;
            this.debug = true;
            this.enableAI = true;
            this.colorScheme = 'auto';
        }
    }
    enableConfig() {
        if(this.debug) {

        }
        if(this.allowRegret) {

        }
        if(this.sound) {

        }
    }
}