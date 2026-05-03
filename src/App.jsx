import { useState, useEffect } from 'react';
import './App.css';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { TruthPoll } from './components/TruthPoll';
import { VoteSimulator } from './components/VoteSimulator';
import { Settings, ShieldCheck, Map, CheckSquare } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showApiModal, setShowApiModal] = useState(!apiKey);
  const [tempKey, setTempKey] = useState('');
  
  const [civicTwin, setCivicTwin] = useState(JSON.parse(localStorage.getItem('civic_twin')) || null);
  const [currentView, setCurrentView] = useState(civicTwin ? 'dashboard' : 'onboarding');

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', tempKey);
    setApiKey(tempKey);
    setShowApiModal(false);
  };

  const handleProfileComplete = (profile) => {
    setCivicTwin(profile);
    localStorage.setItem('civic_twin', JSON.stringify(profile));
    setCurrentView('dashboard');
  };

  const NavButton = ({ view, icon: Icon, label }) => (
    <button 
      onClick={() => setCurrentView(view)}
      className={`btn ${currentView === view ? 'btn-primary' : 'btn-outline'}`}
      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="app-container">
      {/* Header / Nav */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🗳️ CivicTruth
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>AI-Powered Election Assistant</p>
        </div>
        
        {civicTwin && (
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <NavButton view="dashboard" icon={Map} label="Journey" />
            <NavButton view="simulator" icon={CheckSquare} label="Ballot Sim" />
            <NavButton view="truthpoll" icon={ShieldCheck} label="TruthPoll" />
          </nav>
        )}

        <button 
          onClick={() => setShowApiModal(true)} 
          className="btn btn-outline"
          style={{ padding: '0.5rem' }}
          title="API Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!civicTwin || currentView === 'onboarding' ? (
          <Onboarding onComplete={handleProfileComplete} apiKey={apiKey} />
        ) : currentView === 'dashboard' ? (
          <Dashboard civicTwin={civicTwin} apiKey={apiKey} />
        ) : currentView === 'simulator' ? (
          <VoteSimulator civicTwin={civicTwin} apiKey={apiKey} />
        ) : currentView === 'truthpoll' ? (
          <TruthPoll apiKey={apiKey} />
        ) : null}
      </main>

      {/* API Key Modal */}
      {showApiModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1rem' }}>⚙️ Setup Gemini AI</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              CivicTruth requires a Google Gemini API Key to power the personalized journeys and fact-checking.
            </p>
            <input 
              type="password"
              className="input-glass"
              placeholder="Paste your Gemini API Key..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              {apiKey && (
                <button className="btn btn-outline" onClick={() => setShowApiModal(false)}>
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" onClick={saveApiKey}>
                Save Key & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
