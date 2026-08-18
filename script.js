/*
 * Space Play LP — JavaScript consolidado.
 * Inclui captura de leads, popup, VSL, carrossel, FAQ e slider do hero.
 */
(function (window) {
  var LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyR1y1_YI40s2w0cqBGKSiCEtaE3BtF9Afr8eKrHc_RUYKkzbNRk-LBypotE-x2laJw/exec';

  function toSafeText(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  function readLeadData() {
    if (typeof window.getLeadData === 'function') {
      var leadData = window.getLeadData() || {};
      return {
        nome: toSafeText(leadData.NOME),
        email: toSafeText(leadData.EMAIL),
        telefone: toSafeText(leadData.TELEFONE)
      };
    }

    var nameInput = document.getElementById('popup-name');
    var emailInput = document.getElementById('popup-email');
    var phoneInput = document.getElementById('popup-phone');

    return {
      nome: toSafeText(nameInput && nameInput.value),
      email: toSafeText(emailInput && emailInput.value),
      telefone: toSafeText(phoneInput && phoneInput.value)
    };
  }

  function readLeadOrigin() {
    if (typeof window.getLeadOrigin === 'function') {
      return toSafeText(window.getLeadOrigin()) || 'CTA';
    }

    var originInput = document.getElementById('popup-lead-origin');
    return toSafeText(originInput && originInput.value) || 'CTA';
  }

  function resolveOffer(decision, payload) {
    if (payload && payload.oferta) {
      return toSafeText(payload.oferta);
    }

    return decision === 'Recusa' ? 'recusado' : '12_horas_gratis';
  }

  function buildLeadPayload(decision, payload) {
    var input = payload || {};
    var data = readLeadData();

    return {
      nome: toSafeText(input.nome || data.nome),
      telefone: toSafeText(input.telefone || data.telefone),
      email: toSafeText(input.email || data.email),
      origem: toSafeText(input.origem || readLeadOrigin()),
      oferta: resolveOffer(decision, input),
      url: toSafeText(input.url || window.location.href),
      pagamento: 'Não pago'
    };
  }

  async function sendLeadToSheets(payload) {
    var body = JSON.stringify(payload);

    await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: body
    });

    return payload;
  }

  window.buildLeadPayload = buildLeadPayload;
  window.sendLeadToSheets = sendLeadToSheets;
  window.captureLeadData = async function (decision, payload) {
    var leadPayload = buildLeadPayload(decision, payload);
    return sendLeadToSheets(leadPayload);
  };
})(window);


/* ===== Bloco JS integrado 1 ===== */

    (function () {
      var popup = document.getElementById('popup-desconto');
      var closeBtn = document.getElementById('popup-close');
      var skipBtn = document.getElementById('popup-skip');
      var form = document.getElementById('popup-form');
      var triggers = document.querySelectorAll('[data-popup-trigger]');
      var nameInput = document.getElementById('popup-name');
      var emailInput = document.getElementById('popup-email');
      var dddInput = document.getElementById('popup-phone-ddd');
      var phoneInput = document.getElementById('popup-phone');
      var originInput = document.getElementById('popup-lead-origin');
      var decisionInput = document.getElementById('popup-lead-decision');
      var allowedLeadOrigins = ['suporte', 'FAQ', 'CTA'];
      var allowedLeadDecisions = ['Aceita', 'Recusa', 'Aceitou', 'Recusou'];

      window.leadOrigin = 'CTA';
      window.setLeadOrigin = function(origin) {
        if (allowedLeadOrigins.indexOf(origin) === -1) origin = 'CTA';
        window.leadOrigin = origin;
        if (originInput) originInput.value = origin;
        return origin;
      };
      window.getLeadOrigin = function() {
        return window.leadOrigin || 'CTA';
      };
      window.setLeadOrigin(window.leadOrigin);
      window.leadResponse = '';
      window.setLeadResponse = function(response) {
        if (response === 'Aceitou') response = 'Aceita';
        if (response === 'Recusou') response = 'Recusa';
        if (allowedLeadDecisions.indexOf(response) === -1) response = '';
        window.leadResponse = response;
        if (decisionInput) decisionInput.value = response;
        return response;
      };
      window.setLeadDecision = window.setLeadResponse;
      window.getLeadResponse = function() {
        return window.leadResponse || '';
      };
      window.getLeadDecision = window.getLeadResponse;
      window.setLeadResponse(window.leadResponse);
      window.NOME = '';
      window.EMAIL = '';
      window.TELEFONE = '';
      window.setLeadData = function(data) {
        if (Object.prototype.hasOwnProperty.call(data, 'NOME')) {
          window.NOME = data.NOME || '';
          if (nameInput) nameInput.value = window.NOME;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'EMAIL')) {
          window.EMAIL = data.EMAIL || '';
          if (emailInput) emailInput.value = window.EMAIL;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'TELEFONE')) {
          window.TELEFONE = data.TELEFONE || '';
        }
        return {
          NOME: window.NOME,
          EMAIL: window.EMAIL,
          TELEFONE: window.TELEFONE
        };
      };
      window.getLeadData = function() {
        return {
          NOME: window.NOME || '',
          EMAIL: window.EMAIL || '',
          TELEFONE: window.TELEFONE || ''
        };
      };
      window.setLeadData({
        NOME: window.NOME,
        EMAIL: window.EMAIL,
        TELEFONE: window.TELEFONE
      });

      function setFieldError(input, message) {
        var field = input.closest('.popup-field');
        var error = field.querySelector('.popup-error');

        field.classList.toggle('is-invalid', Boolean(message));
        error.textContent = message || '';
      }

      function clearFieldError(input) {
        setFieldError(input, '');
      }

      function getPhoneDigits() {
        return phoneInput.value.replace(/\D/g, '');
      }

      function formatPhone(value) {
        var digits = value.replace(/\D/g, '').slice(0, 9);

        if (digits.length <= 4) return digits;
        if (digits.length <= 8) {
          return digits.slice(0, 4) + '-' + digits.slice(4);
        }

        return digits.slice(0, 5) + '-' + digits.slice(5);
      }

      function getDddDigits() {
        return dddInput.value.replace(/\D/g, '').slice(0, 2);
      }

      function syncPhoneFromStoredValue() {
        var digits = window.TELEFONE.replace(/\D/g, '');

        if (digits.indexOf('55') === 0 && digits.length > 11) digits = digits.slice(2);
        if (digits.length >= 10) {
          dddInput.value = digits.slice(0, 2);
          phoneInput.value = formatPhone(digits.slice(2));
        }
      }

      function normalizePhoneInputs() {
        var ddd = getDddDigits();
        var number = getPhoneDigits();

        if (number.length >= 10 && !ddd) {
          ddd = number.slice(0, 2);
          number = number.slice(2);
        }

        if (number.length > 9) {
          if (!ddd) ddd = number.slice(0, 2);
          number = number.slice(-9);
        }

        dddInput.value = ddd;
        phoneInput.value = formatPhone(number);

        return {
          ddd: ddd,
          number: phoneInput.value.replace(/\D/g, '')
        };
      }

      function getFullPhone() {
        var phone = normalizePhoneInputs();
        return phone.ddd && phone.number ? '55' + phone.ddd + phone.number : '';
      }

      function isValidName(value) {
        var words = value.trim().split(/\s+/).filter(Boolean);
        return words.length >= 2 && words.every(function(word) { return word.length >= 2; });
      }

      function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
      }

      function isValidPhone() {
        var phone = normalizePhoneInputs();
        var allSame = /^(\d)\1+$/.test(phone.ddd + phone.number);

        return phone.ddd.length === 2 && (phone.number.length === 8 || phone.number.length === 9) && !allSame;
      }

      syncPhoneFromStoredValue();

      function validatePopupForm() {
        var isValid = true;
        nameInput.value = nameInput.value.trim().replace(/\s+/g, ' ');
        emailInput.value = emailInput.value.trim().toLowerCase();
        window.setLeadData({
          NOME: nameInput.value,
          EMAIL: emailInput.value,
          TELEFONE: getFullPhone()
        });

        if (!isValidName(nameInput.value)) {
          setFieldError(nameInput, 'Informe nome e sobrenome.');
          isValid = false;
        } else {
          clearFieldError(nameInput);
        }

        if (!isValidEmail(emailInput.value)) {
          setFieldError(emailInput, 'Informe um email valido.');
          isValid = false;
        } else {
          clearFieldError(emailInput);
        }

        if (!isValidPhone()) {
          setFieldError(phoneInput, 'Informe um telefone com DDD.');
          isValid = false;
        } else {
          clearFieldError(phoneInput);
        }

        return isValid;
      }

      function openPopup(event) {
        if (event) event.preventDefault();
        var trigger = event ? event.currentTarget : null;
        var origin = trigger && trigger.getAttribute('data-lead-origin') ? trigger.getAttribute('data-lead-origin') : window.getLeadOrigin();

        window.setLeadOrigin(origin);
        window.setLeadDecision('');
        form.classList.remove('is-submitted');
        document.getElementById('popup-submit').textContent = 'Ativar Desconto';
        [nameInput, emailInput, phoneInput].forEach(clearFieldError);
        popup.classList.add('is-open');
        popup.setAttribute('aria-hidden', 'false');
        document.body.classList.add('popup-open');

        var firstInput = popup.querySelector('input');
        if (firstInput) firstInput.focus();
      }

      function closePopup() {
        popup.classList.remove('is-open');
        popup.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('popup-open');
      }

      window.openPopup = function(origin) {
        if (origin) window.setLeadOrigin(origin);
        openPopup();
      };

      triggers.forEach(function (trigger) {
        trigger.addEventListener('click', openPopup);
      });

      closeBtn.addEventListener('click', closePopup);

      async function sendLead(decision, fallbackUrl) {
        var data = window.getLeadData();
        var payload = {
          nome: data.NOME,
          email: data.EMAIL,
          telefone: data.TELEFONE,
          origem: window.getLeadOrigin(),
          oferta: decision === 'Aceita' ? '12_horas_gratis' : 'recusado',
          url: window.location.href,
          pagamento: 'Não pago'
        };

        var btn = document.getElementById('popup-submit');
        if (btn) btn.disabled = true;

        try {
          if (typeof window.sendLeadToSheets === 'function') {
            await window.sendLeadToSheets(payload);
          } else {
            await fetch('https://script.google.com/macros/s/AKfycbyR1y1_YI40s2w0cqBGKSiCEtaE3BtF9Afr8eKrHc_RUYKkzbNRk-LBypotE-x2laJw/exec', {
              method: 'POST',
              mode: 'no-cors',
              keepalive: true,
              headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
              body: JSON.stringify(payload)
            });
          }
        } catch (err) {
          console.error(err);
        }

        if (decision === 'Aceita') {
          window.location.href = 'https://docs.appmax.com.br/?_gl=1*tu4w9q*_gcl_au*MTk5NDYzNjYyNi4xNzg2NTc1NTk0*_ga*MTM3NzM5Mzk2My4xNzg2NTc1NTk1*_ga_2NQ5NBSB1J*czE3ODY1OTAyNTkkbzIkZzAkdDE3ODY1OTAyNTkkajYwJGwwJGgxMzIxMTA4MTE3';
        } else {
          if (fallbackUrl) { window.location.href = fallbackUrl; } else { closePopup(); }
        }
      }

      skipBtn.addEventListener('click', function() {
        window.setLeadResponse('Recusa');
        sendLead('Recusa', null);
      });

      popup.addEventListener('click', function (event) {
        if (event.target === popup) closePopup();
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && popup.classList.contains('is-open')) {
          closePopup();
        }
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!validatePopupForm()) return;

        form.classList.add('is-submitted');
        document.getElementById('popup-submit').textContent = 'Redirecionando...';
        
        sendLead('Aceita', 'https://docs.appmax.com.br/?_gl=1*tu4w9q*_gcl_au*MTk5NDYzNjYyNi4xNzg2NTc1NTk0*_ga*MTM3NzM5Mzk2My4xNzg2NTc1NTk1*_ga_2NQ5NBSB1J*czE3ODY1OTAyNTkkbzIkZzAkdDE3ODY1OTAyNTkkajYwJGwwJGgxMzIxMTA4MTE3');
      });

      dddInput.addEventListener('input', function () {
        dddInput.value = getDddDigits();
        window.setLeadData({ TELEFONE: getFullPhone() });
        clearFieldError(phoneInput);
        if (dddInput.value.length === 2) phoneInput.focus();
      });

      phoneInput.addEventListener('input', function () {
        normalizePhoneInputs();
        window.setLeadData({ TELEFONE: getFullPhone() });
        clearFieldError(phoneInput);
      });

      [nameInput, emailInput].forEach(function(input) {
        input.addEventListener('input', function() {
          if (input === nameInput) window.setLeadData({ NOME: input.value });
          if (input === emailInput) window.setLeadData({ EMAIL: input.value });
          clearFieldError(input);
        });
      });
    })();
  

/* ===== Bloco JS integrado 2 ===== */

    (function () {
      var iframe = document.getElementById('vsl-iframe');
      var overlay = document.getElementById('vsl-end-overlay');
      var overlayButton = overlay && overlay.querySelector('a');
      var playerCard = iframe && iframe.closest('.vsl-player-card');

      if (!iframe || !overlay || !window.playerjs) return;

      var player = new playerjs.Player(iframe);
      player.on('ended', function () {
        if (playerCard) playerCard.classList.add('is-ended');
        overlay.classList.add('is-visible');
        overlay.setAttribute('aria-hidden', 'false');
        if (overlayButton) overlayButton.removeAttribute('tabindex');
      });
    })();
  

/* ===== Bloco JS integrado 3 ===== */

    (function() {
      const track   = document.getElementById('socialTrack');
      const dotsEl  = document.getElementById('socialDots');
      const prevBtn = document.getElementById('socialPrev');
      const nextBtn = document.getElementById('socialNext');
      const carousel = document.getElementById('socialCarousel');
      const printExtensions = ['png', 'jpg', 'jpeg', 'webp'];
      const printFolders = ['social section/prints'];
      const maxPrints = 80;
      let current   = 0;
      let timer;

      function imageExists(src) {
        return new Promise(function(resolve) {
          const image = new Image();

          image.onload = function() { resolve(src); };
          image.onerror = function() { resolve(null); };
          image.src = src;
        });
      }

      function findPrintByNumber(index) {
        const candidates = [];

        printFolders.forEach(function(folder) {
          printExtensions.forEach(function(extension) {
            candidates.push(folder + '/print' + index + '.' + extension);
            candidates.push(folder + '/print ' + index + '.' + extension);
          });
        });

        return Promise.all(candidates.map(imageExists)).then(function(results) {
          return results.find(Boolean) || null;
        });
      }

      function discoverPrints() {
        const checks = [];

        for (let index = 1; index <= maxPrints; index += 1) {
          checks.push(findPrintByNumber(index).then(function(src) {
            return src ? {
              src: src,
              alt: 'Feedback cliente ' + index
            } : null;
          }));
        }

        return Promise.all(checks).then(function(results) {
          return results.filter(Boolean);
        });
      }

      function initCarousel(prints) {
        clearInterval(timer);
        track.innerHTML = '';
        dotsEl.innerHTML = '';
        current = 0;

        if (!prints.length) {
          prevBtn.disabled = true;
          nextBtn.disabled = true;
          return;
        }

        prints.forEach(function(p, i) {
          const slide = document.createElement('div');
          slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');

          const image = document.createElement('img');
          image.src = p.src;
          image.alt = p.alt;
          image.loading = 'lazy';

          slide.appendChild(image);
          track.appendChild(slide);

          const dot = document.createElement('span');
          dot.className = 'dot' + (i === 0 ? ' active' : '');
          dot.addEventListener('click', function() { goTo(i); });
          dotsEl.appendChild(dot);
        });

        prevBtn.disabled = prints.length <= 1;
        nextBtn.disabled = prints.length <= 1;
        if (prints.length > 1) resetTimer();
      }

      function goTo(index) {
        const slides = track.querySelectorAll('.carousel-slide');
        const dots   = dotsEl.querySelectorAll('.dot');
        if(!slides.length) return;
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
        resetTimer();
      }

      function resetTimer() {
        clearInterval(timer);
        timer = setInterval(function() { goTo(current + 1); }, 5000);
      }

      prevBtn.addEventListener('click', function() { goTo(current - 1); });
      nextBtn.addEventListener('click', function() { goTo(current + 1); });

      carousel.addEventListener('mouseenter', function() { clearInterval(timer); });
      carousel.addEventListener('mouseleave', resetTimer);

      let touchStartX = 0;
      let touchStartY = 0;
      let touchEndX = 0;
      let touchEndY = 0;

      carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
      }, { passive: true });

      carousel.addEventListener('touchmove', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
      }, { passive: true });

      carousel.addEventListener('touchend', function(e) {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            goTo(current + 1);
          } else {
            goTo(current - 1);
          }
        }
      }, { passive: true });

      discoverPrints().then(initCarousel);
    })();
  

/* ===== Bloco JS integrado 4 ===== */

    (function () {
      var items = document.querySelectorAll('#faqAccordion .faq-item');

      items.forEach(function (item) {
        var btn = item.querySelector('.faq-question');
        btn.addEventListener('click', function () {
          var isOpen = item.classList.contains('open');

          items.forEach(function (other) {
            other.classList.remove('open');
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-chevron').innerHTML = '&#8744;';
          });

          if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            item.querySelector('.faq-chevron').innerHTML = '&#8743;';
          }
        });
      });
    })();
  

/* ===== script.js original da LP ===== */
document.addEventListener('DOMContentLoaded', function () {
  var bannerContainer = document.querySelector('.hero-banners-slider');
  var titleContainer = document.querySelector('.movie-titles-slider');
  var slideInterval = 4500;
  var timer = null;
  var currentIndex = 0;

  function initVSLViewerCounter() {
    var viewerEl = document.getElementById('vsl-viewer-count');
    if (!viewerEl) return;

    var minViewers = 30;
    var maxViewers = 300;
    var updateInterval = 5000;
    var minChange = 5;
    var maxChange = 15;
    var currentViewers = Math.floor(Math.random() * (250 - 80 + 1)) + 80;

    function randomBetween(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateCount() {
      var change = randomBetween(minChange, maxChange);
      var direction;

      if (currentViewers <= minViewers) {
        direction = 1;
      } else if (currentViewers >= maxViewers) {
        direction = -1;
      } else {
        direction = Math.random() < 0.35 ? 1 : -1;
      }

      currentViewers = Math.min(maxViewers, Math.max(minViewers, currentViewers + (direction * change)));

      viewerEl.style.opacity = '0.4';
      setTimeout(function () {
        viewerEl.textContent = currentViewers;
        viewerEl.style.opacity = '1';
      }, 300);
    }

    viewerEl.textContent = currentViewers;
    setInterval(updateCount, updateInterval);
  }

  function getSlides() {
    return {
      banners: document.querySelectorAll('.hero-banners-slider .banner-slide'),
      titles: document.querySelectorAll('.movie-titles-slider .title-slide')
    };
  }

  function activateSlide(index) {
    var slides = getSlides();
    var totalSlides = Math.min(slides.banners.length, slides.titles.length);

    for (var i = 0; i < totalSlides; i += 1) {
      slides.banners[i].classList.toggle('active', i === index);
      slides.titles[i].classList.toggle('active', i === index);
    }
  }

  function nextSlide() {
    var slides = getSlides();
    var totalSlides = Math.min(slides.banners.length, slides.titles.length);

    if (!totalSlides) return;

    currentIndex = (currentIndex + 1) % totalSlides;
    activateSlide(currentIndex);
  }

  function startTimer() {
    var slides = getSlides();
    var totalSlides = Math.min(slides.banners.length, slides.titles.length);

    if (timer) clearInterval(timer);
    if (totalSlides <= 1) return;

    timer = setInterval(nextSlide, slideInterval);
  }

  function initSlider() {
    currentIndex = 0;
    activateSlide(currentIndex);
    startTimer();
  }

  initSlider();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearInterval(timer);
      timer = null;
    } else {
      startTimer();
    }
  });

  initVSLViewerCounter();
});
