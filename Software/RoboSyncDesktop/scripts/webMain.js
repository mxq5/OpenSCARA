/* Interactive components */
const connectButton = document.getElementById('connectButton');
//const showConnect = document.getElementById('showConnect');

const showControl = document.getElementById('show_control');
const showProgramming = document.getElementById('show_programming');
const showConsole = document.getElementById('show_console');

/* Views */
const connectView = document.getElementById('connectView');
const controlView = document.getElementById('controlView');
const programmingView = document.getElementById('programmingView');


window.addEventListener('DOMContentLoaded', () => {
  connectView.style.display = 'none';
  controlView.style.display = 'flex';
  programmingView.style.display = 'none';
});

connectButton.addEventListener('click', () => {
  //connectView.style.display = 'none';
});


showControl.addEventListener('click', () => {
  controlView.style.display = 'flex';
  connectView.style.display = 'none';
  programmingView.style.display = 'none';
});

showProgramming.addEventListener('click', () => {
  programmingView.style.display = 'block';
  controlView.style.display = 'none';
  connectView.style.display = 'none';
});

showConsole.addEventListener('click', () => {
  console.log("Show console clicked");
});