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
        this.historyCount = 0;
        if(this.config.enableAI && this.config.playerColor === WHITE) {
            this.waiting = true;
            this.aiMove();
        }
    }
    sendGameOverMsg(msg){
        window.postMessage(msg, "*");
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
    newHistory(move) {
        this.history.push(move);
        $('#history-list').append(`
           <li class="list-group-item d-flex justify-content-between align-items-start" id="move-${move.id}">
                <div class="ms-2 me-auto">
                    <span class="fw-bold">${move.playerColor === BLACK ? 'Black' : 'White'}:</span>
                    Placed at (${move.position[0]}, ${move.position[1]})
                </div>
                <span class="badge bg-primary rounded-pill">97%</span>
            </li> 
        `);
    }
    checkWin() {
        let winner = this.board.checkWin();
        if(winner){
            if(this.config.enableAI) {
                if(winner === this.config.playerColor) {
                    this.sendGameOverMsg('You win!');
                }
                else {
                    this.sendGameOverMsg('You lose!');
                }
            }
            else {
                this.sendGameOverMsg(winner === BLACK ? 'Black wins!' : 'White wins!');
            }
        }
    }
    saveGame() {
        let data = {
            board: this.board.cells,
            history: this.history,
            whoseTurn: this.whoseTurn,
            elapsedTime: this.elapasedTime
        };
        return JSON.stringify(data);
    }
    loadGame(data) {
        try{
            let game = JSON.parse(data);
            this.board.cells = game.board;
            this.history = game.history;
            this.whoseTurn = game.whoseTurn;
            this.elapasedTime = game.elapsedTime;
        }
        catch(err){
            return err;
        }
    }
    newGame() {
        this.board = new Board();
        this.elapasedTime = 0;
        this.whoseTurn = BLACK;
        this.history  = new Array();
        this.waiting = false;
        this.historyCount = 0;
        $('#history-list').empty();
        if(this.config.enableAI && this.config.playerColor === WHITE) {
            this.waiting = true;
            this.aiMove();
        }
    }
    regret(){
        if(this.config.allowRegret && this.history.length > 0) {
            // If the player is white, regret two moves
            // Because the player is white, the last move is made by the AI
            if(this.config.playerColor===WHITE) {
                let move = this.history.pop();
                this.board.cells[move.position[0]][move.position[1]] = EMPTY;
                $(`#move-${move.id}`).remove();
                move = this.history.pop();
                this.board.cells[move.position[0]][move.position[1]] = EMPTY;
                $(`#move-${move.id}`).remove();
            }
            // If the player is black, regret one move
            else {
                let move = this.history.pop();
                let lastMove = this.history[this.history.length - 1];
                this.board.cells[move.position[0]][move.position[1]] = EMPTY;
                $(`#move-${move.id}`).remove();
                this.whoseTurn = (this.whoseTurn === BLACK ? WHITE : BLACK);
                return null;
            }
        }
        else if(this.history.length === 0) {
            return 'No moves to regret';
        }
        else {
            return 'Regret is not allowed';
        }
    }
    setCell(i, j) {
        if(this.waiting) {
            return 'AI is making a move';
        }
        let err = this.board.setCell(i, j, this.getWhoseTurn());
        if(err==null){
            let move = new Move(this.getWhoseTurn(), [i, j], this.historyCount++);
            this.whoseTurn = (this.whoseTurn === BLACK ? WHITE : BLACK);
            this.newHistory(move);
            this.checkWin();
            if(this.config.enableAI){
                this.waiting = true;
                this.aiMove();
                this.checkWin();
            }
            return null;
        }
        else{
            return err;
        }
    }
    aiMove(cells, lastMove) {
        let x = Math.floor(Math.random() * 15);
        let y = Math.floor(Math.random() * 15);
        while(!(this.board.cells[x][y] === EMPTY)){
            x = Math.floor(Math.random() * 15);
            y = Math.floor(Math.random() * 15);
        }
        this.board.setCell(x, y, this.getWhoseTurn());
        this.waiting = false;
        let move = new Move(this.getWhoseTurn(), [x, y], this.historyCount++);
        this.whoseTurn = (this.whoseTurn === BLACK ? WHITE : BLACK);
        this.newHistory(move);
    }
}
class Move {
    constructor(playerColor, position, id) {
        this.playerColor = playerColor;
        this.position = position;
        this.id = id;
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
            [0, 1, 1, 1, 0,]
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
                        throw new Error('Invalid value for playerColor');
                    this.playerColor = (item.value === 'black' ? BLACK : WHITE);
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
        localStorage.setItem('config', JSON.stringify(config));
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
                config = JSON.parse(config);
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
        $('#regret').prop('disabled', !this.allowRegret);
        $('#sound').prop('checked', this.sound);
        $('#soundVolume').val(this.soundVolume);
        if(this.playerColor === BLACK) {
            $('#playerColorBlack').prop('checked', true);
        }
        else {
            $('#playerColorWhite').prop('checked', true);
        }
        $('#debug').prop('checked', this.debug);
        $('#enableAI').prop('checked', this.enableAI);
        $('#colorScheme').val(this.colorScheme);
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