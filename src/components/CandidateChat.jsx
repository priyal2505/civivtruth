import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateWithGemini } from '../gemini';

export const CandidateChat = ({ candidate, civicTwin, apiKey }) => {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Hello! I am the AI persona for ${candidate.title}. I'm built using their real public statements, past voting records, and official platform. What would you like to ask me about my plans or past record?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    const historyPrompt = messages.map(m => `${m.role === 'user' ? 'Voter' : candidate.title}: ${m.text}`).join('\n');
    
    const prompt = `You are roleplaying as the political candidate: ${candidate.title}.
Your platform and past record:
${candidate.record}

The voter's top issues are: ${civicTwin.issues || 'Not specified'}. Keep this in mind if relevant.
Do NOT break character. Speak in the first person ("I will...", "My record shows...").
Be polite, direct, and ground your answers strictly in the provided record.

Chat History:
${historyPrompt}
Voter: ${userMessage}
${candidate.title}:`;

    try {
      const response = await generateWithGemini(prompt, apiKey);
      setMessages(prev => [...prev, { role: 'model', text: response.trim() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {msg.role === 'model' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
            )}
            <div style={{ 
              background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              lineHeight: 1.5,
              fontSize: '0.95rem'
            }}>
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
              <Loader2 size={18} className="text-primary spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="input-glass" 
          style={{ flex: 1 }} 
          placeholder="Ask about their past record or policies..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
