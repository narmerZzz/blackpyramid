const win = document.getElementById('window');
const closed = document.getElementById('closed');
const closeButton = document.getElementById('close');
const reopenButton = document.getElementById('reopen');

closeButton.addEventListener('click', () => {
  win.classList.add('hidden');
  closed.classList.remove('hidden');
  reopenButton.focus();
});

reopenButton.addEventListener('click', () => {
  closed.classList.add('hidden');
  win.classList.remove('hidden');
  closeButton.focus();
});