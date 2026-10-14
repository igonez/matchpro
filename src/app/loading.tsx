import React from 'react';
import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';

export default function RootLoading() {
  return (
    <MobileLoadingScreen
      title="ArenaFitPro"
      subtitle="Carregando..."
      fullScreen={true}
    />
  );
}
