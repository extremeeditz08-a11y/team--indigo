// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    console.log("DOM loaded. Initializing site...");

    // Setup Canvas Sequence
    setupCanvasSequence();
    
});

function setupCanvasSequence() {
    const canvas = document.getElementById("hero-canvas");
    const context = canvas.getContext("2d");

    // Configure image sequence
    const frameCount = 80; // 000 to 079
    const baseUrl = import.meta.env.BASE_URL || '/';
    const currentFrame = index => (
        `${baseUrl}hero/upscaled-video_000/upscaled-video_${index.toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const imageSeq = {
        frame: 0
    };

    let loadedImages = 0;
    const loaderBar = document.querySelector(".loader-bar");
    const loaderText = document.getElementById("loader-text");
    const preloader = document.getElementById("preloader");

    // Helper to resize canvas properly
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render();
    }

    // Failsafe & Fast Load threshold
    let preloaderDismissed = false;

    // Preload remaining images
    function checkDone() {
        if (!preloaderDismissed && loadedImages >= 1) {
            preloaderDismissed = true;
            loaderBar.style.width = `100%`;
            loaderText.innerText = `Ready!`;
            
            setTimeout(() => {
                preloader.style.opacity = 0;
                setTimeout(() => {
                    preloader.style.display = "none";
                    initAnimations(); // Fire off reveal animations
                }, 600);
            }, 100);
        }
    }

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images[i] = img;
        
        img.onload = () => {
            loadedImages++;
            checkDone();
        };
        img.onerror = () => {
            console.error("Failed to load frame " + i, img.src);
            loadedImages++;
            checkDone();
        };
    }

    // Failsafe: Hide preloader after 2 seconds maximum regardless
    setTimeout(() => {
        if (!preloaderDismissed) {
            preloaderDismissed = true;
            preloader.style.opacity = 0;
            setTimeout(() => {
                preloader.style.display = "none";
                initAnimations();
            }, 600);
        }
    }, 2000);

    // Draw the image filling the canvas (cover)
    function render() {
        if (!images[Math.round(imageSeq.frame)]) return;
        
        const img = images[Math.round(imageSeq.frame)];
        if (!img.complete) return;

        // Calculate aspect ratio cover logic
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    images[0].onload = render;

    // Handle Resize
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // GSAP ScrollTrigger timeline for Hero Canvas
    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top", 
            pin: true,
            scrub: 1, 
            anticipatePin: 1
        }
    });

    // Animate frames 0 -> 79
    heroTl.to(imageSeq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: render
    }, 0);

    // Ensure canvas stays centered during scale
    gsap.set(canvas, { transformOrigin: "center center" });

    // Improved zoom-out effect (starts slightly zoomed in, ends at full screen)
    heroTl.fromTo(canvas, 
        { scale: 1.15 }, 
        { scale: 1, ease: "none" }, 
    0);

    // Fade out text as you scrub down
    heroTl.to(".hero-content", {
        opacity: 0,
        y: -100,
        duration: 0.4
    }, 0);

    // Fade out canvas container exactly as the next section starts to overlay
    heroTl.to(".canvas-container", {
        opacity: 0,
        duration: 0.3
    }, 0.7); 

}

function initAnimations() {
    // Check for reduced motion or very small screens to simplify
    const isMobile = window.innerWidth < 768;
    const scrollEase = isMobile ? "power1.out" : "power3.out";

    // Basic View Reveal Animations
    const animElements = document.querySelectorAll('.view-anim');
    
    animElements.forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 90%", 
                toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.6 : 1,
            ease: scrollEase
        });
    });

    // Count Up Animation for Stats
    const stats = document.querySelectorAll('.stat-num');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const suffix = stat.getAttribute('data-suffix') || '';
        
        gsap.to(stat, {
            scrollTrigger: {
                trigger: ".stats-section",
                start: "top 80%"
            },
            innerHTML: target,
            duration: isMobile ? 1.5 : 2,
            snap: { innerHTML: 1 },
            onUpdate: function() {
                stat.innerHTML = Math.round(this.targets()[0].innerHTML) + suffix;
            }
        });
    });

    // Horizontal Scroll for Team Section
    const teamTrack = document.querySelector('.team-scroll-track');
    const teamContainer = document.querySelector('.team-scroll-container');
    
    if (teamTrack && teamContainer && !isMobile) {
        // Calculate the total horizontal tracking distance 
        const getScrollAmount = () => -(teamTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.1); 
        
        const teamTween = gsap.to(teamTrack, {
            x: getScrollAmount,
            ease: "none"
        });
        
        ScrollTrigger.create({
            trigger: teamContainer,
            start: "center center",
            end: () => `+=${getScrollAmount() * -1}`,
            pin: true,
            animation: teamTween,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1
        });
    } else if (teamTrack && isMobile) {
        // Mobile fallback -> simple overflow scroll
        teamContainer.style.height = 'auto';
        teamContainer.style.padding = '40px 20px';
        teamTrack.style.overflowX = 'auto';
        teamTrack.style.paddingRight = '20px';
        teamTrack.classList.add('hide-scrollbar');
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}
