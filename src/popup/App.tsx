import React, { useState, useEffect } from 'react';

// SVG Icon Components
const ShieldIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const LockIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UnlockIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

const ChartIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const BlockIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="m4.9 4.9 14.2 14.2"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const SettingsIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const InfoIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const CookieIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="18" cy="6" r="1"/>
    <circle cx="6" cy="18" r="1"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// Main Component
interface PrivacyScore {
  domain: string;
  score: number;
  trackers: number;
  cookies: number;
  isHTTPS: boolean;
  timestamp: Date;
  blockedRequests: number;
  trackerCategories: string[];
}

interface BlockedTrackersData {
  trackers: string[];
  count: number;
  stats?: any;
}

interface CookieData {
  total: number;
  tracking: number;
  categories: { [key: string]: number };
}

const App: React.FC = () => {
  const [privacyScore, setPrivacyScore] = useState<PrivacyScore | null>(null);
  const [blockedTrackers, setBlockedTrackers] = useState<BlockedTrackersData>({ trackers: [], count: 0 });
  const [cookieData, setCookieData] = useState<CookieData>({ total: 0, tracking: 0, categories: {} });
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentTabData();
  }, []);

  const loadCurrentTabData = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url) {
          const domain = new URL(tab.url).hostname;
          setCurrentDomain(domain);

          const scoreResponse = await chrome.runtime.sendMessage({
            type: 'GET_PRIVACY_SCORE',
            domain: domain
          });

          if (scoreResponse.score) {
            setPrivacyScore(scoreResponse.score);
          }

          const trackersResponse = await chrome.runtime.sendMessage({
            type: 'GET_BLOCKED_TRACKERS'
          });

          if (trackersResponse) {
            setBlockedTrackers(trackersResponse);
          }

          const cookieResponse = await chrome.runtime.sendMessage({
            type: 'GET_COOKIE_ANALYSIS',
            domain: domain
          });

          if (cookieResponse) {
            setCookieData(cookieResponse);
          }
        }
      } else {
        setCurrentDomain('example.com');
        // Demo data for development
        setBlockedTrackers({ trackers: [], count: 12 });
        setCookieData({ total: 28, tracking: 8, categories: {} });
        setPrivacyScore({
          domain: 'example.com',
          score: 82,
          trackers: 12,
          cookies: 28,
          isHTTPS: true,
          timestamp: new Date(),
          blockedRequests: 12,
          trackerCategories: ['analytics', 'advertising', 'social']
        });
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhitelistDomain = async (domain: string) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage({
          type: 'WHITELIST_DOMAIN',
          domain: domain
        });
        console.log(`✅ Domain ${domain} added to whitelist`);
      }
    } catch (error) {
      console.error('Error whitelisting domain:', error);
    }
  };

  const handleBlockDomain = async (domain: string) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage({
          type: 'BLOCK_DOMAIN',
          domain: domain
        });
        console.log(`🚫 Domain ${domain} added to blocklist`);
      }
    } catch (error) {
      console.error('Error blocking domain:', error);
    }
  };

  const openFullDashboard = () => {
    console.log('📊 Opening full dashboard...');
  };

  const showPrivacyTips = () => {
    console.log('💡 Showing privacy tips...');
  };

  const openSettings = () => {
    console.log('⚙️ Opening settings...');
  };

  const getScoreClass = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  };

  const getProgressWidth = (value: number, max: number): number => {
    return Math.min((value / max) * 100, 100);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f4f6', 
          borderTop: '4px solid #3b82f6', 
          borderRadius: '50%',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Analyzing privacy...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      {/* Header */}
      <div className="card-header">
        <div className="header">
          <div className="logo">
            <div className="logo-icon">
              <ShieldIcon />
            </div>
            <div className="logo-text">
              <h1>PRISM</h1>
              <p>Privacy Guardian</p>
            </div>
          </div>
          <div className="status-badge">
            <span className="status-dot active"></span>
            ACTIVE
          </div>
        </div>
      </div>

      {/* Current Domain */}
      <div className="card">
        <div className="domain-info">
          <div className="domain-name">{currentDomain}</div>
          <div className="domain-status">
            <span className="status-dot active"></span>
            Real-time protection enabled
          </div>
        </div>
      </div>

      {/* Privacy Score */}
      {privacyScore && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            Privacy Score
          </h3>
          
          <div className={`score-circle ${getScoreClass(privacyScore.score)}`}>
            <span className="score-text">{privacyScore.score}</span>
          </div>
          
          <p style={{ 
            margin: '0 0 20px 0', 
            fontSize: '14px', 
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {privacyScore.score >= 80 ? 'Excellent Protection' : 
             privacyScore.score >= 60 ? 'Good Protection' : 'Needs Attention'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <EyeOffIcon />
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginTop: '8px' }}>
                {privacyScore.trackers}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                TRACKERS
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <CookieIcon />
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginTop: '8px' }}>
                {privacyScore.cookies}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                COOKIES
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              {privacyScore.isHTTPS ? <LockIcon /> : <UnlockIcon />}
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: privacyScore.isHTTPS ? '#10b981' : '#ef4444',
                marginTop: '8px'
              }}>
                {privacyScore.isHTTPS ? 'YES' : 'NO'}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                HTTPS
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ef4444' }}>{blockedTrackers.count}</div>
          <div className="stat-label">Trackers Blocked</div>
          <div className="progress-bar">
            <div 
              className="progress-fill danger" 
              style={{ width: `${getProgressWidth(blockedTrackers.count, 50)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#f59e0b' }}>{cookieData.tracking}</div>
          <div className="stat-label">Tracking Cookies</div>
          <div className="progress-bar">
            <div 
              className="progress-fill warning" 
              style={{ width: `${getProgressWidth(cookieData.tracking, 20)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#6b7280' }}>{cookieData.total}</div>
          <div className="stat-label">Total Cookies</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressWidth(cookieData.total, 50)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#10b981' }}>{cookieData.total - cookieData.tracking}</div>
          <div className="stat-label">Safe Cookies</div>
          <div className="progress-bar">
            <div 
              className="progress-fill success" 
              style={{ width: `${getProgressWidth(cookieData.total - cookieData.tracking, 30)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Domain Actions */}
      <div className="card">
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldIcon />
          Domain Actions
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button 
            className="btn btn-success"
            onClick={() => handleWhitelistDomain(currentDomain)}
          >
            <CheckIcon />
            Trust Site
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => handleBlockDomain(currentDomain)}
          >
            <BlockIcon />
            Block Site
          </button>
        </div>
      </div>

      {/* Privacy Insights */}
      {privacyScore && (
        <div className="card">
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <InfoIcon />
            Privacy Insights
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                Privacy Level
              </span>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600',
                color: privacyScore.score >= 80 ? '#10b981' : 
                       privacyScore.score >= 60 ? '#f59e0b' : '#ef4444'
              }}>
                {privacyScore.score >= 80 ? 'Excellent' : 
                 privacyScore.score >= 60 ? 'Good' : 'Needs Work'}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                Threat Categories
              </span>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '600',
                background: '#3b82f6',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                {privacyScore.trackerCategories.length}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                Protection Status
              </span>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span className="status-dot active"></span>
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <SettingsIcon />
          Quick Actions
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className="btn"
            onClick={() => openFullDashboard()}
            style={{ justifyContent: 'flex-start', textAlign: 'left' }}
          >
            <ChartIcon />
            <div>
              <div style={{ fontWeight: '500', fontSize: '13px' }}>Detailed Statistics</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>View comprehensive analytics</div>
            </div>
          </button>
          
          <button 
            className="btn"
            onClick={() => showPrivacyTips()}
            style={{ justifyContent: 'flex-start', textAlign: 'left' }}
          >
            <InfoIcon />
            <div>
              <div style={{ fontWeight: '500', fontSize: '13px' }}>Privacy Tips</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Learn protection strategies</div>
            </div>
          </button>
          
          <button 
            className="btn"
            onClick={() => openSettings()}
            style={{ justifyContent: 'flex-start', textAlign: 'left' }}
          >
            <SettingsIcon />
            <div>
              <div style={{ fontWeight: '500', fontSize: '13px' }}>Settings</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Customize your protection</div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        marginTop: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px',
          marginBottom: '4px'
        }}>
          <span className="status-dot active"></span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
            PRISM v2.0.0
          </span>
          <span className="status-dot active"></span>
        </div>
        <p style={{ 
          fontSize: '11px', 
          color: '#6b7280', 
          margin: '0',
          fontWeight: '500'
        }}>
          Privacy First • Always Protected
        </p>
      </div>
    </div>
  );
};

export default App;
