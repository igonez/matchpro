import React from 'react';
import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';

export default function DashboardLoading() {
  return (
    <MobileLoadingScreen
      title="Terminal do Coach"
      subtitle="Carregando turmas, alunos e métricas em tempo real..."
      fullScreen={true}
    />
  );
}
