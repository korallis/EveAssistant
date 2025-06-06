import React from 'react';

const Home = () => {
  return (
    <div>
      <h2>Welcome to EveAssistant</h2>
      <p>Your comprehensive tool for EVE Online ship fittings, market analysis, and character management.</p>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Ship Fittings</h3>
          <p>Create, optimize, and share ship fittings.</p>
        </div>
        <div className="feature-card">
          <h3>Market Analysis</h3>
          <p>Track prices and find profitable trades.</p>
        </div>
        <div className="feature-card">
          <h3>Skill Planning</h3>
          <p>Manage your character's skill progression.</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 