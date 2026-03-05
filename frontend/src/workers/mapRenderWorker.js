import { geoPath, geoMercator } from 'd3-geo';

let canvas = null;
let ctx = null;
let geoData = null;
let projection = null;
let pathGenerator = null;

// State Data
let STATE_DISTRESS = {};
let DC = {};
let clickedStateName = null;
let hoveredLegendLevel = null;
let bootPhase = 'loading';
let bootProgress = 0;
let isFading = false;
let activeArcs = [];
let PRE_SEVA_SOURCES = [];
let PRE_SEVA_DESTS = [];
let PRE_SEVA_LINKS = [];
let width = 1200;
let height = 950;

// Animation timing
let startTime = 0;
let lastDrawTime = 0;

function normalizeStateName(name) {
    if (!name) return "";
    const n = name.trim().toLowerCase();
    if (n === 'orissa') return 'odisha';
    if (n === 'uttaranchal') return 'uttarakhand';
    if (n === 'jammu and kashmir') return 'jammu & kashmir';
    if (n === 'andaman and nicobar') return 'andaman & nicobar island';
    if (n === 'dnd' || n === 'dadara & nagar havelli') return 'dadara & nagar havelli';
    if (n === 'lakshadweep') return 'lakshadweep';
    return n.replace(/ +/g, ' ');
}

// Hex to RGBA helper
function hexToRgba(hex, alpha) {
    // shorthand regex
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : `rgba(0, 255, 238, ${alpha})`;
}

function initCanvas(offscreenCanvas, initData) {
    canvas = offscreenCanvas;
    ctx = canvas.getContext('2d');

    // Scale for high DPI displays if needed, assuming the main thread sets the canvas width/height physical pixels to width*devicePixelRatio.
    // However safely assume logical size is passed: 1200x950
    width = canvas.width;
    height = canvas.height;

    projection = geoMercator()
        .center([82.5, 22.5])
        .scale(1450)
        .translate([1200 / 2, 950 / 2]);

    pathGenerator = geoPath().projection(projection).context(ctx);

    STATE_DISTRESS = initData.STATE_DISTRESS;
    DC = initData.DC;
    PRE_SEVA_SOURCES = initData.PRE_SEVA_SOURCES;
    PRE_SEVA_DESTS = initData.PRE_SEVA_DESTS;
    PRE_SEVA_LINKS = initData.PRE_SEVA_LINKS;

    startTime = performance.now();
    requestAnimationFrame(renderLoop);
}

function updateData(newData) {
    if (newData.geoData !== undefined) geoData = newData.geoData;
    if (newData.clickedStateName !== undefined) clickedStateName = newData.clickedStateName;
    if (newData.hoveredLegendLevel !== undefined) hoveredLegendLevel = newData.hoveredLegendLevel;
    if (newData.bootPhase !== undefined) bootPhase = newData.bootPhase;
    if (newData.bootProgress !== undefined) bootProgress = newData.bootProgress;
    if (newData.isFading !== undefined) isFading = newData.isFading;
    if (newData.activeArcs !== undefined) activeArcs = newData.activeArcs;
}

function hitTest(x, y) {
    if (!geoData || !projection) return null;
    const invert = projection.invert([x, y]);
    // find feature containing points
    for (let feature of geoData.features) {
        // d3-geo path testing logic or simple point in polygon, but since we are in a worker 
        // we can use standard ray casting or let the main thread do it with pointer events if we render it statically.
        // Actually, d3-geo `geoContains` can check if a feature contains a point!
        import('d3-geo').then(d3 => {
            if (d3.geoContains(feature, invert)) {
                // Post to main thread
                postMessage({ type: 'hit', feature: feature.properties });
            }
        })
    }
}

function renderBaseMap(time) {
    if (!geoData) return;

    const hasClick = clickedStateName !== null;
    const hasLegendHover = hoveredLegendLevel !== null;

    geoData.features.forEach(feature => {
        const name = feature.properties._normalizedName || normalizeStateName(feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name || feature.properties.state_name || '');
        const level = STATE_DISTRESS[name] !== undefined ? STATE_DISTRESS[name] : 1;
        const colorHex = DC[level] || '#00FFEE';

        const isClicked = clickedStateName === name;
        const isLegendPulsed = hoveredLegendLevel === level;
        const isBoot = bootPhase === 'building';
        const isThreatSource = PRE_SEVA_SOURCES.includes(name);
        const isThreatDest = PRE_SEVA_DESTS.includes(name);

        ctx.beginPath();
        pathGenerator(feature);

        // Fill style
        let fillVal = 'rgba(0,229,255,0.15)';
        if (!hasClick) {
            // Replicate radial gradients for level 4/3 using pulsing opacity
            if (level === 4) {
                const pulse = Math.sin(time / 500) * 0.5 + 0.5; // 0 to 1
                fillVal = hexToRgba(colorHex, 0.03 + (pulse * 0.04));
            } else if (level === 3) {
                fillVal = hexToRgba(colorHex, 0.04);
            }
            if (isThreatSource) fillVal = 'rgba(245, 158, 11, 0.1)';
            if (isThreatDest) fillVal = 'rgba(139, 92, 246, 0.1)';
            if (isBoot) fillVal = 'transparent';
        } else if (isClicked) {
            fillVal = hexToRgba(colorHex, 0.35); // Approx 59 hex alpha
        }

        ctx.fillStyle = fillVal;

        // Shadow (Filter)
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        if (isClicked) {
            ctx.shadowColor = colorHex;
            ctx.shadowBlur = 16;
        } else if (!hasClick) {
            ctx.shadowColor = 'rgba(0,255,238,0.4)';
            ctx.shadowBlur = 10;
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }

        ctx.fill();

        // Stroke Style
        let strokeColor = isLegendPulsed ? '#FFFFFF' : '#00FFEE';
        let strokeWidth = 1.8;
        let strokeOpacity = isLegendPulsed ? 1 : 0.9;

        if (isClicked) {
            strokeColor = colorHex;
            strokeWidth = 2.5;
            strokeOpacity = 1;
        }

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = hexToRgba(strokeColor, strokeOpacity);

        // Reset shadow for stroke if not clicked
        if (!isClicked) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
        ctx.stroke();

        // Distress Dots
        if (!hasClick && level > 2 && geoData.centroids && geoData.centroids[name]) {
            const centroid = geoData.centroids[name];
            const px = projection(centroid);
            if (px) {
                const baseR = level === 4 ? 4 : 2;
                const dotOpacity = Math.sin((time + level * 1000) / 400) * 0.3 + 0.7; // Pulse between 0.4 and 1.0

                // Outer expanding ring
                const ringR = baseR + ((time % 2000) / 2000) * baseR * 2;
                const ringOpacity = (1 - ((time % 2000) / 2000)) * dotOpacity * 0.3;

                ctx.beginPath();
                ctx.arc(px[0], px[1], ringR, 0, 2 * Math.PI);
                ctx.fillStyle = hexToRgba(colorHex, ringOpacity);
                ctx.fill();

                // Inner glowing dot
                ctx.beginPath();
                ctx.arc(px[0], px[1], baseR, 0, 2 * Math.PI);
                ctx.fillStyle = hexToRgba(colorHex, dotOpacity);
                ctx.shadowColor = colorHex;
                ctx.shadowBlur = 11;
                ctx.fill();

                // Center core
                ctx.beginPath();
                ctx.arc(px[0], px[1], baseR * 0.3, 0, 2 * Math.PI);
                ctx.fillStyle = hexToRgba('#FFFFFF', dotOpacity);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.fill();
            }
        }
    });

}

function renderArcs(time) {
    if (activeArcs.length === 0 || clickedStateName !== null || !geoData || !geoData.centroids) return;

    activeArcs.forEach((arc, i) => {
        const sourceLoc = geoData.centroids[arc.source];
        const destLoc = geoData.centroids[arc.dest];
        if (!sourceLoc || !destLoc) return;

        const start = projection(sourceLoc);
        const end = projection(destLoc);

        const dx = end[0] - start[0];
        const dy = end[1] - start[1];

        // Draw dashed line
        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        const cpX = start[0] + dx / 2 - dy * 0.2;
        const cpY = start[1] + dy / 2 + dx * 0.2;
        ctx.quadraticCurveTo(cpX, cpY, end[0], end[1]);

        ctx.strokeStyle = arc.risk === 'high' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(249, 115, 22, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw traveling dot
        const t = (time % 3000) / 3000;
        // Bezier interpolation
        const px = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * cpX + t * t * end[0];
        const py = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * cpY + t * t * end[1];

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fillStyle = arc.risk === 'high' ? '#EF4444' : '#F97316';
        ctx.shadowColor = arc.risk === 'high' ? '#EF4444' : '#F97316';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function renderLoop(time) {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (bootPhase === 'ready' || bootPhase === 'building' || bootPhase === 'fading') {
        renderBaseMap(time);
        renderArcs(time);
    }

    lastDrawTime = time;
    requestAnimationFrame(renderLoop);
}


self.addEventListener('message', (e) => {
    switch (e.data.type) {
        case 'init':
            initCanvas(e.data.canvas, e.data.payload);
            break;
        case 'update':
            updateData(e.data.payload);
            break;
        case 'hitTest':
            hitTest(e.data.x, e.data.y);
            break;
    }
});
