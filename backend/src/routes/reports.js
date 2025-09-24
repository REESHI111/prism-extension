const express = require('express');
const router = express.Router();

// Placeholder for user reporting endpoints
// Will be implemented in Phase 5

router.get('/', (req, res) => {
  res.json({
    message: 'User reporting endpoints - Coming in Phase 5',
    endpoints: [
      'POST /threat - Report a threat',
      'POST /false-positive - Report false positive',
      'GET /stats - Get reporting statistics'
    ]
  });
});

// Placeholder endpoint for threat reporting
router.post('/threat', (req, res) => {
  const { url, threatType, description } = req.body;
  
  if (!url || !threatType) {
    return res.status(400).json({
      error: 'URL and threat type are required'
    });
  }
  
  // Placeholder response
  res.json({
    id: Date.now().toString(),
    url,
    threatType,
    description,
    status: 'received',
    timestamp: new Date().toISOString(),
    message: 'Full reporting system coming in Phase 5'
  });
});

module.exports = router;