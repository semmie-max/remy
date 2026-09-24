
const row2El = document.getElementById('row2');

if (row2El) {

row2El.textContent = 'remomhe';



const LASTFM_USER = 'Rv3my';
const LASTFM_API_KEY = '248965a0017aa3f8ee2ab5f4440785e8';   

const SPOTIFY_PROXY_URL = 'https://now-playing-proxy.aremomheremy.workers.dev';

let livePlayback = { progress_ms: 0, duration_ms: 0, is_playing: false, lastFetch: 0 };
let currentTrackKey = '';

async function pollSpotifyProgress() {
  try {
    const res = await fetch(SPOTIFY_PROXY_URL);
    const data = await res.json();
    livePlayback = { ...data, lastFetch: Date.now() };

    if (data.is_playing && data.track) {
      const widget = document.getElementById('nowPlaying');
      widget.classList.remove('hidden');
      document.getElementById('npTrack').textContent = data.track;
      document.getElementById('npArtist').textContent = data.artist || '';
      const albumImg = document.getElementById('npAlbumArt');
      if (data.album_image) albumImg.src = data.album_image;

      const trackKey = `${data.track}__${data.artist}`;
      if (trackKey !== currentTrackKey) {
        currentTrackKey = trackKey;
        if (lyricsOverlay.classList.contains('visible')) {
          lyricsTrackEl.textContent = data.track;
          lyricsArtistEl.textContent = data.artist || '';
          lyricsArtEl.src = data.album_image || '';
          fetchLyrics(data.artist, data.track);
        }
      }
    } else if (!data.is_playing) {
      const widget = document.getElementById('nowPlaying');
      widget.classList.add('hidden');
    }
  } catch (e) {
    console.error('Progress poll failed', e);
  }
}
pollSpotifyProgress();
setInterval(pollSpotifyProgress, 3000);

function getCurrentProgressSeconds() {
  const base = Number(livePlayback.progress_ms);
  if (!Number.isFinite(base)) return null;
  if (!livePlayback.is_playing) return base / 1000;
  const drift = (Date.now() - livePlayback.lastFetch) / 1000;
  return (base / 1000) + drift;
}

async function fetchNowPlaying() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const track = data.recenttracks.track[0];
    const isPlaying = track['@attr']?.nowplaying === 'true';

    const widget = document.getElementById('nowPlaying');
    if (!isPlaying) {
      widget.classList.add('hidden');
      return;
    }

    widget.classList.remove('hidden');
    document.getElementById('npTrack').textContent = track.name;
    document.getElementById('npArtist').textContent = track.artist['#text'];

    if (!window.hasShownGreeting) {
    window.hasShownGreeting = true;

    setTimeout(() => {
        showMessage("HI.", "");
    }, 300);
}

    const img = track.image.find(i => i.size === 'large')?.['#text'];
    const albumImg = document.getElementById('npAlbumArt');
    albumImg.src = img || '';
  } catch (e) {
    console.error('Now playing fetch failed', e);
  }
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 5000);


const testimonials = [
  {
    text: "Software is one of the few places where imagination can become something functional.",
    name: "this resonates with me sm idk"
  },
  {
    text: "a move that looks useless sometimes is the most important move on the board  ",
    name: "A good game of chess is always welcome. hmu please"
  },
  {
    text: "Studying how spacecraft trajectories are calculated when both the spacecraft and target body are following paths through space.",
    name: "Learning about orbital transfers, gravitational influences, and the mathematics required for precision space missions."
  },
  {
    text: "Some puzzles require proving that no solution exsts ",
    name: "i think this is weird but true"
  },
  {
    text: "How do engineers calculate the exact path a spacecraft must follow when travelling through space while accounting for orbital transfers, gravitational influences, and the movement of celestial bodies?",
    name: "randomly thought of this"
  },
  {
    text: "I know i'm going to be a really cracked engineer",
    name: "dreams fr."
  },
  {
    text: "Machines can process information, but humans create meaning, ideas, and innovation.",
    name: "ai cannot replace"
  }
];

let testiIndex = 0;

function typeTestimonial(text, callback) {
  const el = document.getElementById('testiText');
  el.textContent = '';
  el.style.borderRight = '2px solid #fff';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      el.style.borderRight = 'none';
      if (callback) callback();
    }
  }, 38);
}

function showTestimonial() {
  const testi = testimonials[testiIndex];
  const author = document.getElementById('testiAuthor');
  const name = document.getElementById('testiName');

  author.classList.remove('visible');
  name.textContent = testi.name;

  typeTestimonial(testi.text, () => {
    setTimeout(() => {
      author.classList.add('visible');
      setTimeout(() => {
        testiIndex = (testiIndex + 1) % testimonials.length;
        showTestimonial();
      }, 6000);
    }, 300);
  });
}

const testiObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      showTestimonial();
      testiObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

testiObserver.observe(document.getElementById('testimonials'));


const nowPlaying = document.querySelector(".now-playing");

let scrollTimeout;

window.addEventListener("scroll", () => {

    nowPlaying.classList.add("mini");

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
        nowPlaying.classList.remove("mini");
    }, 3000);

});



const npLabel = document.querySelector(".np-label");
const npTrack = document.querySelector(".np-track");
const npArtist = document.querySelector(".np-artist");

const original = {
    label: npLabel.textContent,
    track: npTrack.textContent,
    artist: npArtist.textContent
};

function showMessage(label, track, artist = "", duration = 2000) {

    const original = {
        label: npLabel.textContent,
        track: npTrack.textContent,
        artist: npArtist.textContent
    };

    npLabel.textContent = label;
    npTrack.textContent = track;
    npArtist.textContent = artist;

    setTimeout(() => {
        npLabel.textContent = original.label;
        npTrack.textContent = original.track;
        npArtist.textContent = original.artist;
    }, duration);
}


document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        showMessage("WELCOME BACK",);
    }
});

const lyricsOverlay = document.createElement('div');
lyricsOverlay.className = 'lyrics-overlay';
lyricsOverlay.innerHTML = `
  <div class="lyrics-panel" id="lyricsPanel" data-view="player">
    <button class="lyrics-close" aria-label="Close">&times;</button>

    <div class="player-view" id="playerView">
      <div class="player-art-bg" id="playerArtBg"></div>
      <div class="player-card">
        <div class="player-art">
          <img id="playerArtImg" src="" alt="">
        </div>

        <p class="player-track" id="playerTrack"></p>
        <p class="player-artist" id="playerArtist"></p>

        <div class="player-progress-row">
          <button class="player-heart-btn" id="playerHeartBtn" aria-label="Like">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>
          </button>
          <span class="player-time" id="playerTimeElapsed">0:00</span>
          <div class="player-progress-bar">
            <div class="player-progress-fill" id="playerProgressFill"></div>
            <div class="player-progress-dot" id="playerProgressDot"></div>
          </div>
          <span class="player-time" id="playerTimeTotal">0:00</span>
        </div>

        <div class="player-controls">
          <button class="player-control-btn" aria-label="Previous">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"></path></svg>
          </button>
          <button class="player-control-btn player-control-main" id="playerPlayBtn" aria-label="Play">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
          </button>
          <button class="player-control-btn" aria-label="Next">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"></path></svg>
          </button>
        </div>

        <button class="player-lyrics-trigger" id="playerLyricsTrigger">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          <span>LYRICS</span>
        </button>
      </div>
    </div>

    <div class="lyrics-view" id="lyricsView">
      <div class="lyrics-art-bg" id="lyricsArtBg"></div>
      <div class="lyrics-top-row">
        <div class="lyrics-progress-wrap" id="lyricsProgressWrap" style="display:none;">
          <div class="lyrics-eq">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="lyrics-header">
          <p class="lyrics-track" id="lyricsTrack"></p>
          <p class="lyrics-artist" id="lyricsArtist"></p>
        </div>
        <div class="lyrics-art-wrap">
          <img class="lyrics-art" id="lyricsArt" src="" alt="">
        </div>
      </div>
      <div class="lyrics-body" id="lyricsBody"></div>
    </div>
  </div>
`;
document.body.appendChild(lyricsOverlay);

const lyricsPanel = document.getElementById('lyricsPanel');
let playerProgressTimer = null;

function updatePlayerProgress() {
  const elapsed = getCurrentProgressSeconds();
  const durationSec = Number(livePlayback.duration_ms) / 1000;
  if (elapsed === null || !Number.isFinite(durationSec) || durationSec <= 0) return;

  const pct = Math.min(100, (elapsed / durationSec) * 100);
  document.getElementById('playerProgressFill').style.width = pct + '%';
  const dot = document.getElementById('playerProgressDot');
  if (dot) dot.style.left = pct + '%';
  document.getElementById('playerTimeElapsed').textContent = formatTime(elapsed);
  document.getElementById('playerTimeTotal').textContent = formatTime(durationSec);
}

function startPlayerProgressTimer() {
  stopPlayerProgressTimer();
  updatePlayerProgress();
  playerProgressTimer = setInterval(updatePlayerProgress, 500);
}

function stopPlayerProgressTimer() {
  if (playerProgressTimer) {
    clearInterval(playerProgressTimer);
    playerProgressTimer = null;
  }
}

const lyricsBody = document.getElementById('lyricsBody');
const lyricsTrackEl = document.getElementById('lyricsTrack');
const lyricsArtistEl = document.getElementById('lyricsArtist');
const lyricsArtEl = document.getElementById('lyricsArt');
const lyricsProgressWrap = document.getElementById('lyricsProgressWrap');

let syncedLines = [];
let songDuration = 0;
let elapsedSeconds = 0;
let playbackTimer = null;
let lyricsPreviewKey = '';

function prepareLyricsPreview() {
  const track = document.getElementById('playerTrack').textContent;
  const artist = document.getElementById('playerArtist').textContent;
  const art = document.getElementById('playerArtImg').src;

  lyricsTrackEl.textContent = track;
  lyricsArtistEl.textContent = artist;
  lyricsArtEl.src = art;
  document.getElementById('lyricsArtBg').style.backgroundImage = art ? `url(${art})` : 'none';

  const key = `${track}__${artist}`;
  if (key !== lyricsPreviewKey) {
    lyricsPreviewKey = key;
    lyricsBody.innerHTML = '<p class="lyrics-body loading">Loading lyrics...</p>';
    fetchLyrics(artist, track);
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function parseLRC(lrcText) {
  const lines = lrcText.split('\n');
  const result = [];
  const timeTag = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  lines.forEach(line => {
    const matches = [...line.matchAll(timeTag)];
    if (matches.length === 0) return;
    const text = line.replace(timeTag, '').trim();
    matches.forEach(m => {
      const minutes = parseInt(m[1]);
      const seconds = parseInt(m[2]);
      const ms = parseInt(m[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + ms / 1000;
      result.push({ time, text });
    });
  });

  return result.sort((a, b) => a.time - b.time);
}

function renderStaticLyrics(text) {
  lyricsBody.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = text;
  p.style.whiteSpace = 'pre-wrap';
  lyricsBody.appendChild(p);
}

function renderSyncedLyrics() {
  lyricsBody.innerHTML = `<div class="lyrics-track" id="lyricsTrackWrap"></div>`;
  const track = document.getElementById('lyricsTrackWrap');
  syncedLines.forEach((line) => {
    const div = document.createElement('div');
    div.className = 'lyrics-line';

    if (!line.text) {
      div.innerHTML = '&nbsp;';
    } else {
      const words = line.text.split(' ');
      words.forEach((w, wi) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w;
        div.appendChild(span);
        if (wi < words.length - 1) {
          div.appendChild(document.createTextNode(' '));
        }
      });
    }

    track.appendChild(div);
  });
}

function updateActiveLine() {
  if (syncedLines.length === 0) return;

  let activeIndex = 0;
  for (let i = 0; i < syncedLines.length; i++) {
    if (syncedLines[i].time <= elapsedSeconds) {
      activeIndex = i;
    } else {
      break;
    }
  }

  const track = document.getElementById('lyricsTrackWrap');
  if (!track) return;

  const lines = track.querySelectorAll('.lyrics-line');

  lines.forEach((el, i) => {
    el.classList.toggle('current', i === activeIndex);
    const words = el.querySelectorAll('.word');
    words.forEach(w => w.classList.toggle('sung', i === activeIndex));
  });

  const activeEl = lines[activeIndex];
  const activeHeight = activeEl ? activeEl.offsetHeight : (lines[0]?.offsetHeight || 40);
  const offset = activeEl
    ? -(activeEl.offsetTop) + (lyricsBody.clientHeight / 2 - activeHeight / 2)
    : 0;
  track.style.transform = `translateY(${offset}px)`;
}

function startPlaybackTimer() {
  stopPlaybackTimer();
  const initial = getCurrentProgressSeconds();
  elapsedSeconds = initial !== null ? initial : 0;
  let localStart = Date.now() - elapsedSeconds * 1000;
  playbackTimer = setInterval(() => {
    const live = getCurrentProgressSeconds();
    if (live !== null) {
      elapsedSeconds = live;
      localStart = Date.now() - elapsedSeconds * 1000;
    } else {
      elapsedSeconds = (Date.now() - localStart) / 1000;
    }
    if (songDuration > 0 && elapsedSeconds > songDuration) {
      elapsedSeconds = songDuration;
    }
    updateActiveLine();
  }, 500);
}

function stopPlaybackTimer() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

async function fetchLyrics(artist, track) {
  syncedLines = [];
  songDuration = 0;
  lyricsProgressWrap.style.display = 'none';
  stopPlaybackTimer();

  try {
    const searchUrl = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}`;
    const res = await fetch(searchUrl);
    const results = await res.json();

    const match = results.find(r => r.syncedLyrics) || results[0];

    if (match && match.syncedLyrics) {
      syncedLines = parseLRC(match.syncedLyrics);
      songDuration = match.duration || 0;

      if (syncedLines.length > 0) {
        renderSyncedLyrics();
        lyricsProgressWrap.style.display = 'block';
        startPlaybackTimer();
        return;
      }
    }

    if (match && match.plainLyrics) {
      renderStaticLyrics(match.plainLyrics.trim());
      return;
    }

    const fallbackRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
    const fallbackData = await fallbackRes.json();

    if (fallbackData.lyrics) {
      renderStaticLyrics(fallbackData.lyrics.trim());
    } else {
      lyricsBody.innerHTML = '<p class="lyrics-body empty">No lyrics found for this track.</p>';
    }
  } catch (e) {
    lyricsBody.innerHTML = '<p class="lyrics-body empty">Could not load lyrics right now.</p>';
  }
}

function openPlayerView() {
  const track = document.getElementById('npTrack').textContent;
  const artist = document.getElementById('npArtist').textContent;
  const art = document.getElementById('npAlbumArt').src || '';

  if (!track || track === '—') return;

  document.getElementById('playerTrack').textContent = track;
  document.getElementById('playerArtist').textContent = artist;
  document.getElementById('playerArtImg').src = art;
  document.getElementById('playerArtBg').style.backgroundImage = art ? `url(${art})` : 'none';

  lyricsPanel.dataset.view = 'player';
  lyricsOverlay.classList.add('visible');

  startPlayerProgressTimer();
}

function switchToLyricsView() {
  const track = document.getElementById('playerTrack').textContent;
  const artist = document.getElementById('playerArtist').textContent;
  const art = document.getElementById('playerArtImg').src;

  lyricsTrackEl.textContent = track;
  lyricsArtistEl.textContent = artist;
  lyricsArtEl.src = art;
  document.getElementById('lyricsArtBg').style.backgroundImage = art ? `url(${art})` : 'none';
  lyricsBody.innerHTML = '<p class="lyrics-body loading">Loading lyrics...</p>';

  lyricsPanel.dataset.view = 'lyrics';
  fetchLyrics(artist, track);
}

function closeLyrics() {
  lyricsOverlay.classList.remove('visible');
  stopPlaybackTimer();
  stopPlayerProgressTimer();
}

lyricsOverlay.addEventListener('click', (e) => {
  if (e.target === lyricsOverlay) closeLyrics();
});
lyricsOverlay.querySelector('.lyrics-close').addEventListener('click', closeLyrics);

document.getElementById('playerLyricsTrigger').addEventListener('click', switchToLyricsView);

document.getElementById('playerHeartBtn').addEventListener('click', () => {
  document.getElementById('playerHeartBtn').classList.toggle('liked');
});

document.getElementById('nowPlaying').addEventListener('click', openPlayerView);

(function () {
  const playerView = document.getElementById('playerView');
  if (!playerView) return;

  const lyricsViewEl = document.getElementById('lyricsView');

  const fadeEls = [
    document.getElementById('playerArtImg').closest('.player-art'),
    document.getElementById('playerTrack'),
    document.getElementById('playerArtist'),
    playerView.querySelector('.player-progress-row'),
    playerView.querySelector('.player-controls')
  ].filter(Boolean);

  let startY = 0, startX = 0, startTime = 0, tracking = false, dragging = false;

  const COMMIT_DISTANCE = 110;
  const SWIPE_DISTANCE = 35;
  const FLICK_DISTANCE = 12;
  const FLICK_TIME = 220;

  function setProgress(p) {
    fadeEls.forEach(el => {
      el.style.opacity = String(1 - p);
      el.style.transform = `scale(${1 - p * 0.06}) translateY(${-p * 14}px)`;
    });
    if (lyricsViewEl) {
      lyricsViewEl.style.opacity = String(p);
      lyricsViewEl.style.transform = `translateY(${(1 - p) * 24}px)`;
    }
  }

  function resetProgress() {
    fadeEls.forEach(el => {
      el.style.opacity = '';
      el.style.transform = '';
    });
    if (lyricsViewEl) {
      lyricsViewEl.style.opacity = '';
      lyricsViewEl.style.transform = '';
    }
  }

  function onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    tracking = true;
    dragging = false;
    startY = e.clientY;
    startX = e.clientX;
    startTime = Date.now();
  }

  function onMove(e) {
    if (!tracking) return;
    const dy = startY - e.clientY;
    const dx = Math.abs(e.clientX - startX);

    if (dx > 60 || dy <= 0) {
      if (dragging) {
        dragging = false;
        playerView.classList.remove('dragging');
        resetProgress();
      }
      return;
    }

    if (!dragging) {
      prepareLyricsPreview();
    }

    dragging = true;
    playerView.classList.add('dragging');
    setProgress(Math.min(1, dy / COMMIT_DISTANCE));
  }

  function onUp(e) {
    if (!tracking) return;
    tracking = false;
    const dy = startY - e.clientY;
    const dx = Math.abs(e.clientX - startX);
    const dt = Date.now() - startTime;

    playerView.classList.remove('dragging');

    if (dx > 60) { resetProgress(); dragging = false; return; }

    const gentleSwipe = dy > SWIPE_DISTANCE;
    const fastFlick = dy > FLICK_DISTANCE && dt < FLICK_TIME;

    if (dragging && (gentleSwipe || fastFlick)) {
      switchToLyricsView();
    }
    resetProgress();
    dragging = false;
  }

  playerView.addEventListener('pointerdown', onDown);
  playerView.addEventListener('pointermove', onMove);
  playerView.addEventListener('pointerup', onUp);
  playerView.addEventListener('pointercancel', () => {
    tracking = false;
    dragging = false;
    playerView.classList.remove('dragging');
    resetProgress();
  });
})();

} // end homepage-only code


// ===================================================================
// ===== Fragments page: scroll-triggered typewriter text section ====
// Wrapped in its own IIFE so nothing here leaks into the global scope
// or collides with anything above. Also does nothing at all on pages
// that don't have a [data-frag-blur] element, so it's safe to include
// in this shared file even though only fragments/index.html uses it.
// ===================================================================

(function () {
  const fragEls = document.querySelectorAll('[data-frag-blur]');
  if (!fragEls.length) return;

  const photoStack = document.getElementById('fragPhotos');
  if (photoStack) {
    const polaroids = photoStack.querySelectorAll('.frag-polaroid');
    let topZ = polaroids.length + 1;
    polaroids.forEach((el) => {
      el.addEventListener('click', () => {
        topZ++;
        el.style.zIndex = topZ;
      });
    });
  }

  const FRAG_TYPE_SPEED = 8;
  const FRAG_CHARS_PER_TICK = 2;

  function typeFragLine(el) {
    const fullText = el.textContent;
    el.textContent = '';

    const textSpan = document.createElement('span');
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'frag-cursor';

    el.appendChild(textSpan);
    el.appendChild(cursorSpan);

    let i = 0;
    const interval = setInterval(() => {
      textSpan.textContent += fullText.slice(i, i + FRAG_CHARS_PER_TICK);
      i += FRAG_CHARS_PER_TICK;
      if (i >= fullText.length) {
        clearInterval(interval);
        cursorSpan.remove();
      }
    }, FRAG_TYPE_SPEED);
  }

  const fragObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        typeFragLine(entry.target);
        fragObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  fragEls.forEach((el) => fragObserver.observe(el));
})();

// ===================================================================
// ===== Fragments page: scroll-linked name reveal (RV3MY) ===========
// Progress is driven directly by scroll position, so it naturally
// pauses wherever the user stops scrolling and resumes on scroll.
// ===================================================================

(function () {
  const nameEl = document.querySelector('[data-frag-name]');
  if (!nameEl) return;

  const NAME_SLIDE_RANGE = 220;

  function clampSlide(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function updateNameSlide() {
    const section = nameEl.closest('.frag-name-section');
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const start = windowHeight * 0.9;
    const end = windowHeight * 0.1;

    let progress = (start - rect.top) / (start - end);
    progress = clampSlide(progress, 0, 1);

    const offset = NAME_SLIDE_RANGE - (progress * NAME_SLIDE_RANGE * 2);
    nameEl.style.transform = `translateX(${offset}px)`;
  }

  let nameTicking = false;
  function onNameScroll() {
    if (!nameTicking) {
      requestAnimationFrame(() => {
        updateNameSlide();
        nameTicking = false;
      });
      nameTicking = true;
    }
  }

  window.addEventListener('scroll', onNameScroll, { passive: true });
  window.addEventListener('resize', onNameScroll);

  updateNameSlide();
})();

(function () {
  const grid = document.getElementById('ghActivityGrid');
  if (!grid) return;

  const username = 'semmie-max';
  const countEl = document.getElementById('ghActivityCount');

  fetch('https://github-contributions-api.jogruber.de/v4/' + username + '?y=last')
    .then((res) => res.json())
    .then((data) => {
      const days = data.contributions || [];
      const total = days.reduce((sum, d) => sum + d.count, 0);
      if (countEl) countEl.textContent = total + ' contributions in the last year';

      days.forEach((day) => {
        const cell = document.createElement('div');
        cell.className = 'gh-cell gh-level-' + day.level;
        cell.title = day.count + ' contributions on ' + day.date;
        grid.appendChild(cell);
      });
    })
    .catch(() => {
      grid.textContent = 'could not load github activity right now';
    });
})();

(function () {
  const wordsWrap = document.getElementById('textStreamWords');
  if (!wordsWrap) return;

  const words = Array.from(wordsWrap.querySelectorAll('.textstream-word'));
  if (!words.length) return;

  const TEXTSTREAM_INTERVAL_MS = 1800;
  const TEXTSTREAM_EXIT_MS = 500;

  function sizeToWidestWord() {
    let maxWidth = 0;
    words.forEach((word) => {
      word.style.position = 'static';
      maxWidth = Math.max(maxWidth, word.getBoundingClientRect().width);
      word.style.position = 'absolute';
    });
    wordsWrap.style.width = `${Math.ceil(maxWidth)}px`;
  }

  sizeToWidestWord();
  window.addEventListener('resize', sizeToWidestWord);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(sizeToWidestWord);
  }

  let current = 0;
  words[current].classList.add('is-active');

  setInterval(() => {
    const currentEl = words[current];
    currentEl.classList.remove('is-active');
    currentEl.classList.add('is-exiting');

    current = (current + 1) % words.length;
    const nextEl = words[current];
    nextEl.classList.add('is-active');

    setTimeout(() => {
      currentEl.classList.remove('is-exiting');
    }, TEXTSTREAM_EXIT_MS);
  }, TEXTSTREAM_INTERVAL_MS);
})();


document.addEventListener("DOMContentLoaded", () => {
  const songListEl = document.getElementById("songList");
  if (!songListEl) return;

  function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = (totalSec % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  }

  function renderPlaylist(playlist) {
    document.getElementById("playlistName").textContent = playlist.name || "My Playlist";
    document.getElementById("playlistCoverImg").src = playlist.coverImage || "";
    document.getElementById("playlistCoverTitle").textContent = playlist.name || "";
    document.getElementById("playlistCoverSub").textContent = `${playlist.tracks.length} songs`;

    songListEl.innerHTML = "";

    playlist.tracks.forEach((track, i) => {
      const li = document.createElement("li");
      li.className = "song-item";
      li.dataset.uri = track.uri || "";

      li.innerHTML = `
        <span class="song-index">${i + 1}</span>
        <div class="song-info">
          <span class="song-title">${track.name}</span>
          <span class="song-artist">${track.artist}</span>
        </div>
        <span class="song-duration">${formatDuration(track.durationMs)}</span>
        <svg class="song-note-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      `;

      li.addEventListener("click", () => {
        songListEl.querySelectorAll(".song-item").forEach((s) => s.classList.remove("active"));
        li.classList.add("active");
      });

      songListEl.appendChild(li);
    });
  }

  fetch("https://now-playing-proxy.aremomheremy.workers.dev/playlist")
    .then((res) => res.json())
    .then((data) => renderPlaylist(data))
    .catch((e) => console.error("Playlist fetch failed", e));
});

(function () {
  const board = document.getElementById('signboard');
  const form = document.getElementById('signboardForm');
  const input = document.getElementById('signboardInput');
  const inkDots = document.querySelectorAll('.ink-dot');

  if (!board || !form) return;

  const SIGN_API = 'https://now-playing-proxy.aremomheremy.workers.dev';

  let selectedColor = '#1a1a1a';

  inkDots.forEach((dot, i) => {
    if (i === 0) dot.classList.add('selected');
    dot.addEventListener('click', () => {
      inkDots.forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      selectedColor = dot.dataset.color;
    });
  });

  function renderSignature(sig) {
    const el = document.createElement('div');
    el.className = 'signboard-signature';
    el.textContent = sig.text;
    el.style.color = sig.color;
    el.style.left = sig.x + '%';
    el.style.top = sig.y + '%';
    el.style.setProperty('--rot', sig.rot + 'deg');
    el.style.transform = `rotate(${sig.rot}deg)`;
    el.style.fontSize = sig.size + 'rem';
    board.appendChild(el);
  }

  async function loadSignatures() {
    try {
      const res = await fetch(`${SIGN_API}/signatures`);
      const signatures = await res.json();
      signatures.forEach(renderSignature);
    } catch (e) {
      console.error('Failed to load signatures', e);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    try {
      const res = await fetch(`${SIGN_API}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, color: selectedColor })
      });
      const sig = await res.json();
      if (sig.error) {
        console.error('Sign failed', sig.error);
        return;
      }
      renderSignature(sig);
    } catch (e) {
      console.error('Failed to sign', e);
    }
  });

  loadSignatures();
})();