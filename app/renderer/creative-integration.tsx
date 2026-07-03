// Creative Studio Integration
// Add this to your main App component or Dashboard

import React from 'react';
import { CreativeStudio } from './components/CreativeStudio';

// Example integration in Dashboard or main view:
export const DashboardWithCreative: React.FC = () => {
  return (
    <div className="dashboard-container">
      {/* Existing dashboard content */}
      
      {/* Creative Studio Section */}
      <section className="creative-section">
        <CreativeStudio />
      </section>
      
      {/* Other sections */}
    </div>
  );
};

// Or add to Sidebar navigation:
export const sidebarItems = [
  // ... existing items
  {
    id: 'creative-studio',
    label: '🎭 Creative Studio',
    icon: '🎭',
    component: CreativeStudio,
    path: '/creative'
  }
];

// Integration with Productivity Scorer
export async function calculateCreativeImpact(userId: string): Promise<number> {
  const { knouxSuperSystem } = await import('../knoux-super-system');
  const creativeScore = await knouxSuperSystem.getCreativeScore();
  
  // Creative score contributes to productivity
  return creativeScore * 0.3; // 30% weight
}

// Integration with Voice System (optional)
export async function enableCreativeVoiceReading(text: string): Promise<void> {
  const { knouxSuperSystem } = await import('../knoux-super-system');
  
  try {
    await knouxSuperSystem.synthesizeVoice(text, 'poetic');
  } catch (error) {
    console.error('Voice reading failed:', error);
  }
}

export default DashboardWithCreative;
