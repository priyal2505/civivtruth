import { useState, useRef, useEffect } from 'react';
import { Send, User, Flame, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateWithGemini } from '../gemini';

export const DebatePractice = ({ item, civicTwin, apiKey }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial prompt from the "Skeptical Uncle"
    setMessages([
      { 
        role: 'ai', 
        content: `So I hear you're supporting ${item.title}. You really think that's a good idea? Convince me.` 
      }
    ]);
  }, [item]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setFeedback(null);

    const prompt = `You are a "Skeptical Uncle" debating an 18-year-old voter. 
    Topic: ${item.title} - ${item.summary}
    Voter's argument: "${userMsg}"
    
    Your goal is to push back, play devil's advocate, and challenge their logic, but keep it brief (2 sentences max). 
    Do NOT agree with them easily. Use a slightly informal, skeptical tone.`;

    try {
      const response = await generateWithGemini(prompt, apiKey);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "I don't even know what to say to that error." }]);
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = async () => {
    if (!apiKey || messages.length < 3) return;
    setLoading(true);
    
    const chatHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `Analyze this political debate between a user and a skeptical AI.
    ${chatHistory}
    
    Return ONLY a JSON object evaluating the user's arguments:
    {
      "score": "A number 1-100 grading their persuasiveness and factual basis",
      "strength": "1 sentence on what they argued well",
      "weakness": "1 sentence on what they should improve or fact-check"
    }`;

    try {
      const response = await generateWithGemini(prompt, apiKey);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      setFeedback(JSON.parse(cleanJson));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
          <Flame size={20} />
          <strong>Dinner Table Debater</strong>
        </div>
        <button 
          onClick={getFeedback}
          disabled={messages.length < 3 || loading}
          className="btn btn-outline"
          style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
        >
          <Sparkles size={14} /> Get Feedback
        </button>
      </div>

      {feedback && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1rem', background: 'rgba(79, 70, 229, 0.1)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <strong>Debate Score: {feedback.score}/100</strong>
            <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--success)', marginBottom: '0.25rem' }}>✓ {feedback.strength}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--warning)', margin: 0 }}>⚠ {feedback.weakness}</p>
        </motion.div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.5rem' }}>
            {msg.role === 'ai' && <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>}
            
            <div style={{
              maxWidth: '75%',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              borderBottomRightRadius: msg.role === 'user' ? '0' : '12px',
              borderBottomLeftRadius: msg.role === 'ai' ? '0' : '12px',
            }}>
              {msg.content}
            </div>
            
            {msg.role === 'user' && <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>}
          </div>
        ))}
        {loading && !feedback && (
           <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
             <Loader2 size={16} className="spin" /> Skeptical Uncle is typing...
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
        <input 
          className="input-glass"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Defend your position..."
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
