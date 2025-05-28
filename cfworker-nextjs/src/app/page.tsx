"use client";

import { WorkerForm } from '@/components/forms/WorkerForm';
// import { useTranslation } from 'react-i18next'; // Keep if page-specific translations are needed later

export default function Home() {
  // const { t } = useTranslation(); // For page-specific text if any

  const handleWorkerCreated = (node: string, url: string) => {
    console.log('Worker Created:', { node, url });
    // Here you would typically update state, show a toast, etc.
  };

  const handleShowBulkDeployment = () => {
    console.log('Show Bulk Deployment clicked');
    // Logic to show bulk deployment UI
  };

  const handleShowConfigManagement = () => {
    console.log('Show Config Management clicked');
    // Logic to show config management UI
  };

  return (
    <div className="container mx-auto py-8">
      {/* 
        Optionally, add a page title here if needed, e.g., using useTranslation
        <h1 className="text-2xl font-semibold mb-6">{t('pageTitle.workerSetup')}</h1> 
      */}
      <WorkerForm
        onWorkerCreated={handleWorkerCreated}
        onShowBulkDeployment={handleShowBulkDeployment}
        onShowConfigManagement={handleShowConfigManagement}
      />
      {/* Placeholder for other page content like NodeOutput, etc. */}
    </div>
  );
}
