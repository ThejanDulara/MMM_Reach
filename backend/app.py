# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from scipy.ndimage import gaussian_filter1d
from joblib import load
from functools import lru_cache
import os

app = Flask(__name__)
CORS(app)

# ---- Paths ----
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# ---- Model files map (same names you already use) ----
model_files = {
    # TV models
    'TV': 'decision_tree_model_TV.joblib',
    'TV 2+': 'TV 2+.joblib',
    'TV 3+': 'TV 3+.joblib',
    'TV 4+': 'TV 4+.joblib',
    'TV 5+': 'TV 5+.joblib',
    'TV 6+': 'TV 6+.joblib',
    'TV 7+': 'TV 7+.joblib',
    'TV 8+': 'TV 8+.joblib',
    'TV 9+': 'TV 9+.joblib',
    'TV 10+': 'TV 10+.joblib',
    'TV_Jun': 'TV_June.joblib',
    'TV_Jul': 'TV_Jul.joblib',
    'TV_Aug': 'TV_Aug.joblib',
    'TV_Sep': 'TV_Sep.joblib',
    'TV_Oct': 'TV_Oct.joblib',
    'TV_Nov': 'TV_Nov.joblib',
    'TV_Dec': 'TV_Dec.joblib',
    'TV_Jan': 'TV_Jan.joblib',
    'TV_Feb': 'TV_Feb.joblib',
    'TV_Mar': 'TV_Mar.joblib',
    'TV_Apr': 'TV_Apr.joblib',
    'TV_May': 'TV_May.joblib',

    # Facebook models
    'FB 1+': 'FB 1+.joblib',
    'FB 4+': 'FB 4+.joblib',
    'FB 6+': 'FB 6+.joblib',

    # YouTube models
    'Youtube 1+': 'Youtube 1+.joblib',
    'Youtube 4+': 'Youtube 4+.joblib',
    'Youtube 6+': 'Youtube 6+.joblib',

    # Radio and Press models
    'Radio': 'Decition_tree_model_Radio.joblib',
    'Press': 'Random_forest_model_Press.joblib'
}

# ---- Model ranges (unchanged) ----
model_ranges = {
    # TV models
    'TV': (625000, 125000000),
    'TV 2+': (625000, 125000000),
    'TV 3+': (625000, 125000000),
    'TV 4+': (625000, 125000000),
    'TV 5+': (625000, 125000000),
    'TV 6+': (625000, 125000000),
    'TV 7+': (625000, 125000000),
    'TV 8+': (625000, 125000000),
    'TV 9+': (625000, 125000000),
    'TV 10+': (625000, 125000000),
    'TV_Jun': (366090.55, 117750000),
    'TV_Jul': (366090.55, 126750000),
    'TV_Aug': (366090.55, 133200000),
    'TV_Sep': (366090.55, 196950000),
    'TV_Oct': (366090.55, 144600000),
    'TV_Nov': (366090.55, 140850000),
    'TV_Dec': (366090.55, 132300000),
    'TV_Jan': (366090.55, 144000000),
    'TV_Feb': (366090.55, 144900000),
    'TV_Mar': (366090.55, 177300000),
    'TV_Apr': (366090.55, 215100000),
    'TV_May': (366090.55, 123450000),
    # Facebook
    'FB 1+': (60000, 17997000),
    'FB 4+': (63000, 1320000),
    'FB 6+': (63000, 1680000),
    # YouTube
    'Youtube 1+': (360000, 23700000),
    'Youtube 4+': (360000, 23700000),
    'Youtube 6+': (360000, 23700000),
    # Radio and Press
    'Radio': (50000, 10000000),
    'Press': (50000, 13100000)
}

# ---- Lazy model loader ----
@lru_cache(maxsize=None)
def get_model(model_name: str):
    path = os.path.join(MODEL_DIR, model_files[model_name])
    return load(path)

# ---- Helper ----
def calculate_efficiency_point(X_plot, y_pred, target_efficiency, sigma):
    X_plot_1d = X_plot.ravel()
    y_pred_1d = y_pred.ravel()

    y_smooth = gaussian_filter1d(y_pred_1d, sigma=sigma)
    gradient = np.gradient(y_smooth, X_plot_1d)
    max_eff = np.max(np.abs(gradient)) or 1.0  # avoid div-by-zero
    eff_percent = (gradient / max_eff) * 100

    max_idx = np.argmax(gradient)
    post_max = np.arange(max_idx, len(X_plot_1d))
    eff_post = eff_percent[post_max]

    below_target = np.where(eff_post <= target_efficiency)[0]
    idx = post_max[below_target[0]] if len(below_target) > 0 else len(X_plot_1d) - 1
    return X_plot_1d[idx], y_smooth[idx]

# ---- Routes ----
@app.get("/")
def index():
    return "✅ Backend is running!", 200

@app.post("/api/analyze")
def analyze():
    data = request.get_json(force=True, silent=True) or {}
    efficiencies = data.get("efficiencies", {})
    selected_models = data.get("models", {})

    required_channels = ['TV', 'Facebook', 'YouTube', 'Radio', 'Press']
    for ch in required_channels:
        if ch not in efficiencies:
            return jsonify(error=f"Missing efficiency for '{ch}'"), 400

    results = []
    for channel in required_channels:
        model_name = selected_models.get(channel, channel)
        if model_name not in model_files:
            return jsonify(error=f"Unknown model '{model_name}' for channel '{channel}'"), 400

        model = get_model(model_name)  # lazy load + cached
        min_val, max_val = model_ranges[model_name]

        # broader match for all TV variants
        sigma = 450 if model_name.startswith('TV') else 350

        x_vals = np.linspace(min_val, max_val, 10000).reshape(-1, 1)
        y_vals = model.predict(x_vals)
        eff = float(efficiencies[channel])

        budget, reach = calculate_efficiency_point(x_vals, y_vals, eff, sigma)

        results.append({
            "channel": channel,
            "selected_model": model_name,
            "target_efficiency": eff,
            "budget": float(budget),
            "reach": float(reach)
        })

    total_budget = sum(r['budget'] for r in results)
    total_reach = sum(r['reach'] for r in results)

    return jsonify(
        results=results,
        total_budget=total_budget,
        total_reach=total_reach
    ), 200

@app.get("/healthz")
def healthz():
    return {"status": "ok"}, 200

# ---- Local dev entry ----
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
