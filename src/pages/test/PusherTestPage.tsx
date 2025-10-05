import React from 'react';
import { PusherConnectionTest } from '@/components/test/PusherConnectionTest';

const PusherTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <PusherConnectionTest />
    </div>
  );
};

export default PusherTestPage;
