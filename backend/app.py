from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from scipy.ndimage import gaussian_filter1d
from joblib import load
import os
from functools import lru_cache

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

model_files = {
    # TV
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

    # Facebook
    'FB 1+': 'FB 1+.joblib',
    'FB 4+': 'FB 4+.joblib',
    'FB 6+': 'FB 6+.joblib',

    # YouTube
    'Youtube 1+': 'Youtube 1+.joblib',
    'Youtube 4+': 'Youtube 4+.joblib',
    'Youtube 6+': 'Youtube 6+.joblib',

    # Radio / Press (note spelling in filenames)
    'Radio': 'Decition_tree_model_Radio.joblib',
    'Press': 'Random_forest_model_Press.joblib',
}

model_ranges = {
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

    'FB 1+': (60000, 17997000),
    'FB 4+': (63000, 1320000),
    'FB 6+': (63000, 1680000),

    'Youtube 1+': (360000, 23700000),
    'Youtube 4+': (360000, 23700000),
    'Youtube 6+': (360000, 23700000),

    'Radio': (50000, 10000000),
    'Press': (50000, 13100000),
}

def calculate_efficiency_point(X_plot, y_pred, target_efficiency, sigma):
    X_plot_1d = X_plot.ravel()
    y_pred_1d = y_pred.ravel()
    y_smooth = gaussian_filter1d(y_pred_1d, sigma=sigma)
    gradient = np.gradient(y_smooth, X_plot_1d)
    max_eff = np.max(np.abs(gradient))
    eff_percent = (gradient / max_eff) * 100

    max_idx = np.argmax(gradient)
    post_max = np.arange(max_idx, len(X_plot_1d))
    eff_post = eff_percent[post_max]

    below_target = np.where(eff_post <= target_efficiency)[0]
    idx = post_max[below_target[0]] if len(below_target) > 0 else len(X_plot_1d) - 1
    return X_plot_1d[idx], y_smooth[idx]

@lru_cache(maxsize=None)
def get_model(model_name: str):
    filename = model_files[model_name]
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")
    return load(path)

@app.route("/")
def index():
    return jsonify({
        "ok": True,
        "message": "✅ Backend is running!"
    }), 200

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json() or {}
    efficiencies = data.get("efficiencies", {})
    selected_models = data.get("models", {})

    try:
        results = []
        for channel in ['TV', 'Facebook', 'YouTube', 'Radio', 'Press']:
            model_name = selected_models.get(channel, channel)
            model = get_model(model_name)  # lazy load, cached
            min_val, max_val = model_ranges[model_name]
            sigma = 450 if model_name.startswith('TV_') else 350

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

        return jsonify({
            "results": results,
            "total_budget": total_budget,
            "total_reach": total_reach
        }), 200

    except FileNotFoundError as e:
        return jsonify({"error": "Model file missing", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route("/healthz")
def healthz():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)), debug=False)
