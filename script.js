
document.getElementById('row2').textContent = 'remomhe';



const LASTFM_USER = 'Rv3my';
const LASTFM_API_KEY = '248965a0017aa3f8ee2ab5f4440785e8';   

const SPOTIFY_PROXY_URL = 'https://now-playing-proxy.aremomheremy.workers.dev';

let livePlayback = { progress_ms: 0, duration_ms: 0, is_playing: false, lastFetch: 0 };

async function pollSpotifyProgress() {
  try {
    const res = await fetch(SPOTIFY_PROXY_URL);
    const data = await res.json();
    livePlayback = { ...data, lastFetch: Date.now() };
  } catch (e) {
    console.error('Progress poll failed', e);
  }
}
pollSpotifyProgress();
setInterval(pollSpotifyProgress, 3000);

function getCurrentProgressSeconds() {
  if (!livePlayback.is_playing) return livePlayback.progress_ms / 1000;
  const drift = (Date.now() - livePlayback.lastFetch) / 1000;
  return (livePlayback.progress_ms / 1000) + drift;
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
      indicator.classList.remove("playing");
      return;
    }

    widget.classList.remove('hidden');
    indicator.classList.add("playing");
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
  <div class="lyrics-panel">
    <button class="lyrics-close" aria-label="Close">&times;</button>
    <div class="lyrics-art-wrap">
      <img class="lyrics-art" id="lyricsArt" src="" alt="">
    </div>
    <div class="lyrics-header">
      <p class="lyrics-track" id="lyricsTrack"></p>
      <p class="lyrics-artist" id="lyricsArtist"></p>
    </div>
    <div class="lyrics-progress-wrap" id="lyricsProgressWrap" style="display:none;">
      <div class="lyrics-eq">
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
    <div class="lyrics-body" id="lyricsBody"></div>
  </div>
`;
document.body.appendChild(lyricsOverlay);

const lyricsBody = document.getElementById('lyricsBody');
const lyricsTrackEl = document.getElementById('lyricsTrack');
const lyricsArtistEl = document.getElementById('lyricsArtist');
const lyricsArtEl = document.getElementById('lyricsArt');
const lyricsProgressWrap = document.getElementById('lyricsProgressWrap');

let syncedLines = [];
let songDuration = 0;
let elapsedSeconds = 0;
let playbackTimer = null;

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

    if (i < activeIndex) {
      words.forEach(w => w.classList.add('sung'));
      return;
    }
    if (i > activeIndex) {
      words.forEach(w => w.classList.remove('sung'));
      return;
    }

    const lineStart = syncedLines[i].time;
    const lineEnd = syncedLines[i + 1] ? syncedLines[i + 1].time : lineStart + 4;
    const duration = Math.max(lineEnd - lineStart, 0.3);
    const progress = Math.min(Math.max((elapsedSeconds - lineStart) / duration, 0), 1);

    const totalChars = Array.from(words).reduce((sum, w) => sum + w.textContent.length, 0) || 1;
    let cumulative = 0;
    words.forEach(w => {
      cumulative += w.textContent.length;
      const wordFraction = cumulative / totalChars;
      w.classList.toggle('sung', wordFraction <= progress);
    });
  });

  const lineHeight = lines[0]?.offsetHeight || 40;
  const offset = -(activeIndex * lineHeight) + (lyricsBody.clientHeight / 2 - lineHeight / 2);
  track.style.transform = `translateY(${offset}px)`;
}

function startPlaybackTimer() {
  stopPlaybackTimer();
  elapsedSeconds = getCurrentProgressSeconds();
  playbackTimer = setInterval(() => {
    elapsedSeconds = getCurrentProgressSeconds();
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

function openLyrics() {
  const track = document.getElementById('npTrack').textContent;
  const artist = document.getElementById('npArtist').textContent;

  if (!track || track === '—') return;

  lyricsTrackEl.textContent = track;
  lyricsArtistEl.textContent = artist;
  lyricsArtEl.src = document.getElementById('npAlbumArt').src || '';
  lyricsBody.innerHTML = '<p class="lyrics-body loading">Loading lyrics...</p>';
  lyricsOverlay.classList.add('visible');

  fetchLyrics(artist, track);
}

function closeLyrics() {
  lyricsOverlay.classList.remove('visible');
  stopPlaybackTimer();
}

lyricsOverlay.addEventListener('click', (e) => {
  if (e.target === lyricsOverlay) closeLyrics();
});
lyricsOverlay.querySelector('.lyrics-close').addEventListener('click', closeLyrics);

document.getElementById('nowPlaying').addEventListener('click', openLyrics);