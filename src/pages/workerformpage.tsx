import React from 'react';
import WorkerForm from '../components/WorkerForm';
import AccountManagement from '../components/AccountManagement';

const WorkerFormPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h2>Account Management</h2>
          <AccountManagement visible={true} onClose={() => {}} />
        </div>
        
        <div>
          <h2>Worker Configuration</h2>
          <WorkerForm 
            onWorkerCreated={() => {}}
            onShowBulkDeployment={() => {}}
            onShowConfigManagement={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkerFormPage;