/**
 * AnimationEngine - SwarSadhana Pro
 * Centralized Animation Controller using anime.js
 */

import anime from 'animejs/lib/anime.es.js';

class AnimationEngine {
    constructor() {
        this.particles = [];
        this.particleCount = 60;
        this.initialized = false;
    }

    /**
     * Initialize particle background with Indian classical theme colors
     */
    initParticles() {
        const container = document.getElementById('particles-bg');
        if (!container || this.initialized) return;

        this.initialized = true;

        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${2 + Math.random() * 5}px`;
            particle.style.height = particle.style.width;
            particle.style.opacity = 0.15 + Math.random() * 0.25;

            // Indian classical theme colors - Saffron, Gold, Maroon accents
            const colors = ['#FF9933', '#FFD700', '#FF6B35', '#8B1538', '#FFB366'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            container.appendChild(particle);
            this.particles.push(particle);
        }

        // Animate particles
        this.animateParticles();
    }

    /**
     * Animate floating particles
     */
    animateParticles() {
        this.particles.forEach((particle, index) => {
            anime({
                targets: particle,
                translateY: [
                    { value: -25 - Math.random() * 40, duration: 4000 + Math.random() * 2000 },
                    { value: 25 + Math.random() * 40, duration: 4000 + Math.random() * 2000 }
                ],
                translateX: [
                    { value: -15 - Math.random() * 25, duration: 5000 + Math.random() * 2000 },
                    { value: 15 + Math.random() * 25, duration: 5000 + Math.random() * 2000 }
                ],
                opacity: [
                    { value: 0.1 + Math.random() * 0.15, duration: 2500 },
                    { value: 0.3 + Math.random() * 0.2, duration: 2500 }
                ],
                easing: 'easeInOutSine',
                loop: true,
                delay: index * 40
            });
        });
    }

    /**
     * Staggered entrance animation for multiple elements
     */
    staggerEntrance(selector, options = {}) {
        const defaults = {
            translateY: [40, 0],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(100, { start: 100 }),
            easing: 'easeOutExpo'
        };

        return anime({
            targets: selector,
            ...defaults,
            ...options
        });
    }

    /**
     * Screen transition animation
     */
    screenTransition(element, type = 'in') {
        if (type === 'in') {
            return anime({
                targets: element,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 500,
                easing: 'easeOutExpo'
            });
        } else {
            return anime({
                targets: element,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 300,
                easing: 'easeInQuad'
            });
        }
    }

    /**
     * Button press animation with ripple
     */
    buttonPress(element, event) {
        // Create ripple
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        element.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => ripple.remove(), 600);

        // Press animation
        anime({
            targets: element,
            scale: [1, 0.95, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * Number counter animation
     */
    countUp(element, targetValue, options = {}) {
        const obj = { value: 0 };
        const startValue = parseInt(element.textContent) || 0;

        return anime({
            targets: obj,
            value: [startValue, targetValue],
            duration: options.duration || 800,
            easing: options.easing || 'easeOutExpo',
            round: 1,
            update: () => {
                element.textContent = options.suffix
                    ? `${Math.round(obj.value)}${options.suffix}`
                    : Math.round(obj.value);
            }
        });
    }

    /**
     * Hero text reveal animation
     */
    heroReveal(container) {
        const timeline = anime.timeline({
            easing: 'easeOutExpo'
        });

        const title = container.querySelector('h1');
        const hindiTitle = container.querySelector('.hindi-title');
        const subtitle = container.querySelector('p');
        const button = container.querySelector('.btn');

        if (title) {
            timeline.add({
                targets: title,
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 800
            });
        }

        if (hindiTitle) {
            timeline.add({
                targets: hindiTitle,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600
            }, '-=500');
        }

        if (subtitle) {
            timeline.add({
                targets: subtitle,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600
            }, '-=400');
        }

        if (button) {
            timeline.add({
                targets: button,
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.9, 1],
                duration: 500
            }, '-=300');
        }

        return timeline;
    }

    /**
     * Card entrance animation
     */
    cardEntrance(cards) {
        return anime({
            targets: cards,
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.95, 1],
            delay: anime.stagger(100),
            duration: 600,
            easing: 'easeOutExpo'
        });
    }

    /**
     * Swar key press animation
     */
    swarKeyPress(element) {
        return anime({
            targets: element,
            translateY: [0, 5, 0],
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutQuad'
        });
    }

    /**
     * Swar match celebration animation - "Shuddha Swar" moment
     */
    swarMatchCelebration(element) {
        return anime({
            targets: element,
            scale: [1, 1.15, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .5)'
        });
    }

    /**
     * Accuracy meter fill animation
     */
    meterFill(element, percentage) {
        return anime({
            targets: element,
            width: `${percentage}%`,
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    /**
     * Score update animation
     */
    scoreUpdate(element, value) {
        // Bounce animation
        anime({
            targets: element,
            scale: [1, 1.2, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .6)'
        });

        // Update value with counter
        this.countUp(element, value);
    }

    /**
     * Nav link hover effect
     */
    navLinkHover(element, entering) {
        anime({
            targets: element,
            scale: entering ? 1.05 : 1,
            duration: 200,
            easing: 'easeOutQuad'
        });
    }

    /**
     * Success burst effect - for Shuddha Swar achievement
     */
    successBurst(element) {
        // Create burst particles
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: linear-gradient(135deg, #FF9933, #FFD700);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${centerX}px;
                top: ${centerY}px;
            `;
            document.body.appendChild(particle);

            const angle = (i / 10) * Math.PI * 2;
            const distance = 60 + Math.random() * 40;

            anime({
                targets: particle,
                translateX: Math.cos(angle) * distance,
                translateY: Math.sin(angle) * distance,
                opacity: [1, 0],
                scale: [1, 0],
                duration: 700,
                easing: 'easeOutExpo',
                complete: () => particle.remove()
            });
        }
    }

    /**
     * Waveform glow pulse
     */
    waveformPulse(container) {
        return anime({
            targets: container,
            boxShadow: [
                '0 0 10px rgba(255, 153, 51, 0.2)',
                '0 0 30px rgba(255, 153, 51, 0.4)',
                '0 0 10px rgba(255, 153, 51, 0.2)'
            ],
            duration: 1500,
            loop: true,
            easing: 'easeInOutSine'
        });
    }

    /**
     * Tanpura button activation animation
     */
    tanpuraActivate(button) {
        return anime({
            targets: button,
            scale: [1, 1.1, 1],
            duration: 300,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    /**
     * Raga card reveal animation
     */
    ragaCardReveal(card) {
        return anime({
            targets: card,
            opacity: [0, 1],
            translateY: [30, 0],
            rotateY: [15, 0],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }
}

// Export singleton instance
export const animationEngine = new AnimationEngine();
export default animationEngine;
