import React from 'react';
import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';

export default function StudentAppLoading() {
  return (
    <MobileLoadingScreen
      title="Sua Arena"
      subtitle="Sincronizando XP, missões e leaderboard..."
      fullScreen={true}
    />
  );
}
