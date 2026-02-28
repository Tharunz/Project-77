import React, { useEffect, useRef } from 'react';
import './QuantumHeroBg.css';

export default function QuantumHeroBg() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const targetMouse = useRef({ x: 0, y: 0 });
    const currentMouse = useRef({ x: 0, y: 0 });
    const pixelMouse = useRef({ x: -1000, y: -1000 }); // Out of screen initially

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');

        // Guard against zero-width containers on mount
        let width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
        let height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;

        let particles = [];
        const numParticles = 80;

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 0.5
            });
        }

        const handleMouseMove = (e) => {
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;
            // Normalize exactly from -1 to 1 for 3D parallax
            const nx = (e.clientX / currentWidth) * 2 - 1;
            const ny = (e.clientY / currentHeight) * 2 - 1;
            targetMouse.current = { x: nx, y: ny };
            // Exact pixels for canvas interaction
            pixelMouse.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', handleMouseMove);

        let animationFrameId;

        const render = () => {
            // Smooth lerp for parallax vars
            currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * 0.1;
            currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * 0.1;

            // Direct DOM mutation saves React 60 FPS renders
            if (container && window.innerWidth > 768) {
                container.style.setProperty('--mx', currentMouse.current.x);
                container.style.setProperty('--my', currentMouse.current.y);
            } else if (container) {
                container.style.setProperty('--mx', 0);
                container.style.setProperty('--my', 0);
            }

            // --- CANVAS LOGIC ---
            if (canvas) {
                ctx.clearRect(0, 0, width, height);

                // Update and draw particles
                for (let i = 0; i < numParticles; i++) {
                    let p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0 || p.x > width) p.vx *= -1;
                    if (p.y < 0 || p.y > height) p.vy *= -1;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 229, 160, 0.4)';
                    ctx.fill();

                    // Draw connections
                    for (let j = i + 1; j < numParticles; j++) {
                        let p2 = particles[j];
                        let dx = p.x - p2.x;
                        let dy = p.y - p2.y;
                        let dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 120) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = `rgba(0, 229, 160, ${0.15 - dist / 120 * 0.15})`;
                            ctx.stroke();
                        }
                    }

                    // Draw connection to mouse (Tether effect)
                    let dxm = p.x - pixelMouse.current.x;
                    let dym = p.y - pixelMouse.current.y;
                    let distm = Math.sqrt(dxm * dxm + dym * dym);

                    if (distm < 200) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(pixelMouse.current.x, pixelMouse.current.y);
                        ctx.strokeStyle = `rgba(0, 229, 160, ${(200 - distm) / 200 * 0.5})`;
                        ctx.stroke();

                        // Gentle magnetic pull towards mouse
                        p.vx -= (dxm / distm) * 0.015;
                        p.vy -= (dym / distm) * 0.015;
                    }

                    // Friction cap for high speeds from pull
                    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    if (speed > 1.2) {
                        p.vx *= 0.95;
                        p.vy *= 0.95;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
            // Reinitialize particle positions on resize to avoid them being out of bounds
            for (let i = 0; i < numParticles; i++) {
                particles[i].x = Math.random() * width;
                particles[i].y = Math.random() * height;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="hq-hero-bg" ref={containerRef}>
            <canvas ref={canvasRef} className="hq-canvas" />

            {/* Ambient Auroras */}
            <div className="hq-aurora a-teal" />
            <div className="hq-aurora a-saffron" />
            <div className="hq-aurora a-blue" />

            {/* 3D Data Floor */}
            <div className="hq-floor-wrap">
                <div className="hq-floor" />
            </div>

            {/* Floating Glass Data Nodes */}
            <div className="hq-glass-nodes">
                <div className="hq-node n1">
                    <div className="hq-node-core" />
                    <div className="hq-node-ring" />
                    <div className="hq-node-float-text">NODE 01</div>
                </div>
                <div className="hq-node n2">
                    <div className="hq-node-core" />
                    <div className="hq-node-ring" />
                    <div className="hq-node-float-text">NODE 02</div>
                </div>
                <div className="hq-node n3">
                    <div className="hq-node-core" />
                    <div className="hq-node-ring reverse" />
                    <div className="hq-node-float-text">DATALINK</div>
                </div>
            </div>

            {/* Shooting Data Streams */}
            <div className="hq-streams">
                <div className="hq-stream s1" />
                <div className="hq-stream s2" />
                <div className="hq-stream s3" />
                <div className="hq-stream s4" />
            </div>

            <div className="hq-vignette" />
        </div>
    );
}
