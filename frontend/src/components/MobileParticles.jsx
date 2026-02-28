import React, { useEffect, useRef } from 'react';
import './MobileParticles.css';

export default function MobileParticles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Colors
        const SAFFRON = '#FF6B2C';
        const TEAL = '#00E5A0';

        // Set canvas size
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Particle System
        const particles = [];
        const numParticles = 45; // Sweet spot for mobile performance vs density
        const connectionDistance = 110;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Move mostly upwards, slight horizontal drift
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 1) * 1.5 - 0.5;
                this.radius = Math.random() * 2 + 1.5;
                this.color = Math.random() > 0.5 ? SAFFRON : TEAL;
                // Add a subtle pulsing size
                this.baseRadius = this.radius;
                this.pulseSpeed = Math.random() * 0.05 + 0.01;
                this.angle = Math.random() * Math.PI * 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Pulse size
                this.angle += this.pulseSpeed;
                this.radius = this.baseRadius + Math.sin(this.angle) * 1;

                // Wrap around edges for infinite flow
                if (this.y < -50) this.y = canvas.height + 50;
                if (this.x < -50) this.x = canvas.width + 50;
                if (this.x > canvas.width + 50) this.x = -50;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;

                // Add glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fill();

                // Reset shadow for lines
                ctx.shadowBlur = 0;
            }
        }

        // Initialize particles
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update & Draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw network connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);

                        // Opacity based on distance
                        const alpha = 1 - (dist / connectionDistance);

                        // Use gradient line between two different colored dots
                        const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);

                        // Parse colors to add alpha
                        const hexToRgba = (hex, alpha) => {
                            const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
                            return `rgba(${r},${g},${b},${alpha})`;
                        };

                        gradient.addColorStop(0, hexToRgba(particles[i].color, alpha * 0.5));
                        gradient.addColorStop(1, hexToRgba(particles[j].color, alpha * 0.5));

                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="mobile-particles-container">
            <canvas ref={canvasRef} className="m-particle-canvas" />
            <div className="m-glow-orb" />
            <div className="m-glow-orb m-glow-orb-2" />
        </div>
    );
}
