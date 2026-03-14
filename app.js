// Update timestamp with current date and time
function updateTimestamp() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    };
    const formattedDate = now.toLocaleString('en-US', options);
    const timestampEl = document.getElementById('last-updated');
    if (timestampEl) {
        timestampEl.textContent = `Last Updated: ${formattedDate}`;
    }
}

// Landing page transition
document.getElementById('explore-btn').addEventListener('click', () => {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateTimestamp();
    setTimeout(initMap, 100);
    // Update timestamp every minute
    setInterval(updateTimestamp, 60000);
});

let map;
let layers = {};
let hotspotMarkers = [];
let currentDischarge = 0;
let currentYear = 4;
let currentRiver = 'yamuna';
let riverPolyline = null;

// River data configurations
const riverData = {
    yamuna: {
        name: 'Yamuna River Stretch | Delhi-Agra Corridor',
        center: [27.5, 78.0],
        zoom: 11,
        path: [
            [27.55, 77.95],
            [27.52, 77.98],
            [27.49, 78.01],
            [27.46, 78.04],
            [27.43, 78.07]
        ],
        hotspots: [
            { lat: 27.545, lng: 77.955, type: 'erosion', severity: 'critical', id: 'E-001' },
            { lat: 27.525, lng: 77.985, type: 'erosion', severity: 'high', id: 'E-002' },
            { lat: 27.485, lng: 78.015, type: 'erosion', severity: 'critical', id: 'E-003' },
            { lat: 27.465, lng: 78.035, type: 'sedimentation', severity: 'high', id: 'S-001' },
            { lat: 27.445, lng: 78.065, type: 'erosion', severity: 'moderate', id: 'E-004' },
            { lat: 27.515, lng: 77.975, type: 'sedimentation', severity: 'moderate', id: 'S-002' },
            { lat: 27.495, lng: 78.005, type: 'erosion', severity: 'high', id: 'E-005' },
            { lat: 27.475, lng: 78.025, type: 'sedimentation', severity: 'critical', id: 'S-003' }
        ]
    },
    ganga: {
        name: 'Ganga River Stretch | Varanasi-Patna Corridor',
        center: [25.5, 83.0],
        zoom: 10,
        path: [
            [25.55, 82.95],
            [25.52, 82.98],
            [25.49, 83.01],
            [25.46, 83.04],
            [25.43, 83.07]
        ],
        hotspots: [
            { lat: 25.545, lng: 82.955, type: 'erosion', severity: 'high', id: 'G-E-001' },
            { lat: 25.525, lng: 82.985, type: 'sedimentation', severity: 'critical', id: 'G-S-001' },
            { lat: 25.485, lng: 83.015, type: 'erosion', severity: 'moderate', id: 'G-E-002' },
            { lat: 25.465, lng: 83.035, type: 'erosion', severity: 'high', id: 'G-E-003' },
            { lat: 25.445, lng: 83.065, type: 'sedimentation', severity: 'moderate', id: 'G-S-002' }
        ]
    },
    brahmaputra: {
        name: 'Brahmaputra River Stretch | Assam Valley',
        center: [26.2, 91.7],
        zoom: 10,
        path: [
            [26.25, 91.65],
            [26.22, 91.68],
            [26.19, 91.71],
            [26.16, 91.74],
            [26.13, 91.77]
        ],
        hotspots: [
            { lat: 26.245, lng: 91.655, type: 'erosion', severity: 'critical', id: 'B-E-001' },
            { lat: 26.225, lng: 91.685, type: 'erosion', severity: 'critical', id: 'B-E-002' },
            { lat: 26.185, lng: 91.715, type: 'sedimentation', severity: 'high', id: 'B-S-001' },
            { lat: 26.165, lng: 91.735, type: 'erosion', severity: 'high', id: 'B-E-003' },
            { lat: 26.145, lng: 91.765, type: 'sedimentation', severity: 'critical', id: 'B-S-002' },
            { lat: 26.205, lng: 91.695, type: 'erosion', severity: 'moderate', id: 'B-E-004' }
        ]
    },
    godavari: {
        name: 'Godavari River Stretch | Telangana Region',
        center: [18.7, 79.5],
        zoom: 10,
        path: [
            [18.75, 79.45],
            [18.72, 79.48],
            [18.69, 79.51],
            [18.66, 79.54],
            [18.63, 79.57]
        ],
        hotspots: [
            { lat: 18.745, lng: 79.455, type: 'sedimentation', severity: 'high', id: 'GD-S-001' },
            { lat: 18.725, lng: 79.485, type: 'erosion', severity: 'moderate', id: 'GD-E-001' },
            { lat: 18.685, lng: 79.515, type: 'erosion', severity: 'high', id: 'GD-E-002' },
            { lat: 18.665, lng: 79.535, type: 'sedimentation', severity: 'moderate', id: 'GD-S-002' }
        ]
    },
    narmada: {
        name: 'Narmada River Stretch | Madhya Pradesh',
        center: [22.8, 76.5],
        zoom: 10,
        path: [
            [22.85, 76.45],
            [22.82, 76.48],
            [22.79, 76.51],
            [22.76, 76.54],
            [22.73, 76.57]
        ],
        hotspots: [
            { lat: 22.845, lng: 76.455, type: 'erosion', severity: 'moderate', id: 'N-E-001' },
            { lat: 22.825, lng: 76.485, type: 'sedimentation', severity: 'high', id: 'N-S-001' },
            { lat: 22.785, lng: 76.515, type: 'erosion', severity: 'high', id: 'N-E-002' },
            { lat: 22.765, lng: 76.535, type: 'erosion', severity: 'critical', id: 'N-E-003' }
        ]
    }
};

// Initialize map
function initMap() {
    const river = riverData[currentRiver];
    map = L.map('map').setView(river.center, river.zoom);
    
    // Base layers
    layers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri'
    }).addTo(map);
    
    layers.lidar = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri',
        opacity: 0.7
    });
    
    // River path
    riverPolyline = L.polyline(river.path, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7
    }).addTo(map);
    
    // Elevation/slope layer (simulated with colored polygons)
    layers.elevation = L.layerGroup();
    createElevationLayer();
    layers.elevation.addTo(map);
    
    // Initialize hotspots
    layers.erosion = L.layerGroup();
    layers.sedimentation = L.layerGroup();
    createHotspots(0, 4);
    layers.erosion.addTo(map);
    layers.sedimentation.addTo(map);
    
    setupLayerToggles();
    setupScenarioSimulator();
    setupTimeline();
    setupRiverSelector();
}

function createElevationLayer() {
    const river = riverData[currentRiver];
    const baseLat = river.center[0];
    const baseLng = river.center[1];
    
    const elevationZones = [
        { coords: [[baseLat + 0.06, baseLng - 0.06], [baseLat + 0.06, baseLng - 0.04], [baseLat + 0.04, baseLng - 0.04], [baseLat + 0.04, baseLng - 0.06]], color: '#10b981', opacity: 0.3 },
        { coords: [[baseLat + 0.03, baseLng - 0.03], [baseLat + 0.03, baseLng - 0.01], [baseLat + 0.01, baseLng - 0.01], [baseLat + 0.01, baseLng - 0.03]], color: '#f59e0b', opacity: 0.3 },
        { coords: [[baseLat - 0.02, baseLng], [baseLat - 0.02, baseLng + 0.02], [baseLat - 0.04, baseLng + 0.02], [baseLat - 0.04, baseLng]], color: '#ef4444', opacity: 0.3 },
        { coords: [[baseLat - 0.06, baseLng + 0.05], [baseLat - 0.06, baseLng + 0.07], [baseLat - 0.08, baseLng + 0.07], [baseLat - 0.08, baseLng + 0.05]], color: '#f59e0b', opacity: 0.3 }
    ];
    
    elevationZones.forEach(zone => {
        L.polygon(zone.coords, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: zone.opacity,
            weight: 1
        }).addTo(layers.elevation);
    });
}

function createHotspots(discharge, year) {
    layers.erosion.clearLayers();
    layers.sedimentation.clearLayers();
    hotspotMarkers = [];
    
    const river = riverData[currentRiver];
    const baseHotspots = river.hotspots;
    
    // Adjust hotspots based on discharge and year
    const dischargeMultiplier = 1 + (discharge * 0.15);
    const yearOffset = (4 - year) * 0.0005;
    
    baseHotspots.forEach(hotspot => {
        const adjustedLat = hotspot.lat + (Math.random() - 0.5) * yearOffset;
        const adjustedLng = hotspot.lng + (Math.random() - 0.5) * yearOffset;
        
        const color = hotspot.severity === 'critical' ? '#ef4444' :
                     hotspot.severity === 'high' ? '#f59e0b' : '#10b981';
        
        const radius = hotspot.severity === 'critical' ? 12 : 
                      hotspot.severity === 'high' ? 10 : 8;
        
        const marker = L.circleMarker([adjustedLat, adjustedLng], {
            radius: radius * dischargeMultiplier,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        });
        
        marker.hotspotData = {
            id: hotspot.id,
            type: hotspot.type,
            severity: hotspot.severity,
            discharge: discharge,
            year: year
        };
        
        marker.on('click', () => showHotspotDetails(marker.hotspotData));
        
        if (hotspot.type === 'erosion') {
            marker.addTo(layers.erosion);
        } else {
            marker.addTo(layers.sedimentation);
        }
        
        hotspotMarkers.push(marker);
    });
    
    updateRiskCounts();
}

function setupRiverSelector() {
    const selector = document.getElementById('river-select');
    
    selector.addEventListener('change', (e) => {
        const selectedRiver = e.target.value;
        
        if (selectedRiver === 'custom') {
            const riverName = prompt('Enter custom river name:');
            const lat = parseFloat(prompt('Enter center latitude (e.g., 25.5):'));
            const lng = parseFloat(prompt('Enter center longitude (e.g., 80.0):'));
            
            if (riverName && !isNaN(lat) && !isNaN(lng)) {
                // Create custom river data
                riverData.custom = {
                    name: riverName + ' | Custom Location',
                    center: [lat, lng],
                    zoom: 11,
                    path: [
                        [lat + 0.05, lng - 0.05],
                        [lat + 0.02, lng - 0.02],
                        [lat - 0.01, lng + 0.01],
                        [lat - 0.04, lng + 0.04],
                        [lat - 0.07, lng + 0.07]
                    ],
                    hotspots: [
                        { lat: lat + 0.045, lng: lng - 0.045, type: 'erosion', severity: 'high', id: 'C-E-001' },
                        { lat: lat + 0.025, lng: lng - 0.015, type: 'sedimentation', severity: 'moderate', id: 'C-S-001' },
                        { lat: lat - 0.015, lng: lng + 0.015, type: 'erosion', severity: 'critical', id: 'C-E-002' },
                        { lat: lat - 0.045, lng: lng + 0.035, type: 'sedimentation', severity: 'high', id: 'C-S-002' }
                    ]
                };
                currentRiver = 'custom';
                switchRiver('custom');
            } else {
                alert('Invalid input. Please try again.');
                selector.value = currentRiver;
            }
        } else {
            currentRiver = selectedRiver;
            switchRiver(selectedRiver);
        }
    });
}

function switchRiver(riverId) {
    const river = riverData[riverId];
    
    // Update location display
    document.getElementById('location-display').textContent = river.name;
    
    // Update map view
    map.setView(river.center, river.zoom);
    
    // Remove old river polyline
    if (riverPolyline) {
        map.removeLayer(riverPolyline);
    }
    
    // Add new river polyline
    riverPolyline = L.polyline(river.path, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7
    }).addTo(map);
    
    // Clear and recreate elevation layer
    layers.elevation.clearLayers();
    createElevationLayer();
    
    // Recreate hotspots
    createHotspots(currentDischarge, currentYear);
    
    // Remove uploaded layer if exists
    if (uploadedLidarLayer) {
        map.removeLayer(uploadedLidarLayer);
        uploadedLidarLayer = null;
    }
    
    // Reset upload info
    document.getElementById('upload-info').textContent = 'No file selected';
    document.getElementById('upload-info').classList.remove('success');
    document.getElementById('process-lidar').disabled = true;
    document.getElementById('lidar-upload').value = '';
}

function showHotspotDetails(data) {
    const panel = document.getElementById('details-panel');
    panel.classList.remove('hidden');
    
    document.getElementById('hotspot-id').textContent = data.id;
    
    const severityEl = document.getElementById('hotspot-severity');
    severityEl.textContent = data.severity.toUpperCase();
    severityEl.style.background = data.severity === 'critical' ? '#fee2e2' :
                                   data.severity === 'high' ? '#fef3c7' : '#d1fae5';
    severityEl.style.color = data.severity === 'critical' ? '#991b1b' :
                            data.severity === 'high' ? '#92400e' : '#065f46';
    
    document.getElementById('hotspot-issue').textContent = 
        data.type === 'erosion' ? 'Bank Erosion' : 'Sediment Accumulation';
    
    const failureTime = data.severity === 'critical' ? '6-12 months' :
                       data.severity === 'high' ? '1-2 years' : '3-5 years';
    document.getElementById('hotspot-failure').textContent = failureTime;
    
    const erosionRate = data.severity === 'critical' ? '2.5 m/year' :
                       data.severity === 'high' ? '1.2 m/year' : '0.5 m/year';
    document.getElementById('hotspot-rate').textContent = erosionRate;
    
    document.getElementById('hotspot-area').textContent = 
        Math.floor(Math.random() * 500 + 200) + ' m²';
    
    createChart(data);
}

function createChart(data) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const erosionData = months.map(() => Math.random() * 3 + (data.severity === 'critical' ? 2 : 1));
    
    const trace = {
        x: months,
        y: erosionData,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#3b82f6', width: 2 },
        marker: { size: 6 }
    };
    
    const layout = {
        title: 'Monthly Erosion Trend (2024)',
        xaxis: { title: 'Month' },
        yaxis: { title: 'Erosion Rate (m)' },
        margin: { l: 50, r: 20, t: 40, b: 40 },
        height: 250,
        font: { size: 11 }
    };
    
    Plotly.newPlot('chart-container', [trace], layout, { responsive: true, displayModeBar: false });
}

function setupLayerToggles() {
    document.getElementById('layer-satellite').addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(layers.satellite);
        } else {
            map.removeLayer(layers.satellite);
        }
    });
    
    document.getElementById('layer-lidar').addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(layers.lidar);
        } else {
            map.removeLayer(layers.lidar);
        }
    });
    
    document.getElementById('layer-elevation').addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(layers.elevation);
        } else {
            map.removeLayer(layers.elevation);
        }
    });
    
    document.getElementById('layer-erosion').addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(layers.erosion);
        } else {
            map.removeLayer(layers.erosion);
        }
    });
    
    document.getElementById('layer-sedimentation').addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(layers.sedimentation);
        } else {
            map.removeLayer(layers.sedimentation);
        }
    });
}

function setupScenarioSimulator() {
    const slider = document.getElementById('discharge-slider');
    const valueDisplay = document.getElementById('discharge-value');
    
    slider.addEventListener('input', (e) => {
        currentDischarge = parseInt(e.target.value);
        const labels = ['Normal Flow', '+10% Discharge', '+30% Discharge', '+50% Discharge'];
        valueDisplay.textContent = labels[currentDischarge];
        createHotspots(currentDischarge, currentYear);
    });
}

function setupTimeline() {
    const slider = document.getElementById('time-slider');
    const valueDisplay = document.getElementById('timeline-value');
    
    slider.addEventListener('input', (e) => {
        currentYear = parseInt(e.target.value);
        const years = ['2020', '2021', '2022', '2023', 'December 2024'];
        valueDisplay.textContent = 'Current: ' + years[currentYear];
        createHotspots(currentDischarge, currentYear);
    });
}

function updateRiskCounts() {
    let critical = 0, high = 0, moderate = 0;
    
    hotspotMarkers.forEach(marker => {
        if (marker.hotspotData.severity === 'critical') critical++;
        else if (marker.hotspotData.severity === 'high') high++;
        else moderate++;
    });
    
    document.getElementById('critical-count').textContent = critical;
    document.getElementById('high-count').textContent = high;
    document.getElementById('moderate-count').textContent = moderate;
}

document.getElementById('close-panel').addEventListener('click', () => {
    document.getElementById('details-panel').classList.add('hidden');
});

// LiDAR Upload Feature
let uploadedLidarLayer = null;
const BACKEND_URL = 'http://localhost:5000';

document.getElementById('lidar-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const infoEl = document.getElementById('upload-info');
        infoEl.textContent = file.name;
        infoEl.classList.add('success');
        document.getElementById('process-lidar').disabled = false;
    }
});

document.getElementById('process-lidar').addEventListener('click', () => {
    const file = document.getElementById('lidar-upload').files[0];
    if (!file) return;
    
    const infoEl = document.getElementById('upload-info');
    infoEl.textContent = 'Processing ' + file.name + '...';
    
    // Upload to backend for processing
    uploadToBackend(file);
});

async function uploadToBackend(file) {
    const infoEl = document.getElementById('upload-info');
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${BACKEND_URL}/api/upload-lidar`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        
        if (result.success) {
            infoEl.textContent = file.name + ' - Processed successfully';
            infoEl.classList.add('success');
            
            // Display results on map
            displayBackendResults(result);
        } else {
            throw new Error(result.error || 'Processing failed');
        }
        
    } catch (error) {
        console.error('Backend processing error:', error);
        infoEl.textContent = 'Backend unavailable. Using local processing...';
        infoEl.classList.remove('success');
        
        // Fallback to local processing
        setTimeout(() => {
            processLidarFile(file);
            infoEl.textContent = file.name + ' - Loaded locally';
        }, 500);
    }
}

function displayBackendResults(result) {
    // Remove previous uploaded layer
    if (uploadedLidarLayer) {
        map.removeLayer(uploadedLidarLayer);
    }
    
    const hotspots = result.hotspots || [];
    const stats = result.stats || {};
    
    // Create layer group for uploaded data
    uploadedLidarLayer = L.layerGroup().addTo(map);
    
    // Add hotspots from backend
    hotspots.forEach(hotspot => {
        const color = hotspot.severity === 'critical' ? '#ef4444' :
                     hotspot.severity === 'high' ? '#f59e0b' : '#10b981';
        
        const radius = hotspot.severity === 'critical' ? 12 : 
                      hotspot.severity === 'high' ? 10 : 8;
        
        const marker = L.circleMarker([hotspot.lat, hotspot.lng], {
            radius: radius,
            fillColor: color,
            color: '#8b5cf6',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.7
        });
        
        // Create popup content
        let popupContent = `<div style="font-family: sans-serif; min-width: 200px;">
            <strong style="font-size: 1.1em; color: #0c4a6e;">📊 ${hotspot.id}</strong><br><br>
            <span style="color: #0369a1; font-weight: 500;">Type:</span> 
            <span style="color: #0c4a6e;">${hotspot.type === 'erosion' ? 'Erosion' : 'Sedimentation'}</span><br>
            <span style="color: #0369a1; font-weight: 500;">Severity:</span> 
            <span style="color: #0c4a6e;">${hotspot.severity.toUpperCase()}</span><br>`;
        
        if (hotspot.elevation !== null && hotspot.elevation !== undefined) {
            popupContent += `<span style="color: #0369a1; font-weight: 500;">Elevation:</span> 
                <span style="color: #0c4a6e;">${hotspot.elevation.toFixed(2)} m</span><br>`;
        }
        
        if (hotspot.slope !== null && hotspot.slope !== undefined) {
            popupContent += `<span style="color: #0369a1; font-weight: 500;">Slope:</span> 
                <span style="color: #0c4a6e;">${hotspot.slope.toFixed(2)}°</span><br>`;
        }
        
        if (hotspot.score !== null && hotspot.score !== undefined) {
            popupContent += `<span style="color: #0369a1; font-weight: 500;">Risk Score:</span> 
                <span style="color: #0c4a6e;">${hotspot.score.toFixed(1)}/100</span><br>`;
        }
        
        popupContent += '</div>';
        marker.bindPopup(popupContent);
        
        marker.hotspotData = {
            id: hotspot.id,
            type: hotspot.type,
            severity: hotspot.severity,
            discharge: currentDischarge,
            year: currentYear,
            uploaded: true,
            backendProcessed: true
        };
        
        marker.on('click', () => showHotspotDetails(marker.hotspotData));
        marker.addTo(uploadedLidarLayer);
        
        if (hotspot.type === 'erosion') {
            marker.addTo(layers.erosion);
        } else {
            marker.addTo(layers.sedimentation);
        }
        
        hotspotMarkers.push(marker);
    });
    
    // Fit map to hotspots if available
    if (hotspots.length > 0) {
        const bounds = hotspots.map(h => [h.lat, h.lng]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Show stats in console
    console.log('Backend Processing Stats:', stats);
    
    // Update risk counts
    updateRiskCounts();
}

function processLidarFile(file) {
    // Remove previous uploaded layer
    if (uploadedLidarLayer) {
        map.removeLayer(uploadedLidarLayer);
    }
    
    const fileName = file.name.toLowerCase();
    
    // For GeoJSON files, we can actually read them
    if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const geojson = JSON.parse(e.target.result);
                
                // Validate GeoJSON structure
                if (!geojson.type || (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature')) {
                    throw new Error('Invalid GeoJSON structure');
                }
                
                uploadedLidarLayer = L.geoJSON(geojson, {
                    style: {
                        color: '#8b5cf6',
                        weight: 2,
                        fillOpacity: 0.3
                    },
                    onEachFeature: (feature, layer) => {
                        if (feature.properties) {
                            let popupContent = '<div style="font-family: sans-serif; min-width: 200px;">';
                            popupContent += '<strong style="font-size: 1.1em; color: #0c4a6e;">📊 Uploaded LiDAR Data</strong><br><br>';
                            
                            // Format property names to be more readable
                            const formatKey = (key) => {
                                return key
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, l => l.toUpperCase());
                            };
                            
                            // Format values with units where appropriate
                            const formatValue = (key, value) => {
                                if (key.includes('elevation') || key.includes('slope')) {
                                    return `${value} m`;
                                } else if (key.includes('width') || key.includes('length')) {
                                    return `${value} m`;
                                } else if (key.includes('density')) {
                                    return value;
                                } else if (key.includes('rate')) {
                                    return value;
                                }
                                return value;
                            };
                            
                            for (let key in feature.properties) {
                                const formattedKey = formatKey(key);
                                const formattedValue = formatValue(key, feature.properties[key]);
                                popupContent += `<span style="color: #0369a1; font-weight: 500;">${formattedKey}:</span> `;
                                popupContent += `<span style="color: #0c4a6e;">${formattedValue}</span><br>`;
                            }
                            
                            popupContent += '</div>';
                            layer.bindPopup(popupContent);
                        }
                    }
                }).addTo(map);
                
                // Fit map to uploaded data bounds
                if (uploadedLidarLayer.getBounds && uploadedLidarLayer.getBounds().isValid()) {
                    map.fitBounds(uploadedLidarLayer.getBounds());
                    addUploadedAreaHotspots(uploadedLidarLayer.getBounds());
                } else {
                    // If bounds are invalid, use default area
                    const defaultBounds = [[27.50, 77.99], [27.50, 78.03], [27.47, 78.03], [27.47, 77.99]];
                    addUploadedAreaHotspots(defaultBounds);
                }
                
                document.getElementById('upload-info').textContent = file.name + ' - Loaded successfully';
            } catch (error) {
                console.error('GeoJSON parsing error:', error);
                document.getElementById('upload-info').textContent = 'Error: Invalid GeoJSON format. Using simulated data instead.';
                document.getElementById('upload-info').classList.remove('success');
                // Fall back to simulated data
                setTimeout(() => simulateLidarData(file.name), 500);
            }
        };
        reader.readAsText(file);
    } else {
        // For other formats (.tif, .las, .laz), simulate with demo data
        simulateLidarData(file.name);
    }
}

function simulateLidarData(fileName) {
    // Create a simulated LiDAR coverage area
    const bounds = [
        [27.50, 77.99],
        [27.50, 78.03],
        [27.47, 78.03],
        [27.47, 77.99]
    ];
    
    uploadedLidarLayer = L.polygon(bounds, {
        color: '#8b5cf6',
        fillColor: '#8b5cf6',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '5, 5'
    }).addTo(map);
    
    uploadedLidarLayer.bindPopup(`
        <strong>Uploaded LiDAR Dataset</strong><br>
        File: ${fileName}<br>
        Coverage: 12.5 km²<br>
        Resolution: 1m<br>
        Points: 2.3M<br>
        Status: Processed
    `);
    
    map.fitBounds(bounds);
    
    // Add new hotspots in uploaded area
    addUploadedAreaHotspots(bounds);
}

function addUploadedAreaHotspots(bounds) {
    // Calculate center of bounds
    const centerLat = (bounds[0][0] + bounds[2][0]) / 2;
    const centerLng = (bounds[0][1] + bounds[2][1]) / 2;
    
    // Add 3 new hotspots in the uploaded area
    const newHotspots = [
        { lat: centerLat + 0.01, lng: centerLng - 0.01, type: 'erosion', severity: 'high', id: 'U-001' },
        { lat: centerLat - 0.01, lng: centerLng + 0.01, type: 'sedimentation', severity: 'moderate', id: 'U-002' },
        { lat: centerLat, lng: centerLng, type: 'erosion', severity: 'critical', id: 'U-003' }
    ];
    
    newHotspots.forEach(hotspot => {
        const color = hotspot.severity === 'critical' ? '#ef4444' :
                     hotspot.severity === 'high' ? '#f59e0b' : '#10b981';
        
        const radius = hotspot.severity === 'critical' ? 12 : 
                      hotspot.severity === 'high' ? 10 : 8;
        
        const marker = L.circleMarker([hotspot.lat, hotspot.lng], {
            radius: radius,
            fillColor: color,
            color: '#8b5cf6',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.7
        });
        
        marker.hotspotData = {
            id: hotspot.id,
            type: hotspot.type,
            severity: hotspot.severity,
            discharge: currentDischarge,
            year: currentYear,
            uploaded: true
        };
        
        marker.on('click', () => showHotspotDetails(marker.hotspotData));
        
        if (hotspot.type === 'erosion') {
            marker.addTo(layers.erosion);
        } else {
            marker.addTo(layers.sedimentation);
        }
        
        hotspotMarkers.push(marker);
    });
    
    updateRiskCounts();
}

// Community Engagement Features
let communityReports = [
    { id: 1, type: 'erosion', severity: 'critical', location: 'Near Wazirabad Bridge', description: 'Severe bank erosion observed, approximately 5m of land lost in past month', reporter: 'Rajesh Kumar', date: '2024-12-20', votes: 23 },
    { id: 2, type: 'flooding', severity: 'high', location: 'Yamuna Bank, Sector 15', description: 'Water level rising rapidly, threatening nearby settlements', reporter: 'Anonymous', date: '2024-12-22', votes: 18 },
    { id: 3, type: 'pollution', severity: 'medium', location: 'Downstream of Industrial Area', description: 'Unusual water discoloration and odor detected', reporter: 'Priya Sharma', date: '2024-12-23', votes: 12 },
    { id: 4, type: 'erosion', severity: 'high', location: 'Village Khera Ghat', description: 'Riverbank collapsing, agricultural land at risk', reporter: 'Suresh Yadav', date: '2024-12-21', votes: 15 },
    { id: 5, type: 'debris', severity: 'low', location: 'Near Railway Bridge', description: 'Large accumulation of plastic and debris blocking flow', reporter: 'Anonymous', date: '2024-12-19', votes: 8 }
];

// Community Modal
document.getElementById('community-fab').addEventListener('click', () => {
    document.getElementById('community-modal').classList.remove('hidden');
    loadCommunityReports();
});

document.getElementById('close-community-modal').addEventListener('click', () => {
    document.getElementById('community-modal').classList.add('hidden');
});

// Close modal on outside click
document.getElementById('community-modal').addEventListener('click', (e) => {
    if (e.target.id === 'community-modal') {
        document.getElementById('community-modal').classList.add('hidden');
    }
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

// Report Form Submission
document.getElementById('report-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newReport = {
        id: communityReports.length + 1,
        type: document.getElementById('issue-type').value,
        severity: document.getElementById('issue-severity').value,
        location: document.getElementById('issue-location').value,
        description: document.getElementById('issue-description').value,
        reporter: document.getElementById('reporter-name').value || 'Anonymous',
        date: new Date().toISOString().split('T')[0],
        votes: 0
    };
    
    communityReports.unshift(newReport);
    
    // Show success message
    alert('Thank you! Your report has been submitted successfully. Our team will review it shortly.');
    
    // Reset form
    document.getElementById('report-form').reset();
    
    // Switch to reports tab
    document.querySelector('[data-tab="reports"]').click();
    loadCommunityReports();
});

// Load Community Reports
function loadCommunityReports() {
    const reportsList = document.getElementById('reports-list');
    const filter = document.getElementById('reports-filter').value;
    
    let filteredReports = communityReports;
    if (filter !== 'all') {
        filteredReports = communityReports.filter(r => r.type === filter);
    }
    
    document.getElementById('reports-count').textContent = `${filteredReports.length} reports`;
    
    reportsList.innerHTML = filteredReports.map(report => `
        <div class="report-card ${report.severity}">
            <div class="report-header">
                <span class="report-type">${formatReportType(report.type)}</span>
                <span class="report-severity ${report.severity}">${report.severity}</span>
            </div>
            <div class="report-location">📍 ${report.location}</div>
            <div class="report-description">${report.description}</div>
            <div class="report-footer">
                <span>${report.reporter} • ${formatDate(report.date)}</span>
                <div class="report-votes">
                    <button class="vote-btn" onclick="voteReport(${report.id})">👍</button>
                    <span>${report.votes}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function formatReportType(type) {
    const types = {
        'erosion': 'Bank Erosion',
        'flooding': 'Flooding',
        'pollution': 'Water Pollution',
        'debris': 'Debris Accumulation',
        'other': 'Other Issue'
    };
    return types[type] || type;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

function voteReport(reportId) {
    const report = communityReports.find(r => r.id === reportId);
    if (report) {
        report.votes++;
        loadCommunityReports();
    }
}

// Reports filter
document.getElementById('reports-filter').addEventListener('change', loadCommunityReports);

// Alerts Form Submission
document.getElementById('alerts-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('alert-email').value;
    const phone = document.getElementById('alert-phone').value;
    const radius = document.getElementById('alert-radius').value;
    
    alert(`Success! You've subscribed to alerts for ${radius}km radius.\nNotifications will be sent to: ${email}${phone ? ' and ' + phone : ''}`);
    
    document.getElementById('alerts-form').reset();
});
