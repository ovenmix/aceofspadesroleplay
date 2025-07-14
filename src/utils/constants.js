// Application constants and configuration

export const DEPARTMENTS = {
    KCSO: {
      name: 'King County Sheriff\'s Office',
      shortName: 'KCSO',
      banner: 'SERVING • PROTECTING • COMMUNITY',
      description: 'The King County Sheriff\'s Office is dedicated to maintaining law and order throughout King County with integrity, professionalism, and community partnership.',
      color: 'blue',
      subdivisions: [
        'Patrol Division',
        'Detective Division', 
        'Traffic Unit',
        'K-9 Unit',
        'SWAT Team'
      ]
    },
    MSP: {
      name: 'Maryland State Police',
      shortName: 'MSP',
      banner: 'EXCELLENCE • INTEGRITY • SERVICE',
      description: 'The Maryland State Police provides statewide law enforcement services with unwavering dedication to public safety and community trust.',
      color: 'indigo',
      subdivisions: [
        'Highway Patrol',
        'Criminal Investigation Division',
        'Aviation Unit',
        'Marine Unit'
      ]
    },
    MFD: {
      name: 'Montgomery Fire Department',
      shortName: 'MFD',
      banner: 'COURAGE • HONOR • DEDICATION',
      description: 'Montgomery Fire Department provides comprehensive emergency services including fire suppression, emergency medical care, and specialized rescue operations.',
      color: 'red',
      subdivisions: [
        'Fire Suppression',
        'Emergency Medical Services',
        'Hazmat Team',
        'Technical Rescue'
      ]
    }
  };
  
  export const BAN_DURATIONS = [
    { value: '1 hour', label: '1 Hour' },
    { value: '6 hours', label: '6 Hours' },
    { value: '1 day', label: '1 Day' },
    { value: '3 days', label: '3 Days' },
    { value: '7 days', label: '7 Days' },
    { value: '14 days', label: '14 Days' },
    { value: '30 days', label: '30 Days' },
    { value: 'permanent', label: 'Permanent' }
  ];
  
  export const MONEY_TYPES = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank' }
  ];
  
  export const MODERATION_ACTIONS = {
    WARN: 'warn',
    KICK: 'kick',
    BAN: 'ban'
  };
  
  export const TRUST_SCORE_COLORS = {
    HIGH: { min: 80, bg: 'bg-green-100', text: 'text-green-800' },
    MEDIUM: { min: 60, bg: 'bg-yellow-100', text: 'text-yellow-800' },
    LOW: { min: 0, bg: 'bg-red-100', text: 'text-red-800' }
  };
  
  export const DEFAULT_DOCUMENTS = {
    KCSO: [
      {
        title: 'Standard Operating Procedures',
        content: 'Comprehensive guidelines for daily operations and protocols for King County Sheriff\'s Office personnel.',
        lastUpdated: '2 days ago'
      },
      {
        title: 'Training Manual',
        content: 'Complete training protocols and procedures for new recruits and ongoing education.',
        lastUpdated: '1 week ago'
      },
      {
        title: 'Code of Conduct',
        content: 'Professional standards and behavioral expectations for all KCSO personnel.',
        lastUpdated: '3 weeks ago'
      },
      {
        title: 'Equipment Guidelines',
        content: 'Proper use and maintenance of department equipment and vehicles.',
        lastUpdated: '1 month ago'
      }
    ],
    MSP: [
      {
        title: 'Patrol Procedures',
        content: 'State-wide patrol guidelines and protocols for Maryland State Police operations.',
        lastUpdated: '1 day ago'
      },
      {
        title: 'Investigation Manual',
        content: 'Criminal investigation procedures and techniques for detectives and investigators.',
        lastUpdated: '5 days ago'
      },
      {
        title: 'Traffic Enforcement',
        content: 'Highway patrol and traffic enforcement guidelines for state troopers.',
        lastUpdated: '2 weeks ago'
      },
      {
        title: 'Emergency Response',
        content: 'Emergency situation response procedures and incident command protocols.',
        lastUpdated: '1 month ago'
      }
    ],
    MFD: [
      {
        title: 'Fire Suppression SOPs',
        content: 'Fire suppression tactics and safety procedures for emergency response.',
        lastUpdated: '3 days ago'
      },
      {
        title: 'EMS Protocols',
        content: 'Emergency medical service guidelines and patient care protocols.',
        lastUpdated: '1 week ago'
      },
      {
        title: 'Hazmat Procedures',
        content: 'Hazardous materials response and containment procedures.',
        lastUpdated: '2 weeks ago'
      },
      {
        title: 'Rescue Operations',
        content: 'Technical rescue and emergency response procedures for specialized situations.',
        lastUpdated: '3 weeks ago'
      }
    ]
  };
  
  export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      DISCORD: '/auth/discord',
      VERIFY: '/auth/verify',
      LOGOUT: '/auth/logout'
    },
    PLAYERS: {
      LIST: '/api/players',
      STATS: '/api/players/stats',
      MONEY: '/api/players/money'
    },
    MODERATION: {
      WARN: '/api/moderation/warn',
      KICK: '/api/moderation/kick',
      BAN: '/api/moderation/ban',
      HISTORY: '/api/moderation/history'
    },
    DEPARTMENTS: {
      LIST: '/api/departments',
      UPDATE: '/api/departments',
      COMMAND: '/api/departments/:dept/command',
      DOCUMENTS: '/api/departments/:dept/documents'
    },
    SETTINGS: {
      GET: '/api/settings',
      UPDATE: '/api/settings',
      BACKUP: '/api/system/backup',
      STATUS: '/api/system/status'
    }
  };