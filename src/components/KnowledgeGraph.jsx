import { useState } from 'react';
import { motion } from 'framer-motion';

export const KnowledgeGraph = ({ masteredTopics, exploreTopics, onNavigate }) => {
  const handleTopicClick = (topic) => {
    if (!onNavigate) return;
    if (topic === "Misinformation Tactics") {
      onNavigate('truthpoll');
    } else {
      onNavigate('simulator');
    }
  };
  // A simple visual representation of a node graph using CSS layout
  
  return (
    <div className="glass-panel" style={{ marginTop: '2rem', background: 'rgba(15, 17, 26, 0.8)' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🧠 Civic Knowledge Graph
      </h3>
      <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Your personal understanding map. Complete more tasks to grow your civic brain.
      </p>

      <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Core Node */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', zIndex: 10,
            boxShadow: '0 0 30px var(--primary-glow)'
          }}
        >
          You
        </motion.div>

        {/* Mastered Nodes */}
        {masteredTopics.map((topic, i) => {
          const angle = (i * (360 / Math.max(1, masteredTopics.length))) * (Math.PI / 180);
          const radius = 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={topic}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x, y }}
              transition={{ delay: 0.5 + (i * 0.2) }}
              style={{
                position: 'absolute',
                padding: '0.5rem 1rem',
                background: 'var(--success)',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              {topic}
            </motion.div>
          );
        })}

        {/* To Explore Nodes */}
        {exploreTopics.map((topic, i) => {
          const angle = ((i * (360 / Math.max(1, exploreTopics.length))) + 45) * (Math.PI / 180);
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.button
              key={topic}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6, x, y }}
              transition={{ delay: 1 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              onClick={() => handleTopicClick(topic)}
              style={{
                position: 'absolute',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px dashed var(--text-muted)',
                borderRadius: '20px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                outline: 'none'
              }}
              aria-label={`Explore ${topic}`}
            >
              {topic}
            </motion.button>
          );
        })}

        {/* Connecting Lines (Simulated via SVG) */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
          {masteredTopics.map((_, i) => {
             const angle = (i * (360 / Math.max(1, masteredTopics.length))) * (Math.PI / 180);
             const radius = 80;
             const x = Math.cos(angle) * radius;
             const y = Math.sin(angle) * radius;
             return (
                <line key={i} x1="50%" y1="50%" x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} stroke="var(--primary)" strokeWidth="2" opacity="0.5" />
             )
          })}
        </svg>

      </div>
    </div>
  );
};
