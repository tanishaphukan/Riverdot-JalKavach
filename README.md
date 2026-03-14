# 🌊 RiverDOT-JalKavach

> LiDAR-based interactive dashboard for predicting sedimentation and erosion hotspots in river systems.

Built for **Riverathon 1.0** - A National Level River Hackathon by Namami Gange & Amity University.

---

## What It Does

Analyzes LiDAR terrain data to identify river zones prone to erosion and sedimentation, visualized as an interactive hotspot map with real-time flood scenario simulation.

---

## Key Features

- 🗺️ Interactive map with multi-layer LiDAR visualization
- 🔴 Erosion & sedimentation hotspot detection
- 🌊 Flood discharge scenario simulation
- 📊 Real-time risk analytics dashboard
- 📤 GeoJSON/TIF LiDAR data upload & processing
- 👥 Community issue reporting system
- 5 pre-configured Indian rivers - Yamuna, Ganga, Brahmaputra, Godavari, Narmada

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, Leaflet.js, Plotly.js |
| Backend | Python, Flask |
| Data | GeoJSON, GeoTIFF, GDAL, Rasterio |
| ML | Random Forest (scikit-learn) |

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/tanishaphukan/RiverDOT-JalKavach.git
cd RiverDOT-JalKavach

# Open directly in browser
open index.html

# Or run local server
python -m http.server 8000
```

For backend setup, see [SETUP.md](SETUP.md)

---

## Sample Data

Two sample LiDAR datasets included:
- `sample-lidar-yamuna.geojson`
- `sample-lidar-ganga.geojson`

---

## Future Scope

ML erosion prediction · Live IoT sensor integration · Cloud deployment · PDF report export

---
