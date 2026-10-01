
function loadChapter(index) {
  // FIX: agar koi disabled chapter ko direct URL/bookmark se khole, use bhi
  // agle enabled chapter pe bhej do (fail-safe: enabled-state load na ho
  // to normally proceed karo, kisi ko block mat karo).
  const _enabledArr = window._chapterEnabledState && window._chapterEnabledState['forensics'];
  if (_enabledArr && _enabledArr[index] === false) {
    return goToAdjacentChapter(index, 1);
  }

  currentChapter = index;

  // Chapter view track karo (sirf logged-in users, completion % ke liye)
  // FIX: .rpc(...).catch() seedha chain nahi hota Supabase JS v2 mein
  // bina await/then ke, TypeError deta tha jo poora loadChapter crash
  // kar deta tha, isliye chapter content kabhi load hi nahi hota tha.
  if (window._supabase && chapters[index]) {
    const _slug = chapters[index].title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    try {
      window._supabase.rpc('track_chapter_view', { p_course: 'forensics', p_chapter_slug: _slug })
        .then(() => {}, () => {});
    } catch (e) {}
  }

  // Scroll to top on chapter change
  const _lm = document.getElementById('learnMain');
  if (_lm) _lm.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update page title with chapter name
  const chapterInfo = chapters[index];
  if (chapterInfo) {
    document.title = chapterInfo.title + ' on AlexCyberX Network Forensics Course';
  }

  // Update sidebar active
  document.querySelectorAll('.chapter-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  const ch = chapters[index];

  // Prev button
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (ch.prev) {
    prevBtn.style.visibility = 'visible';
    document.getElementById('prevTitle').textContent = ch.prev;
    // FIX: pehle seedha index-1 pe jaata tha, disabled chapter ho to bhi
    // khul jaata tha. Ab pehla enabled chapter dhundta hai peeche ki taraf.
    prevBtn.onclick = () => goToAdjacentChapter(index, -1);
  } else {
    prevBtn.style.visibility = 'hidden';
  }

  if (ch.next) {
    nextBtn.style.visibility = 'visible';
    document.getElementById('nextTitle').textContent = ch.next;
    // FIX: same as above, agla enabled chapter dhundta hai aage ki taraf.
    nextBtn.onclick = () => goToAdjacentChapter(index, 1);
  } else {
    nextBtn.style.visibility = 'hidden';
  }

  // Content
    if (index === 0) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent00;
  } else if (index === 1) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent01;
  } else if (index === 2) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent02;
  } else if (index === 3) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent03;
  } else if (index === 4) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent04;
  } else if (index === 5) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent05;
  } else if (index === 6) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent06;
  } else if (index === 7) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent07;
  } else if (index === 8) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent08;
  } else if (index === 9) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent09;
  } else if (index === 10) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent10;
  } else if (index === 12) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent12;
  } else if (index === 13) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent13;
  } else if (index === 14) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent14;
  } else if (index === 15) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent15;
  } else if (index === 16) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent16;
  } else if (index === 17) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent17;
  } else if (index === 18) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent18;
  } else if (index === 19) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent19;
  } else if (index === 20) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent20;
  } else if (index === 21) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent21;
  } else if (index === 22) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent22;
  } else if (index === 23) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent23;
  } else if (index === 24) {
    document.getElementById('chapterContent').innerHTML = window.chapterContent24;
  }



  setTimeout(() => {
    const svgTexts = document.querySelectorAll('svg text, svg tspan');
    svgTexts.forEach(t => {
      const fill = t.getAttribute("fill");
      if (fill === "#444" || fill === "#333" || fill === "#2a2a2a") t.setAttribute("fill", "#8080a0");
      else if (fill === "#555") t.setAttribute("fill", "#7878a0");
      else if (fill === "#666") t.setAttribute("fill", "#9090b0");
      else if (fill === "#777") t.setAttribute("fill", "#9898b8");
      else if (fill === "#888") t.setAttribute("fill", "#a8a8c0");
    });
  }, 0);

  // Re-apply dict translations (banner, nav labels etc.)
  if (typeof applyDictTranslations === 'function') {
    applyDictTranslations(selectedLang);
  }

  // Store original Hinglish IMMEDIATELY after content is set into the DOM
  const _chBox = document.getElementById('chapterContent');
  if (_chBox) {
    const _origKey = 'orig_' + index;
    chapterCache[_origKey] = _chBox.innerHTML; // always fresh Hinglish
  }

  // Translate if selected language is not Hinglish
  if (typeof applyChapterTranslation === 'function' && selectedLang !== 'hl') {
    const _ck = selectedLang + '_' + index;
    if (chapterCache[_ck] && _chBox) {
      // Already translated - inject instantly from cache
      injectTranslated(_chBox, chapterCache[_ck]);
    } else {
      // Translate now
      applyChapterTranslation(selectedLang);
    }
  }

  // Mobile sidebar band karo
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
  }
}

// Make loadChapter globally accessible after script loads
if (window.loadChapter) {
  window.loadChapter._real = loadChapter;
} else {
  window.loadChapter = loadChapter;
}

// Chapter loads only when user navigates to learn page (via showPage)


