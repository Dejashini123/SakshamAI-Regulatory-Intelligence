/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { OverviewView } from './components/views/OverviewView.tsx';
import { ApplicationsView } from './components/views/ApplicationsView.tsx';
import { NewValidationView } from './components/views/NewValidationView.tsx';
import { ApplicationDetailView } from './components/views/ApplicationDetailView.tsx';
import { DocumentAuthenticationView } from './components/views/DocumentAuthenticationView.tsx';
import { ComplianceRulesView } from './components/views/ComplianceRulesView.tsx';
import { AnomalyReviewView } from './components/views/AnomalyReviewView.tsx';
import { InfrastructureEvidenceView } from './components/views/InfrastructureEvidenceView.tsx';
import { ReportsView } from './components/views/ReportsView.tsx';
import { AuditTrailView } from './components/views/AuditTrailView.tsx';
import { UserRolesView } from './components/views/UserRolesView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';

import { 
  Application, 
  DashboardStats, 
  ComplianceRule, 
  AuditEvent, 
  AnomalyAlert, 
  InfrastructureEvidence,
  AuthenticationAttempt,
  UserRole
} from './types/index.ts';

import { 
  fetchHealth, 
  fetchCurrentUser, 
  switchUserRole, 
  fetchDashboardStats, 
  fetchApplications, 
  fetchRules, 
  fetchAnomalies, 
  fetchInfrastructure, 
  fetchAuditTrail,
  resetDemoDatabase
} from './services/api.ts';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [activeRole, setActiveRole] = useState<UserRole>('Administrator');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureEvidence[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [geminiActive, setGeminiActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all initial state from Express REST backend
  const loadAllData = async () => {
    try {
      const [
        healthData,
        userData,
        statsData,
        appsData,
        rulesData,
        anomaliesData,
        infraData,
        auditData
      ] = await Promise.all([
        fetchHealth().catch(() => ({ geminiConfigured: false })),
        fetchCurrentUser().catch(() => ({ role: 'Administrator' as UserRole })),
        fetchDashboardStats().catch(() => null),
        fetchApplications().catch(() => []),
        fetchRules().catch(() => []),
        fetchAnomalies().catch(() => []),
        fetchInfrastructure().catch(() => []),
        fetchAuditTrail().catch(() => [])
      ]);

      setGeminiActive(Boolean(healthData?.geminiConfigured));
      setActiveRole(userData?.role || 'Administrator');
      setStats(statsData);
      setApplications(appsData);
      setRules(rulesData);
      setAnomalies(anomaliesData);
      setInfrastructure(infraData);
      setAuditTrail(auditData);

      // If an application was selected, update its reference
      if (selectedApplication) {
        const refreshed = appsData.find((a: Application) => a.id === selectedApplication.id);
        if (refreshed) setSelectedApplication(refreshed);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRoleChange = async (newRole: UserRole) => {
    try {
      await switchUserRole(newRole);
      setActiveRole(newRole);
      loadAllData();
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  const handleSelectApplication = (app: Application) => {
    setSelectedApplication(app);
    setCurrentView('application-detail');
  };

  const handleNewValidation = () => {
    setCurrentView('new-validation');
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset all demonstration data to default seed state?')) {
      await resetDemoDatabase();
      await loadAllData();
      setCurrentView('overview');
    }
  };

  const pendingAnomaliesCount = anomalies.filter(a => a.status === 'pending_review').length;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Persistent Gov-Tech Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          if (v !== 'application-detail') setSelectedApplication(null);
          setCurrentView(v);
        }}
        activeRole={activeRole}
        pendingAnomaliesCount={pendingAnomaliesCount}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar adhering to frontend-design contract */}
        <Header
          currentView={currentView}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          onNewValidation={handleNewValidation}
          onResetDemo={handleResetDemo}
          geminiActive={geminiActive}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Initializing AICTE SAKSHAM Regulatory Workspace...
            </div>
          ) : (
            <>
              {currentView === 'overview' && (
                <OverviewView
                  stats={stats}
                  applications={applications}
                  recentAudits={auditTrail}
                  onSelectApplication={handleSelectApplication}
                  onNavigate={(v) => setCurrentView(v)}
                />
              )}

              {currentView === 'applications' && (
                <ApplicationsView
                  applications={applications}
                  onSelectApplication={handleSelectApplication}
                  onNewValidation={handleNewValidation}
                />
              )}

              {currentView === 'new-validation' && (
                <NewValidationView
                  onValidationComplete={(app) => {
                    setSelectedApplication(app);
                    setCurrentView('application-detail');
                    loadAllData();
                  }}
                  onCancel={() => setCurrentView('applications')}
                />
              )}

              {currentView === 'application-detail' && selectedApplication && (
                <ApplicationDetailView
                  application={selectedApplication}
                  activeRole={activeRole}
                  onBack={() => {
                    setSelectedApplication(null);
                    setCurrentView('applications');
                    loadAllData();
                  }}
                  onRefresh={(updatedApp) => {
                    setSelectedApplication(updatedApp);
                    loadAllData();
                  }}
                />
              )}

              {currentView === 'doc-auth' && (
                <DocumentAuthenticationView
                  applications={applications}
                  authentications={[]}
                  onRefresh={loadAllData}
                />
              )}

              {currentView === 'rules' && (
                <ComplianceRulesView
                  rules={rules}
                  activeRole={activeRole}
                  onRefresh={loadAllData}
                />
              )}

              {currentView === 'anomalies' && (
                <AnomalyReviewView
                  anomalies={anomalies}
                  applications={applications}
                  activeRole={activeRole}
                  onRefresh={loadAllData}
                  onSelectApplication={handleSelectApplication}
                />
              )}

              {currentView === 'infrastructure' && (
                <InfrastructureEvidenceView
                  infrastructure={infrastructure}
                />
              )}

              {currentView === 'reports' && (
                <ReportsView
                  applications={applications}
                  stats={stats}
                  onSelectApplication={handleSelectApplication}
                />
              )}

              {currentView === 'audit' && (
                <AuditTrailView
                  auditTrail={auditTrail}
                />
              )}

              {currentView === 'users' && (
                <UserRolesView
                  activeRole={activeRole}
                  onRoleChange={handleRoleChange}
                />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  geminiActive={geminiActive}
                  applications={applications}
                  onSelectApplication={handleSelectApplication}
                  onResetComplete={loadAllData}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
