//This is a placeholder for the AI logic that will be implemented using a server api.
//In real-world scenarios, the AI logic would be implemented on the server side.
//it will send a POST request to the server with the current game state and receive the next move from the server.
function nextMove(cells) {
    cells = JSON.parse(cells);
    let move = { x: 0, y: 0 };
    for(let i = 0; i < 15; i++) {
        for(let j = 0; j < 15; j++) {
            if(cells[i][j] === EMPTY) {
                move.x = i;
                move.y = j;
                return JSON.stringify(move);
            }
        }
    }
    return JSON.stringify(move);//Should never reach here
}