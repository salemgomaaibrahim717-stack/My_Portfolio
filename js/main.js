/* ============================================
   Portfolio - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Preloader ---
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('loaded');
        document.body.style.overflow = '';
      }, 800);
    });
    // Fallback
    setTimeout(() => {
      preloader.classList.add('loaded');
      document.body.style.overflow = '';
    }, 3000);
  }

  // --- Navbar Scroll Effect ---
  const navbar = document.querySelector('.navbar-main');
  if (navbar) {
    const handleNavScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  // --- Mobile Menu (Sidebar Style) ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobClose = document.querySelector('.mob-menu-close');
  
  if (menuToggle && mobileMenu) {
    menuToggle.setAttribute('aria-expanded', 'false');
    // Ensure hidden menu is inert on load
    if(!mobileMenu.classList.contains('open')) {
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.setAttribute('inert', '');
    }

    const openMenu = () => {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      mobileMenu.removeAttribute('inert');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        mobClose?.focus({ preventScroll: true });
      });
    };
    
    const closeMenu = () => {
      const focusedInsideMenu = mobileMenu.contains(document.activeElement);
      if (focusedInsideMenu) {
        menuToggle.focus({ preventScroll: true });
      }
      mobileMenu.classList.remove('open');
      requestAnimationFrame(() => {
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.setAttribute('inert', '');
      });
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    if(mobClose) mobClose.addEventListener('click', closeMenu);

    mobileMenu.querySelectorAll('.mob-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // --- Site Integrity & Link Hygiene ---
  const normalizePath = (value = '') => {
    if (!value) return '/';
    let path = value;

    if (/^https?:\/\//i.test(path)) {
      try {
        path = new URL(path, window.location.origin).pathname;
      } catch (error) {
        return '/';
      }
    }

    path = path.split('?')[0].split('#')[0].trim();
    if (!path) return '/';

    path = path.replace(/\/{2,}/g, '/');
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    path = path.replace(/\/index\.html$/i, '');
    path = path.replace(/\.html$/i, '');
    return path || '/';
  };

  const currentPath = normalizePath(window.location.pathname);
  const isHttpOrigin = /^https?:/i.test(window.location.origin);

  if (isHttpOrigin) {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const canonicalPath = currentPath === '/' ? '/' : `${currentPath}/`;
      canonical.setAttribute('href', `${window.location.origin}${canonicalPath}`);
    }

    document.querySelectorAll('script[type="application/ld+json"]').forEach((schemaScript) => {
      if (schemaScript.textContent.includes('https://example.com')) {
        schemaScript.textContent = schemaScript.textContent.replaceAll('https://example.com', window.location.origin);
      }
    });
  }

  const socialFallbacks = [
    { icon: 'ri-github-fill', url: 'https://github.com/salemgomaa' },
    { icon: 'ri-whatsapp-fill', url: 'https://wa.me/201035619688' },
    { icon: 'ri-whatsapp-line', url: 'https://wa.me/201035619688' }
  ];

  document.querySelectorAll('a').forEach((link) => {
    const href = (link.getAttribute('href') || '').trim();
    const isSocialLink = link.classList.contains('social-link') || !!link.closest('.mob-socials');
    if (!isSocialLink) return;

    const icon = link.querySelector('i');
    const iconClass = icon ? icon.className : '';
    const mappedSocial = socialFallbacks.find((item) => iconClass.includes(item.icon));

    // Keep social blocks restricted to GitHub and WhatsApp only.
    if (!mappedSocial) {
      link.remove();
      return;
    }

    if (href === '#') {
      link.setAttribute('href', mappedSocial.url);
    } else if (href === 'https://github.com/settings/profile') {
      link.setAttribute('href', 'https://github.com/salemgomaa');
    }

    const finalHref = (link.getAttribute('href') || '').trim();
    if (/^https?:\/\//i.test(finalHref)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  document.querySelectorAll('a[target="_blank"]').forEach((externalLink) => {
    externalLink.setAttribute('rel', 'noopener noreferrer');
  });

  // --- Scroll Reveal (IntersectionObserver) ---
  let revealObserver; // Declare in scope to be used by dynamic content
  const revealElements = document.querySelectorAll('.reveal, .reveal-right, .reveal-left, .reveal-scale');
  
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  if (revealElements.length > 0) {
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- Counter Animation ---
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 2000;
          const startTime = performance.now();

          const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current + suffix;
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target + suffix;
            }
          };
          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  // --- Skill Bars Animation ---
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  if (skillBars.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const width = entry.target.getAttribute('data-width');
          entry.target.style.width = width + '%';
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    skillBars.forEach(el => skillObserver.observe(el));
  }

  // --- Portfolio Filter (with sharable state) ---
  const filterTabs = Array.from(document.querySelectorAll('.filter-tab'));
  const projectCards = Array.from(document.querySelectorAll('.project-item'));
  if (filterTabs.length > 0 && projectCards.length > 0) {
    const filterWrap = document.querySelector('.filter-tabs');
    let statusLabel = document.querySelector('.portfolio-filter-status');
    if (!statusLabel && filterWrap) {
      statusLabel = document.createElement('p');
      statusLabel.className = 'portfolio-filter-status';
      filterWrap.insertAdjacentElement('afterend', statusLabel);
    }

    const validFilters = new Set(filterTabs.map((tab) => tab.getAttribute('data-filter')).filter(Boolean));
    const normalizeFilter = (value) => (value && validFilters.has(value) ? value : 'all');

    const updateFilterURL = (filter) => {
      const params = new URLSearchParams(window.location.search);
      if (filter === 'all') {
        params.delete('category');
      } else {
        params.set('category', filter);
      }
      const query = params.toString();
      const nextURL = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextURL);
    };

    const updateFilterStatus = (visibleCount, filter) => {
      if (!statusLabel) return;
      const activeLabel = filterTabs.find((tab) => tab.getAttribute('data-filter') === filter)?.textContent || 'All';
      statusLabel.textContent = `Showing ${visibleCount} projects in ${activeLabel.trim()}`;
    };

    const applyPortfolioFilter = (filter, shouldSyncURL = true) => {
      const normalizedFilter = normalizeFilter(filter);
      let visibleCount = 0;

      filterTabs.forEach((tab) => {
        tab.classList.toggle('active', tab.getAttribute('data-filter') === normalizedFilter);
      });

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        const isVisible = normalizedFilter === 'all' || category === normalizedFilter;

        card.style.opacity = isVisible ? '0' : '0';
        card.style.transform = 'scale(0.94)';

        if (isVisible) {
          visibleCount += 1;
          card.style.display = '';
          card.removeAttribute('hidden');
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.setAttribute('hidden', 'hidden');
          setTimeout(() => {
            card.style.display = 'none';
          }, 240);
        }
      });

      updateFilterStatus(visibleCount, normalizedFilter);
      if (shouldSyncURL) updateFilterURL(normalizedFilter);
    };

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        applyPortfolioFilter(tab.getAttribute('data-filter') || 'all');
      });
    });

    const initialCategory = normalizeFilter(new URLSearchParams(window.location.search).get('category') || 'all');
    applyPortfolioFilter(initialCategory, false);
  }

  // --- Portfolio Quick View Modal ---
  const projectCardsInteractive = Array.from(document.querySelectorAll('.project-card'));
  if (projectCardsInteractive.length > 0) {
    const categoryInsights = {
      ecommerce: ['Conversion-focused checkout flow', 'Performance-first product pages', 'Scalable catalog architecture'],
      dashboard: ['Real-time insights architecture', 'Decision-ready visual hierarchy', 'Modular metrics components'],
      webapp: ['User-centered workflow design', 'Reliable data sync patterns', 'Growth-ready component system'],
      landing: ['Message-market fit storytelling', 'High-converting CTA placements', 'A/B testing-ready structure'],
      wordpress: ['Custom editorial workflows', 'Optimized publishing performance', 'SEO-friendly content system']
    };

    const modalMarkup = `
      <aside class="project-quickview-modal" id="projectQuickView" aria-hidden="true">
        <div class="project-quickview-backdrop" data-close-modal></div>
        <article class="project-quickview-panel" role="dialog" aria-modal="true" aria-labelledby="quickview-title">
          <button class="project-quickview-close" type="button" aria-label="Close details" data-close-modal>
            <i class="ri-close-line"></i>
          </button>
          <p class="project-quickview-kicker">Project Spotlight</p>
          <h3 id="quickview-title"></h3>
          <p class="project-quickview-desc"></p>
          <div class="project-quickview-tags"></div>
          <ul class="project-quickview-points"></ul>
          <a class="btn-primary-custom project-quickview-cta" href="/contact/start-your-project/">Start Similar Project <i class="ri-arrow-left-line"></i></a>
        </article>
      </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    const quickView = document.querySelector('#projectQuickView');
    const quickViewTitle = quickView?.querySelector('#quickview-title');
    const quickViewDesc = quickView?.querySelector('.project-quickview-desc');
    const quickViewTags = quickView?.querySelector('.project-quickview-tags');
    const quickViewPoints = quickView?.querySelector('.project-quickview-points');
    const quickViewCTA = quickView?.querySelector('.project-quickview-cta');

    document.querySelectorAll('.project-thumb .overlay a').forEach((liveLink) => {
      liveLink.addEventListener('click', (event) => {
        event.stopPropagation();
      });
    });

    const closeQuickView = () => {
      if (!quickView) return;
      quickView.classList.remove('open');
      quickView.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    const openQuickView = (card) => {
      if (!quickView || !quickViewTitle || !quickViewDesc || !quickViewTags || !quickViewPoints || !quickViewCTA) return;
      const host = card.closest('.project-item');
      const category = host?.getAttribute('data-category') || 'webapp';
      const title = card.querySelector('.project-name')?.textContent?.trim() || 'Project';
      const description = card.querySelector('.project-desc-brief')?.textContent?.trim() || 'A premium product experience with a strong focus on design and performance.';
      const tags = Array.from(card.querySelectorAll('.project-tag')).map((tag) => tag.textContent.trim()).filter(Boolean);
      const points = categoryInsights[category] || categoryInsights.webapp;

      quickViewTitle.textContent = title;
      quickViewDesc.textContent = description;
      quickViewTags.innerHTML = tags.map((tag) => `<span class="project-quickview-tag">${tag}</span>`).join('');
      quickViewPoints.innerHTML = points.map((point) => `<li>${point}</li>`).join('');
      quickViewCTA.setAttribute('href', `/contact/start-your-project/?project=${encodeURIComponent(title)}`);

      quickView.classList.add('open');
      quickView.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    };

    projectCardsInteractive.forEach((card) => {
      const label = card.querySelector('.project-name')?.textContent?.trim() || 'project details';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Open ${label}`);

      card.addEventListener('click', () => openQuickView(card));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openQuickView(card);
        }
      });
    });

    quickView?.querySelectorAll('[data-close-modal]').forEach((closer) => {
      closer.addEventListener('click', closeQuickView);
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeQuickView();
      }
    });
  }

  // --- FAQ Toggle ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });

  // --- Contact Form ---
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const readValue = (id) => (contactForm.querySelector(`#${id}`)?.value || '').trim();
      const projectName = readValue('name');
      const projectEmail = readValue('email');
      const projectPhone = readValue('phone');
      const service = readValue('service');
      const budget = readValue('budget');
      const timeline = readValue('timeline');
      const details = readValue('message');

      const mailSubject = encodeURIComponent(`New Project Inquiry - ${projectName || 'Website Visitor'}`);
      const mailBody = encodeURIComponent([
        `Name: ${projectName || 'Not provided'}`,
        `Email: ${projectEmail || 'Not provided'}`,
        `Phone: ${projectPhone || 'Not provided'}`,
        `Service: ${service || 'Not selected'}`,
        `Budget: ${budget || 'Not selected'}`,
        `Timeline: ${timeline || 'Not selected'}`,
        '',
        'Project Details:',
        details || 'No details provided.'
      ].join('\n'));

      window.location.href = `mailto:salemgomaaibrahim717@gmail.com?subject=${mailSubject}&body=${mailBody}`;

      const formEl = contactForm;
      const successEl = document.querySelector('.form-success');
      if (successEl) {
        formEl.style.display = 'none';
        successEl.classList.add('show');
      }
    });
  }

  // --- Active Nav Link ---
  document.querySelectorAll('.nav-link, .mob-link').forEach((link) => {
    const href = (link.getAttribute('href') || '').trim();
    if (!href || href.startsWith('#') || /^https?:\/\//i.test(href)) return;
    if (normalizePath(href) === currentPath) {
      link.classList.add('active');
    }
  });

  // --- Swiper Init ---
  if (typeof Swiper !== 'undefined' && document.querySelector('.testimonial-swiper')) {
    new Swiper('.testimonial-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  }

  // --- Tilt effect on cards (desktop only) ---
  if (
    window.innerWidth > 991 &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const tiltCards = document.querySelectorAll('.card-custom, .project-card, .blog-card');
    tiltCards.forEach(card => {
      let rect = null;
      let pointerX = 0;
      let pointerY = 0;
      let tiltFrame = null;

      const renderTilt = () => {
        tiltFrame = null;
        if (!rect) return;
        const x = pointerX - rect.left;
        const y = pointerY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4.2;
        const rotateY = ((x - centerX) / centerX) * 4.2;

        if (card.classList.contains('project-card')) {
          card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
          card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
        }

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      };

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
      });
      card.addEventListener('mousemove', (e) => {
        if (!rect) {
          rect = card.getBoundingClientRect();
        }
        pointerX = e.clientX;
        pointerY = e.clientY;
        if (!tiltFrame) {
          tiltFrame = requestAnimationFrame(renderTilt);
        }
      });
      card.addEventListener('mouseleave', () => {
        if (tiltFrame) {
          cancelAnimationFrame(tiltFrame);
          tiltFrame = null;
        }
        card.style.transform = '';
        if (card.classList.contains('project-card')) {
          card.style.removeProperty('--mx');
          card.style.removeProperty('--my');
        }
        rect = null;
      });
    });
  }

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // --- Parallax on scroll (lightweight) ---
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  // --- Theme Toggle (Sync Desktop & Mobile) ---
  const themeToggles = document.querySelectorAll('#themeToggle, #themeToggleMobile');
  const currentTheme = localStorage.getItem('theme');
  
  const updateThemeUI = (theme) => {
    themeToggles.forEach(toggle => {
      const icon = toggle.querySelector('i');
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if(icon) icon.className = 'ri-sun-fill';
      } else {
        document.documentElement.removeAttribute('data-theme');
        if(icon) icon.className = 'ri-moon-fill';
      }
    });
  };

  if (currentTheme === 'light') {
    updateThemeUI('light');
  } else {
    updateThemeUI('dark');
  }

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'light') {
        updateThemeUI('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        updateThemeUI('light');
        localStorage.setItem('theme', 'light');
      }
    });
  });

  // --- Custom Magnetic Cursor ---
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  
  if (
    cursorDot &&
    cursorOutline &&
    window.matchMedia("(pointer: fine)").matches
  ) {
    document.body.classList.add('custom-cursor-enabled');
    let cursorX = 0;
    let cursorY = 0;
    let cursorTicking = false;

    cursorDot.style.left = '50%';
    cursorDot.style.top = '50%';
    cursorOutline.style.left = '50%';
    cursorOutline.style.top = '50%';

    const paintCursor = () => {
      cursorTicking = false;
      cursorDot.style.left = `${cursorX}px`;
      cursorDot.style.top = `${cursorY}px`;
      cursorOutline.style.left = `${cursorX}px`;
      cursorOutline.style.top = `${cursorY}px`;
    };

    const moveCursor = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (!cursorTicking) {
        cursorTicking = true;
        requestAnimationFrame(paintCursor);
      }
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });

    const hoverElements = document.querySelectorAll('a, button, .project-card, input, textarea');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('hover');
        cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
      });
      el.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('hover');
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    });
  }

  // --- GSAP Advanced Animations ---
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Initial Hero Animation
    if (document.querySelector('.hero-greeting')) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" }});
      tl.fromTo(".hero-greeting", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.2 })
        .fromTo(".hero-name", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.8")
        .fromTo(".hero-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.8")
        .fromTo(".hero-desc", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.8")
        .fromTo(".hero-actions", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.8")
        .fromTo(".hero-stats", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.6")
        .fromTo(".hero-image-wrapper", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, ease: "power3.out" }, "-=1.2");
    }

    // Parallax floating cards
    gsap.utils.toArray('.floating-card').forEach((card, i) => {
      gsap.to(card, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    });

    // Sections Reveal
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.fromTo(title, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: title, start: "top 85%" }}
      );
    });
  }

  // --- Dynamic Blog Integration ---
  const blogContainer = document.querySelector('#blog-posts-row');
  if (false && blogContainer) {
    blogContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-accent" role="status"><span class="visually-hidden">جاري التحميل...</span></div><p class="mt-3" style="color:var(--text-secondary);">جاري جلب أحدث المقالات التقنية...</p></div>';
    
    const fetchArticles = async () => {
      try {
        console.log('Fetching professional articles from Hacker News API...');
        // Using Algolia HN API - Highly reliable and no-key needed
        const response = await fetch('https://hn.algolia.com/api/v1/search?query=web%20development%20frontend%20design&hitsPerPage=18&tags=story');
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        const articles = data.hits;
        console.log('Articles received:', articles.length);
        
        const renderArticles = (items) => {
          blogContainer.innerHTML = ''; 
          // Array of high-end tech images for variety
          const techImages = [
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
            'https://images.unsplash.com/photo-1504639725590-34d0984388bd',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
            'https://images.unsplash.com/photo-1516116216624-53e697fedbea'
          ];

          items.forEach((article, index) => {
            const date = new Date(article.created_at || Date.now()).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
            const imgUrl = `${techImages[index % techImages.length]}?auto=format&fit=crop&w=600&q=80`;
            const articleUrl = article.url || `https://news.ycombinator.com/item?id=${article.objectID}`;
            
            const cardHTML = `
              <div class="col-lg-4 col-md-6">
                <div class="blog-card">
                  <div class="blog-thumb" style="background-image: url('${imgUrl}')">
                    <span class="blog-cat">${article._tags.includes('show_hn') ? 'مشروع' : 'تقنية'}</span>
                  </div>
                  <div class="blog-body">
                    <div class="blog-meta">
                      <span><i class="ri-calendar-line"></i> ${date}</span>
                      <span><i class="ri-chat-3-line"></i> ${article.num_comments || 0} تعليق</span>
                    </div>
                    <h3 class="blog-title">${article.title}</h3>
                    <p class="blog-excerpt">مقال تقني متخصص يتناول ${article.title.split(' ').slice(0, 3).join(' ')} وأبعاده المستقبلية في تطوير الويب.</p>
                    <a href="${articleUrl}" target="_blank" class="btn-ghost">
                      اقرأ المقال كاملاً 
                      <i class="ri-arrow-left-line"></i>
                    </a>
                  </div>
                </div>
              </div>
            `;
            blogContainer.insertAdjacentHTML('beforeend', cardHTML);
          });
          
          if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            // Re-initialize ScrollTrigger to recognize the new page height
            ScrollTrigger.refresh();
            
            gsap.from("#blog-posts-row .blog-card", {
              y: 50,
              opacity: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: { 
                trigger: "#blog-posts-row", 
                start: "top 90%"
              }
            });
          }
        };

        if (articles && articles.length > 0) {
          renderArticles(articles);
        } else {
          throw new Error('No articles found');
        }
      } catch (error) {
        console.error('Blog API Error:', error);
        // Robust Fallbacks with REAL working links
        const fallbackArticles = [
          { title: 'دليل احتراف Next.js 14 وتقنيات الـ Server Components', url: 'https://nextjs.org/blog/next-14' },
          { title: 'مستقبل الذكاء الاصطناعي في هندسة البرمجيات 2024', url: 'https://github.blog/2023-11-08-the-architecture-of-today-how-ai-is-changing-the-way-we-build-software/' },
          { title: 'تحسين أداء المواقع الضخمة: استراتيجيات متقدمة', url: 'https://web.dev/articles/vitals' }
        ];
        
        blogContainer.innerHTML = '';
        fallbackArticles.forEach((article, index) => {
          const cardHTML = `
            <div class="col-lg-4 col-md-6">
              <div class="blog-card">
                <div class="blog-thumb" style="background-image: url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80')">
                  <span class="blog-cat">مقالات مختارة</span>
                </div>
                <div class="blog-body">
                  <div class="blog-meta">
                    <span><i class="ri-calendar-line"></i> تحديث اليوم</span>
                    <span><i class="ri-star-line"></i> مقال مميز</span>
                  </div>
                  <h3 class="blog-title">${article.title}</h3>
                  <p class="blog-excerpt">نظرة معمقة على أحدث الأدوات والمنهجيات البرمجية التي تضمن لك التفوق في سوق العمل العالمي.</p>
                  <a href="${article.url}" target="_blank" class="btn-ghost">اقرأ المقال كاملاً <i class="ri-arrow-left-line"></i></a>
                </div>
              </div>
            </div>
          `;
          blogContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
      }
    };
    fetchArticles();
  }

  // --- Smart Blog Experience (DEV.to API) ---
  const smartBlogContainer = document.querySelector('#blog-posts-row');
  if (smartBlogContainer) {
    const blogSectionContainer = smartBlogContainer.closest('.container-custom');
    const DEV_TO_FEEDS = [
      { url: 'https://dev.to/api/articles?top=30&per_page=24&tag=webdev', seedTag: 'webdev' },
      { url: 'https://dev.to/api/articles?top=30&per_page=24&tag=javascript', seedTag: 'javascript' },
      { url: 'https://dev.to/api/articles?top=30&per_page=24&tag=react', seedTag: 'react' }
    ];
    const FILTER_OPTIONS = [
      { key: 'all', label: 'All' },
      { key: 'webdev', label: 'Web Dev' },
      { key: 'javascript', label: 'JavaScript' },
      { key: 'react', label: 'React' },
      { key: 'ai', label: 'AI' },
      { key: 'career', label: 'Career' }
    ];
    const CACHE_KEY = 'portfolio_devto_cache_v2';
    const CACHE_TTL = 1000 * 60 * 20;
    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80';
    const state = {
      activeFilter: 'all',
      searchText: '',
      sortBy: 'trending'
    };
    let allArticles = [];

    const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (char) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
    ));

    const normalizeTag = (tag) => String(tag || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    const asSafeUrl = (value) => {
      if (typeof value !== 'string') return '';
      const trimmed = value.trim();
      if (!/^https?:\/\//i.test(trimmed)) return '';
      try {
        return new URL(trimmed).toString();
      } catch {
        return '';
      }
    };

    const formatDate = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatCompactNumber = (value) => {
      const formatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
      return formatter.format(Math.max(0, Number(value) || 0));
    };

    const trimText = (text, maxLength) => {
      const normalized = String(text || '').replace(/\s+/g, ' ').trim();
      if (!normalized) return '';
      return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}...` : normalized;
    };

    const computeArticleScore = (article) => {
      const publishedTime = new Date(article.publishedAt).getTime();
      const ageInDays = Number.isNaN(publishedTime) ? 0 : Math.max(0, (Date.now() - publishedTime) / 86400000);
      const freshnessScore = Math.max(0, 28 - ageInDays);
      const depthScore = Math.max(0, 12 - Math.abs(article.readTime - 7));
      return Math.round(
        (article.reactions * 1.8) +
        (article.comments * 2.6) +
        (article.tags.length * 3.2) +
        freshnessScore +
        depthScore
      );
    };

    const normalizeArticle = (item) => {
      const seedTag = normalizeTag(item.__seedTag || 'webdev');
      const title = trimText(item.title, 140);
      const articleUrl = asSafeUrl(item.url || item.canonical_url);
      if (!title || !articleUrl) return null;

      const rawTags = Array.isArray(item.tag_list)
        ? item.tag_list
        : typeof item.tags === 'string'
          ? item.tags.split(',')
          : [];
      const normalizedTags = rawTags.map(normalizeTag).filter(Boolean);
      if (seedTag && !normalizedTags.includes(seedTag)) {
        normalizedTags.unshift(seedTag);
      }

      const description = trimText(
        item.description || `A practical deep dive into ${title.split(' ').slice(0, 5).join(' ')} for modern developers.`,
        190
      );
      const coverImage = asSafeUrl(item.cover_image || item.social_image) || FALLBACK_IMAGE;
      const article = {
        id: String(item.id || articleUrl),
        title,
        description,
        url: articleUrl,
        image: coverImage,
        tags: normalizedTags,
        publishedAt: item.published_at || item.published_timestamp || new Date().toISOString(),
        readTime: Math.max(2, Number(item.reading_time_minutes) || 6),
        reactions: Math.max(0, Number(item.public_reactions_count) || Number(item.positive_reactions_count) || 0),
        comments: Math.max(0, Number(item.comments_count) || 0)
      };
      article.score = computeArticleScore(article);
      return article;
    };

    const controlsMarkup = `
      <section class="article-intel-board reveal-scale" aria-label="Article Control Center">
        <div class="article-intel-head">
          <div>
            <span class="article-intel-badge"><i class="ri-radar-line"></i> Article Radar</span>
            <h2>Handpicked engineering reads from DEV.to API</h2>
            <p>Smart ranking combines relevance, freshness, discussion depth, and reading quality.</p>
          </div>
        </div>
        <div class="article-intel-controls">
          <div class="article-filter-group" id="article-filter-group"></div>
          <label class="article-search" for="article-search-input">
            <i class="ri-search-line"></i>
            <input id="article-search-input" type="search" placeholder="Search title, summary, or tag" autocomplete="off">
          </label>
          <label class="article-sort" for="article-sort-select">
            <i class="ri-filter-3-line"></i>
            <select id="article-sort-select" aria-label="Sort articles">
              <option value="trending">Sort: Trending</option>
              <option value="newest">Sort: Newest</option>
              <option value="discussed">Sort: Most Discussed</option>
              <option value="quick">Sort: Quick Reads</option>
            </select>
          </label>
        </div>
        <p class="article-intel-status" id="article-status-label">Preparing your article feed...</p>
      </section>
    `;

    const featuredMarkup = `
      <section class="featured-article-slot reveal" id="featured-article-slot" aria-live="polite"></section>
    `;

    if (blogSectionContainer) {
      smartBlogContainer.insertAdjacentHTML('beforebegin', featuredMarkup);
      smartBlogContainer.insertAdjacentHTML('beforebegin', controlsMarkup);
    }

    const filterGroup = document.querySelector('#article-filter-group');
    const searchInput = document.querySelector('#article-search-input');
    const sortSelect = document.querySelector('#article-sort-select');
    const statusLabel = document.querySelector('#article-status-label');
    const featuredSlot = document.querySelector('#featured-article-slot');

    if (revealObserver) {
      const controlsElement = document.querySelector('.article-intel-board');
      if (controlsElement) revealObserver.observe(controlsElement);
      if (featuredSlot) revealObserver.observe(featuredSlot);
    }

    FILTER_OPTIONS.forEach((option, index) => {
      if (!filterGroup) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `article-filter-chip${index === 0 ? ' active' : ''}`;
      chip.dataset.tag = option.key;
      chip.textContent = option.label;
      filterGroup.appendChild(chip);
    });

    const renderLoadingState = () => {
      if (statusLabel) statusLabel.textContent = 'Loading high-quality articles from DEV.to API...';

      if (featuredSlot) {
        featuredSlot.innerHTML = `
          <article class="featured-article-card featured-skeleton skeleton-loading">
            <div class="featured-media"></div>
            <div class="featured-content">
              <div style="height:14px;border-radius:12px;margin-bottom:0.9rem;"></div>
              <div style="height:32px;border-radius:12px;margin-bottom:0.6rem;"></div>
              <div style="height:18px;border-radius:12px;margin-bottom:0.6rem;"></div>
              <div style="height:18px;border-radius:12px;width:72%;margin-bottom:1.4rem;"></div>
              <div style="height:44px;border-radius:999px;width:210px;"></div>
            </div>
          </article>
        `;
      }

      smartBlogContainer.innerHTML = Array.from({ length: 6 }).map(() => `
        <div class="col-lg-4 col-md-6">
          <article class="blog-card skeleton-loading">
            <div class="blog-thumb"></div>
            <div class="blog-body">
              <div style="height:13px;border-radius:12px;margin-bottom:0.9rem;"></div>
              <div style="height:25px;border-radius:12px;margin-bottom:0.6rem;"></div>
              <div style="height:18px;border-radius:12px;margin-bottom:0.5rem;"></div>
              <div style="height:18px;border-radius:12px;width:78%;"></div>
            </div>
          </article>
        </div>
      `).join('');
    };

    const renderEmptyState = (message) => {
      if (featuredSlot) featuredSlot.innerHTML = '';
      smartBlogContainer.innerHTML = `
        <div class="col-12">
          <article class="article-empty-state">
            <i class="ri-inbox-archive-line"></i>
            <h3>No articles matched this view</h3>
            <p>${escapeHTML(message)}</p>
          </article>
        </div>
      `;
      if (statusLabel) statusLabel.textContent = 'Try a different filter or search term.';
    };

    const renderFeaturedArticle = (article) => {
      if (!featuredSlot) return;
      if (!article) {
        featuredSlot.innerHTML = '';
        return;
      }

      featuredSlot.innerHTML = `
        <article class="featured-article-card">
          <div class="featured-media">
            <img src="${article.image}" alt="${escapeHTML(article.title)}" loading="lazy">
            <span class="featured-source">DEV.to API · Editor Pick</span>
          </div>
          <div class="featured-content">
            <p class="featured-kicker">Featured Engineering Story</p>
            <h2>${escapeHTML(article.title)}</h2>
            <p>${escapeHTML(trimText(article.description, 220))}</p>
            <div class="featured-metrics">
              <span><i class="ri-fire-fill"></i> ${formatCompactNumber(article.score)} score</span>
              <span><i class="ri-thumb-up-line"></i> ${formatCompactNumber(article.reactions)} reactions</span>
              <span><i class="ri-chat-3-line"></i> ${formatCompactNumber(article.comments)} comments</span>
              <span><i class="ri-time-line"></i> ${article.readTime} min read</span>
            </div>
            <a href="${article.url}" class="btn-primary-custom" target="_blank" rel="noopener noreferrer">
              Dive into the article <i class="ri-arrow-left-line"></i>
            </a>
          </div>
        </article>
      `;
    };

    const renderArticleCards = (articles) => {
      smartBlogContainer.innerHTML = articles.map((article) => {
        const visibleTags = article.tags.slice(0, 3);
        const tagsMarkup = visibleTags.map((tag) => `<span class="blog-tag">#${escapeHTML(tag)}</span>`).join('');
        const excerpt = escapeHTML(trimText(article.description, 140));
        const mainTag = escapeHTML(article.tags[0] || 'webdev');

        return `
          <div class="col-lg-4 col-md-6">
            <article class="blog-card article-card">
              <div class="blog-thumb">
                <img class="blog-thumb-media" src="${article.image}" alt="${escapeHTML(article.title)}" loading="lazy">
                <span class="blog-cat">${mainTag}</span>
              </div>
              <div class="blog-body">
                <div class="blog-meta">
                  <span><i class="ri-calendar-line"></i> ${formatDate(article.publishedAt)}</span>
                  <span><i class="ri-fire-fill"></i> ${formatCompactNumber(article.score)} score</span>
                </div>
                <h3 class="blog-title">${escapeHTML(article.title)}</h3>
                <p class="blog-excerpt">${excerpt}</p>
                <div class="blog-tags">${tagsMarkup}</div>
                <span class="article-source"><i class="ri-global-line"></i> DEV Community</span>
                <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="btn-ghost">
                  Read full article <i class="ri-arrow-left-line"></i>
                </a>
              </div>
            </article>
          </div>
        `;
      }).join('');
    };

    const animateFreshCards = () => {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      ScrollTrigger.refresh();
      gsap.fromTo(
        '#blog-posts-row .article-card',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power2.out'
        }
      );
    };

    const applyFiltersAndRender = () => {
      if (!allArticles.length) {
        renderEmptyState('No curated data available at the moment.');
        return;
      }

      const normalizedQuery = state.searchText.trim().toLowerCase();
      const filtered = allArticles.filter((article) => {
        const matchesTag = state.activeFilter === 'all' || article.tags.includes(state.activeFilter);
        if (!matchesTag) return false;
        if (!normalizedQuery) return true;
        const haystack = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });

      const sorted = [...filtered].sort((first, second) => {
        if (state.sortBy === 'newest') {
          return new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime();
        }
        if (state.sortBy === 'discussed') {
          return second.comments - first.comments;
        }
        if (state.sortBy === 'quick') {
          return first.readTime - second.readTime;
        }
        return second.score - first.score;
      });

      if (!sorted.length) {
        renderEmptyState('Nothing matched this search. Try another keyword or tag.');
        return;
      }

      const featuredArticle = sorted[0];
      const gridArticles = sorted.slice(1, 13);
      renderFeaturedArticle(featuredArticle);
      renderArticleCards(gridArticles.length ? gridArticles : [featuredArticle]);

      if (statusLabel) {
        statusLabel.textContent = `${sorted.length} curated articles ready · Source: DEV.to API`;
      }
      animateFreshCards();
    };

    const hydrateArticles = (rawItems) => {
      const seen = new Set();
      const normalized = rawItems
        .map(normalizeArticle)
        .filter((item) => item && !seen.has(item.id) && seen.add(item.id));

      allArticles = normalized.sort((first, second) => second.score - first.score);
    };

    const readCache = () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        if (!parsed || !Array.isArray(parsed.items)) return null;
        if (Date.now() - parsed.savedAt > CACHE_TTL) return null;
        return parsed.items;
      } catch {
        return null;
      }
    };

    const writeCache = (items) => {
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ items, savedAt: Date.now() }));
      } catch {
        // Ignore storage errors silently.
      }
    };

    const fetchLiveArticles = async () => {
      const requests = DEV_TO_FEEDS.map(async (feed) => {
        const response = await fetch(feed.url, { headers: { Accept: 'application/json' } });
        if (!response.ok) {
          throw new Error(`DEV.to feed failed for ${feed.seedTag}`);
        }
        const payload = await response.json();
        const items = Array.isArray(payload) ? payload : [];
        return items.map((item) => ({ ...item, __seedTag: feed.seedTag }));
      });

      const results = await Promise.all(requests);
      return results.flat();
    };

    const fallbackArticles = [
      {
        id: 'fallback-1',
        title: 'Advanced Rendering Patterns in Next.js for Faster User Experiences',
        description: 'A practical breakdown of streaming, caching, and edge rendering patterns with real-world guidance.',
        url: 'https://nextjs.org/blog',
        cover_image: FALLBACK_IMAGE,
        reading_time_minutes: 7,
        public_reactions_count: 220,
        comments_count: 40,
        published_at: '2026-02-24T10:00:00.000Z',
        tag_list: ['webdev', 'react', 'performance'],
        __seedTag: 'webdev'
      },
      {
        id: 'fallback-2',
        title: 'How AI-Assisted Workflows Are Reshaping Modern Engineering Teams',
        description: 'Actionable techniques to pair AI with code reviews, testing strategy, and architectural thinking.',
        url: 'https://github.blog',
        cover_image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80',
        reading_time_minutes: 9,
        public_reactions_count: 180,
        comments_count: 35,
        published_at: '2026-01-18T10:00:00.000Z',
        tag_list: ['ai', 'career', 'engineering'],
        __seedTag: 'ai'
      },
      {
        id: 'fallback-3',
        title: 'The Frontend Performance Field Guide for Large-Scale Web Apps',
        description: 'Measure what matters, reduce expensive rendering work, and ship faster interfaces with confidence.',
        url: 'https://web.dev',
        cover_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        reading_time_minutes: 8,
        public_reactions_count: 162,
        comments_count: 26,
        published_at: '2026-03-01T10:00:00.000Z',
        tag_list: ['webdev', 'javascript', 'performance'],
        __seedTag: 'javascript'
      }
    ];

    const initArticles = async () => {
      renderLoadingState();

      const cachedItems = readCache();
      if (cachedItems) {
        hydrateArticles(cachedItems);
        applyFiltersAndRender();
        if (statusLabel) {
          statusLabel.textContent = `${allArticles.length} curated articles loaded from smart cache`;
        }
      }

      try {
        const liveItems = await fetchLiveArticles();
        hydrateArticles(liveItems);
        writeCache(liveItems);
        applyFiltersAndRender();
      } catch (error) {
        console.error('DEV.to API Error:', error);
        if (!allArticles.length) {
          hydrateArticles(fallbackArticles);
          applyFiltersAndRender();
          if (statusLabel) {
            statusLabel.textContent = 'Using premium fallback feed. Live API is currently unavailable.';
          }
        }
      }
    };

    if (filterGroup) {
      filterGroup.addEventListener('click', (event) => {
        const chip = event.target.closest('.article-filter-chip');
        if (!chip) return;
        state.activeFilter = chip.dataset.tag || 'all';
        filterGroup.querySelectorAll('.article-filter-chip').forEach((button) => button.classList.remove('active'));
        chip.classList.add('active');
        applyFiltersAndRender();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        state.searchText = event.target.value || '';
        applyFiltersAndRender();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (event) => {
        state.sortBy = event.target.value || 'trending';
        applyFiltersAndRender();
      });
    }

    initArticles();
  }

});
