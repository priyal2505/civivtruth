import { useState } from 'react';
import { BookOpen, CheckSquare, Sparkles, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWithGemini } from '../gemini';

export const VoteSimulator = ({ civicTwin, apiKey }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readingLevel, setReadingLevel] = useState(civicTwin.readingLevel || 'adult');

  const mockBallot = [
    {
      id: 'prop1',
      type: 'Measure',
      title: 'Proposition 4: Clean Water Bond',
      summary: 'Authorizes $1.5 billion in bonds for water infrastructure and drought preparedness.',
    },
    {
      id: 'prop2',
      type: 'Measure',
      title: 'Proposition 27: Online Sports Betting',
      summary: 'Allows online and mobile sports wagering for tribes and gaming companies.',
    },
    {
      id: 'mayor',
      type: 'Candidate',
      title: 'Mayor of Cityville',
      summary: 'Choose 1. Candidates: Jane Doe (Prog), John Smith (Cons), Alex Lee (Ind).',
    }
  ];

  const handleExplain = async (item) => {
    setSelectedItem(item);
    if (!apiKey) {
      alert("Please enter API Key in settings first.");
      return;
    }

    setLoading(true);
    setExplanation(null);

    const prompt = `You are an impartial election assistant. Explain this ballot item to a voter.
    Voter's Reading Level: ${readingLevel} (adapt your tone and vocabulary exactly to this)
    Voter's Top Issues: ${civicTwin.issues || 'None specified'} (highlight impacts on these issues if relevant)
    
    Ballot Item: ${item.title} - ${item.summary}
    
    Return ONLY a JSON object with this structure:
    {
      "simpleExplanation": "What this actually means in plain English",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"],
      "impactOnIssues": "How this relates to their specific top issues (if it does)"
    }`;

    try {
      const response = await generateWithGemini(prompt, apiKey);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(cleanJson);
      setExplanation(analysis);
    } catch (error) {
      console.error(error);
      alert("Explanation failed. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: 'calc(100vh - 150px)' }}>
      {/* Left Column: The Ballot */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <CheckSquare className="text-primary" /> Practice Ballot
        </h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Click "Explain" on any item to get a personalized breakdown without the legal jargon.
        </p>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
          {mockBallot.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel" 
              style={{ 
                marginBottom: '1rem',
                borderLeft: selectedItem?.id === item.id ? '4px solid var(--primary)' : '1px solid var(--border)',
                background: selectedItem?.id === item.id ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-card)'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                {item.type}
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{item.summary}</p>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className={`btn ${selectedItem?.id === item.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  onClick={() => handleExplain(item)}
                >
                  <Sparkles size={16} /> Explain This
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: AI Explanation */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <BookOpen className="text-accent" /> AI Breakdown
          </h3>
          <select 
            className="input-glass" 
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
            value={readingLevel}
            onChange={(e) => {
              setReadingLevel(e.target.value);
              if (selectedItem) handleExplain(selectedItem); // re-fetch with new level
            }}
          >
            <option value="6th grade">Like I'm 10</option>
            <option value="adult">Standard Adult</option>
            <option value="expert">Policy Expert</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!selectedItem ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              <Info size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Select an item from the ballot to see a personalized explanation.</p>
            </div>
          ) : loading ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 className="text-primary spin" size={48} />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Translating legalese to plain English...</p>
            </div>
          ) : explanation ? (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>The TL;DR</h4>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{explanation.simpleExplanation}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>👍 Arguments For</h4>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', margin: 0 }}>
                      {explanation.pros.map((p, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{p}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>👎 Arguments Against</h4>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', margin: 0 }}>
                      {explanation.cons.map((p, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{p}</li>)}
                    </ul>
                  </div>
                </div>

                {civicTwin.issues && (
                  <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                    <h4 style={{ color: 'var(--primary-light)', marginBottom: '0.5rem' }}>Impact on Your Top Issues</h4>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{explanation.impactOnIssues}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
