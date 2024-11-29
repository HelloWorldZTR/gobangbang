// Description: Contains the game logic and data structures.
const BLACK = 1;
const WHITE = 2;
const EMPTY = 0;

class Game {
    constructor() {
        this.board = new Board();
        this.elapasedTime = 0;
        this.config = new Config();
        this.whoseTurn = BLACK;
        this.history  = new Array();
        this.waiting = false;
    }
    getBoard() {
        return this.board.cells;
    }
    getElapsedTime() {
        this.elapasedTime++;
        return this.elapasedTime;
    }
    getConfig() {
        return this.config;
    }
    getWhoseTurn() {
        return this.whoseTurn;
    }
    setCell(i, j) {
        if(this.waiting) {
            return 'AI is making a move';
        }
        let err = this.board.setCell(i, j, this.getWhoseTurn());
        if(err==null){
            let move = new Move(this.getWhoseTurn(), [i, j]);
            this.whoseTurn = (this.whoseTurn === BLACK ? WHITE : BLACK);
            this.history.push(move);
            if(this.config.enableAI) {
                // Start waiting to prevent the player from making another move
                this.waiting = true;
                $('#board')[0].style.cursor = 'wait';
                // Call the AI to make a move
                let ai_move_json = nextMove(JSON.stringify(this.getBoard()));
                let ai_move = JSON.parse(ai_move_json);
                //move = new Move(this.getWhoseTurn(), [ai_move.x, ai_move.y]);
                //this.board.setCell(ai_move.x, ai_move.y, this.getWhoseTurn());
                //this.history.push(move);
                // Stop waiting
                this.waiting = false;
                $('#board').style.cursor = 'default';
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
            if (count >= 5) {
                return true;
            }
        }
    }
    _threeThree(){
        let pattern = [
            [0, 1, 0, 1, 1, 0],
            [0, 1, 1, 0, 1, 0],
            [0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0]
        ];
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        let count = 0;
        for(let i=0; i<this.size; i++) {
            for(let j=0; j<this.size; j++) {
                for(let k=0; k<pattern.length; k++) {
                    for(let d=0; d<directions.length; d++) {
                        let dx = directions[d][0];
                        let dy = directions[d][1];
                        let flag = true;
                        for(let l=0; l<pattern[k].length; l++) {
                            let nx = i + l * dx;
                            let ny = j + l * dy;
                            if(nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.cells[nx][ny] === pattern[k][l]) {
                                continue;
                            } else {
                                flag = false;
                                break;
                            }
                        }
                        if(flag) {
                            count++;
                        }
                    }
                }
            }
        }
        if(count>=2)
            return false;
        else 
            return true;
    }
    _fourFour(){
        let pattern = [
            [1,1,1,0,1],
            [1,1,0,1,1],
            [1,0,1,1,1],
            [0,1,1,1,1],
            [1,1,1,1,0]
        ];
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        let count = 0;
        for(let i=0; i<this.size; i++) {
            for(let j=0; j<this.size; j++) {
                for(let k=0; k<pattern.length; k++) {
                    for(let d=0; d<directions.length; d++) {
                        let dx = directions[d][0];
                        let dy = directions[d][1];
                        let flag = true;
                        for(let l=0; l<pattern[k].length; l++) {
                            let nx = i + l * dx;
                            let ny = j + l * dy;
                            if(nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.cells[nx][ny] === pattern[k][l]) {
                                continue;
                            } else {
                                flag = false;
                                break;
                            }
                        }
                        if(flag) {
                            count++;
                        }
                    }
                }
            }
        }
        if(count>=2)
            return false;
        else 
            return true;
    }
    _longConnect(){
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for(let i=0; i<this.size; i++) {
            for(let j=0; j<this.size; j++) {
                if(this.cells[i][j] === BLACK) {
                    for(let k=0; k<directions.length; k++) {
                        let count = 1;
                        let dx = directions[k][0];
                        let dy = directions[k][1];
                        for(let l=1; l<this.size; l++) {
                            let nx = i + dx * l;
                            let ny = j + dy * l;
                            if(nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.cells[nx][ny] === BLACK) {
                                count++;
                            } else {
                                break;
                            }
                        }
                        if(count > 5) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    /** Check the board for any illegal moves
     * @returns {string} - The reason why the move is illegal, or null if the move is legal
     */
    checkLegal(){
        let illegal = false;
        let reason = "Why its illegal";
        if(!this._threeThree()){
            illegal = true;
            reason = "Three Three";
        }
        if(!this._fourFour()){
            illegal = true;
            reason = "Four Four";
        }
        if(!this._longConnect()){
            illegal = true;
            reason = "Long Connect";
        }
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
        else return null;
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
    updateConfig(config) {
        for(let i=0; i<config.length; i++) {
            let item = config[i];
            switch(item.name) {
                case 'allowRegret':
                    if(!(['true', 'false'].includes(item.value)))
                        throw new Error('Invalid value for allowRegret');
                    this.allowRegret = item.value === 'true';
                    break;
                case 'sound':
                    if(!(['true', 'false'].includes(item.value)))
                        throw new Error('Invalid value for sound');
                    this.sound = item.value === 'true';
                    break;
                case 'soundVolume':
                    if(isNaN(parseFloat(item.value)))
                        throw new Error('Invalid value for soundVolume');
                    this.soundVolume = parseFloat(item.value);
                    break;
                case 'playerColor':
                    if(!(['black', 'white'].includes(item.value)))
                    this.playerColor = item.value === 'black' ? BLACK : WHITE;
                    break;
                case 'debug':
                    if(!(['true', 'false'].includes(item.value)))
                        throw new Error('Invalid value for debug');
                    this.debug = item.value === 'true';
                    break;
                case 'enableAI':
                    if(!(['true', 'false'].includes(item.value)))
                        throw new Error('Invalid value for enableAI');
                    this.enableAI = item.value === 'true';
                    break;
                case 'colorScheme':
                    if(!(['auto', 'dark', 'light'].includes(item.value)))
                        throw new Error('Invalid value for colorScheme');
                    this.colorScheme = item.value;
                    break;
            }
        }
        // Save the configuration to local storage
        localStorage.setItem('config', config);
        // Enable the configuration
        this.enableConfig();
    }
    /** Load the configuration from local storage
     *  Load the default configuration if the configuration is either not found or corrupted.
     */
    loadConfig() {
        // Load the configuration from local storage
        let config = localStorage.getItem('config');
        if(config) {
            try {
                this.updateConfig(config)
            } catch (error) {
                console.error(error);
                console.warn('Using default configuration');
                this.loadDefaultConfig();
            }
        }
        else {
            console.warn('Config not found in local storage');
            console.warn('Using default configuration');
            this.loadDefaultConfig();
        }
    }
    loadDefaultConfig() {
        this.allowRegret = true;
        this.sound = true;
        this.soundVolume = 0.5;
        this.playerColor = BLACK;
        this.debug = false;
        this.enableAI = true;
        this.colorScheme = 'auto';
    }
    enableConfig() {
        console.log('Config enabled');
        console.log(this.toString());
        //TODO::Sync with UI
    }
    toString() {
        let config = {
            allowRegret: this.allowRegret,
            sound: this.sound,
            soundVolume: this.soundVolume,
            playerColor: this.playerColor,
            debug: this.debug,
            enableAI: this.enableAI,
            colorScheme: this.colorScheme
        };
        return JSON.stringify(config);
    }
}