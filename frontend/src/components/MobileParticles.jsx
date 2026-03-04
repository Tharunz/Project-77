import React, { useEffect, useRef, useState, memo } from 'react';
import './MobileParticles.css';

function MobileParticles() {
    const canvasRef = useRef(null);
    const workerRef = useRef(null);
    // Force fresh canvas on remount (prevents InvalidStateError on transferControlToOffscreen)
    const [mountSeed] = useState(() => Math.random());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            // Transfer control to Offscreen Worker for GPGPU acceleration
            const offscreen = canvas.transferControlToOffscreen();
            const worker = new Worker(new URL('../workers/animationWorker.js', import.meta.url), { type: 'module' });
            workerRef.current = worker;

            worker.postMessage({
                action: 'init',
                data: {
                    canvas: offscreen,
                    type: 'particles',
                    num: 28,
                    c1: '#FF6B2C',
                    c2: '#00E5A0'
                }
            }, [offscreen]);

            const handleResize = () => {
                worker.postMessage({
                    action: 'resize',
                    data: { width: window.innerWidth, height: window.innerHeight }
                });
            };

            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                worker.terminate();
            };
        } catch (e) {
            console.warn('Canvas transfer failed or already transferred:', e);
        }
    }, [mountSeed]);

    return (
        <div className="mobile-particles-container">
            <canvas key={mountSeed} ref={canvasRef} className="m-particle-canvas" />
            <div className="m-glow-orb" />
            <div className="m-glow-orb m-glow-orb-2" />
        </div>
    );
}

export default memo(MobileParticles);
