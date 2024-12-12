// Description: Contains the game logic and data structures.
const BLACK = 1;
const WHITE = 2;
const EMPTY = 0;

const MAX_MOVES = 10;
const MAX_DEPTH = 1;

/**
 * @class Game
 * @classdesc Represents the game. Contains the game state and rules.
 * @property {Board} board - The game board
 * @property {Config} config - The game configuration
 * That's pretty much it
 */
class Game {
    constructor() {
        this.board = new Board();
        this.elapasedTime = 0;
        this.config = new Config();
        this.whoseTurn = BLACK;
        this.history = new Array();
        this.waiting = false;
        this.historyCount = 0;
        if (this.config.enableAI && this.config.playerColor === WHITE) {
            //If AI is the first to make a move, place a piece at the center
            this.board.cells[7][7] = BLACK;
            let move = new Move(BLACK, [7, 7], this.historyCount++);
            this.newHistory(move);
            this.whoseTurn = WHITE;
        }
    }
    /**
     * Send the game over message to the parent window
     * html is supported in the message
     * @param {string} msg 
     */
    sendGameOverMsg(msg) {
        window.postMessage(msg, "*");
    }
    /**
     * Get the game board array
     * @returns {Array} - The game board
     */
    getBoard() {
        return this.board.cells;
    }
    /**
     * Get the elapsed time since the game started
     * Update the elapsed time every second
     * @returns {number} - The elapsed time since the game started
     */
    getElapsedTime() {
        this.elapasedTime++;
        return this.elapasedTime;
    }
    /**
     * No I don't want to do this
     * @returns {Config} - The game configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * I dont want to do this either
     * @returns {number} - The color of the player whose turn it is
     */
    getWhoseTurn() {
        return this.whoseTurn;
    }
    /**
     * Add a new move to the history
     * Update the history list in the UI
     * @param {Move} move 
     */
    newHistory(move) {
        this.history.push(move);
        let alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
        $('#history-list').append(`
           <li class="list-group-item d-flex justify-content-between align-items-start" id="move-${move.id}">
                <div class="ms-2 me-auto">
                    <span class="fw-bold">${move.playerColor === BLACK ? '⚫' : '⚪'}:</span>
                    (${alphabet[move.position[1]]}, ${move.position[0]+1})
                </div>
            </li> 
        `);
    }
    /**
     * Check if the game is over
     * If the game is over, send a message to the parent window
     * If AI is enabled in the game, we should say "You win!" or "You lose!" 
     * instead of "Black wins!" or "White wins!" otherwise
     */
    checkWin() {
        let winner = this.board.checkWin();
        if (winner) {
            if (this.config.enableAI) {
                if (winner === this.config.playerColor) {
                    this.sendGameOverMsg($.i18n.prop('msg.win'));
                }
                else {
                    this.sendGameOverMsg($.i18n.prop('msg.lose'));
                }
            }
            else {
                this.sendGameOverMsg(winner === BLACK ? $.i18n.prop('msg.blackwin') : $.i18n.prop('msg.whitewin'));
            }
        }
    }
    /**
     * Save the game to a string(JSON format)
     * @returns {string} - The game save file in JSON format
     */
    saveGame() {
        let data = {
            board: this.board.cells,
            history: this.history,
            whoseTurn: this.whoseTurn,
            elapsedTime: this.elapasedTime
        };
        return JSON.stringify(data);
    }
    /**
     * Load a game from a string(JSON format)
     * @param {string} data 
     * @returns error message if the data is invalid, null otherwise
     */
    loadGame(data) {
        try {
            let game = JSON.parse(data);
            this.board.cells = game.board;
            this.history = game.history;
            this.whoseTurn = game.whoseTurn;
            this.elapasedTime = game.elapsedTime;
        }
        catch (err) {
            return err;
        }
    }
    /**
     * Start a new game
     */
    newGame() {
        this.board.cells = new Array(15).fill(null).map(() => new Array(15).fill(EMPTY));
        this.elapasedTime = 0;
        this.whoseTurn = BLACK;
        this.history = new Array();
        this.waiting = false;
        this.historyCount = 0;
        $('#history-list').empty();
        if (this.config.enableAI && this.config.playerColor === WHITE) {
            this.board.cells[7][7] = BLACK;
            let move = new Move(BLACK, [7, 7], this.historyCount++);
            this.newHistory(move);
            this.whoseTurn = WHITE;
        }
    }
    /**
     * Undo the last move
     * @returns {string} - The reason why the player cannot regret, or null if the player can regret
     */
    regret() {
        if (this.config.allowRegret && this.history.length > 0) {
            if(this.config.enableAI) {
                //If AI is enabled, we need to regret two moves
                //Because the last move is made by the AI
                let move = this.history.pop();
                this.board.cells[move.position[0]][move.position[1]] = EMPTY;
                $(`#move-${move.id}`).remove();
                move = this.history.pop();
                this.board.cells[move.position[0]][move.position[1]] = EMPTY;
                $(`#move-${move.id}`).remove();
            }
            else {
                let move = this.history.pop();
                this.board.cells[move.position[0]][move.position[1]] = EMPTY;
                $(`#move-${move.id}`).remove();
            }
        }
        else if (this.history.length === 0) {
            return $.i18n.prop('warn.nomove');
        }
        else {
            return $.i18n.prop('warn.notallowed');
        }
    }
    /**
     * Set a cell on the board
     * @param {number} i the x position of the cell
     * @param {number} j the y position of the cell
     * @returns {string} - The reason why the cell cannot be set to
     * or null if the cell is set successfully
     */
    setCell(i, j) {
        if (this.waiting) {
            return $.i18n.prop('warn.waiting');
        }
        let err = this.board.setCell(i, j, this.getWhoseTurn());
        if (err == null) {
            let move = new Move(this.getWhoseTurn(), [i, j], this.historyCount++);
            this.whoseTurn = (this.whoseTurn === BLACK ? WHITE : BLACK);
            this.newHistory(move);
            this.checkWin();
            if (this.config.enableAI) {
                this.waiting = true;
                this.aiMove();
                this.checkWin();
            }
            return null;
        }
        else {
            return err;
        }
    }
    aiMove() {
        let bestMove = this.getBestMove();
        let aiColor = this.config.playerColor === BLACK ? WHITE : BLACK;
        if(bestMove==null) {
            bestMove = moves[0];
        }
        this.board.cells[bestMove[0]][bestMove[1]] = aiColor;
        let move = new Move(aiColor, bestMove, this.historyCount++);
        this.newHistory(move);
        this.whoseTurn = (this.whoseTurn === BLACK ? WHITE : BLACK);
        this.waiting = false;
    }
    getBestMove(){
        let aiColor = this.config.playerColor === BLACK ? WHITE : BLACK;
        let humanColor = this.config.playerColor;
        let bestMove = null;
        let bestScore = Infinity;
        let moves = this.board.getAllValidMoves(aiColor);
        console.log(moves.slice(0, MAX_MOVES)); 
        //If the AI is white we want to minimize the score
        for (let i = 0; i < Math.min(MAX_MOVES, moves.length); i++) {
            let move = moves[i];
            if(move[2]>=100000) {
                //If the AI can win in one move, or lose in one move,
                // just make the move
                bestMove = move;
                break;
            }
            this.board.cells[move[0]][move[1]] = aiColor;
            let score = this.minmax(MAX_DEPTH, -Infinity, Infinity, humanColor);
            this.board.cells[move[0]][move[1]] = EMPTY;
            if(score<bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        if(bestMove==null) {
            bestMove = moves[0];
        }
        return bestMove;
    }
    minmax(depth, alpha, beta, playerColor) {
        let moves = this.board.getAllValidMoves(playerColor);
        if (depth === 0 || moves.length === 0) {
            return this.board.evaluate();
        }
        if (playerColor === BLACK) {
            //We want to maximize the score
            let max = -Infinity;
            for (let i = 0; i < Math.min(MAX_MOVES, moves.length); i++) {
                let move = moves[i];
                this.board.cells[move[0]][move[1]] = BLACK;
                max = Math.max(max, this.minmax(depth - 1, alpha, beta, WHITE));
                this.board.cells[move[0]][move[1]] = EMPTY;
                alpha = Math.max(alpha, max);
                if (beta <= alpha) {
                    break;
                }
            }
            return max;
        }
        else {
            //We want to minimize the score
            let min = Infinity;
            for (let i = 0; i < Math.min(MAX_MOVES, moves.length); i++) {
                let move = moves[i];
                this.board.cells[move[0]][move[1]] = WHITE;
                min = Math.min(min, this.minmax(depth - 1, alpha, beta, BLACK));
                this.board.cells[move[0]][move[1]] = EMPTY;
                beta = Math.min(beta, min);
                if (beta <= alpha) {
                    break;
                }
            }
            return min;
        }
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
    ///////////////////////////////////////////////////////////////////////////////////////////
    //Methods for AI
    ///////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Assuming the AI is black
     * the higher the score, the better the board is for black
     * @returns {number} - The score of the board
     */
    evaluate() {
        let scoreBlack = 0;
        let scoreWhite = 0;
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                for (let k = 0; k < directions.length; k++) {
                    let countBlack = 1;
                    let countWhite = 1;
                    let dx = directions[k][0];
                    let dy = directions[k][1];
                    for (let l = 1; l < 5; l++) {
                        let nx = i + dx * l;
                        let ny = j + dy * l;
                        if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15) {
                            if (this.cells[nx][ny] === BLACK) {
                                countBlack++;
                            }
                            else if (this.cells[nx][ny] === WHITE) {
                                countWhite++;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    if (countBlack === 5) {
                        scoreBlack += 100000;
                    }
                    else if (countBlack === 4) {
                        scoreBlack += 10000;
                    }
                    else if (countBlack === 3) {
                        scoreBlack += 1000;
                    }
                    else if (countBlack === 2) {
                        scoreBlack += 100;
                    }
                    else if (countBlack === 1) {
                        scoreBlack += 10;
                    }
                    if (countWhite === 5) {
                        scoreWhite += 100000;
                    }
                    else if (countWhite === 4) {
                        scoreWhite += 10000;
                    }
                    else if (countWhite === 3) {
                        scoreWhite += 1000;
                    }
                    else if (countWhite === 2) {
                        scoreWhite += 100;
                    }
                    else if (countWhite === 1) {
                        scoreWhite += 10;
                    }
                }
            }
        }
        return scoreBlack - scoreWhite;
    }
    /**
     * Assuming the AI is black
     * the higher the score, the greater the chance of winning if black placed at x, y
     * @param {int} x 
     * @param {int} y 
     */
    evaluatePos(x, y, playerColor) {
        let totalScore = 0;
        let otherColor = (playerColor === BLACK ? WHITE : BLACK);
        //If we want to make an immediate move, set the score to >=100000
        if (this._fiveInRow(x, y, playerColor)) {//1st priority
            totalScore += 1000000;
        }
        if (this._fiveInRow(x, y, otherColor)) {
            totalScore += 1000000;
        }
        if (this._liveFour(x, y, playerColor)) {//3rd priority
            totalScore += 200000;
        }
        if(this._liveFour(x, y, otherColor)) {//2nd priority
            totalScore += 100000;
        }
        if(this._liveThree(x, y, otherColor)) {
            totalScore += 10000;
        }
        if(this._deadFour(x, y, otherColor)) {
            totalScore += 10000;
        }
        if (this._liveThree(x, y, playerColor)) {
            totalScore += 10000;
        }
        if(this._deadFour(x, y, playerColor)) {
            totalScore += 1000;
        }
        if(this._nearSomething(x, y)) {
            totalScore += 100;
        }
        if(this._nearCenter(x, y)) {
            totalScore += 10;
        }
        if (this._checkForbidden(x, y, playerColor)) {
            totalScore -= 100000000;
        }
        return totalScore;
    }
    _fiveInRow(x, y, playerColor) {
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        //horizontal
        let count = 1;
        let tx=x, ty=y;
        while(tx>0 && this.cells[tx-1][ty]===playerColor) {
            tx--;
            count++;
        }
        tx = x;
        while(tx<14 && this.cells[tx+1][ty]===playerColor) {
            tx++;
            count++;
        }
        if(count>=5) {
            return true;
        }
        //vertical
        count = 1;
        tx=x, ty=y;
        while(ty>0 && this.cells[tx][ty-1]===playerColor) {
            ty--;
            count++;
        }
        ty = y;
        while(ty<14 && this.cells[tx][ty+1]===playerColor) {
            ty++;
            count++;
        }
        if(count>=5) {
            return true;
        }
        //diagonal
        count = 1;
        tx=x, ty=y;
        while(tx>0 && ty>0 && this.cells[tx-1][ty-1]===playerColor) {
            tx--;
            ty--;
            count++;
        }
        tx = x;
        ty = y;
        while(tx<14 && ty<14 && this.cells[tx+1][ty+1]===playerColor) {
            tx++;
            ty++;
            count++;
        }
        if(count>=5) {
            return true;
        }
        count = 1;
        tx=x, ty=y;
        while(tx>0 && ty<14 && this.cells[tx-1][ty+1]===playerColor) {
            tx--;
            ty++;
            count++;
        }
        tx = x;
        ty = y;
        while(tx<14 && ty>0 && this.cells[tx+1][ty-1]===playerColor) {
            tx++;
            ty--;
            count++;
        }
        if(count>=5) {
            return true;
        }
        return false;
    }
    /**
     * 
     * @param {int} x 
     * @param {int} y 
     */
    _liveThree(x, y, playerColor) {
        let otherColor = (playerColor === BLACK ? WHITE : BLACK);
        //horizontal
        let flagh = true;
        let count = 1;
        let tx = x, ty = y;
        while (tx > 0 && this.cells[tx - 1][ty] === playerColor) {
            tx--;
            count++;
        }
        if (tx === 0 || this.cells[tx - 1][ty] === otherColor) {
            flagh = false;
        }
        tx = x;
        while (tx < 14 && this.cells[tx + 1][ty] === playerColor) {
            tx++;
            count++;
        }
        if (tx === 14 || this.cells[tx + 1][ty] === otherColor) {
            flagh = false;
        }
        if (count < 3) {
            flagh = false;
        }
        //vertical
        let flagv = true;
        count = 1;
        tx = x, ty = y;
        while (ty > 0 && this.cells[tx][ty - 1] === playerColor) {
            ty--;
            count++;
        }
        if (ty === 0 || this.cells[tx][ty - 1] === otherColor) {
            flagv = false;
        }
        ty = y;
        while (ty < 14 && this.cells[tx][ty + 1] === playerColor) {
            ty++;
            count++;
        }
        if (ty === 14 || this.cells[tx][ty + 1] === otherColor) {
            flagv = false;
        }
        if (count < 3) {
            flagv = false;
        }
        //diagonal
        let flagd1 = true;
        count = 1;
        tx = x, ty = y;
        while (tx > 0 && ty > 0 && this.cells[tx - 1][ty - 1] === playerColor) {
            tx--;
            ty--;
            count++;
        }
        if (tx === 0 || ty === 0 || this.cells[tx - 1][ty - 1] === otherColor) {
            flagd1 = false;
        }
        tx = x;
        ty = y;
        while (tx < 14 && ty < 14 && this.cells[tx + 1][ty + 1] === playerColor) {
            tx++;
            ty++;
            count++;
        }
        if (tx === 14 || ty === 14 || this.cells[tx + 1][ty + 1] === otherColor) {
            flagd1 = false;
        }
        if (count < 3) {
            flagd1 = false;
        }
        tx = x, ty = y;
        count = 1;
        let flagd2 = true;
        while (tx > 0 && ty < 14 && this.cells[tx - 1][ty + 1] === playerColor) {
            tx--;
            ty++;
            count++;
        }
        if (tx === 0 || ty === 14 || this.cells[tx - 1][ty + 1] === otherColor) {
            flagd2 = false;
        }
        tx = x;
        ty = y;
        while (tx < 14 && ty > 0 && this.cells[tx + 1][ty - 1] === playerColor) {
            tx++;
            ty--;
            count++;
        }
        if (tx === 14 || ty === 0 || this.cells[tx + 1][ty - 1] === otherColor) {
            flagd2 = false;
        }
        if (count < 3) {
            flagd2 = false;
        }
        return flagh || flagv || flagd1 || flagd2;
    }
    _liveFour(x, y, playerColor) {
        let otherColor = (playerColor === BLACK ? WHITE : BLACK);
        //horizontal
        let flagh = true;
        let count = 1;
        let tx = x, ty = y;
        while (tx > 0 && this.cells[tx - 1][ty] === playerColor) {
            tx--;
            count++;
        }
        if (tx === 0 || this.cells[tx - 1][ty] === otherColor) {
            flagh = false;
        }
        tx = x;
        while (tx < 14 && this.cells[tx + 1][ty] === playerColor) {
            tx++;
            count++;
        }
        if (tx === 14 || this.cells[tx + 1][ty] === otherColor) {
            flagh = false;
        }
        if (count < 4) {
            flagh = false;
        }
        //vertical
        let flagv = true;
        count = 1;
        tx = x, ty = y;
        while (ty > 0 && this.cells[tx][ty - 1] === playerColor) {
            ty--;
            count++;
        }
        if (ty === 0 || this.cells[tx][ty - 1] === otherColor) {
            flagv = false;
        }
        ty = y;
        while (ty < 14 && this.cells[tx][ty + 1] === playerColor) {
            ty++;
            count++;
        }
        if (ty === 14 || this.cells[tx][ty + 1] === otherColor) {
            flagv = false;
        }
        if (count < 4) {
            flagv = false;
        }
        //diagonal
        let flagd1 = true;
        count = 1;
        tx = x, ty = y;
        while (tx > 0 && ty > 0 && this.cells[tx - 1][ty - 1] === playerColor) {
            tx--;
            ty--;
            count++;
        }
        if (tx === 0 || ty === 0 || this.cells[tx - 1][ty - 1] === otherColor) {
            flagd1 = false;
        }
        tx = x;
        ty = y;
        while (tx < 14 && ty < 14 && this.cells[tx + 1][ty + 1] === playerColor) {
            tx++;
            ty++;
            count++;
        }
        if (tx === 14 || ty === 14 || this.cells[tx + 1][ty + 1] === otherColor) {
            flagd1 = false;
        }
        if (count < 4) {
            flagd1 = false;
        }
        let flagd2 = true;
        tx = x, ty = y;
        count = 1;
        while (tx > 0 && ty < 14 && this.cells[tx - 1][ty + 1] === playerColor) {
            tx--;
            ty++;
            count++;
        }
        if (tx === 0 || ty === 14 || this.cells[tx - 1][ty + 1] === otherColor) {
            flagd2 = false;
        }
        tx = x;
        ty = y;
        while (tx < 14 && ty > 0 && this.cells[tx + 1][ty - 1] === playerColor) {
            tx++;
            ty--;
            count++;
        }
        if (tx === 14 || ty === 0 || this.cells[tx + 1][ty - 1] === otherColor) {
            flagd2 = false;
        }
        if(count<4) {
            flagd2 = false;
        }
        return flagh || flagv || flagd1 || flagd2;
    }
    _nearSomething(x, y) {
        let cnt = 0;
        for(let i = x-1; i<=x+1; i++) {
            for(let j = y-1; j<=y+1; j++) {
                if(i>=0 && i<15 && j>=0 && j<15 && this.cells[i][j] !== EMPTY) {
                    return true;
                }
            }
        }
    }
    _nearCenter(x, y) {
        return (x>=6 && x<=8 && y>=6 && y<=8);
    }
    _deadFour(x, y, playerColor) {
        let otherColor = (playerColor === BLACK ? WHITE : BLACK);
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        //horizontal
        let count = 1;
        let countDead = 0;
        let tx = x, ty = y;
        while (tx > 0 && this.cells[tx - 1][ty] === playerColor) {
            tx--;
            count++;
        }
        if(tx==0 || this.cells[tx-1][ty]===otherColor) {
            countDead++;
        }
        tx = x;
        while (tx < 14 && this.cells[tx + 1][ty] === playerColor) {
            tx++;
            count++;
        }
        if(tx==14 || this.cells[tx+1][ty]===otherColor) {
            countDead++;
        }
        if(count==4 && countDead==1) {
            return true;
        }
        //vertical
        count = 1;
        countDead = 0;
        tx = x, ty = y;
        while (ty > 0 && this.cells[tx][ty - 1] === playerColor) {
            ty--;
            count++;
        }
        if(ty==0 || this.cells[tx][ty-1]===otherColor) {
            countDead++;
        }
        ty = y;
        while (ty < 14 && this.cells[tx][ty + 1] === playerColor) {
            ty++;
            count++;
        }
        if(ty==14 || this.cells[tx][ty+1]===otherColor) {
            countDead++;
        }
        if(count==4 && countDead==1) {
            return true;
        }
        //diagonal
        count = 1;
        countDead = 0;
        tx = x, ty = y;
        while (tx > 0 && ty > 0 && this.cells[tx - 1][ty - 1] === playerColor) {
            tx--;
            ty--;
            count++;
        }
        if(tx==0 || ty==0 || this.cells[tx-1][ty-1]===otherColor) {
            countDead++;
        }
        tx = x;
        ty = y;
        while (tx < 14 && ty < 14 && this.cells[tx + 1][ty + 1] === playerColor) {
            tx++;
            ty++;
            count++;
        }
        if(tx==14 || ty==14 || this.cells[tx+1][ty+1]===otherColor) {
            countDead++;
        }
        if(count==4 && countDead==1) {
            return true;
        }
        count = 1;
        countDead = 0;
        tx = x, ty = y;
        while (tx > 0 && ty < 14 && this.cells[tx - 1][ty + 1] === playerColor) {
            tx--;
            ty++;
            count++;
        }
        if(tx==0 || ty==14 || this.cells[tx-1][ty+1]===otherColor) {
            countDead++;
        }
        tx = x;
        ty = y;
        while (tx < 14 && ty > 0 && this.cells[tx + 1][ty - 1] === playerColor) {
            tx++;
            ty--;
            count++;
        }
        if(tx==14 || ty==0 || this.cells[tx+1][ty-1]===otherColor) {
            countDead++;
        }
        if(count==4 && countDead==1) {
            return true;
        }
        return false;
    }
    getAllValidMoves(playerColor) {
        let moves = [];
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (this.cells[i][j] === EMPTY) {
                    // if (this._checkForbidden(i, j, playerColor)) {
                    //     continue;
                    // }
                   // else {
                        moves.push([i, j, this.evaluatePos(i, j, playerColor)]);
                    //}
                }
            }
        }
        moves.sort((a, b)=>{
            return b[2]-a[2];
        })
        return moves;
    }
    _checkForbidden(x, y, playerColor) {
        if (playerColor === WHITE) return false;
        else {
            this.cells[x][y] = BLACK;
            let flag = false;
            flag = flag || this._longConnect();
            flag = flag || this._fourFour();
            flag = flag || this._threeThree();
            this.cells[x][y] = EMPTY;
            return flag;
        }
    }
    /** Check if there are five consecutive pieces in any direction of cell(x, y)
     * @param {number} x - The row index of the cell
     * @param {number} y - The column index of the cell
     * @param {number} playerColor - The color of the player(BLACK, WHITE)
     * @returns {boolean} - True if there are five consecutive pieces, false otherwise
     * It's a private method, so it's not accessible from outside the class.
     */
    _checkFive(x, y, playerColor) {
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for (let i = 0; i < directions.length; i++) {
            let count = 1;
            let dx = directions[i][0];
            let dy = directions[i][1];
            for (let j = 1; j < 5; j++) {
                let nx = x + dx * j;
                let ny = y + dy * j;
                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.cells[nx][ny] === playerColor) {
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
    ///////////////////////////////////////////////////////////////////////////////////////////
    //Methods for checking illegal moves
    ///////////////////////////////////////////////////////////////////////////////////////////
    _threeThree() {
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {

                //horizontal
                let flagh = 1;
                let count = 1;
                let tx = x, ty = y;
                while (tx > 0 && this.cells[tx - 1][ty] === BLACK) {
                    tx--;
                    count++;
                }
                if (tx === 0 || this.cells[tx - 1][ty] === WHITE) {
                    flagh = 0;
                }
                tx = x;
                while (tx < 14 && this.cells[tx + 1][ty] === BLACK) {
                    tx++;
                    count++;
                }
                if (tx === 14 || this.cells[tx + 1][ty] === WHITE) {
                    flagh = 0;
                }
                if (count < 3) {
                    flagh = 0;
                }
                //vertical
                let flagv = 1;
                count = 1;
                tx = x, ty = y;
                while (ty > 0 && this.cells[tx][ty - 1] === BLACK) {
                    ty--;
                    count++;
                }
                if (ty === 0 || this.cells[tx][ty - 1] === WHITE) {
                    flagv = 0;
                }
                ty = y;
                while (ty < 14 && this.cells[tx][ty + 1] === BLACK) {
                    ty++;
                    count++;
                }
                if (ty === 14 || this.cells[tx][ty + 1] === WHITE) {
                    flagv = 0;
                }
                if (count < 3) {
                    flagv = 0;
                }
                //diagonal
                let flagd = 1;
                count = 1;
                tx = x, ty = y;
                while (tx > 0 && ty > 0 && this.cells[tx - 1][ty - 1] === BLACK) {
                    tx--;
                    ty--;
                    count++;
                }
                if (tx === 0 || ty === 0 || this.cells[tx - 1][ty - 1] === WHITE) {
                    flagd = 0;
                }
                tx = x;
                ty = y;
                while (tx < 14 && ty < 14 && this.cells[tx + 1][ty + 1] === BLACK) {
                    tx++;
                    ty++;
                    count++;
                }
                if (tx === 14 || ty === 14 || this.cells[tx + 1][ty + 1] === WHITE) {
                    flagd = 0;
                }
                if (count < 3) {
                    flagd = 0;
                }
                return ((flagh + flagv + flagd) >= 2);
            }
        }
    }
    _fourFour() {
        let pattern = [
            [0, 1, 1, 1, 1, 0],
            [2, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 2]
        ];
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < pattern.length; k++) {
                    for (let d = 0; d < directions.length; d++) {
                        let dx = directions[d][0];
                        let dy = directions[d][1];
                        let flag = true;
                        for (let l = 0; l < pattern[k].length; l++) {
                            let nx = i + l * dx;
                            let ny = j + l * dy;
                            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.cells[nx][ny] === pattern[k][l]) {
                                continue;
                            } else {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) {
                            count++;
                        }
                    }
                }
            }
        }
        if (count >= 2)
            return true;
        else
            return false;
    }
    _longConnect() {
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.cells[i][j] === BLACK) {
                    for (let k = 0; k < directions.length; k++) {
                        let count = 1;
                        let dx = directions[k][0];
                        let dy = directions[k][1];
                        for (let l = 1; l < this.size; l++) {
                            let nx = i + dx * l;
                            let ny = j + dy * l;
                            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.cells[nx][ny] === BLACK) {
                                count++;
                            } else {
                                break;
                            }
                        }
                        if (count > 5) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    /** Check the board for any illegal moves
     * @returns {string} - The reason why the move is illegal, or null if the move is legal
     */
    checkLegal() {
        let illegal = false;
        let reason = "Why its illegal";
        if (this._threeThree()) {
            illegal = true;
            reason = "Three Three";
        }
        if (this._fourFour()) {
            illegal = true;
            reason = "Four Four";
        }
        if (this._longConnect()) {
            illegal = true;
            reason = "Long Connect";
        }
        if (illegal) return reason;
        else return null;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////
    //Methods for game logic
    ///////////////////////////////////////////////////////////////////////////////////////////
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
        if (err != null) {
            this.cells[i][j] = EMPTY;
            return err;
        }
        else return null;
    }
    /**Check the board if there contains five consecutive pieces
     * @returns {number} - The winner of the game(BLACK, WHITE), null if there is no winner
     */
    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.cells[i][j] !== EMPTY) {
                    if (this._checkFive(i, j, this.cells[i][j])) {
                        return this.cells[i][j];
                    }
                }
            }
        }
        if(this.checkLegal() !== null) {
            return WHITE;
        }
        return null;
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
    /**
     * @description Update the configuration and save it in local storage 
     * @param {Array} config - The configuration to update
     * */
    updateConfig(config) {
        console.log(config);
        this.allowRegret = false;
        this.sound = false;
        this.enableAI = false;
        this.debug = false;
        for (let i = 0; i < config.length; i++) {
            let item = config[i];
            switch (item.name) {
                case 'allowRegret':
                    this.allowRegret = true;
                    break;
                case 'sound':
                    this.sound = true;
                    break;
                case 'soundVolume':
                    if (isNaN(parseFloat(item.value)))
                        throw new Error('Invalid value for soundVolume');
                    this.soundVolume = parseFloat(item.value);
                    break;
                case 'playerColor':
                    if (!(['black', 'white'].includes(item.value)))
                        throw new Error('Invalid value for playerColor');
                    this.playerColor = (item.value === 'black' ? BLACK : WHITE);
                    break;
                case 'debug':
                    this.debug = true;
                    break;
                case 'enableAI':
                    this.enableAI = true;
                    break;
                case 'colorScheme':
                    if (!(['auto', 'dark', 'light'].includes(item.value)))
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
    /** 
     * Load the configuration from local storage
     * Load the default configuration if the configuration is either not found or corrupted.
     */
    loadConfig() {
        // Load the configuration from local storage
        let config = localStorage.getItem('config');
        if (config) {
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
    /**
     * Enable the configuration
     * Sync the configuration with the UI
     */
    enableConfig() {
        console.log('Config enabled');
        console.log(this.toString());
        // Sync the configuration with the UI
        $('#regret').prop('checked', this.allowRegret);
        $('#sound').prop('checked', this.sound);
        $('#soundVolume').val(this.soundVolume);
        if (this.playerColor === BLACK) {
            $('#playerColorBlack').prop('checked', true);
            $('#playerColorWhite').prop('checked', false);
        }
        else {
            $('#playerColorWhite').prop('checked', true);
            $('#playerColorBlack').prop('checked', false);
        }
        $('#debug').prop('checked', this.debug);
        $('#enableAI').prop('checked', this.enableAI);
        $('#colorScheme').val(this.colorScheme);
        //Actuate the configuration
        $('#bgm').prop('volume', this.soundVolume/100);
        try{
            if (this.sound) {
                $('#bgm').get(0).play();
            }
            else {
                $('#bgm').get(0).pause();
            }
        }catch(e) {
            //That's fine
        }
        if(this.enableAI) {
            if(this.playerColor === BLACK) {
                $('#player1').text("You");
                $('#player2').text("AI");
            }
            else {
                $('#player1').text("AI");
                $('#player2').text("You");
            }
        }
        else {
            $('#player1').text("Player 1");
            $('#player2').text("Player 2");
        }
    }
    /**
     * Debugging method
     * @returns {string} - The configuration in JSON format
     */
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