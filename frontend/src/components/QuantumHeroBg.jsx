import React, { useEffect, useRef, useState, memo } from 'react';
import './QuantumHeroBg.css';

function QuantumHeroBg() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const workerRef = useRef(null);
    // Force fresh canvas on remount (prevents InvalidStateError on transferControlToOffscreen)
    const [mountSeed] = useState(() => Math.random());

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        try {
            // Transfer control to Offscreen Worker for GPGPU acceleration
            const offscreen = canvas.transferControlToOffscreen();
            const worker = new Worker(new URL('../workers/animationWorker.js', import.meta.url), { type: 'module' });
            workerRef.current = worker;

            worker.postMessage({
                action: 'init',
                data: {
                    canvas: offscreen,
                    type: 'quantum',
                    num: 50
                }
            }, [offscreen]);

            const handleMouseMove = (e) => {
                const currentWidth = window.innerWidth;
                const currentHeight = window.innerHeight;
                const nx = (e.clientX / currentWidth) * 2 - 1;
                const ny = (e.clientY / currentHeight) * 2 - 1;

                // Send mouse data to worker
                worker.postMessage({
                    action: 'mouse',
                    data: {
                        pixel: { x: e.clientX, y: e.clientY },
                        norm: { x: nx, y: ny }
                    }
                });

                // Update container style for CSS parallax
                if (window.innerWidth > 768) {
                    container.style.setProperty('--mx', nx);
                    container.style.setProperty('--my', ny);
                }
            };

            const handleResize = () => {
                worker.postMessage({
                    action: 'resize',
                    data: { width: window.innerWidth, height: window.innerHeight }
                });
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('resize', handleResize);
                worker.terminate();
            };
        } catch (e) {
            console.warn('Canvas transfer failed or already transferred:', e);
        }
    }, [mountSeed]);

    return (
        <div className="hq-hero-bg" ref={containerRef}>
            <canvas key={mountSeed} ref={canvasRef} className="hq-canvas" />

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

export default memo(QuantumHeroBg);
