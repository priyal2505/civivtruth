import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Target, Sparkles, Loader2 } from 'lucide-react';
import { generateWithGemini } from '../gemini';

export const Onboarding = ({ onComplete, apiKey }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    state: '',
    voterStatus: 'first-time', // first-time, registered, moved
    issues: ''
  });

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      await generatePersona();
    }
  };

  const generatePersona = async () => {
    if (!apiKey) {
      alert("Please enter API Key in settings first.");
      return;
    }
    setLoading(true);
    
    const prompt = `You are an expert election system. Create a "Civic Twin" JSON profile for a user with these details:
    State: ${formData.state}
    Status: ${formData.voterStatus}
    Top Issues: ${formData.issues}
    
    Return ONLY a JSON object (no markdown, no backticks) with this structure:
    {
      "personaName": "A catchy title for their persona",
      "summary": "A 2 sentence encouraging summary of their voting power",
      "readingLevel": "adult",
      "stateRules": "1 sentence on their state's key voting rule (e.g. mail-in vs in-person)",
      "upcomingDates": ["Date 1: Action", "Date 2: Action"]
    }`;

    try {
      const response = await generateWithGemini(prompt, apiKey);
      // Clean up markdown formatting if AI still adds it
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const profile = JSON.parse(cleanJson);
      
      const fullProfile = { ...formData, ...profile };
      setLoading(false);
      onComplete(fullProfile);
    } catch (error) {
      console.error(error);
      alert("Error generating persona. " + error.message);
      setLoading(false);
    }
  };

  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', overflow: 'hidden', position: 'relative' }}>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem' }}>
            <Loader2 className="text-primary" size={48} style={{ animation: 'spin 2s linear infinite' }} />
            <h3 style={{ marginTop: '1.5rem' }}>Generating your Civic Twin...</h3>
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              Analyzing {formData.state} election laws and tailoring your journey.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ 
                  height: '4px', flex: 1, margin: '0 4px', borderRadius: '2px',
                  background: i <= step ? 'var(--primary)' : 'var(--border)' 
                }} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <MapPin className="text-primary" /> Where are you voting?
                  </h2>
                  <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Election rules vary wildly by state. We need this to get your dates right.</p>
                  <input 
                    type="text" 
                    className="input-glass" 
                    placeholder="e.g. Maharashtra, Karnataka, Delhi..." 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <User className="text-primary" /> What's your voter status?
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {['first-time', 'registered', 'recently moved'].map((status) => (
                      <button 
                        key={status}
                        className={`btn ${formData.voterStatus === status ? 'btn-primary' : 'btn-outline'}`}
                        style={{ justifyContent: 'flex-start', padding: '1rem' }}
                        onClick={() => setFormData({...formData, voterStatus: status})}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)} Voter
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Target className="text-primary" /> What issues matter to you?
                  </h2>
                  <p className="text-muted" style={{ marginBottom: '1.5rem' }}>We'll highlight these topics when explaining ballot measures.</p>
                  <textarea 
                    className="input-glass" 
                    rows="3"
                    placeholder="e.g. Education, Environment, Economy, Healthcare..." 
                    value={formData.issues}
                    onChange={(e) => setFormData({...formData, issues: e.target.value})}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleNext}
                disabled={step === 0 && !formData.state}
              >
                {step === 2 ? <><Sparkles size={18} /> Generate My Profile</> : 'Continue'}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
