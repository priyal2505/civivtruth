import { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWithGemini } from '../gemini';

export const TruthPoll = ({ apiKey }) => {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!claim.trim()) return;
    if (!apiKey) {
      alert("Please enter API Key in settings first.");
      return;
    }

    setLoading(true);
    setResult(null);

    const prompt = `You are "TruthPoll", an expert election fact-checker. 
    Analyze this claim: "${claim}"
    
    Return ONLY a JSON object with this structure:
    {
      "verdict": "TRUE" | "FALSE" | "MISLEADING",
      "confidence": number 0-100,
      "tacticUsed": "Name of manipulation tactic if any (e.g., Cherry-picking, Fear-mongering, Out of Context)",
      "explanation": "2-3 concise sentences explaining why and providing the truth",
      "howToSpot": "1 tip on how a user could spot this tactic themselves"
    }`;

    try {
      const response = await generateWithGemini(prompt, apiKey);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(cleanJson);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'TRUE') return 'var(--success)';
    if (verdict === 'FALSE') return 'var(--danger)';
    return 'var(--warning)';
  };

  const getVerdictIcon = (verdict) => {
    if (verdict === 'TRUE') return <ShieldCheck size={32} color="var(--success)" />;
    if (verdict === 'FALSE') return <ShieldAlert size={32} color="var(--danger)" />;
    return <AlertTriangle size={32} color="var(--warning)" />;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>TruthPoll</h2>
        <p className="text-muted">Paste any election claim, tweet, or rumor. AI will instantly analyze it, check facts, and explain the manipulation tactic used.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <textarea 
            className="input-glass"
            rows="4"
            placeholder="e.g. 'They are changing polling locations at the last minute to prevent us from voting!'"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            style={{ paddingRight: '100px', resize: 'none' }}
          />
          <button 
            className="btn btn-primary"
            style={{ position: 'absolute', bottom: '1rem', right: '1rem', padding: '0.5rem 1rem' }}
            onClick={handleAnalyze}
            disabled={loading || !claim.trim()}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <><Search size={18} /> Analyze</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ 
              borderLeft: `4px solid ${getVerdictColor(result.verdict)}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                {getVerdictIcon(result.verdict)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: getVerdictColor(result.verdict), fontSize: '1.5rem', margin: 0 }}>
                    {result.verdict}
                  </h3>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                    Trust Score: <strong>{result.confidence}%</strong>
                  </div>
                </div>

                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {result.explanation}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Tactic Detected
                    </div>
                    <strong>{result.tacticUsed || "None"}</strong>
                  </div>
                  
                  <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      How to Spot It
                    </div>
                    <span style={{ fontSize: '0.9rem' }}>{result.howToSpot}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
