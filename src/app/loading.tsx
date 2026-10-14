import React from 'react';
import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';

export default function RootLoading() {
  return (
    <MobileLoadingScreen
      title="ArenaFitPro"
      subtitle="Inicializando sistema operacional..."
      fullScreen={true}
    />
  );
}
