// Register GSAP
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initAnimations();
    initCustomCursor();
});

function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 60 + 20;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.4;
            this.color = Math.random() > 0.5 ? '#9d50bb' : '#6e48aa';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < -100) this.x = canvas.width + 100;
            if (this.x > canvas.width + 100) this.x = -100;
            if (this.y < -100) this.y = canvas.height + 100;
            if (this.y > canvas.height + 100) this.y = -100;
        }

        draw() {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, this.color + '33'); // Adding hex transparency
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 40; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

function initAnimations() {
    // Hero Entrance
    const tl = gsap.timeline();
    tl.to("#hero-title", {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power4.out"
    })
    .to("#hero-tag", {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, "-=0.8");

    // Member Cards Reveal
    const cards = document.querySelectorAll('.member-card');
    cards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 95%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            scale: 0.9,
            duration: 1.2,
            delay: (index % 3) * 0.1,
            ease: "power3.out"
        });

        // Drift / Floating Motion (Organic feel)
        gsap.to(card, {
            y: "-=30",
            x: index % 2 === 0 ? "+=20" : "-=20",
            duration: 4 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });

    // Mouse Parallax for Cluster
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (clientX - centerX) / centerX;
        const moveY = (clientY - centerY) / centerY;

        cards.forEach(card => {
            const factor = parseFloat(card.getAttribute('data-parallax')) || 0.1;
            gsap.to(card, {
                x: moveX * 50 * factor,
                y: moveY * 50 * factor,
                duration: 1,
                ease: "power2.out"
            });
        });
    });

    // Section Labels reveal
    document.querySelectorAll('.team-section-label').forEach(label => {
        gsap.from(label, {
            scrollTrigger: {
                trigger: label,
                start: "top 90%"
            },
            opacity: 0,
            letterSpacing: "20px",
            duration: 1.5,
            ease: "power2.out"
        });
    });
}

function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1
        });
    });

    document.querySelectorAll('.member-card, a').forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 3, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, duration: 0.3 });
        });
    });
}
