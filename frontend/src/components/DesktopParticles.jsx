/**
 * DesktopParticles — GPU-accelerated particle system for desktop (>1024px).
 *
 * Architecture:
 *  • OffscreenCanvas transferred to animationWorker.js (off main thread entirely)
 *  • Mouse events throttled: one RAF gate ensures ≤60 messages/sec to worker
 *  • Page-visibility API: worker skips frames when tab is hidden
 *  • will-change + translateZ(0) on canvas → compositor layer = no layout thrash
 *  • 120 particles across 3 depth layers with repulsion + connecting lines
 */
import React, { useEffect, useRef, useState, memo } from 'react';
import './DesktopParticles.css';

function DesktopParticles() {
    const canvasRef = useRef(null);
    const workerRef = useRef(null);
    const mouseRafRef = useRef(null); // throttle gate
    const containerRef = useRef(null);
    const [mountSeed] = useState(() => Math.random());
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) { setUseFallback(true); return; }

        // Bail out on mobile (belt-and-suspenders on top of CSS)
        if (window.innerWidth < 769) return;

        try {
            if (typeof canvas.transferControlToOffscreen !== 'function') {
                throw new Error('No OffscreenCanvas support');
            }

            // Set pixel dimensions BEFORE transfer — canvas default is 300×150
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;

            const offscreen = canvas.transferControlToOffscreen();
            const worker = new Worker(
                new URL('../workers/animationWorker.js', import.meta.url),
                { type: 'module' }
            );
            workerRef.current = worker;

            worker.postMessage(
                {
                    action: 'init',
                    data: {
                        canvas: offscreen,
                        type: 'desktop',
                        num: 80, // 12 hub + 28 relay + 40 endpoint (ProNode hierarchy)
                    }
                },
                [offscreen]
            );

            worker.onerror = () => setUseFallback(true);

            // ── Mouse handler — throttled via RAF flag ────────────────────
            const handleMouseMove = (e) => {
                if (mouseRafRef.current) return; // already queued
                mouseRafRef.current = requestAnimationFrame(() => {
                    mouseRafRef.current = null;
                    const nx = (e.clientX / window.innerWidth) * 2 - 1;
                    const ny = (e.clientY / window.innerHeight) * 2 - 1;
                    worker.postMessage({
                        action: 'mouse',
                        data: {
                            pixel: { x: e.clientX, y: e.clientY },
                            norm: { x: nx, y: ny }
                        }
                    });
                    // CSS parallax for aurora layers
                    if (containerRef.current) {
                        containerRef.current.style.setProperty('--dpx', nx);
                        containerRef.current.style.setProperty('--dpy', ny);
                    }
                });
            };

            // ── Resize handler ────────────────────────────────────────────
            const handleResize = () => {
                worker.postMessage({
                    action: 'resize',
                    data: { width: window.innerWidth, height: window.innerHeight }
                });
            };

            // ── Page-visibility: pause/resume worker render loop ──────────
            const handleVisibility = () => {
                worker.postMessage({
                    action: document.hidden ? 'pause' : 'resume',
                    data: {}
                });
            };

            window.addEventListener('mousemove', handleMouseMove, { passive: true });
            window.addEventListener('resize', handleResize, { passive: true });
            document.addEventListener('visibilitychange', handleVisibility);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('resize', handleResize);
                document.removeEventListener('visibilitychange', handleVisibility);
                if (mouseRafRef.current) cancelAnimationFrame(mouseRafRef.current);
                worker.terminate();
            };
        } catch (err) {
            console.warn('[DesktopParticles] OffscreenCanvas unavailable, using CSS fallback', err);
            setUseFallback(true);
        }
    }, [mountSeed]);

    // ── CSS-only fallback: 24 pure-CSS animated dots ─────────────────────────
    if (useFallback) {
        const dots = Array.from({ length: 24 }, (_, i) => ({
            id: i,
            size: 2 + (i % 4),
            left: `${(i * 4.2) % 98}%`,
            top: `${(i * 6.7) % 96}%`,
            color: i % 3 === 0 ? 'rgba(255,107,44,0.6)' : i % 3 === 1 ? 'rgba(0,229,160,0.5)' : 'rgba(92,142,255,0.45)',
            dur: `${7 + (i % 8)}s`,
            delay: `-${(i * 1.1) % 9}s`,
            xr: `${((i * 31) % 70) - 35}px`,
            yr: `${((i * 43) % 70) - 35}px`,
        }));
        return (
            <div className="dp-container dp-fallback" aria-hidden="true">
                {dots.map(d => (
                    <div key={d.id} style={{
                        position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
                        width: d.size, height: d.size, background: d.color,
                        left: d.left, top: d.top,
                        animation: `dpFloat ${d.dur} ease-in-out ${d.delay} infinite`,
                        '--xr': d.xr, '--yr': d.yr,
                    }} />
                ))}
                <style>{`
                    @keyframes dpFloat {
                        0%,100%{transform:translate(0,0) scale(1);opacity:.55}
                        33%{transform:translate(var(--xr),var(--yr)) scale(1.4);opacity:.9}
                        66%{transform:translate(calc(var(--xr)*-.6),calc(var(--yr)*.8)) scale(.75);opacity:.35}
                    }
                `}</style>
                <div className="dp-glow dp-glow-1" />
                <div className="dp-glow dp-glow-2" />
                <div className="dp-glow dp-glow-3" />
            </div>
        );
    }

    return (
        <div className="dp-container" ref={containerRef} aria-hidden="true">
            <canvas
                key={mountSeed}
                ref={canvasRef}
                className="dp-canvas"
            />
            {/* Parallax aurora overlays — respond to --dpx / --dpy CSS vars */}
            <div className="dp-aurora dp-aurora-saffron" />
            <div className="dp-aurora dp-aurora-teal" />
            <div className="dp-aurora dp-aurora-blue" />
        </div>
    );
}

export default memo(DesktopParticles);
