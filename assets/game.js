// Description: Contains the game logic and data structures.
const BLACK = 1;
const WHITE = 2;
const EMPTY = 0;

class Game {
    constructor() {
        this.board = new Board();
        this.timeElasped = 0;
        this.config = new Config();
        this.whoseTurn = BLACK;
        this.history  = new Array();
        if(this.config.enableAI && this.config.playerColor === WHITE) {
            
        }
    }
    getElapsedTime() {
        return this.timeElasped++;
    }
    setCell(i, j) {
        if(this.whoseTurn !== this.config.playerColor) {
            return 'Not your turn';
        }
        window.chrome.postMessage(
            JSON.stringify(JSON.stringify({
                type: 'move',
                x: i,
                y: j
            })));
    }

}
class Move {
    constructor(playerColor, position) {
        this.playerColor = playerColor;
        this.position = position;
    }
}

class Board {
    constructor() {
        this.size = 15;
        this.cells = new Array(self.size).fill(0).map(() => new Array(self.size).fill(0));
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