# JalKavach - Complete Setup Guide

This guide will help you set up both the frontend and Python backend for the JalKavach LiDAR River Intelligence Dashboard.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│   Frontend      │         │   Backend        │
│   (HTML/JS)     │ ◄─────► │   (Python/Flask) │
│                 │  HTTP   │                  │
│ - Map Display   │         │ - DEM Processing │
│ - User Input    │         │ - ML Prediction  │
│ - Visualization │         │ - Feature Extract│
└─────────────────┘         └──────────────────┘
```

## Prerequisites

### For Frontend
- Modern web browser (Chrome, Firefox, Edge)
- Local web server (optional, for development)

### For Backend
- Python 3.8 or higher
- pip package manager
- 4GB+ RAM (for processing large DEM files)

## Installation Steps

### 1. Clone/Download the Project

```bash
git clone <repository-url>
cd jalkavach
```

### 2. Backend Setup

#### Step 2.1: Navigate to Backend Directory
```bash
cd backend
```

#### Step 2.2: Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 2.3: Install Dependencies
```bash
pip install -r requirements.txt
```

**Note:** If you encounter issues installing `rasterio` on Windows:
```bash
pip install pipwin
pipwin install gdal
pipwin install rasterio
```

#### Step 2.4: Train ML Model (Optional)

Generate a trained model for better predictions:
```bash
python train_model.py
```

This will create `models/erosion_model.pkl` with a trained Random Forest classifier.

#### Step 2.5: Start Backend Server
```bash
python app.py
```

The backend will start on `http://localhost:5000`

You should see:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### 3. Frontend Setup

#### Step 3.1: Open in Browser

**Option A - Direct File Access:**
Simply open `index.html` in your browser.

**Option B - Using Python HTTP Server:**
```bash
# In the project root directory (not backend/)
python -m http.server 8000
```
Then visit `http://localhost:8000`

**Option C - Using Live Server (VS Code):**
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## Testing the Integration

### 1. Check Backend Health

Visit `http://localhost:5000/api/health` in your browser.

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-24T10:30:00",
  "version": "1.0.0"
}
```

### 2. Test Frontend Connection

1. Open the application in your browser
2. Click "Explore River Dashboard"
3. In the left sidebar, find "Upload LiDAR Data"
4. Upload one of the sample files:
   - `sample-lidar-yamuna.geojson`
   - `sample-lidar-ganga.geojson`
5. Click "Process & Display"

**Expected Behavior:**
- File uploads to backend
- Backend processes the data
- Hotspots appear on the map with purple borders
- Console shows "Backend Processing Stats"

**If Backend is Unavailable:**
- Frontend will show "Backend unavailable. Using local processing..."
- Falls back to client-side processing
- Hotspots still appear but without ML predictions

## Data Processing Pipeline

### When You Upload a File:

1. **Frontend** → Sends file to backend via `/api/upload-lidar`

2. **Backend** → Processes file:
   ```
   ┌─────────────────┐
   │ File Upload     │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │ Feature Extract │ ← Slope, Curvature, TWI, etc.
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │ ML Prediction   │ ← Random Forest Model
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │ Hotspot Gen     │ ← Georeferenced Points
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │ Return JSON     │
   └─────────────────┘
   ```

3. **Frontend** → Displays results on map

## Supported File Formats

### GeoJSON (.geojson, .json)
- Point or Polygon features
- Properties: elevation, slope, gradient
- Example: `sample-lidar-yamuna.geojson`

### GeoTIFF (.tif, .tiff)
- Digital Elevation Model (DEM)
- Single-band raster
- Projected coordinate system

### Future Support
- LAS/LAZ point clouds
- Multi-temporal datasets

## Configuration

### Backend Port (Optional)

To change the backend port, edit `backend/app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # Change port here
```

Then update `app.js`:
```javascript
const BACKEND_URL = 'http://localhost:5000';  // Update port here
```

### CORS Configuration

If accessing from a different domain, update `backend/app.py`:
```python
CORS(app, origins=['http://localhost:8000', 'http://127.0.0.1:5500'])
```

## Troubleshooting

### Backend Won't Start

**Error: "Address already in use"**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Error: "Module not found"**
```bash
pip install -r requirements.txt --force-reinstall
```

### Frontend Can't Connect to Backend

1. Check backend is running: `http://localhost:5000/api/health`
2. Check browser console for CORS errors
3. Verify `BACKEND_URL` in `app.js` matches backend address
4. Try disabling browser extensions (ad blockers)

### File Upload Fails

1. Check file size (< 50MB recommended)
2. Verify file format is supported
3. Check backend console for error messages
4. Ensure `uploads/` directory exists and is writable

### Poor Prediction Accuracy

1. Train model with real DEM dataset:
   - Collect labeled DEM samples
   - Update `load_real_dem_dataset()` in `train_model.py`
   - Run `python train_model.py`

2. Tune model hyperparameters in `train_model.py`

3. Collect more training data from diverse terrain types

## Using Your Own DEM Dataset

### Step 1: Prepare Training Data

Create a CSV file with columns:
```
slope,curvature,flow_accumulation,twi,roughness,elevation,label
15.5,-0.2,45.3,8.2,3.1,250.0,1
28.3,-0.4,78.9,6.5,5.2,280.0,2
...
```

Labels:
- 0: Stable
- 1: Moderate Erosion
- 2: High Erosion
- 3: Moderate Sedimentation
- 4: High Sedimentation

### Step 2: Update Training Script

Edit `backend/train_model.py`:
```python
def load_real_dem_dataset(dataset_path):
    import pandas as pd
    df = pd.read_csv(dataset_path)
    X = df[['slope', 'curvature', 'flow_accumulation', 
            'twi', 'roughness', 'elevation']].values
    y = df['label'].values
    return X, y
```

### Step 3: Train Model
```bash
python train_model.py
```

### Step 4: Restart Backend
```bash
python app.py
```

## Production Deployment

### Backend (Flask)

**Using Gunicorn:**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Using Docker:**
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Frontend

Deploy to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

Update `BACKEND_URL` in `app.js` to production backend URL.

## Performance Optimization

### For Large DEM Files

1. **Tile Processing**: Process DEM in smaller tiles
2. **Downsampling**: Reduce resolution for preview
3. **Caching**: Cache processed results
4. **Async Processing**: Use Celery for background tasks

### For Better Predictions

1. **More Training Data**: 10,000+ labeled samples
2. **Deep Learning**: Use CNN for spatial patterns
3. **Ensemble Models**: Combine multiple models
4. **Feature Engineering**: Add more terrain features

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend accessible in browser
3. ✅ Test with sample GeoJSON files
4. 🔄 Train model with your DEM dataset
5. 🔄 Deploy to production
6. 🔄 Add more features (time-series, alerts)

## Support

For issues or questions:
1. Check console logs (browser and backend)
2. Review error messages
3. Verify all dependencies are installed
4. Ensure file formats are correct

## License

MIT License - See LICENSE file for details
