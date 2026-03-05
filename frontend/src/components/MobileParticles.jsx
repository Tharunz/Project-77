import React, { useEffect, useRef, useState, memo } from 'react';
import './MobileParticles.css';

// CSS-only fallback particles (18 dots, pointer-events:none, pure keyframe animation)
const CSS_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 2 + (i % 4),
    left: `${(i * 5.5) % 100}%`,
    top: `${(i * 7.3) % 100}%`,
    color: i % 3 === 0 ? 'rgba(255,107,44,0.55)' : i % 3 === 1 ? 'rgba(0,229,160,0.45)' : 'rgba(92,142,255,0.40)',
    dur: `${6 + (i % 7)}s`,
    delay: `-${(i * 0.9) % 8}s`,
    xRange: `${((i * 31) % 60) - 30}px`,
    yRange: `${((i * 43) % 60) - 30}px`,
}));

function MobileParticles() {
    const canvasRef = useRef(null);
    const workerRef = useRef(null);
    const [mountSeed] = useState(() => Math.random());
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) { setUseFallback(true); return; }

        try {
            if (typeof canvas.transferControlToOffscreen !== 'function') throw new Error('No OffscreenCanvas');
            const offscreen = canvas.transferControlToOffscreen();
            const worker = new Worker(new URL('../workers/animationWorker.js', import.meta.url), { type: 'module' });
            workerRef.current = worker;
            worker.postMessage({ action: 'init', data: { canvas: offscreen, type: 'particles', num: 18, c1: '#FF6B2C', c2: '#00E5A0' } }, [offscreen]);
            worker.onerror = () => setUseFallback(true);
            const onResize = () => worker.postMessage({ action: 'resize', data: { width: window.innerWidth, height: window.innerHeight } });
            window.addEventListener('resize', onResize);
            return () => { window.removeEventListener('resize', onResize); worker.terminate(); };
        } catch {
            setUseFallback(true);
        }
    }, [mountSeed]);

    if (useFallback) {
        return (
            <div className="mobile-particles-container" aria-hidden="true">
                {CSS_PARTICLES.map(p => (
                    <div key={p.id} style={{
                        position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
                        width: p.size, height: p.size, background: p.color,
                        left: p.left, top: p.top,
                        animation: `cssParticleFloat ${p.dur} ease-in-out ${p.delay} infinite`,
                        '--px': p.xRange, '--py': p.yRange,
                    }} />
                ))}
                <style>{`@keyframes cssParticleFloat { 0%,100%{transform:translate(0,0) scale(1);opacity:0.6} 33%{transform:translate(var(--px),var(--py)) scale(1.3);opacity:1} 66%{transform:translate(calc(var(--px)*-0.5),calc(var(--py)*0.7)) scale(0.8);opacity:0.4} }`}</style>
                <div className="m-glow-orb" />
                <div className="m-glow-orb m-glow-orb-2" />
            </div>
        );
    }

    return (
        <div className="mobile-particles-container">
            <canvas key={mountSeed} ref={canvasRef} className="m-particle-canvas" />
            <div className="m-glow-orb" />
            <div className="m-glow-orb m-glow-orb-2" />
        </div>
    );
}

export default memo(MobileParticles);
