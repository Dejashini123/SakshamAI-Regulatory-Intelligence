    generatedAt: new Date().toISOString(),
    regulatoryStatement: 'LEGAL DISCLAIMER: This document represents an AI-assisted preliminary regulatory decision-support assessment and does NOT constitute final statutory approval or rejection. Final administrative decisions rest exclusively with the AICTE Executive Committee.',
    application: {
      id: app.applicationId,
      name: app.institutionName,
      pid: app.institutionIdentifier,
      category: app.category,
      academicYear: app.academicYear,
      status: app.status,
      submissionDate: app.submissionDate,
      approvedIntake: app.approvedIntake,
      requestedIntake: app.requestedIntake,
      programmes: app.programmesList
    },
    documentsSummary: app.documents.map(d => ({
      originalName: d.originalName,
      category: d.docCategory,
      sha256: d.sha256Hash,
      fieldsCount: d.extractedFields.length,
      digitalSignatureStatus: d.digitalSignatureStatus
    })),
    validationScore: app.preliminaryScore,
    findings: app.findings,
    authenticationRecords: auths,
    anomalyAlerts: anomalies,
    reviewerNotes: app.reviewerNotes,
    assessingOfficer: db.activeRole
  };

  res.json(report);
});

// CSV Export
app.get('/api/reports/export/csv', (_req: Request, res: Response) => {
  const db = getDB();
  const headers = [
    'Application ID',
    'Institution Name',
    'PID',
    'Category',
    'Academic Year',
    'Status',
    'Approved Intake',
    'Requested Intake',
    'Deficiencies',
    'Warnings',
    'Last Validated'
  ];

  const rows = db.applications.map(a => [
    `"${a.applicationId}"`,
    `"${a.institutionName.replace(/"/g, '""')}"`,
    `"${a.institutionIdentifier}"`,
    `"${a.category}"`,
    `"${a.academicYear}"`,
    `"${a.status}"`,
    a.approvedIntake,
    a.requestedIntake,
    a.preliminaryScore?.deficiencies || 0,
    a.preliminaryScore?.warnings || 0,
    `"${a.lastValidatedAt || 'N/A'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="AICTE_Applications_Summary.csv"');
  res.send(csvContent);
});

// 15. Demo Reset & Test Scenario Loader
app.post('/api/demo/reset', (_req: Request, res: Response) => {
  const freshData = seedDatabase();
  saveDB(freshData);
  res.json({ success: true, message: 'Database reset to initial demonstration state with 5 synthetic test institutions.' });
});

// Explicit API 404 handler (ensures unknown API routes return JSON 404 instead of falling back to HTML)
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

// Serve asset images statically in both dev and production
app.use('/src/assets/images', express.static(path.resolve(process.cwd(), 'src/assets/images')));

// Mount Vite (dev) or dist static files (production)
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distIndexExists = fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.html'));

  if (isProduction || distIndexExists) {
    const distPath = path.resolve(process.cwd(), 'dist');
    console.log(`Serving production frontend from ${distPath}`);
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('Mounting Vite dev middleware');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AICTE SAKSHAM Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
