
document.getElementById('row2').textContent = 'remomhe';



const LASTFM_USER = 'Rv3my';
const LASTFM_API_KEY = '248965a0017aa3f8ee2ab5f4440785e8';   

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
setInterval(fetchNowPlaying, 5000); // refresh every 5s


const testimonials = [
  {
    text: "Remomhe stands out because of her ability to deliver exactly what you asked for, she's a top notch communicator and a very versatile developer.",
    name: "— CEO of tulips and roses"
  },
  {
    text: "One of the most detail-oriented developers I've worked with.",
    name: "— StayWoke Luxury"
  },
  {
    text: "You don't fully believe it until you experience it yourself. Remy never disappoints",
    name: "— Undisclosed"
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

    // Capture the CURRENT song details
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


// Show "Welcome back" when the user returns
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        showMessage("WELCOME BACK",);
    }
});