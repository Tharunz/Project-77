/**
 * GeoJSON Processing Worker
 * Handles heavy data fetching, parsing, and normalization off-main-thread.
 */

// Simple centroid calculation for the worker (average of coordinates)
function getCentroid(feature) {
    let pts = [];
    if (feature.geometry.type === 'Polygon') {
        pts = feature.geometry.coordinates[0];
    } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(poly => poly[0].forEach(p => pts.push(p)));
    }
    if (pts.length === 0) return [82.5, 22.5];
    let x = 0, y = 0;
    pts.forEach(p => { x += p[0]; y += p[1]; });
    return [x / pts.length, y / pts.length];
}

function normalizeStateName(name, stateDistressKeys) {
    if (!name) return "";
    const n = name.trim().toLowerCase();

    if (n.includes("delhi")) return "Delhi";
    if (n.includes("andaman")) return "Andaman and Nicobar Islands";
    if (n.includes("dadara") || n.includes("dadra") || n.includes("daman")) return "Dadra and Nagar Haveli and Daman and Diu";
    if (n === "jammu & kashmir" || n === "jammu and kashmir") return "Jammu and Kashmir";
    if (n === "uttaranchal" || n === "uttarakhand") return "Uttarakhand";
    if (n === "orissa" || n === "odisha") return "Odisha";
    if (n === "pondicherry") return "Puducherry";

    const standardName = stateDistressKeys.find(k => k.toLowerCase() === n);
    return standardName || name;
}

self.onmessage = async (e) => {
    const { action, data } = e.data;

    if (action === 'process_chunk') {
        const { features, stateDistressKeys } = data;
        const delayMap = {};
        const centroids = {};

        const processedFeatures = features.map(feature => {
            const props = feature.properties;
            const rawName = props.NAME_1 || props.ST_NM || props.name || props.state_name || '';
            const normalizedName = normalizeStateName(rawName, stateDistressKeys);

            const centroid = getCentroid(feature);
            centroids[normalizedName] = centroid;

            const dist = Math.sqrt(Math.pow(centroid[0] - 82, 2) + Math.pow(centroid[1] - 22, 2));
            delayMap[normalizedName] = dist * 0.08;

            return {
                ...feature,
                properties: {
                    ...props,
                    _normalizedName: normalizedName,
                    _centroid: centroid
                }
            };
        });

        self.postMessage({
            type: 'SUCCESS',
            data: {
                features: processedFeatures,
                delayMap,
                centroids
            }
        });
    }
};
