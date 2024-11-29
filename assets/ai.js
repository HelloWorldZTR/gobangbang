//This is a placeholder for the AI logic that will be implemented using a server api.
//In real-world scenarios, the AI logic would be implemented on the server side.
//it will send a POST request to the server with the current game state and receive the next move from the server.
async function nextMove(cells) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/nextMove',
            type: 'POST',
            data: JSON.stringify(cells),
            contentType: 'application/json',
            success: (data) => {
                resolve(data);
            },
            error: (err) => {
                reject(err);
            }
        });
    });
}