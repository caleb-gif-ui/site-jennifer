/* ============================================================
   ✨ script.js – Expérience Romantique Premium pour Jennifer
   ============================================================
   Particules, Curseur, Carrousel 3D, Audio Autoplay, Modale,
   Ripple, Swipe, Animations Scroll. Tout en Vanilla JS.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ---------- ÉLÉMENTS DOM ----------
  const body = document.body;
  const cursor = document.getElementById("customCursor");
  const hamburger = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  const particlesCanvas = document.getElementById("particlesCanvas");
  const ctx = particlesCanvas.getContext("2d");

  // Carrousel
  const carouselTrack = document.getElementById("carouselTrack");
  const slides = document.querySelectorAll(".carousel-slide");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  const indicators = document.querySelectorAll(".indicator");
  let currentIndex = 2; // Commencer au milieu (Jennifer3)
  let autoplayInterval;
  let touchStartX = 0;
  let touchEndX = 0;

  // Modale lettre
  const letterModal = document.getElementById("letterModal");
  const openLetterBtn = document.getElementById("openLetterBtn");
  const modalClose = document.getElementById("modalClose");

  // Audio
  const bgMusic = document.getElementById("bgMusic");
  const playBtn = document.getElementById("playBtn");
  const progressContainer = document.getElementById("progressContainer");
  const progressFill = document.getElementById("progressFill");
  const progressThumb = document.getElementById("progressThumb");
  const timeDisplay = document.getElementById("timeDisplay");
  const volumeSlider = document.getElementById("volumeSlider");
  const musicCard = document.querySelector(".music-card");
  let audioInitialized = false;

  // ---------- CURSEUR PERSONNALISÉ ----------
  if (window.innerWidth > 768) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    // Cache le curseur par défaut sur les éléments interactifs
    const interactiveElements = document.querySelectorAll(
      "a, button, .carousel-btn, .indicator, .hamburger, .progress-bar, .volume-slider",
    );
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", () => (cursor.style.opacity = "0.3"));
      el.addEventListener("mouseleave", () => (cursor.style.opacity = "1"));
    });
  }

  // ---------- MENU HAMBURGER MOBILE ----------
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.setAttribute(
      "aria-expanded",
      navLinks.classList.contains("active"),
    );
  });

  // Fermer le menu au clic sur un lien
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  // ---------- SYSTÈME DE PARTICULES (Canvas) ----------
  let particles = [];
  const maxParticles = 70;
  const heartPath = new Path2D(
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  ); // Cœur SVG path

  function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * particlesCanvas.height;
    }
    reset() {
      this.x = Math.random() * particlesCanvas.width;
      this.y = particlesCanvas.height + 20;
      this.size = Math.random() * 12 + 4;
      this.speedY = Math.random() * 0.4 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.type = Math.random() < 0.3 ? "heart" : "dot"; // 30% cœurs
      this.angle = Math.random() * Math.PI * 2;
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.angle * 0.02) * 0.1;
      this.angle += 0.01;
      if (this.y < -20 || this.x < -20 || this.x > particlesCanvas.width + 20) {
        this.reset();
        this.y = particlesCanvas.height + 20;
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (this.type === "heart") {
        const scale = this.size / 24;
        ctx.fillStyle = "#ff4f8b";
        ctx.shadowColor = "#ff4f8b";
        ctx.shadowBlur = 10;
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        ctx.fill(heartPath);
      } else {
        ctx.fillStyle = `rgba(255, 143, 177, ${this.opacity})`;
        ctx.shadowColor = "#ff8fb1";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Initialiser les particules
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ---------- CARROUSEL 3D ----------
  function updateCarousel() {
    slides.forEach((slide, index) => {
      slide.classList.remove("active", "prev", "next");
      if (index === currentIndex) {
        slide.classList.add("active");
      } else if (index === (currentIndex - 1 + slides.length) % slides.length) {
        slide.classList.add("prev");
      } else if (index === (currentIndex + 1) % slides.length) {
        slide.classList.add("next");
      }
    });
    // Mise à jour des indicateurs
    indicators.forEach((ind, idx) => {
      ind.classList.toggle("active", idx === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
    resetAutoplay();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
    resetAutoplay();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
    resetAutoplay();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 4500);
  }

  function stopAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Événements boutons
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);
  indicators.forEach((ind) => {
    ind.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      goToSlide(idx);
    });
  });

  // Swipe tactile
  carouselTrack.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    },
    { passive: true },
  );

  carouselTrack.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    resetAutoplay();
  });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  }

  // Initialisation
  updateCarousel();
  startAutoplay();

  // Pause autoplay au survol
  carouselTrack.addEventListener("mouseenter", stopAutoplay);
  carouselTrack.addEventListener("mouseleave", startAutoplay);

  // ---------- MODALE LETTRE ----------
  function openModal() {
    letterModal.classList.add("active");
    body.style.overflow = "hidden";
  }

  function closeModal() {
    letterModal.classList.remove("active");
    body.style.overflow = "";
  }

  openLetterBtn.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  letterModal.addEventListener("click", (e) => {
    if (e.target === letterModal) closeModal();
  });
  // Fermer avec Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && letterModal.classList.contains("active")) {
      closeModal();
    }
  });

  // ---------- LECTEUR AUDIO & AUTOPLAY ROBUSTE ----------
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function updateProgress() {
    const { currentTime, duration } = bgMusic;
    if (duration && !isNaN(duration)) {
      const progressPercent = (currentTime / duration) * 100;
      progressFill.style.width = `${progressPercent}%`;
      progressThumb.style.left = `${progressPercent}%`;
      timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    } else {
      timeDisplay.textContent = "00:00 / 00:00";
    }
  }

  function setVolume(value) {
    bgMusic.volume = value / 100;
    volumeSlider.value = value;
  }

  // Stratégie autoplay : lecture muette d'abord, puis activation au premier clic utilisateur
  async function attemptAutoplay() {
    bgMusic.volume = 0;
    try {
      await bgMusic.play();
      audioInitialized = true;
      musicCard.classList.add("playing");
      playBtn.querySelector(".play-icon").textContent = "❚❚";
      // Restaurer progressivement le volume
      setTimeout(() => {
        if (bgMusic.paused === false) {
          setVolume(volumeSlider.value || 70);
        }
      }, 500);
    } catch (err) {
      console.log("Autoplay bloqué, en attente interaction utilisateur.");
    }
  }

  // Tenter autoplay immédiatement
  attemptAutoplay();

  // Activer l'audio au premier clic n'importe où si pas encore joué
  document.addEventListener(
    "click",
    function initAudioOnInteraction() {
      if (!audioInitialized && bgMusic.paused) {
        bgMusic.volume = 0;
        bgMusic
          .play()
          .then(() => {
            audioInitialized = true;
            musicCard.classList.add("playing");
            playBtn.querySelector(".play-icon").textContent = "❚❚";
            setVolume(volumeSlider.value || 70);
          })
          .catch((e) => console.warn(e));
      }
    },
    { once: false },
  );

  // Play/Pause bouton
  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (bgMusic.paused) {
      bgMusic
        .play()
        .then(() => {
          musicCard.classList.add("playing");
          playBtn.querySelector(".play-icon").textContent = "❚❚";
          if (!audioInitialized) {
            setVolume(volumeSlider.value || 70);
            audioInitialized = true;
          }
        })
        .catch((err) => console.warn(err));
    } else {
      bgMusic.pause();
      musicCard.classList.remove("playing");
      playBtn.querySelector(".play-icon").textContent = "▶";
    }
  });

  // Barre de progression cliquable
  progressContainer.addEventListener("click", (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (bgMusic.duration) {
      const seekTime = (clickX / width) * bgMusic.duration;
      bgMusic.currentTime = seekTime;
      updateProgress();
    }
  });

  // Volume
  volumeSlider.addEventListener("input", (e) => {
    setVolume(e.target.value);
  });

  // Mise à jour continue de la progression
  bgMusic.addEventListener("timeupdate", updateProgress);
  bgMusic.addEventListener("loadedmetadata", updateProgress);
  bgMusic.addEventListener("ended", () => {
    musicCard.classList.remove("playing");
    playBtn.querySelector(".play-icon").textContent = "▶";
  });

  // ---------- EFFET RIPPLE SUR LES BOUTONS ----------
  function createRipple(event, button) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  }

  document.querySelectorAll(".ripple-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      createRipple(e, this);
    });
  });

  // ---------- ANIMATIONS AU SCROLL (Intersection Observer) ----------
  const animatedElements = document.querySelectorAll(
    ".letter-card, .music-card, .section-title, .hero-content > *, .carousel-container",
  );

  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        entry.target.style.transition =
          "opacity 0.8s ease, transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)";
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => {
    // Initial state pour l'animation
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.willChange = "opacity, transform";
    observer.observe(el);
  });

  // Déclencher les éléments visibles au chargement
  window.addEventListener("load", () => {
    // Petite astuce pour les éléments déjà dans le viewport
    setTimeout(() => {
      animatedElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      });
    }, 100);
  });

  // ---------- GESTION DES ÉMOJIS PULSATIONS (déjà en CSS, on ajoute un peu de dynamisme) ----------
  // On peut ajouter un effet aléatoire subtil via JS, mais CSS fait déjà l'essentiel.

  console.log("✨ Expérience Jennifer prête. Que l'amour rayonne.");
});
