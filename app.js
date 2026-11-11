/* ===== app.js — Melame glavna logika ===== */

const gate = document.getElementById('gate');
const app = document.getElementById('app');
const inviteInput = document.getElementById('inviteCode');
const enterBtn = document.getElementById('enterBtn');
const gateError = document.getElementById('gateError');
const uploadBtn = document.getElementById('uploadBtn');
const uploadModal = document.getElementById('uploadModal');
const inviteBtn = document.getElementById('inviteBtn');
const inviteModal = document.getElementById('inviteModal');
const inviteCodeShow = document.getElementById('inviteCodeShow');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const inviteClose = document.getElementById('inviteClose');
const upCancel = document.getElementById('upCancel');
const upSave = document.getElementById('upSave');
const upTitle = document.getElementById('upTitle');
const upArtist = document.getElementById('upArtist');
const upFile = document.getElementById('upFile');
const songList = document.getElementById('songList');
const emptyState = document.getElementById('emptyState');
const player = document.getElementById('player');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const seekBar = document.getElementById('seekBar');
const curTimeEl = document.getElementById('curTime');
const durTimeEl = document.getElementById('durTime');
const volBar = document.getElementById('volBar');
const audio = document.getElementById('audioEl');
const searchInput = document.getElementById('searchInput');
const installBtn = document.getElementById('installBtn');
const logoutBtn = document.getElementById('logoutBtn');

let allSongs = [];
let currentSongId = null;

/* ========== GATE ========== */
async function initGate() {
  const real = (await getInviteCode()).toUpperCase();
  inviteCodeShow.textContent = real;
  
  const saved = sessionStorage.getItem('melame_auth');
  if (saved === '1') {
    enterApp();
  }
}

enterBtn.addEventListener('click', async () => {
  const real = (await getInviteCode()).toUpperCase();
  const entered = inviteInput.value.trim().toUpperCase();
  if (entered === real) {
    sessionStorage.setItem('melame_auth', '1');
    enterApp();
  } else {
    gateError.classList.remove('hidden');
  }
});

function enterApp() {
  gate.classList.add('hidden');
  app.classList.remove('hidden');
  loadSongs();
}

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('melame_auth');
  location.reload();
});

/* ========== PESMI ========== */
async function loadSongs() {
  allSongs = await dbGetAllSongs();
  renderList();
}

function renderList(filter = '') {
  songList.innerHTML = '';
  const q = filter.toLowerCase();
  const filtered = allSongs.filter(s => 
    s.title.toLowerCase().includes(q) || 
    s.artist.toLowerCase().includes(q)
  );
  
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(s => {
      const div = document.createElement('div');
      div.className = 'song';
      div.innerHTML = `
        <div class="song-cover">${s.cover ? '🖼️' : '🎵'}</div>
        <div class="song-info">
          <div class="song-title">${esc(s.title)}</div>
          <div class="song-artist">${esc(s.artist)}</div>
        </div>
        <button class="icon-btn" onclick="playSong(${s.id})">▶</button>
        <button class="icon-btn" onclick="downloadSong(${s.id})">⬇</button>
        <button class="icon-btn" onclick="removeSong(${s.id})">🗑</button>
      `;
      songList.appendChild(div);
    });
  }
}

function esc(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ========== PREDVAJANJE ========== */
async function playSong(id) {
  const s = allSongs.find(x => x.id === id);
  if (!s) return;
  
  currentSongId = id;
  playerTitle.textContent = s.title;
  playerArtist.textContent = s.artist;
  player.classList.remove('hidden');
  
  const url = URL.createObjectURL(s.blob);
  audio.src = url;
  audio.play();
  playPauseBtn.textContent = '⏸';
  
  audio.ontimeupdate = () => {
    curTimeEl.textContent = fmtTime(audio.currentTime);
    durTimeEl.textContent = fmtTime(audio.duration);
    seekBar.value = (audio.currentTime / audio.duration) * 100 || 0;
  };
}

playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = '⏸';
  } else {
    audio.pause();
    playPauseBtn.textContent = '▶';
  }
});

seekBar.addEventListener('input', () => {
  audio.currentTime = (seekBar.value / 100) * audio.duration;
});

volBar.addEventListener('input', () => {
  audio.volume = volBar.value;
