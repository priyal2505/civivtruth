import { useState, useEffect } from 'react';
import { Sliders, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateWithGemini } from '../gemini';

export const PolicySandbox = ({ measure, civicTwin, apiKey }) => {
  const [sliderValue, setSliderValue] = useState(measure.sandbox.default);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounce the API call so we don't spam it while dragging
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateImpact(sliderValue);
    }, 800); // 800ms debounce
    return () => clearTimeout(timer);
  }, [sliderValue]);

  const calculateImpact = async (value) => {
    if (!apiKey) return;
    setLoading(true);

    const prompt = `You are a policy simulator. Analyze the impact of this ballot measure if the parameter is set to a specific value.
Measure: ${measure.title} - ${measure.summary}
Parameter Context: ${measure.sandbox.context}
Current Value: ${value} ${measure.sandbox.unit}

The voter's top issues are: ${civicTwin.issues || 'None specified'}.

Return ONLY a JSON object with this structure:
{
  "summary": "1-sentence summary of the overall effect at this level.",
  "personalImpact": "How this specific level impacts the voter directly (taxes, daily life).",
  "issueImpact": "How this specific level affects their Top Issues.",
  "trend": "up" | "down" | "neutral" (represents the severity/cost)
}`;

    try {
      const response = await generateWithGemini(prompt, apiKey);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      setAnalysis(JSON.parse(cleanJson));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sliders className="text-accent" /> Policy Sandbox
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {measure.sandbox.description}
        </p>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{measure.sandbox.min} {measure.sandbox.unit}</span>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-light)', fontSize: '1.2rem' }}>
              {sliderValue} {measure.sandbox.unit}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{measure.sandbox.max} {measure.sandbox.unit}</span>
          </div>
          <input 
            type="range" 
            min={measure.sandbox.min} 
            max={measure.sandbox.max} 
            step={measure.sandbox.step}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="text-primary spin" size={32} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Calculating impact...</p>
          </div>
        )}

        {analysis && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', padding: '1.5rem', borderRadius: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: '50%', 
                background: analysis.trend === 'up' ? 'rgba(239, 68, 68, 0.2)' : analysis.trend === 'down' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                color: analysis.trend === 'up' ? 'var(--danger)' : analysis.trend === 'down' ? 'var(--success)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {analysis.trend === 'up' ? <TrendingUp size={20} /> : analysis.trend === 'down' ? <TrendingDown size={20} /> : <Minus size={20} />}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-light)' }}>Projected Result</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>{analysis.summary}</p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Personal Impact</h4>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{analysis.personalImpact}</p>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Impact on Your Top Issues</h4>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{analysis.issueImpact}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
