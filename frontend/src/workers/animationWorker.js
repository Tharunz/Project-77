/**
 * GPGPU Animation Worker
 * Handles OffscreenCanvas rendering and particle physics off-main-thread.
 */

let ctx;
let canvas;
let particles = [];
let type = 'particles'; // 'particles' or 'quantum'
let width, height;
let mouse = { x: -1000, y: -1000 };
let currentMouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };

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
        }
        particles.push(p);
    }
}

function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    if (type === 'particles') {
        const connectionDistance = 110;
        particles.forEach(p => {
            p.update(width, height);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;
                if (distSq < connectionDistance * connectionDistance) {
                    const dist = Math.sqrt(distSq);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 229, 160, ${(1 - dist / connectionDistance) * 0.3})`;
                    ctx.stroke();
                }
            }
        }
    } else if (type === 'quantum') {
        const connectionDistance = 120;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 229, 160, 0.4)';
            ctx.fill();

            // Mouse tether
            const dxm = p.x - mouse.x;
            const dym = p.y - mouse.y;
            const distmSq = dxm * dxm + dym * dym;
            if (distmSq < 200 * 200) {
                const distm = Math.sqrt(distmSq);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(0, 229, 160, ${(200 - distm) / 200 * 0.5})`;
                ctx.stroke();
                p.vx -= (dxm / distm) * 0.015;
                p.vy -= (dym / distm) * 0.015;
            }

            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1.2) { p.vx *= 0.95; p.vy *= 0.95; }
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const ds = dx * dx + dy * dy;
                if (ds < connectionDistance * connectionDistance) {
                    const d = Math.sqrt(ds);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 229, 160, ${0.15 - d / connectionDistance * 0.15})`;
                    ctx.stroke();
                }
            }
        }
    }

    requestAnimationFrame(render);
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
    }
};
