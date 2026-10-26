    details = `Issuing authority gateway timed out or endpoint is currently unavailable.`;
  }

  const attempt: AuthenticationAttempt = {
    id: `auth-${Date.now()}`,
    documentId: targetDoc.id,
    applicationId: targetApp.id,
    type: 'issuing_authority_api',
    authorityName: authorityName || 'Demonstration Issuing Authority Gateway',
    referenceNumber: referenceNumber || 'REF-DEMO-01',
    endpointUrl: `https://verification.authority.gov.in/api/v1/records/${encodeURIComponent(referenceNumber || 'demo')}`,
    timestamp: new Date().toISOString(),
    status,
    responseDetails: details,
    verifiedByActor: db.activeRole
  };

  db.authentications.unshift(attempt);
  logAudit(db, db.activeRole, db.activeRole, 'OFFICIAL_SOURCE_VERIFY', targetDoc.id, status === 'Verified by authorized source' ? 'SUCCESS' : 'WARNING', `${authorityName} check: ${status}`);
  saveDB(db);

  res.json({ success: true, attempt });
});

// Manual Verification Action by Officer
app.post('/api/authentication/manual', (req: Request, res: Response) => {
  const db = getDB();
  const { documentId, authorityName, referenceNumber, status, comments } = req.body;

  let targetDoc: DocumentRecord | null = null;
  let targetApp: Application | null = null;

  for (const a of db.applications) {
    const d = a.documents.find(doc => doc.id === documentId);
    if (d) {
      targetDoc = d;
      targetApp = a;
      break;
    }
  }

  if (!targetDoc || !targetApp) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const attempt: AuthenticationAttempt = {
    id: `auth-${Date.now()}`,
    documentId: targetDoc.id,
    applicationId: targetApp.id,
    type: 'manual_verification',
    authorityName: authorityName || 'Manual Regulatory Verification',
    referenceNumber: referenceNumber || 'MANUAL-REF',
    timestamp: new Date().toISOString(),
    status: status || 'Verified by authorized source',
    responseDetails: comments || 'Verified in person by authorized verification officer.',
    verifiedByActor: db.activeRole
  };

  db.authentications.unshift(attempt);
  logAudit(db, db.activeRole, db.activeRole, 'MANUAL_VERIFY', targetDoc.id, 'RECORDED', `Manual officer verification: ${status}. Comments: ${comments}`);
  saveDB(db);

  res.json({ success: true, attempt });
});

// 10. Review Actions (Confirm / Dismiss Findings with Reason)
app.post('/api/reviews/action', (req: Request, res: Response) => {
  const db = getDB();
  const { applicationId, findingId, action, reason } = req.body;

  const app = db.applications.find(a => a.id === applicationId);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  if (findingId) {
    const finding = app.findings.find(f => f.id === findingId);
    if (finding) {
      if (action === 'confirm_finding') {
        finding.reviewStatus = 'confirmed';
        finding.reviewerNotes = reason || 'Confirmed by reviewer.';
        finding.reviewedBy = db.activeRole;
        finding.reviewedAt = new Date().toISOString();
      } else if (action === 'dismiss_finding') {
        if (!reason || reason.trim().length < 5) {
          return res.status(400).json({ error: 'A substantive justification reason is required to dismiss a finding.' });
        }
        finding.reviewStatus = 'dismissed';
        finding.reviewerNotes = reason;
        finding.reviewedBy = db.activeRole;
        finding.reviewedAt = new Date().toISOString();
      }
    }
  }

  logAudit(
    db, 
    db.activeRole, 
    db.activeRole, 
    action.toUpperCase(), 
    findingId || applicationId, 
    'RECORDED', 
    `Action: ${action}. Justification: ${reason}`
  );
  saveDB(db);

  res.json({ success: true, application: app });
});

// 11. Compliance Rules Management
app.get('/api/rules', (_req: Request, res: Response) => {
  const db = getDB();
  res.json(db.rules);
});

app.post('/api/rules', (req: Request, res: Response) => {
  const db = getDB();
  const { name, category, description, severity, sourceReference, conditionType } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Name and Category are required.' });
  }

  const newRule: ComplianceRule = {
    id: `rule-${Date.now()}`,
    ruleId: `RULE-CUSTOM-${Math.floor(100 + Math.random() * 900)}`,
    name: name.trim(),
    category,
    description: description || '',
    severity: severity || 'major',
    sourceReference: sourceReference || 'Configured Demonstration Rule',
    effectiveDate: '2026-04-01',
    version: '2026.1',
    isEnabled: true,
    isDemonstrationRule: true,
    conditionType: conditionType || 'document_presence'
  };

  db.rules.unshift(newRule);
  logAudit(db, db.activeRole, db.activeRole, 'CREATE_RULE', newRule.id, 'SUCCESS', `Created compliance rule ${newRule.ruleId}: ${newRule.name}`);
  saveDB(db);

  res.status(201).json(newRule);
});

app.patch('/api/rules/:id/toggle', (req: Request, res: Response) => {
  const db = getDB();
  const rule = db.rules.find(r => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });

  rule.isEnabled = !rule.isEnabled;
  logAudit(db, db.activeRole, db.activeRole, 'TOGGLE_RULE', rule.id, 'SUCCESS', `Rule ${rule.ruleId} set to ${rule.isEnabled ? 'ENABLED' : 'DISABLED'}`);
  saveDB(db);

  res.json(rule);
});

// 12. Audit Trail & Anomaly Alerts
app.get('/api/audit-trail', (_req: Request, res: Response) => {
  const db = getDB();
  res.json(db.auditTrail);
});
