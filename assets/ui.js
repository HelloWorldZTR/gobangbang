// Description: This file contains the user interface logic for the game.
// It is responsible for rendering the game board and handling user input.
// The user interface is implemented using HTML5 Canvas.

// Game logic data structures
let game = new Game();
// UI elements
let errorDisplayDiv = $('#error');
let board = $('#board')[0];
let timer = $('#timer');
let updateBtn = $('#update');
// UI variables
let selectedPoint = null;
let lastSelectedPoint = null;
let canvas = board.getContext('2d');
let boardSize = getBoardSize();
let offset_x = boardSize * 0.1;
let offset_y = boardSize * 0.1;
let shadow = boardSize * 0.02;
let width = boardSize * 0.8;
let height = boardSize * 0.8;
let cellSize = width / 14;
let circleSize = cellSize * 0.4;
let bg = new Image();

bg.src = 'assets/bg.jpg';
bg.onload = function () {
  drawBoard();
}
// Helper functions
function getClientHeight() {
  return window.innerHeight - $('header').height();
}
function getClietWidth() {
  return window.innerWidth - $('#sidebar').width();
}
function getBoardSize() {
  return Math.min(getClientHeight(), getClietWidth());
}
function getCellSize() {
  return getBoardSize() / 14;
}
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
function displayError(err) {
  errorDisplayDiv.text(err);
  errorDisplayDiv.show();
  setTimeout(() => {
    errorDisplayDiv.hide();
  }, 2000);
}
function formatTime(time) {
  let hours = Math.floor(time / 3600000);
  let minutes = Math.floor(time / 60000);
  let seconds = Math.floor(time / 1000) % 60;
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }
  else {
    return `${minutes}:${seconds}`;
  }
}
function updatePlayer() {
  if (game.whoseTurn === BLACK) {
    $('#player').text('Black⚫');
  }
  else {
    $('#player').text('White⚪');
  }
}
// Event listeners
window.addEventListener('resize', function () {
  $('#board').attr('width', getBoardSize());
  $('#board').attr('height', getBoardSize());
  boardSize = getBoardSize();
  offset_x = boardSize * 0.1;
  offset_y = boardSize * 0.1;
  width = boardSize * 0.8;
  height = boardSize * 0.8;
  cellSize = width / 14;
  circleSize = cellSize * 0.4;
  drawBoard();
});
window.addEventListener('message', function (event) {
  let data = JSON.parse(event.data);
  if (data.type === 'update') {
    
  }
  else if(data.type === 'err') {
    displayError(data.msg);
  } else if(data.type === 'win') {
    $('#win').modal('show');
  }
});
$(document).ready(function () {
  $('#board').attr('width', getBoardSize());
  $('#board').attr('height', getBoardSize());
  drawBoard();
});
setInterval(() => {
  timer.text(formatTime(game.getElapsedTime()));
}, 1000);
board.addEventListener("mousemove", function __handler__(evt) {
  //redraw the board
  drawBoard();
  // Get the mouse position
  let x = evt.clientX;
  let y = evt.clientY;
  let rect = board.getBoundingClientRect();
  x -= rect.left;
  y -= rect.top;
  // Get the selected point
  let seletecdPoint = null;
  for (i = 0; i < 15; i++) {
    for (j = 0; j < 15; j++) {
      let pointx = offset_x + i * cellSize;
      let pointy = offset_y + j * cellSize;
      // Check if the mouse is within the border of a point
      if (getDistance(x, y, pointx, pointy) < cellSize / 2) {
        minDistance = getDistance(x, y, pointx, pointy);
        selectedPoint = [i, j];
      }
    }
  }
  //Draw a hover effect if a point is selected
  let canvas = board.getContext('2d');

  if (selectedPoint != null) {
    let pointx = offset_x + selectedPoint[0] * cellSize;
    let pointy = offset_y + selectedPoint[1] * cellSize;
    canvas.fillStyle = 'blue';
    canvas.beginPath();
    canvas.arc(pointx, pointy, circleSize + 1, 0, 2 * Math.PI);
    canvas.fill();
    //Set the cursor to pointer
    board.style.cursor = 'pointer';
  }
  else {
    board.style.cursor = 'default';
    //remove the hover effect
    drawBoard();
    lastSelectedPoint = null;
  }

});
board.addEventListener("mouseout", function __handler__(evt) {
  //remove the hover effect
  lastSelectedPoint = null;
  drawBoard();
});
updateBtn.click(function () {
  //Read Configurations
  let config = $('#config-form').serializeArray();
  //Update the game configuration
  game.config.updateConfig(config[0].value, config[1].value, config[2].value, config[3].value, true, config[4].value, config[5].value);
  console.log(config);
  $('#settings').modal('hide');
});
board.addEventListener("click", function __handler__(evt) {
  // Get the mouse position
  let x = evt.clientX;
  let y = evt.clientY;
  let rect = board.getBoundingClientRect();
  x -= rect.left;
  y -= rect.top;
  // Get the selected point
  let seletecdPoint = null;
  for (i = 0; i < 15; i++) {
    for (j = 0; j < 15; j++) {
      let pointx = offset_x + i * cellSize;
      let pointy = offset_y + j * cellSize;
      // Check if the mouse is within the border of a point
      if (getDistance(x, y, pointx, pointy) < cellSize * 0.3) {
        minDistance = getDistance(x, y, pointx, pointy);
        selectedPoint = [i, j];
      }
    }
  }
  game.setCell(selectedPoint[0], selectedPoint[1]);
});
// Render functions
function drawBoard() {
  canvas.clearRect(0, 0, boardSize, boardSize);
  canvas.fillStyle = 'yellow';
  canvas.drawImage(bg, 0, 0, boardSize, boardSize);
  /* Draw the board lines */
  canvas.penStyle = 'black';
  canvas.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    canvas.moveTo(offset_x + i * cellSize, offset_y);
    canvas.lineTo(offset_x + i * cellSize, offset_y + height);
    canvas.stroke();
  }
  for (let i = 0; i < 15; i++) {
    canvas.moveTo(offset_x, offset_y + i * cellSize);
    canvas.lineTo(offset_x + width, offset_y + i * cellSize);
    canvas.stroke();
  }
  canvas.fillStyle = 'black';
  /* Draw the star points */
  let starPoints = [3, 11];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let x = starPoints[i];
      let y = starPoints[j];
      canvas.beginPath();
      canvas.arc(offset_x + x * cellSize, offset_y + y * cellSize, 5, 0, 2 * Math.PI);
      canvas.fill();
    }
  }
  /* Draw the center point */
  canvas.beginPath();
  canvas.arc(offset_x + 7 * cellSize, offset_y + 7 * cellSize, 5, 0, 2 * Math.PI);
  canvas.fill();
  /* Draw pieces on the board */
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (game.board.cells[i][j] !== EMPTY) {
        let color = game.board.cells[i][j] === BLACK ? 'black' : 'white';
        let pointx = offset_x + i * cellSize;
        let pointy = offset_y + j * cellSize;
        canvas.fillStyle = color;
        canvas.beginPath();
        canvas.arc(pointx, pointy, circleSize, 0, 2 * Math.PI);
        canvas.fill();
      }
    }
  }
}
