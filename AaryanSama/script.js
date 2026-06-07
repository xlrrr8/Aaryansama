let lenis;
let isMobileClickScrolling = false;

const getAbsoluteOffsetTop = (element) => {
    let offsetTop = 0;
    while(element) {
        offsetTop += element.offsetTop;
        element = element.offsetParent;
    }
    return offsetTop;
};

/* ==========================================================================
   LENIS SMOOTH SCROLL INTEGRATION
   ========================================================================== */
function initLenis() {
    lenis = new Lenis({
        duration: 1.8, // Increased scroll duration for long, luxurious kinetic deceleration
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Luxurious exponential kinetic easing
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1.2, // Extremely buttery mouse trigger response
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Synchronize Lenis scroll positions with GSAP's ScrollTrigger
    lenis.on('scroll', () => {
        ScrollTrigger.update();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lenis smooth scroll first
    initLenis();
    
    // Initialize UI features
    initHeaderScroll();
    initMobileNavigation();
    initScrollSpy();
    initContactForm();
    initAmbientParticles();
    initMagneticGrid();
    initSectionReveal();
    initScrollParallax();
    initScrollParallaxPins();
    initProjectsAccordion(); // Initialize premium expanding cards swiper!
    initProjectsSlider(); // Initialize sliding window pagination for project cards!
    initInterestsAccordion(); // Initialize interests expanding cards swiper!
    initScrollVideo(); // Scroll-driven video background
    initRotatingText(); // Fade-reveal rotating tagline
    initMobileScrollAccordion(); // Initialize scrolling vertical card maximization on mobile!
});

/* ==========================================================================
   HEADER SCROLL EFFECT
   ========================================================================== */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const checkScroll = () => {
        const currentScrollY = window.scrollY;

        // Scrolled backing glass/opacity trigger
        if (currentScrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll(); // Trigger immediately in case page is refreshed while scrolled
}

/* ==========================================================================
   MOBILE DRAWER TOGGLE
   ========================================================================== */
function initMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    const toggleMenu = () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        mobileToggle.classList.toggle('active');
        mobileDrawer.classList.toggle('active');
        document.body.style.overflow = isExpanded ? '' : 'hidden'; // Prevent body scroll when menu open
    };
    
    mobileToggle.addEventListener('click', toggleMenu);
    
    // Close drawer when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

/* ==========================================================================
   NAVIGATION SCROLL SPY & SMOOTH SCROLLING
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navPills = document.querySelectorAll('.nav-pill');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const indicator = document.querySelector('.nav-indicator');
    const track = document.querySelector('.nav-pills');

    if (!indicator || !track) return;

    // Active pill tracker
    let activePill = document.querySelector('.nav-pill.active') || navPills[0];

    const animateIndicator = (targetElement) => {
        if (!targetElement) return;

        const trackRect = track.getBoundingClientRect();
        const pillRect = targetElement.getBoundingClientRect();

        const x = pillRect.left - trackRect.left;
        const y = pillRect.top - trackRect.top;

        // Snappy and buttery smooth kinetic sliding overlay using high-order ease
        gsap.to(indicator, {
            x: x,
            y: y,
            width: pillRect.width,
            height: pillRect.height,
            duration: 0.52,
            ease: 'power4.out',
            overwrite: 'auto'
        });
    };

    const updateActivePill = (newActivePill) => {
        if (!newActivePill || newActivePill === activePill) return;
        activePill.classList.remove('active');
        newActivePill.classList.add('active');
        activePill = newActivePill;

        // Slide the indicator only if the user is not currently hovering over the pills track
        if (!track.classList.contains('is-hovered')) {
            animateIndicator(activePill);
        }
    };
    
    const scrollActive = () => {
        const scrollY = window.scrollY;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Offset for sticky header
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                // Find matching pill
                const matchingPill = document.querySelector(`.nav-pill[href="#${sectionId}"]`);
                if (matchingPill) {
                    updateActivePill(matchingPill);
                }
                
                // Update mobile drawer links
                mobileLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    
    // Add hover sweeps and link enter listeners
    navPills.forEach(pill => {
        pill.addEventListener('mouseenter', () => {
            track.classList.add('is-hovered');
            animateIndicator(pill);
        });
    });

    track.addEventListener('mouseleave', () => {
        track.classList.remove('is-hovered');
        // Slide back to the active section pill on mouse exit
        animateIndicator(activePill);
    });

    window.addEventListener('scroll', scrollActive, { passive: true });
    window.addEventListener('resize', () => animateIndicator(activePill));

    // Initial positioning after document loads completely
    setTimeout(() => {
        activePill = document.querySelector('.nav-pill.active') || navPills[0];
        animateIndicator(activePill);
    }, 200);
    
    // Smooth Scrolling anchor link transitions powered natively by Lenis
    document.querySelectorAll('.nav-pill, .mobile-link, .scroll-btn, .nav-logo').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection && lenis) {
                // Align sections perfectly under the sticky header
                const offset = targetId === '#hero' ? 0 : -75;
                lenis.scrollTo(targetSection, {
                    offset: offset,
                    duration: 1.2,
                    immediate: false
                });
            }
        });
    });
}

/* ==========================================================================
   CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const feedback = document.getElementById('formFeedback');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Grab inputs
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const messageVal = document.getElementById('message').value.trim();
        
        // Simple client-side validation
        if (!nameVal || !emailVal || !messageVal) {
            showFeedback('Please fill in all fields.', 'error');
            return;
        }
        
        // Visual sending state
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
        
        // Simulate premium asynchronous mail delivery
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            // Success response
            showFeedback(`Thank you, ${nameVal}! Your message has been received.`, 'success');
            form.reset();
            
            // Clear feedback after 5 seconds
            setTimeout(() => {
                feedback.classList.add('hidden');
                feedback.className = 'form-feedback hidden';
            }, 5000);
            
        }, 1800);
    });
    
    function showFeedback(msg, type) {
        feedback.innerText = msg;
        feedback.className = `form-feedback ${type}`; // remove hidden
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/* ==========================================================================
   AMBIENT HIGH-PERFORMANCE CANVAS PARTICLES
   ========================================================================== */
function initAmbientParticles() {
    const canvas = document.getElementById('ambient-particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    
    // Mouse tracking for particle interaction
    let mouse = { x: -9999, y: -9999 };
    const mouseRadius = 150; // Repulsion radius in pixels
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });
    
    // Auto resize canvas size
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Trigonometric Vector Flow Field Particle with Mouse Repulsion
    class FlowParticle {
        constructor() {
            this.reset();
            // Start at random coordinates
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 0.8 + 0.4;
            this.vx = 0;
            this.vy = 0;
            this.speedMultiplier = Math.random() * 0.3 + 0.15;
            this.opacity = Math.random() * 0.12 + 0.04;
            this.life = Math.random() * 200 + 100;
            this.maxLife = this.life;
        }
        
        update(time) {
            this.life--;
            if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }

            // Flow field base force
            const angle = Math.sin(this.x * 0.003 + time * 0.0002) * Math.cos(this.y * 0.003 - time * 0.0002) * Math.PI * 2;
            let ax = Math.cos(angle) * this.speedMultiplier;
            let ay = Math.sin(angle) * this.speedMultiplier;

            // Mouse repulsion — push particles away from cursor (only calculate if mouse is on screen)
            if (mouse.x > -9000) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouseRadius && dist > 0) {
                    // Smooth inverse-square repulsion force
                    const force = (mouseRadius - dist) / mouseRadius;
                    const repelStrength = force * force * 2.5; // Quadratic falloff
                    ax += (dx / dist) * repelStrength;
                    ay += (dy / dist) * repelStrength;
                }
            }

            // Apply friction and accumulate acceleration
            this.vx = this.vx * 0.95 + ax * 0.05;
            this.vy = this.vy * 0.95 + ay * 0.05;

            this.x += this.vx;
            this.y += this.vy;
        }
        
        draw() {
            const currentOpacity = this.opacity * (this.life / this.maxLife);

            // Particles near the cursor glow slightly brighter (only calculate if mouse is on screen)
            let proximityBoost = 1;
            if (mouse.x > -9000) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                proximityBoost = dist < mouseRadius * 1.5 ? 
                    (1 + (1 - dist / (mouseRadius * 1.5)) * 1.5) : 1;
            }

            ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * proximityBoost})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // Populate flow field particles (optimized count for mobile screens)
    const initParticles = () => {
        particlesArray = [];
        const count = Math.floor((canvas.width * canvas.height) / 10000);
        const maxParticles = window.innerWidth <= 820 ? 15 : 220;
        for (let i = 0; i < Math.min(count, maxParticles); i++) {
            particlesArray.push(new FlowParticle());
        }
    };
    initParticles();
    
    window.addEventListener('resize', initParticles);
    
    let time = 0;
    
    const animate = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        time++;

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update(time);
            particlesArray[i].draw();
        }
        
        requestAnimationFrame(animate);
    };
    animate();
}

/* ==========================================================================
   MAGNETIC GRID — Cursor-Tracking Spotlight Reveal
   ========================================================================== */
function initMagneticGrid() {
    const grid = document.getElementById('magnetic-grid');
    if (!grid) return;

    window.addEventListener('mousemove', (e) => {
        grid.style.setProperty('--mouse-x', e.clientX + 'px');
        grid.style.setProperty('--mouse-y', e.clientY + 'px');
    });
}

/* ==========================================================================
   SECTION REVEAL ENGINE (INTERSECTION OBSERVER)
   ========================================================================== */
function initSectionReveal() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observerOptions = {
        root: null,
        threshold: 0.05,
        rootMargin: '0px 0px -10px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const section = entry.target;
            const isAboutSection = section.id === 'about';

            if (entry.isIntersecting) {
                if (section.revealTimeout) {
                    clearTimeout(section.revealTimeout);
                }

                section.classList.add('reveal-active');
                
                // Add class 'revealed' after all stagger transitions are complete
                const delay = isAboutSection ? 2200 : 600;
                section.revealTimeout = setTimeout(() => {
                    section.classList.add('revealed');
                }, delay);
                
                if (!isAboutSection) {
                    observer.unobserve(section);
                }
            } else {
                if (isAboutSection) {
                    if (section.revealTimeout) {
                        clearTimeout(section.revealTimeout);
                    }
                    section.classList.remove('reveal-active');
                    section.classList.remove('revealed');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   MULTI-LAYERED HIGH-PERFORMANCE SCROLL PARALLAX
   ========================================================================== */
function initScrollParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Register ScrollTrigger plugin with GSAP
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================================================
    // GSAP HERO PARALLAX ANIMATION LAYERS (Linked to Lenis Inertial Scroll)
    // ==========================================================================

    let mm = gsap.matchMedia();

    // Desktop only scroll animations (screen width > 768px)
    mm.add("(min-width: 769px)", () => {
        // Layer 1: Background Typography ("PORTFOLIO") Outer Wrapper
        gsap.to('.hero-bg-heading-wrapper', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2, // Delicate lag for elegant kinetic inertia
            },
            yPercent: -20,      // Shifts upwards slowly
            xPercent: -15,      // Kinetic horizontal drift to the left
            opacity: 0.08,      // Smooth fade out as it exits
            ease: 'none'
        });

        // Layer 2: Central Portrait Image
        gsap.to('.portrait-wrapper', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2,
            },
            yPercent: 12,       // Moves slower than scroll speed for distinct layering depth
            scale: 0.92,        // Gracefully scales down
            opacity: 0.05,      // Fades out near exit
            ease: 'none'
        });

        // Layer 3: Foreground Text & UI (Left typographic columns & Right stacked role)
        gsap.to(['.hero-left-content', '.hero-right-content'], {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '45% top',
                scrub: 1.0,
            },
            yPercent: -35,      // Slides upwards faster than viewport speed
            opacity: 0,         // Rapidly fades out
            ease: 'none'
        });

        // Scroll Down Hint Indicator
        gsap.to('.scroll-down-hint', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '20% top',
                scrub: 1.0,
            },
            yPercent: -15,
            opacity: 0,
            ease: 'none'
        });
    });

    // Kinetic Page-Load Slide-In and Interactive Mouse-Parallax
    const bgHeading = document.querySelector('.hero-bg-heading');
    if (bgHeading) {
        let isLoaded = false;

        // 1. Entrance on page load: Smooth slide-in from the right side
        gsap.fromTo(bgHeading, 
            { 
                x: '180px', 
                opacity: 0 
            }, 
            { 
                x: '0px', 
                opacity: 0.9, 
                duration: 2.2, 
                ease: 'power4.out',
                onComplete: () => {
                    isLoaded = true;
                }
            }
        );

        // 2. Mousemove Parallax: Link to cursor coordinates for immersive depth
        window.addEventListener('mousemove', (e) => {
            if (!isLoaded) return;
            if (window.innerWidth <= 768) return; // Ignore on mobile

            // Calculate offset percentage from center (-0.5 to 0.5)
            const xPercent = (e.clientX / window.innerWidth) - 0.5;
            const yPercent = (e.clientY / window.innerHeight) - 0.5;

            // Nudge slightly in opposite direction (maximum 40px translation)
            const targetX = xPercent * -40;
            const targetY = yPercent * -20;

            gsap.to(bgHeading, {
                x: targetX,
                y: targetY,
                duration: 1.2,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    }

    // ==========================================================================
    // GSAP ABOUT SECTION PARALLAX ANIMATION LAYERS (Matching Hero Parallax)
    // ==========================================================================

    // About Layer 1: Background Title ("ABOUT ME") — scroll parallax + mouse parallax
    const aboutBgTitle = document.querySelector('.about-bg-title');
    if (aboutBgTitle) {
        // Scroll-based drift
        gsap.to('.about-bg-title', {
            scrollTrigger: {
                trigger: '#about',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.4,
            },
            yPercent: -30,
            xPercent: -8,
            opacity: 0.1,
            ease: 'none'
        });

        // Mouse-based parallax (tracks cursor for immersive depth)
        window.addEventListener('mousemove', (e) => {
            const xPercent = (e.clientX / window.innerWidth) - 0.5;
            const yPercent = (e.clientY / window.innerHeight) - 0.5;

            gsap.to(aboutBgTitle, {
                x: xPercent * -30,
                y: yPercent * -15,
                duration: 1.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    }

    // About Layer 2: Left Content Column (Portrait + Quick Facts) — slow scroll parallax for depth
    gsap.to('.about-left', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
        },
        yPercent: -8,
        ease: 'none'
    });

    // About Layer 3: Text Content — subtle upward drift on scroll (synchronized)
    gsap.to('.about-right', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
        },
        yPercent: -8,
        ease: 'none'
    });

    // ==========================================================================
    // GLOBAL AMBIENT SHAPES & OUTLINE BACKDROP PARALLAX (LERP Loop)
    // ==========================================================================
    const sphere1 = document.querySelector('.sphere-1-wrap');
    const sphere2 = document.querySelector('.sphere-2-wrap');
    const sphere3 = document.querySelector('.sphere-3-wrap');
    
    // Select existing + new local section blobs
    const blobSkills = document.querySelector('.blob-skills');
    const blobSkills2 = document.querySelector('.blob-skills-2');
    const blobProjects = document.querySelector('.blob-projects');
    const blobProjects2 = document.querySelector('.blob-projects-2');
    const blobProjects3 = document.querySelector('.blob-projects-3');
    const blobContact = document.querySelector('.blob-contact');
    const blobContact2 = document.querySelector('.blob-contact-2');
    const blobBeyond = document.querySelector('.blob-beyond');
    
    // Select existing + new global background wrappers
    const blobGlobal1 = document.querySelector('.blob-global-1-wrap');
    const blobGlobal2 = document.querySelector('.blob-global-2-wrap');
    const blobGlobal3 = document.querySelector('.blob-global-3-wrap');
    const blobGlobal4 = document.querySelector('.blob-global-4-wrap');

    // Select outline backdrop parallax texts with precalculated geometry to eliminate layout thrashing
    const parallaxData = [];
    const initParallaxData = () => {
        parallaxData.length = 0;
        document.querySelectorAll('.parallax-text').forEach(el => {
            const parent = el.parentElement;
            if (parent) {
                parallaxData.push({
                    element: el,
                    speed: parseFloat(el.getAttribute('data-speed')) || 0.1,
                    parentOffsetTop: getAbsoluteOffsetTop(parent),
                    parentHeight: parent.offsetHeight
                });
            }
        });
    };
    initParallaxData();
    window.addEventListener('resize', initParallaxData);

    let lastScrollY = window.scrollY;
    let targetScrollY = window.scrollY;

    const updateScrollParallax = () => {
        // Interpolation (lerp) for buttery smooth motion lag with increased fluid weight
        lastScrollY += (targetScrollY - lastScrollY) * 0.05;

        if (sphere1) {
            sphere1.style.transform = `translate3d(0, ${lastScrollY * 0.15}px, 0)`;
        }
        if (sphere2) {
            sphere2.style.transform = `translate3d(0, ${lastScrollY * -0.12}px, 0)`;
        }
        if (sphere3) {
            sphere3.style.transform = `translate3d(0, ${lastScrollY * 0.08}px, 0) rotate(${lastScrollY * 0.015}deg)`;
        }

        // Apply scroll parallax in a single GPU-driven update
        if (blobSkills) {
            blobSkills.style.transform = `translate3d(0, ${lastScrollY * -0.05}px, 0)`;
        }
        if (blobSkills2) {
            blobSkills2.style.transform = `translate3d(0, ${lastScrollY * 0.04}px, 0)`;
        }
        if (blobProjects) {
            blobProjects.style.transform = `translate3d(0, ${lastScrollY * 0.06}px, 0)`;
        }
        if (blobProjects2) {
            blobProjects2.style.transform = `translate3d(0, ${lastScrollY * -0.06}px, 0)`;
        }
        if (blobProjects3) {
            blobProjects3.style.transform = `translate3d(0, ${lastScrollY * -0.05}px, 0)`;
        }
        if (blobContact) {
            blobContact.style.transform = `translate3d(0, ${lastScrollY * -0.04}px, 0)`;
        }
        if (blobContact2) {
            blobContact2.style.transform = `translate3d(0, ${lastScrollY * 0.05}px, 0)`;
        }
        if (blobBeyond) {
            blobBeyond.style.transform = `translate3d(0, ${lastScrollY * 0.04}px, 0)`;
        }
        if (blobGlobal1) {
            blobGlobal1.style.transform = `translate3d(0, ${lastScrollY * 0.06}px, 0)`;
        }
        if (blobGlobal2) {
            blobGlobal2.style.transform = `translate3d(0, ${lastScrollY * -0.06}px, 0)`;
        }
        if (blobGlobal3) {
            blobGlobal3.style.transform = `translate3d(0, ${lastScrollY * 0.05}px, 0)`;
        }
        if (blobGlobal4) {
            blobGlobal4.style.transform = `translate3d(0, ${lastScrollY * -0.05}px, 0)`;
        }

        // Backstage Parallax outline texts relative to parent viewport offset (Zero layout thrashing!)
        parallaxData.forEach(item => {
            const parentTop = item.parentOffsetTop - lastScrollY;
            const relativeOffset = (window.innerHeight / 2) - (parentTop + item.parentHeight / 2);
            const translateY = relativeOffset * item.speed;
            item.element.style.transform = `translate3d(-50%, ${translateY}px, 0)`;
        });

        requestAnimationFrame(updateScrollParallax);
    };

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    }, { passive: true });

    updateScrollParallax();
}

/* ==========================================================================
   PREMIUM DYNAMIC HORIZONTAL PROJECTS ACCORDION SWIPER
   ========================================================================== */
function setupMobileTap(item, type) {
    let touchStartX = 0;
    let touchStartY = 0;

    item.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    item.addEventListener('touchend', (e) => {
        if (window.innerWidth > 820) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = Math.abs(touchEndX - touchStartX);
        const diffY = Math.abs(touchEndY - touchStartY);

        // If finger moved less than 8px in both directions, it's a tap!
        if (diffX < 8 && diffY < 8) {
            handleMobileTap(item, type);
        }
    }, { passive: true });
}

function handleMobileTap(item, type) {
    const activeClass = type === 'project' ? 'accordion-item' : 'interest-accordion-item';
    const currentActive = document.querySelector(`.${activeClass}.active`);
    
    if (currentActive !== item) {
        isMobileClickScrolling = true;
        if (currentActive) currentActive.classList.remove('active');
        item.classList.add('active');
        
        // Calculate the absolute static target scroll position to prevent layout shift errors
        const isProject = type === 'project';
        const container = isProject ? document.querySelector('.projects-accordion') : document.querySelector('.interests-accordion');
        const items = Array.from(isProject ? document.querySelectorAll('.accordion-item') : document.querySelectorAll('.interest-accordion-item'));
        const index = items.indexOf(item);
        const itemHeight = isProject ? 110 : 105;
        
        const containerTop = getAbsoluteOffsetTop(container);
        const targetY = containerTop + index * itemHeight - (window.innerHeight / 2) + 45;
        
        // Scroll card to center of viewport using native smooth scroll on mobile for better compatibility
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        
        setTimeout(() => {
            isMobileClickScrolling = false;
        }, 800);
    }
}

function initProjectsAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    if (accordionItems.length === 0) return;

    accordionItems.forEach((item) => {
        // Bind touch tap events for mobile layout
        setupMobileTap(item, 'project');

        // Maximize on hover (mouseenter)
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth <= 820) return;

            const currentActive = document.querySelector('.accordion-item.active');
            if (currentActive !== item) {
                if (currentActive) currentActive.classList.remove('active');
                item.classList.add('active');
            }
        });

        // Click/tap handler: fallback click listener
        item.addEventListener('click', () => {
            if (window.innerWidth <= 820) {
                handleMobileTap(item, 'project');
                return;
            }

            // Desktop click fallback
            const currentActive = document.querySelector('.accordion-item.active');
            if (currentActive !== item) {
                if (currentActive) currentActive.classList.remove('active');
                item.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   PROJECTS SLIDER PAGINATION ENGINE (4 CARDS VISIBLE WINDOW)
   ========================================================================== */
function initProjectsSlider() {
    const accordion = document.querySelector('.projects-accordion');
    if (!accordion) return;

    const items = accordion.querySelectorAll('.accordion-item');
    if (items.length <= 4) return;

    let startIndex = 0;
    const maxStartIndex = items.length - 4; // 6 - 4 = 2

    const updateSlider = (newStartIndex) => {
        if (newStartIndex === startIndex) return;
        startIndex = newStartIndex;

        items.forEach((item, index) => {
            if (index >= startIndex && index < startIndex + 4) {
                item.classList.remove('hidden-card');
            } else {
                item.classList.add('hidden-card');
                // Deactivate the hidden card if it was active
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            }
        });

        // Ensure at least one visible card is active (expanded)
        const activeItem = accordion.querySelector('.accordion-item.active:not(.hidden-card)');
        if (!activeItem) {
            items[startIndex].classList.add('active');
        }
    };

    // Track mouse movement across the projects container to shift visible window
    accordion.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 820) return; // Responsive vertical stack on mobile

        const rect = accordion.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, relativeX / rect.width));

        // Map mouse position to 3 zones (Zone 0: Left, Zone 1: Center, Zone 2: Right)
        let targetIndex = 0;
        if (pct >= 0.35 && pct < 0.65) {
            targetIndex = 1;
        } else if (pct >= 0.65) {
            targetIndex = 2;
        }

        updateSlider(targetIndex);
    });

    // Initialize state showing first 4 cards
    items.forEach((item, index) => {
        if (index >= 4) {
            item.classList.add('hidden-card');
        }
    });
}

/* ==========================================================================
   PREMIUM DYNAMIC HORIZONTAL INTERESTS ACCORDION SWIPER
   ========================================================================== */
function initInterestsAccordion() {
    const accordionItems = document.querySelectorAll('.interest-accordion-item');
    if (accordionItems.length === 0) return;

    accordionItems.forEach((item) => {
        // Bind touch tap events for mobile layout
        setupMobileTap(item, 'interest');

        // Maximize on hover (mouseenter)
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth <= 820) return;

            const currentActive = document.querySelector('.interest-accordion-item.active');
            if (currentActive !== item) {
                if (currentActive) currentActive.classList.remove('active');
                item.classList.add('active');
            }
        });

        // Click/tap handler: fallback click listener
        item.addEventListener('click', () => {
            if (window.innerWidth <= 820) {
                handleMobileTap(item, 'interest');
                return;
            }

            // Desktop click fallback
            const currentActive = document.querySelector('.interest-accordion-item.active');
            if (currentActive !== item) {
                if (currentActive) currentActive.classList.remove('active');
                item.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   SCROLL-BOUND INTERACTIVE PARALLAX MESH ANIMATION (GSAP ScrollTrigger)
   ========================================================================== */
function initScrollParallaxPins() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Register ScrollTrigger plugin with GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Parallax configs for each passion pin in the mood board background
    const pinParallaxConfigs = [
        { selector: '.pin-films', yPercent: -45, rotate: -3 },
        { selector: '.pin-posters', yPercent: -60, rotate: 2 },
        { selector: '.pin-chess', yPercent: 40, rotate: -1.5 },
        { selector: '.pin-literature', yPercent: -50, rotate: 1 },
        { selector: '.pin-writing', yPercent: -55, rotate: -2 },
        { selector: '.pin-dev', yPercent: -30, rotate: 1.5 }
    ];

    pinParallaxConfigs.forEach(config => {
        const pin = document.querySelector(config.selector);
        if (pin) {
            // Set initial rotation for aesthetic variety
            gsap.set(pin, { rotation: config.rotate });

            // Animate translation over scroll
            gsap.to(pin, {
                scrollTrigger: {
                    trigger: pin,
                    start: 'top bottom', // Trigger as soon as the card enters the viewport bottom
                    end: 'bottom top',   // Continue until it leaves the viewport top
                    scrub: 1.5           // Buttery soft lag for physical inertia
                },
                yPercent: config.yPercent,
                ease: 'none'
            });
        }
    });
}



/* ==========================================================================
   SCROLL-DRIVEN VIDEO BACKGROUND (Looping Scrub)
   ========================================================================== */
function initScrollVideo() {
    const video = document.getElementById('bg-video');
    if (!video) return;

    // How many pixels of scroll equals one full video loop
    const scrollPerLoop = 3000;

    // Wait until video metadata is ready so we know its duration
    const onReady = () => {
        const duration = video.duration;
        if (!duration || isNaN(duration)) return;

        // Pause native playback — we drive it manually
        video.pause();

        // Use Lenis scroll callback for buttery-smooth updates
        if (typeof lenis !== 'undefined' && lenis) {
            lenis.on('scroll', ({ scroll }) => {
                // Modulo loop: every `scrollPerLoop` px replays the full video
                const loopedScroll = scroll % scrollPerLoop;
                const progress = loopedScroll / scrollPerLoop;
                video.currentTime = progress * duration;
            });
        } else {
            // Fallback: plain scroll listener
            window.addEventListener('scroll', () => {
                const scroll = window.scrollY;
                const loopedScroll = scroll % scrollPerLoop;
                const progress = loopedScroll / scrollPerLoop;
                video.currentTime = progress * duration;
            }, { passive: true });
        }
    };

    if (video.readyState >= 1) {
        onReady();
    } else {
        video.addEventListener('loadedmetadata', onReady);
    }
}

/* ==========================================================================
   FADE-REVEAL ROTATING TYPOGRAPHY LOOP
   ========================================================================== */
function initRotatingText() {
    const words = document.querySelectorAll('.rotating-word');
    if (words.length === 0) return;

    let currentIndex = 0;
    const interval = 2500;

    setInterval(() => {
        const current = words[currentIndex];
        current.classList.remove('active');
        current.classList.add('exit');

        const nextIndex = (currentIndex + 1) % words.length;
        const next = words[nextIndex];

        setTimeout(() => {
            current.classList.remove('exit');
            next.classList.add('active');
        }, 300);

        currentIndex = nextIndex;
    }, interval);
}

/* ==========================================================================
   MOBILE VERTICAL SCROLL ACCORDION MAXIMIZER
   ========================================================================== */
function initMobileScrollAccordion() {
    const projectItems = document.querySelectorAll('.accordion-item');
    const interestItems = document.querySelectorAll('.interest-accordion-item');
    let ticking = false;

    const handleScroll = () => {
        if (window.innerWidth > 820) return;
        if (isMobileClickScrolling) return; // Skip updating active class if we're programmatically scrolling to a clicked card

        const viewportCenter = window.innerHeight / 2;

        // 1. Projects Accordion scroll trigger
        let closestProject = null;
        let minProjectDist = Infinity;

        projectItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            // Use a stable collapsed center offset (45px) to prevent height expansion from biasing detection center
            const itemCenter = rect.top + 45;
            const dist = Math.abs(viewportCenter - itemCenter);

            if (dist < minProjectDist) {
                minProjectDist = dist;
                closestProject = item;
            }
        });

        if (closestProject) {
            projectItems.forEach(item => {
                if (item === closestProject) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        // 2. Interests Accordion scroll trigger
        let closestInterest = null;
        let minInterestDist = Infinity;

        interestItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            // Use a stable collapsed center offset (45px) to prevent height expansion from biasing detection center
            const itemCenter = rect.top + 45;
            const dist = Math.abs(viewportCenter - itemCenter);

            if (dist < minInterestDist) {
                minInterestDist = dist;
                closestInterest = item;
            }
        });

        if (closestInterest) {
            interestItems.forEach(item => {
                if (item === closestInterest) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    };

    const throttledHandleScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
        });
    };

    // Integrate with Lenis scroll event if available, otherwise fallback to standard scroll
    if (typeof lenis !== 'undefined' && lenis) {
        lenis.on('scroll', throttledHandleScroll);
    } else {
        window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    }

    // Trigger once initially to set correct state
    setTimeout(handleScroll, 100);
}

