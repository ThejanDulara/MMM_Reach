import React, { useState } from 'react';

const channels = [
  {
    name: 'TV',
    icon: '/TV.jpg',
    options: [
      'TV','TV 2+','TV 3+','TV 4+','TV 5+','TV 6+','TV 7+','TV 8+','TV 9+','TV 10+',
      'TV_Jan','TV_Feb','TV_Mar','TV_Apr','TV_May','TV_Jun','TV_Jul','TV_Aug',
      'TV_Sep','TV_Oct','TV_Nov','TV_Dec'
    ]
  },
  { name: 'Facebook', icon: '/FB.png', options: ['FB 1+', 'FB 4+', 'FB 6+'] },
  { name: 'YouTube', icon: '/YT.png', options: ['Youtube 1+', 'Youtube 4+', 'Youtube 6+'] },
  { name: 'Radio', icon: '/Radio.png' },
  { name: 'Press', icon: '/Press.png' }
];

function MediaInputSection({ onCalculate }) {
  const [efficiencies, setEfficiencies] = useState({
    TV: '', Facebook: '', YouTube: '', Radio: '', Press: ''
  });

  const [models, setModels] = useState({
    TV: 'TV',
    Facebook: 'FB 1+',
    YouTube: 'Youtube 1+'
  });

  const [loading, setLoading] = useState(false);

  const handleEfficiencyChange = (channel, value) => {
    setEfficiencies(prev => ({ ...prev, [channel]: value }));
  };

  const handleModelChange = (channel, value) => {
    setModels(prev => ({ ...prev, [channel]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double submits
    setLoading(true);

    for (const [ch, val] of Object.entries(efficiencies)) {
      const v = Number(val);
      if (isNaN(v) || v < 0 || v > 100) {
        alert(`Efficiency for ${ch} must be between 0 and 100.`);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('https://mmmreach-production.up.railway.app/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ efficiencies, models })
      });

      if (!res.ok) throw new Error('Failed to get prediction');

      const result = await res.json();
      onCalculate(result);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-form" aria-busy={loading}>
      <div className="channel-list">
        {channels.map(({ name, options, icon }) => (
          <div className="channel-item" key={name}>
            <div className="channel-label-container">
              <img src={icon} alt={name} className="channel-icon" />
              <label className="channel-label">{name} Efficiency Level</label>
            </div>

            <input
              type="number"
              className="efficiency-input"
              placeholder="0 - 100"
              min="0"
              max="100"
              value={efficiencies[name]}
              onChange={e => handleEfficiencyChange(name, e.target.value)}
              required
              disabled={loading}
            />

            {options ? (
              <select
                className="model-select"
                value={models[name] || options[0]}
                onChange={e => handleModelChange(name, e.target.value)}
                disabled={loading}
              >
                {options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <div className="empty-space" />
            )}
          </div>
        ))}
      </div>

      {/* Button aligned with the input + dropdown columns */}
      <div className="button-row">
        <div /> {/* aligns with the label column */}
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? "Calculating..." : <><span className="button-icon">📊</span> Show Results</>}
        </button>
      </div>

      <style jsx>{`
        .input-form {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }

        .input-form::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 700px;
          background:
            linear-gradient(to left,
              rgba(255, 255, 255, 0) 10%,
              rgba(255, 255, 255, 0.12) 20%,
              rgba(255, 255, 255, 0.35) 60%,
              rgba(255, 255, 255, 0.7) 80%,
              rgba(255, 255, 255, 1) 100%),
            url('/media-background.jpeg') right center / cover no-repeat;
          pointer-events: none;
          z-index: 0;
        }

        .channel-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          z-index: 1; /* above the faded image */
        }

        .channel-item {
          display: grid;
          grid-template-columns: 300px 160px 200px; /* wider label column for perfect alignment */
          gap: 1rem;
          align-items: center;
        }

        .channel-label-container {
          display: flex;
          align-items: center;
          white-space: nowrap;
          gap: 16px; /* increased icon↔label distance */
        }

        .channel-icon {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }

        .channel-label {
          font-weight: 600;
          color: #1a202c;
          white-space: nowrap;
        }

        .efficiency-input {
          padding: 0.55rem 0.9rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.975rem;
          width: 110px; /* reduced */
          background: #fff;
          transition: all 0.2s;
          color: #111;
        }

        .efficiency-input:focus {
          border-color: #667eea;
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .model-select {
          padding: 0.55rem 0.9rem;
          border-radius: 10px;
          font-size: 0.975rem;
          border: 1px solid #e2e8f0;
          background: #fff;
          width: 140px; /* reduced */
          color: #111;
          cursor: pointer;
          transition: all 0.2s;
        }

        .model-select:focus {
          border-color: #667eea;
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .model-select option {
          padding: 0.5rem;
          background: #fff;
          color: #2d3748;
        }

        .empty-space {
          width: 600px;
        }

        /* New: grid-aligned button row */
        .button-row {
          display: grid;
          grid-template-columns: 300px 160px 200px; /* match .channel-item */
          align-items: center;
          margin-top: 1.25rem;
          position: relative;
          z-index: 1;
        }

        .button-row .submit-button {
          grid-column: 3 / 4;   /* only in the dropdown column */
          justify-self: end;    /* push to right edge */
        }

        .submit-button {
          padding: 0.65rem 1.15rem;
          background: linear-gradient(90deg, #5a67d8, #434190);
          color: white;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .submit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(67, 65, 144, 0.28);
          opacity: 0.95;
        }

        /* Disabled state */
        .submit-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
          opacity: 0.8;
        }

        .button-icon {
          font-size: 1.2rem;
        }

        @media (max-width: 1024px) {
          .input-form::after {
            width: 40%;
          }
        }

        @media (max-width: 768px) {
          .input-form::after {
            display: none;
          }

          .channel-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px dashed #edf2f7;
          }

          .channel-label-container {
            width: 100%;
          }

          .efficiency-input,
          .model-select,
          .empty-space {
            width: 100%;
          }

          .button-row {
            display: block;
          }

          .button-row .submit-button {
            width: 100%;
            margin-top: 1rem;
          }
        }
      `}</style>
    </form>
  );
}

export default MediaInputSection;
