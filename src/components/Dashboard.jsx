import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { KnowledgeGraph } from './KnowledgeGraph';

export const Dashboard = ({ civicTwin, apiKey, onNavigate }) => {
  const [completedSteps, setCompletedSteps] = useState([0]); // First step done by default

  const toggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const steps = civicTwin.upcomingDates || [
    "April 19: Phase 1 Voting",
    "May 25: Phase 6 Voting",
    "June 4: Election Results"
  ];

  // Derived for Knowledge Graph demo
  const mastered = ["Registration Rules", civicTwin.state + " Deadlines"];
  const toExplore = ["Local Props", "Candidates", "Misinformation Tactics"];
  
  if (completedSteps.includes(1)) mastered.push("Ballot Rules");
  if (completedSteps.includes(2)) mastered.push("Voting Methods");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}
    >
      {/* Main Timeline Column */}
      <div>
        <div className="glass-panel" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(236, 72, 153, 0.1))' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>👋 Welcome back, {civicTwin.personaName || 'Voter'}</h2>
          <p>{civicTwin.summary}</p>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.9rem' }}>
            <strong>📜 {civicTwin.state} Law:</strong> {civicTwin.stateRules}
          </div>
        </div>

        <h3 style={{ marginBottom: '1.5rem' }}>Your Custom Election Journey</h3>
        
        <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
          {/* Timeline Line */}
          <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }} />
          
          {steps.map((stepStr, index) => {
            const isDone = completedSteps.includes(index);
            const [datePart, ...actionParts] = stepStr.split(':');
            const action = actionParts.join(':') || stepStr;

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ 
                  position: 'relative', 
                  marginBottom: '2rem',
                  opacity: isDone ? 0.6 : 1
                }}
              >
                <div 
                  style={{ 
                    position: 'absolute', left: '-1.5rem', top: '4px',
                    cursor: 'pointer', zIndex: 2
                  }}
                  onClick={() => toggleStep(index)}
                >
                  {isDone ? (
                    <CheckCircle2 className="text-success" fill="var(--bg-dark)" />
                  ) : (
                    <Circle className="text-muted" fill="var(--bg-dark)" />
                  )}
                </div>

                <div className="glass-panel" style={{ padding: '1rem', marginLeft: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    <Clock size={14} /> {datePart}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{action.trim()}</h4>
                  {!isDone && index === Math.max(...completedSteps) + 1 && (
                    <div style={{ marginTop: '1rem' }}>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                        Take Action Now
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Column */}
      <div>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem' }}>Profile Match</h3>
          <ul style={{ listStyle: 'none', gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">State</span> <strong>{civicTwin.state}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Status</span> <strong>{civicTwin.voterStatus}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Complexity</span> <strong>{civicTwin.readingLevel}</strong>
            </li>
          </ul>
        </div>

        <KnowledgeGraph masteredTopics={mastered} exploreTopics={toExplore} onNavigate={onNavigate} />
      </div>
    </motion.div>
  );
};
