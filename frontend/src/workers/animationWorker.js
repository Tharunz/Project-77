/**
 * GPGPU Animation Worker
 * Handles OffscreenCanvas rendering and particle physics off-main-thread.
 */

let ctx;
let canvas;
let particles = [];
let type = 'particles'; // 'particles' | 'quantum' | 'desktop'
let width, height;
let mouse = { x: -1000, y: -1000 };
let currentMouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };
let frameCount = 0;
let paused = false;

// ── ProNode (desktop) state ──────────────────────────────────────────────────
let pulses = [];        // animated data pulses [{fi, ti, t, color}]
let PULSE_MAX = 18;
let pulseClock = 0;     // frames since last pulse spawn
const PULSE_SPAWN_RATE = 22; // spawn a pulse every N frames

// Simplified Particle for Worker
class WorkerParticle {
    constructor(w, h, color1, color2) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 1) * 1.5 - 0.5;
        this.radius = Math.random() * 2 + 1.5;
        this.color = Math.random() > 0.5 ? color1 : color2;
        this.baseRadius = this.radius;
        this.pulseSpeed = Math.random() * 0.05 + 0.01;
        this.angle = Math.random() * Math.PI * 2;
    }

    update(w, h) {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.pulseSpeed;
        this.radius = this.baseRadius + Math.sin(this.angle) * 1;

        if (this.y < -50) this.y = h + 50;
        if (this.x < -50) this.x = w + 50;
        if (this.x > w + 50) this.x = -50;
    }
}

function initParticles(n, w, h, c1, c2) {
    particles = [];
    for (let i = 0; i < n; i++) {
        const p = new WorkerParticle(w, h, c1, c2);
        if (type === 'quantum') {
            p.vx = (Math.random() - 0.5) * 0.5;
            p.vy = (Math.random() - 0.5) * 0.5;
            p.radius = Math.random() * 2 + 0.5;
        } else if (type === 'desktop') {
            // ProNode hierarchy: 0=hub(12), 1=relay(28), 2=endpoint(40) — by index slice
            p.nodeType = i < 0.15 * n ? 0 : i < 0.5 * n ? 1 : 2;
            const sp = p.nodeType === 0 ? 0.45 : p.nodeType === 1 ? 0.65 : 0.85;
            p.vx = (Math.random() - 0.5) * sp;
            p.vy = (Math.random() - 0.5) * sp;
            // Hub=saffron, Relay=teal, Endpoint=blue
            p.nodeColor = p.nodeType === 0 ? '#FF6B2C' : p.nodeType === 1 ? '#00E5A0' : '#5C8EFF';
            p.radius = p.nodeType === 0 ? Math.random() * 1.5 + 3.5
                     : p.nodeType === 1 ? Math.random() * 1.0 + 1.8
                     : Math.random() * 0.8 + 0.8;
            p.baseRadius = p.radius;
            p.pulseSpeed = Math.random() * 0.02 + 0.005;
            p.angle = Math.random() * Math.PI * 2;
            // Depth layer for parallax (hub=near, endpoint=far)
            p.layer = p.nodeType;
        }
        particles.push(p);
    }
}

function render() {
    if (!ctx) return;
    frameCount++;
    ctx.clearRect(0, 0, width, height);

    if (type === 'particles') {
        const connectionDistance = 110;
        const connDistSq = connectionDistance * connectionDistance;
        particles.forEach(p => {
            p.update(width, height);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Draw connections every other frame to halve stroke call count
        if (frameCount % 2 === 0) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < connDistSq) {
                        const dist = Math.sqrt(distSq);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 229, 160, ${(1 - dist / connectionDistance) * 0.3})`;
                        ctx.stroke();
                    }
                }
            }
        }
    } else if (type === 'quantum') {
        // Quantum mode: dots only, no O(n²) connection loop
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 229, 160, 0.45)';
            ctx.fill();

            // Mouse tether only (single line per particle, not O(n²))
            const dxm = p.x - mouse.x;
            const dym = p.y - mouse.y;
            const distmSq = dxm * dxm + dym * dym;
            if (distmSq < 160 * 160) {
                const distm = Math.sqrt(distmSq);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(0, 229, 160, ${(160 - distm) / 160 * 0.4})`;
                ctx.stroke();
                p.vx -= (dxm / distm) * 0.012;
                p.vy -= (dym / distm) * 0.012;
            }

            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1.0) { p.vx *= 0.95; p.vy *= 0.95; }
        });
    } else if (type === 'desktop') {
        // ════════════════════════════════════════════════════════════════════
        // ProNode Particle System
        // • Hub(12) / Relay(28) / Endpoint(40) node hierarchy
        // • Spatial hash grid → O(n) connection checks instead of O(n²)
        // • Animated data pulses travelling along connections
        // • Cursor attractor: up to 8 nearest particles connect to mouse
        // • Per-hub glow via shadowBlur (limited set, low cost)
        // ════════════════════════════════════════════════════════════════════
        const CONN_DIST  = 145;
        const CONN_SQ    = CONN_DIST * CONN_DIST;
        const MOUSE_DIST = 220;
        const MOUSE_SQ   = MOUSE_DIST * MOUSE_DIST;
        const GLOW_DIST  = 85;
        const GLOW_SQ    = GLOW_DIST * GLOW_DIST;

        // ── 1. Build spatial hash grid ───────────────────────────────────
        const CELL = CONN_DIST;
        const cols = Math.ceil(width  / CELL) + 1;
        const rows = Math.ceil(height / CELL) + 1;
        const grid = new Array(cols * rows);
        for (let k = 0; k < grid.length; k++) grid[k] = null; // linked-list head

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const cx = Math.floor(p.x / CELL);
            const cy = Math.floor(p.y / CELL);
            if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) {
                const cell = cy * cols + cx;
                p._next = grid[cell];
                grid[cell] = i;
            }
        }

        // ── 2. Move particles ────────────────────────────────────────────
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Cursor attractor / repulsor for hub nodes, gentle drift for others
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mSq = mdx * mdx + mdy * mdy;
            if (mSq < MOUSE_SQ && mSq > 1) {
                const md = Math.sqrt(mSq);
                // Hub: attracted toward cursor (feel pulled)
                // Others: gentle repulsion
                const forceMag = p.nodeType === 0
                    ? -(MOUSE_DIST - md) / MOUSE_DIST * 0.06
                    :  (MOUSE_DIST - md) / MOUSE_DIST * 0.05;
                p.vx += (mdx / md) * forceMag;
                p.vy += (mdy / md) * forceMag;
            }

            p.vx *= 0.982;
            p.vy *= 0.982;
            p.x  += p.vx;
            p.y  += p.vy;

            // Wrap edges
            if (p.x < -30) p.x = width  + 30;
            if (p.x > width  + 30) p.x = -30;
            if (p.y < -30) p.y = height + 30;
            if (p.y > height + 30) p.y = -30;

            // Pulse radius (hub nodes breathe more)
            p.angle += p.pulseSpeed;
            p.radius = p.baseRadius + Math.sin(p.angle) * (p.nodeType === 0 ? 1.2 : 0.5);
        }

        // ── 3. Collect connections via spatial grid (every other frame) ──
        const connPairs = []; // [{ax,ay,bx,by,opacity,colorA}]
        const glowPairs = []; // close connections for glow pass
        if (frameCount % 2 === 0) {
            for (let i = 0; i < particles.length; i++) {
                const pi = particles[i];
                const cx = Math.floor(pi.x / CELL);
                const cy = Math.floor(pi.y / CELL);

                for (let gy = cy - 1; gy <= cy + 1; gy++) {
                    for (let gx = cx - 1; gx <= cx + 1; gx++) {
                        if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;
                        let j = grid[gy * cols + gx];
                        while (j !== null && j !== undefined) {
                            if (j > i) { // avoid duplicates
                                const pj = particles[j];
                                const dx = pi.x - pj.x;
                                const dy = pi.y - pj.y;
                                const dSq = dx * dx + dy * dy;
                                if (dSq < CONN_SQ) {
                                    const dist = Math.sqrt(dSq);
                                    const opacity = (1 - dist / CONN_DIST) * 0.28;
                                    const entry = { ax: pi.x, ay: pi.y, bx: pj.x, by: pj.y, opacity, colorA: pi.nodeColor, colorB: pj.nodeColor, dist };
                                    connPairs.push(entry);
                                    if (dSq < GLOW_SQ) glowPairs.push(entry);
                                }
                            }
                            j = particles[j]?._next;
                        }
                    }
                }
            }
        }

        // ── 4. Draw regular connections (no shadow, batched by color) ────
        ctx.shadowBlur = 0;
        ctx.lineWidth = 0.8;
        for (let k = 0; k < connPairs.length; k++) {
            const c = connPairs[k];
            ctx.beginPath();
            ctx.moveTo(c.ax, c.ay);
            ctx.lineTo(c.bx, c.by);
            ctx.strokeStyle = c.colorA + Math.round(c.opacity * 255).toString(16).padStart(2, '0');
            ctx.stroke();
        }

        // ── 5. Glow pass — only close connections get shadowBlur ─────────
        if (glowPairs.length > 0) {
            ctx.lineWidth = 1.0;
            ctx.shadowBlur = 6;
            for (let k = 0; k < glowPairs.length; k++) {
                const c = glowPairs[k];
                ctx.shadowColor = c.colorA;
                ctx.beginPath();
                ctx.moveTo(c.ax, c.ay);
                ctx.lineTo(c.bx, c.by);
                ctx.strokeStyle = c.colorA + '55';
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }

        // ── 6. Draw nodes ────────────────────────────────────────────────
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            // Hub nodes get glow
            if (p.nodeType === 0) {
                ctx.shadowBlur  = 14;
                ctx.shadowColor = p.nodeColor;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            const alpha = p.nodeType === 0 ? 'cc' : p.nodeType === 1 ? '99' : '66';
            ctx.fillStyle = p.nodeColor + alpha;
            ctx.fill();

            // Hub: draw a ring halo
            if (p.nodeType === 0) {
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius + 3, 0, Math.PI * 2);
                ctx.strokeStyle = p.nodeColor + '33';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0;

        // ── 7. Cursor attractor node — visible ring + 8 nearest lines ───
        if (mouse.x > 0 && mouse.x < width) {
            // Draw cursor ring
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();

            // Connect 6 nearest particles to cursor
            const near = [];
            for (let i = 0; i < particles.length; i++) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const d = dx * dx + dy * dy;
                if (d < 250 * 250) near.push({ i, d });
            }
            near.sort((a, b) => a.d - b.d);
            ctx.lineWidth = 0.7;
            for (let k = 0; k < Math.min(6, near.length); k++) {
                const p = particles[near[k].i];
                const dist = Math.sqrt(near[k].d);
                const op = (1 - dist / 250) * 0.45;
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = `rgba(255,255,255,${op.toFixed(2)})`;
                ctx.stroke();
            }
        }

        // ── 8. Data pulse animation ──────────────────────────────────────
        // Spawn new pulses from hub nodes at regular intervals
        pulseClock++;
        if (pulseClock >= PULSE_SPAWN_RATE && connPairs.length > 0 && pulses.length < PULSE_MAX) {
            pulseClock = 0;
            // Pick a random hub-adjacent connection
            const eligibleConns = connPairs.filter((_, idx) => idx % 3 === (frameCount % 3));
            if (eligibleConns.length > 0) {
                const conn = eligibleConns[Math.floor(Math.random() * eligibleConns.length)];
                pulses.push({ conn, t: 0, rev: Math.random() > 0.5 });
            }
        }

        // Advance and draw pulses
        ctx.shadowBlur = 8;
        for (let k = pulses.length - 1; k >= 0; k--) {
            const pulse = pulses[k];
            pulse.t += 0.022;
            if (pulse.t >= 1) { pulses.splice(k, 1); continue; }

            const t    = pulse.rev ? 1 - pulse.t : pulse.t;
            const px   = pulse.conn.ax + (pulse.conn.bx - pulse.conn.ax) * t;
            const py   = pulse.conn.ay + (pulse.conn.by - pulse.conn.ay) * t;
            const fade = Math.sin(pulse.t * Math.PI); // 0→1→0

            ctx.shadowColor = 'rgba(255,240,180,0.9)';
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,240,180,${(fade * 0.92).toFixed(2)})`;
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    if (!paused) requestAnimationFrame(render);
}

self.onmessage = (e) => {
    const { action, data } = e.data;

    if (action === 'init') {
        canvas = data.canvas;
        ctx = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;
        type = data.type || 'particles';
        initParticles(data.num || 45, width, height, data.c1 || '#FF6B2C', data.c2 || '#00E5A0');
        render();
    } else if (action === 'resize') {
        width = canvas.width = data.width;
        height = canvas.height = data.height;
    } else if (action === 'mouse') {
        mouse = data.pixel;
        targetMouse = data.norm;
    } else if (action === 'pause') {
        paused = true;
    } else if (action === 'resume') {
        if (paused) { paused = false; render(); }
    }
};
