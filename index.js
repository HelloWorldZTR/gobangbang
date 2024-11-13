function getClientHeight() {
  return window.innerHeight-$('header').height(); 
}
function getClietWidth() {
  return window.innerWidth-$('#sidebar').width();
}
function getBoardSize() {
  return Math.min(getClientHeight(), getClietWidth());
}

$(document).on('resize', function() {
  $('#board').attr('width', getBoardSize());
  $('#board').attr('height', getBoardSize());
  render();
});
$(document).ready(function() {
  $('#board').attr('width', getBoardSize());
  $('#board').attr('height', getBoardSize());
  render();
} );


function render(){
    let board = $('#board')[0];
    let canvas = board.getContext('2d');
    let boardSize = getBoardSize();
    let offset_x = boardSize*0.1;
    let offset_y = boardSize*0.1;
    let shadow = boardSize*0.02;
    let width = boardSize*0.8;
    let height = boardSize*0.8;
    let cellSize = width/14;
    /* Debugging */
    console.log('Board size: ' + boardSize);
    console.log('Offset x: ' + offset_x);
    console.log('Offset y: ' + offset_y);
    console.log('Width: ' + width);
    console.log('Height: ' + height);
    console.log('Cell size: ' + cellSize);

    /* Draw the board background */
    canvas.fillStyle = 'red';
    canvas.fillRect(shadow, shadow, boardSize, boardSize);
    canvas.fillStyle = 'yellow';
    canvas.fillRect(0, 0, boardSize-shadow, boardSize-shadow);
    /* Draw the board lines */
    canvas.penStyle = 'black';
    canvas.lineWidth = 1;
    for(let i = 0; i < 15; i++){
        canvas.moveTo(offset_x + i*cellSize, offset_y);
        canvas.lineTo(offset_x + i*cellSize, offset_y + height);
        canvas.stroke();
    }
    for(let i = 0; i < 15; i++){
        canvas.moveTo(offset_x, offset_y + i*cellSize);
        canvas.lineTo(offset_x + width, offset_y + i*cellSize);
        canvas.stroke();
    }
    canvas.fillStyle = 'black';
    /* Draw the star points */
    let starPoints = [3, 11];
    for(let i = 0; i < 2; i++){
        for(let j = 0; j < 2; j++){
            let x = starPoints[i];
            let y = starPoints[j];
            canvas.beginPath();
            canvas.arc(offset_x + x*cellSize, offset_y + y*cellSize, 5, 0, 2*Math.PI);
            canvas.fill();
        }
    }
    /* Draw the center point */
    canvas.beginPath();
    canvas.arc(offset_x + 7*cellSize, offset_y + 7*cellSize, 5, 0, 2*Math.PI);
    canvas.fill();

}
