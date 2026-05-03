import { useState } from 'react';
import { BookOpen, CheckSquare, Sparkles, Loader2, Info, MessageSquare, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWithGemini } from '../gemini';
import { CandidateChat } from './CandidateChat';
import { PolicySandbox } from './PolicySandbox';
import { DebatePractice } from './DebatePractice';

export const VoteSimulator = ({ civicTwin, apiKey }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('explain'); // 'explain', 'chat', 'sandbox'
  const [explanation, setExplanation] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readingLevel, setReadingLevel] = useState(civicTwin.readingLevel || 'adult');

  const mockBallot = [
    {
      id: 'prop1',
      type: 'Measure',
      title: 'Measure 1: Metro Phase 3 Expansion',
      summary: 'Allocates budget for expanding urban metro infrastructure to ease traffic congestion.',
      sandbox: {
        description: 'Adjust the allocated budget to see how it affects urban mobility vs. state fiscal deficit.',
        context: 'A state infrastructure allocation for expanding the metro network.',
        min: 500,
        max: 10000,
        step: 500,
        default: 2500,
        unit: 'Crore ₹'
      }
    },
    {
      id: 'prop2',
      type: 'Measure',
      title: 'Measure 2: IT Sector Startup Subsidies',
      summary: 'Provides tax breaks and subsidies for new tech startups to boost local employment.',
      sandbox: {
        description: 'Adjust the proposed subsidy percentage to see the impact on job creation vs. state tax revenue.',
        context: 'Tax subsidy applied to new IT sector companies.',
        min: 5,
        max: 30,
        step: 1,
        default: 15,
        unit: '%'
      }
    },
    {
      id: 'candidate_priya',
      type: 'Candidate',
      title: 'Priya Sharma for MLA',
      summary: 'Progressive candidate focused on urban mobility, green energy, and women safety.',
      record: 'Voted YES on the 2022 Women\'s Safety Initiative. Supported expanding the city electric bus fleet. Vetoed the 2023 industrial deregulations in green zones. Stance: Increase social services funding, strict environmental regulations.'
    },
    {
      id: 'candidate_vikram',
      type: 'Candidate',
      title: 'Vikram Singh for MLA',
      summary: 'Conservative candidate focused on infrastructure development, lower taxes, and foreign investment.',
      record: 'Voted NO on the 2022 Corporate Tax Hike due to investment concerns. Championed the 2023 Special Economic Zone (SEZ) bill. Strongly supports increasing police funding by 15%. Stance: Cut bureaucratic red tape, pro-business development.'
    }
  ];

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setActiveTab('explain');
    setExplanation(null);
    setMatchData(null);
    handleExplain(item);
  };

  const handleExplain = async (item) => {
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
    ${item.record ? 'Context (Past Record): ' + item.record : ''}
    
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

  const handleMatch = async (item) => {
    if (!apiKey) {
      alert("Please enter API Key in settings first.");
      return;
    }

    setLoading(true);
    setMatchData(null);
    setActiveTab('match');

    const prompt = `You are a Candidate Matchmaker. Compare this voter's profile with the candidate.
    Voter's Top Issues: ${civicTwin.issues || 'General welfare'}
    
    Candidate: ${item.title} - ${item.summary}
    Record: ${item.record}
    
    Return ONLY a JSON object with this structure:
    {
      "matchScore": 85,
      "alignmentPoints": ["Point 1 where they agree", "Point 2"],
      "frictionPoints": ["Point 1 where they disagree"]
    }`;

    try {
      const response = await generateWithGemini(prompt, apiKey);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      setMatchData(JSON.parse(cleanJson));
    } catch (error) {
      console.error(error);
      alert("Match calculation failed. " + error.message);
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
          Select an item to understand it, chat with candidates, or test policy impacts.
        </p>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
          {mockBallot.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel" 
              style={{ 
                marginBottom: '1rem',
                borderLeft: selectedItem?.id === item.id ? '4px solid var(--primary)' : '1px solid var(--border)',
                background: selectedItem?.id === item.id ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-card)',
                cursor: 'pointer'
              }}
              onClick={() => handleSelectItem(item)}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                {item.type}
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{item.summary}</p>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button 
                  className={`btn ${selectedItem?.id === item.id && activeTab === 'explain' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  onClick={(e) => { e.stopPropagation(); handleSelectItem(item); }}
                >
                  <Sparkles size={16} /> Explain
                </button>
                
                {item.type === 'Candidate' && (
                  <button 
                    className={`btn ${selectedItem?.id === item.id && activeTab === 'chat' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setActiveTab('chat'); }}
                  >
                    <MessageSquare size={16} /> Chat
                  </button>
                )}

                {item.type === 'Measure' && item.sandbox && (
                  <button 
                    className={`btn ${selectedItem?.id === item.id && activeTab === 'sandbox' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setActiveTab('sandbox'); }}
                  >
                    <Sliders size={16} /> Sandbox
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: AI Interactive Area */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedItem ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            <Info size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Select an item from the ballot to dive deeper.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className={`btn ${activeTab === 'explain' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveTab('explain')}
                >
                  <BookOpen size={18} /> Breakdown
                </button>
                {selectedItem.type === 'Candidate' && (
                  <>
                    <button 
                      className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setActiveTab('chat')}
                    >
                      <MessageSquare size={18} /> Chat with {selectedItem.title.split(' ')[0]}
                    </button>
                    <button 
                      className={`btn ${activeTab === 'match' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleMatch(selectedItem)}
                    >
                      <Sparkles size={18} /> Match Score
                    </button>
                  </>
                )}
                <button 
                  className={`btn ${activeTab === 'debate' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveTab('debate')}
                >
                  <Flame size={18} /> Debate Practice
                </button>
                {selectedItem.type === 'Measure' && selectedItem.sandbox && (
                  <button 
                    className={`btn ${activeTab === 'sandbox' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('sandbox')}
                  >
                    <Sliders size={18} /> Policy Sandbox
                  </button>
                )}
              </div>

              {activeTab === 'explain' && (
                <select 
                  className="input-glass" 
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                  value={readingLevel}
                  onChange={(e) => {
                    setReadingLevel(e.target.value);
                    handleExplain(selectedItem);
                  }}
                >
                  <option value="6th grade">Like I'm 10</option>
                  <option value="adult">Standard Adult</option>
                  <option value="expert">Policy Expert</option>
                </select>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'explain' && (
                loading ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="text-primary spin" size={48} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Translating legalese to plain English...</p>
                  </div>
                ) : explanation ? (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 0.5rem' }}>
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
                ) : null
              )}

              {activeTab === 'chat' && (
                <CandidateChat candidate={selectedItem} civicTwin={civicTwin} apiKey={apiKey} />
              )}

              {activeTab === 'match' && (
                loading ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="text-primary spin" size={48} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Calculating your alignment...</p>
                  </div>
                ) : matchData ? (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '2rem' }}>
                      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: matchData.matchScore > 70 ? 'var(--success)' : matchData.matchScore > 40 ? 'var(--warning)' : 'var(--danger)' }}>
                          {matchData.matchScore}%
                        </div>
                        <h3 className="text-muted">Compatibility Match</h3>
                      </div>
                      
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <h4 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Where you align:</h4>
                          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {matchData.alignmentPoints.map((p, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{p}</li>)}
                          </ul>
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Where you differ:</h4>
                          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {matchData.frictionPoints.map((p, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{p}</li>)}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : null
              )}

              {activeTab === 'debate' && (
                <DebatePractice item={selectedItem} civicTwin={civicTwin} apiKey={apiKey} />
              )}

              {activeTab === 'sandbox' && (
                <PolicySandbox measure={selectedItem} civicTwin={civicTwin} apiKey={apiKey} />
              )}
            </div>
          </>
        )}
      </div>
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .btn-ghost { background: transparent; border: 1px solid transparent; color: var(--text-muted); }
        .btn-ghost:hover { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};
