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
let autosaveData = localStorage.getItem('gameAutoSave');
let saveData = JSON.stringify(localStorage.getItem('gameSaves'));
let saveTime = JSON.stringify(localStorage.getItem('saveTime'));
const SAVE_SLOTS = 5;
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
let waiting = false;
let hint = null;
let paused = false;
bg.src = 'assets/bg.jpg';
bg.onload = function () {
  drawBoard();
}

// Helper functions
function isMobile() {
  return window.innerWidth < 768;
}
function getClientHeight() {
  return window.innerHeight - $('header').height();//Remove possible padding
}
function getClietWidth() {
  return window.innerWidth;
}
function getBoardSize() {
  if(isMobile()) {//Single column layout
    return Math.min(getClientHeight(), getClietWidth()*0.9);
  }//Dual column layout
  else return Math.min(getClientHeight(), getClietWidth()*0.6*0.667);
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
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time) % 60;
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
function checkSaves() {
  if(localStorage.getItem('gameSaves')===null){
    console.warn('No save data found, initializing save data');
    localStorage.setItem('gameSaves', JSON.stringify([]));
  }
  if(localStorage.getItem('saveTime')===null){
    localStorage.setItem('saveTime', JSON.stringify([]));
  }
  try {
    saveData = JSON.parse(localStorage.getItem('gameSaves'));
    saveTime = JSON.parse(localStorage.getItem('saveTime'));
  }
  catch (e) {
    console.error('Game save data corrupted');
    console.error(e);
    localStorage.setItem('gameSaves', JSON.stringify([]));
    localStorage.setItem('saveTime', JSON.stringify([]));
    saveData = [];
    saveTime = [];
  }
}
function saveGame(i) {
  checkSaves();
  if(saveData[i]!==null) {
    let yesno = window.confirm('Are you sure you want to overwrite this save?');
    if(!yesno) return;
  }
  let data = game.saveGame();
  saveData[i] = data;
  saveTime[i] = new Date().toISOString();
  localStorage.setItem('gameSaves', JSON.stringify(saveData));
  localStorage.setItem('saveTime', JSON.stringify(saveTime));
  updateSaveSlots();
}
function loadSave(i) {
  if(i===0) {
    let err = game.loadGame(autosaveData);
    if (err) {
      displayError(err);
    }
    drawBoard();
    return;
  }
  checkSaves();
  if(saveData[i]===null) {
    window.alert('Slot is empty');
    return;
  }
  let data = saveData[i];
  let err = game.loadGame(data);
  if (err) {
    displayError(err);
  }
  drawBoard();
}
function deleteSave(i) {
  checkSaves();
  if(saveData[i]===null) {
    window.alert('Slot is empty');
    return;
  }
  let yesno = window.confirm('Are you sure you want to delete this save?');
  if(!yesno) return;
  saveData[i] = null;
  saveTime[i] = null;
  localStorage.setItem('gameSaves', JSON.stringify(saveData));
  localStorage.setItem('saveTime', JSON.stringify(saveTime));
  updateSaveSlots();
}
function updateSaveSlots() {
  checkSaves();
  for (let i = 1; i <= SAVE_SLOTS; i++) {
    let slot = $(`#save${i}-date`);
    if (saveData[i] !== null) {
      slot.text(saveTime[i]);
      console.log(saveTime[i]);
    }
    else {
      slot.text('Empty');
    }
  }
}
updateSaveSlots();
// Event listeners
// ()=>{
//   let preferredLanguage = window.navigator.language;
//   if(preferredLanguage==='zh-CN'){
//     $('#language').val('zh');
//   }
//   else{
//     $('#language').val('en');
//   }
// }

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
$(document).ready(function () {
  $('#board').attr('width', getBoardSize());
  $('#board').attr('height', getBoardSize());
  drawBoard();
  //If there is an autosave, ask the player if they want to load it
  if (autosaveData) {
    $('#load-modal').modal('show');
  }
  // //Initialize i18n
  // jQuery.i18n.properties({
  //   name: 'strings', 
  //   path: 'bundles/', 
  //   mode: 'map',
  //   callback: function () {
  //     $('body').find('*').toArray().forEach((cur) => {
  //       if (cur.hasAttribute('data-i18n')) {
  //         let key = cur.getAttribute('data-i18n');
  //         cur.innerHTML = jQuery.i18n.prop(key);
  //       }
  //     });
  //   }
  // });
});
// $('#language').change(function () {
//   let lang = $('#language').val();
//   console.log(lang);
//   jQuery.i18n.properties({
//     name: 'strings', 
//     path: 'bundles/', 
//     mode: 'map', 
//     language: lang, 
//     callback: function () {
//       $('body').find('*').toArray().forEach((cur) => {
//         if (cur.hasAttribute('data-i18n')) {
//           let key = cur.getAttribute('data-i18n');
//           cur.innerHTML = jQuery.i18n.prop(key);
//         }
//       });
//     }
//   });
// });

setInterval(() => {
  if(!paused)
    timer.text(formatTime(game.getElapsedTime()));
}, 1000);

$('#colorScheme').change(function () {
  let scheme = $('#colorScheme').val();
  if (scheme === 'auto') {
    document.documentElement.setAttribute('data-bs-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  else {
    document.documentElement.setAttribute('data-bs-theme', scheme);
  }
  if(document.documentElement.getAttribute('data-bs-theme')==='dark'){
    document.body.style.backgroundImage = 'url(assets/web_bg_dark.jpg)';
  }
  else {
    document.body.style.backgroundImage = 'url(assets/web_bg.png)';
  }
});

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
    canvas.fillStyle = game.getWhoseTurn()===BLACK?'rgba(0,0,0,0.6)':'rgba(255,255,255,0.6)';
    canvas.beginPath();
    canvas.arc(pointx, pointy, circleSize + 1, 0, 2 * Math.PI);
    canvas.fill();
    //Draw a little tooltip
    if(game.config.debug){
      canvas.fillStyle = 'black';
      canvas.font = '12px Arial';
      canvas.fillText(`(${selectedPoint[0]},${selectedPoint[1]})`, pointx + 10, pointy - 10);
    }
    
    //Set the cursor to pointer
    if(!game.waiting)
      board.style.cursor = 'pointer';
    else 
      board.style.cursor='wait';
  }
  else {
    if(!game.waiting)
      board.style.cursor = 'default';
    else 
      board.style.cursor='wait';
    //remove the hover effect
    drawBoard();
    lastSelectedPoint = null;
  }

});
board.addEventListener("mouseout", function __handler__(evt) {
  //remove the hover effect
  lastSelectedPoint = null;
  selectedPoint = null;
  drawBoard();
});
updateBtn.click(function () {
  //Read Configurations
  let config = $('#config-form').serializeArray();
  //Start a new game if the player color is changed
  let newGame = false;
  for(let i=0;i<config.length;i++) {
    if(config[i].name==='playerColor') {
      let color = config[i].value==='black'?BLACK:WHITE;
      if(color!==game.config.playerColor) {
        console.log('New Game because of color change');
        newGame = true;
      }
    }
  }
  //Update the game configuration
  game.config.updateConfig(config);
  //Start a new game
  if(newGame) {
    game.newGame();
    drawBoard();
  }
});
$('#hint').click(function(){
  let bestMove = game.getBestMove();
  hint = bestMove;
  drawBoard();
  //Remove the hint after 2 seconds
  setTimeout(()=>{
    hint = null;
    drawBoard();
  },2000);
});
$('.player-color').toArray().forEach((cur)=>{
  cur.addEventListener("click", 
  function __handler__(evt) {
    let color = evt.target.value==='black'?BLACK:WHITE;
    if(color!==game.config.playerColor) {
      $('#save-warn').css('display', 'block');
    }
    else {
      $('#save-warn').css('display', 'none');
    }
  })
});
$('#regret').click(function () {
  let err = game.regret();
  if (err) {
    displayError(err);
  }
  drawBoard();
});
// $('#saveBtn').click(() => {
//   let data = game.saveGame();
//   // Save to a file for download
//   let blob = new Blob([data], { type: 'application/json' });
//   let url = URL.createObjectURL(blob);
//   let a = document.createElement('a');
//   a.href = url;
//   a.download = `gamesave-${new Date().toISOString()}.json`;
//   a.click();
//   URL.revokeObjectURL(url);
// });
$('#review').click(()=>{
  let reviewData = game.getReviewData();
  $('#review-data').text(reviewData);
  $('#review-data').css('display', 'block');
  // let blob = new Blob([reviewData], { type: 'text/plain' });
  // let url = URL.createObjectURL(blob);
  // let a = document.createElement('a');
  // a.href = url;
  // a.download = `review-${new Date().toISOString()}.txt`;
  // a.click();
});
// Save the game to local storage
// Delete the last autosave if the user hasnt made any moves
window.addEventListener('beforeunload', function (evt) {
  let data = game.saveGame();
  if(game.history.length>0)
    this.localStorage.setItem('gameAutoSave', data);
  else 
    this.localStorage.removeItem('gameAutoSave');
});

// Load the game from local storage
$('#load-autosave').click(()=>{
  let err = game.loadGame(autosaveData);
  if (err) {
    displayError(err);
  }
  drawBoard();
});
$('#new-game').click(()=>{
  game.newGame();
  drawBoard();
});

//Load the game from a file
$('#loadBtn').click(() => {
  // Upload a file
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function () {
    let file = input.files[0];
    let reader = new FileReader();
    reader.onload = function () {
      let data = reader.result;
      let err = game.loadGame(data);
      if (err) {
        displayError(err);
      }
      drawBoard();
    }
    reader.readAsText(file);
  }
  input.click();
});
$('#newGameBtn').click(() => {
  game.newGame();
  drawBoard();
});
$('#game-over').on('hidden.bs.modal', function () {
  game.newGame();
  drawBoard();
});
window.addEventListener('message', function (evt) {
  let data = evt.data;
  $('#game-over-message').text(data);
  $('#game-over').modal('show');
});
$('#pause').click(() => {
  paused = true;
  $('#pause-modal').modal('show');
});
$('#resume').click(() => {
  paused = false;
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
  let err = game.setCell(selectedPoint[0], selectedPoint[1]);
  if (err) {
    displayError(err);
  }
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
      canvas.arc(offset_x + x * cellSize, offset_y + y * cellSize, boardSize*0.01, 0, 2 * Math.PI);
      canvas.fill();
    }
  }
  /* Draw the center point */
  canvas.beginPath();
  canvas.arc(offset_x + 7 * cellSize, offset_y + 7 * cellSize, boardSize*0.01, 0, 2 * Math.PI);
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
        let colorHighLight = game.board.cells[i][j] === BLACK ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
        canvas.fillStyle = colorHighLight;
        canvas.beginPath();
        canvas.arc(pointx+circleSize*0.1, pointy+circleSize*0.1, circleSize*0.6, 0, 2 * Math.PI);
        canvas.fill();
      }
    }
  }
  /*Draw hint position on the board */
  if(hint!==null){
    let pointx = offset_x + hint[0] * cellSize;
    let pointy = offset_y + hint[1] * cellSize;
    canvas.fillStyle = 'rgba(255,0,0,0.6)';
    canvas.beginPath();
    canvas.arc(pointx, pointy, circleSize + 1, 0, 2 * Math.PI);
    canvas.fill();
  }
}
