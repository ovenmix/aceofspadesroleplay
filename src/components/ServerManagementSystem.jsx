import React, { useState } from 'react';
import { Users, Shield, Ban, AlertTriangle, AlertCircle, Clock, DollarSign, Search, Eye, Plus, TrendingUp, Activity, Crown, Skull, Target, Wifi, Heart, Coins, Award, FileText, UserPlus, Settings, LogOut, User } from 'lucide-react';

const ServerManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [modalType, setModalType] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to false to see login screen
  const [userRole, setUserRole] = useState('Director'); // Director, Staff, KCSO, MSP, MFD, Civilian
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [formData, setFormData] = useState({
    playerId: '',
    reason: '',
    duration: '',
    amount: '',
    moneyType: 'cash',
    commandName: '',
    commandRank: '',
    commandDiscord: ''
  });

  const tabs = ['Dashboard', 'Staff', 'KCSO', 'MSP', 'MFD', 'Settings'];

  // Permission system
  const hasAccess = (tab) => {
    const permissions = {
      'Dashboard': ['Director', 'Staff', 'KCSO', 'MSP', 'MFD', 'Civilian'],
      'Staff': ['Director', 'Staff'],
      'KCSO': ['Director', 'KCSO'],
      'MSP': ['Director', 'MSP'],
      'MFD': ['Director', 'MFD'],
      'Settings': ['Director']
    };
    return permissions[tab]?.includes(userRole) || false;
  };

  // Mock data
  const stats = {
    totalBans: 1247,
    totalKicks: 3891,
    totalWarns: 5634,
    activePlayers: 156
  };

  const playerStats = {
    mostHours: { name: 'VeteranPlayer92', hours: 2847, avatar: '🎮' },
    mostDeaths: { name: 'RecklessDriver', deaths: 1284, avatar: '💀' },
    mostKills: { name: 'TopCop_Jake', kills: 456, avatar: '🚔' },
    recentConnection: { name: 'NewPlayer2025', lastSeen: '2 minutes ago', avatar: '🆕' },
    mostDonated: { name: 'GenerousSupporter', amount: '$2,450', avatar: '💎' },
    richestPlayer: { name: 'BusinessTycoon', money: '$15,847,392', avatar: '💰' },
    mostRoles: { name: 'CommunityLeader', roles: 12, avatar: '👑' }
  };


    const [moderationForm, setModerationForm] = useState({
      playerId: '',
      reason: '',
      duration: '',
      action: 'warn'
    });
    const [moneyForm, setMoneyForm] = useState({
      playerId: '',
      amount: '',
      type: 'cash'
    });
  
    const handleModerationSubmit = (e) => {
      e.preventDefault();
      if (onModerationAction) {
        onModerationAction(moderationForm);
      }
      setModerationForm({ playerId: '', reason: '', duration: '', action: 'warn' });
    };
  
    const handleMoneySubmit = (e) => {
      e.preventDefault();
      if (onAddMoney) {
        onAddMoney(moneyForm);
      }
      setMoneyForm({ playerId: '', amount: '', type: 'cash' });
    };
  
    const getTrustScoreColor = (score) => {
      if (score >= 90) return 'text-green-400';
      if (score >= 70) return 'text-yellow-400';
      return 'text-red-400';
    };
  
    const handleQuickAction = (player, action) => {
      if (onModerationAction) {
        onModerationAction({
          playerId: player.id,
          action: action,
          reason: `Quick ${action} from live players panel`,
          duration: action === 'ban' ? '1 hour' : ''
        });
      }
    };


  const chainOfCommand = {
    KCSO: [
      { rank: 'Sheriff', name: 'John Smith', discord: 'JohnS#1234' },
      { rank: 'Undersheriff', name: 'Sarah Johnson', discord: 'SarahJ#5678' },
      { rank: 'Chief Deputy', name: 'Mike Wilson', discord: 'MikeW#9012' },
      { rank: 'Captain', name: 'Lisa Brown', discord: 'LisaB#3456' }
    ],
    MSP: [
      { rank: 'Colonel', name: 'Robert Davis', discord: 'RobertD#7890' },
      { rank: 'Lieutenant Colonel', name: 'Jennifer White', discord: 'JenW#2345' },
      { rank: 'Major', name: 'David Miller', discord: 'DavidM#6789' },
      { rank: 'Captain', name: 'Amanda Garcia', discord: 'AmandaG#0123' }
    ],
    MFD: [
      { rank: 'Fire Chief', name: 'Thomas Anderson', discord: 'TomA#4567' },
      { rank: 'Assistant Chief', name: 'Maria Rodriguez', discord: 'MariaR#8901' },
      { rank: 'Battalion Chief', name: 'Kevin Lee', discord: 'KevinL#2345' },
      { rank: 'Captain', name: 'Nicole Taylor', discord: 'NicoleT#6789' }
    ]
  };

  const departments = {
    KCSO: {
      name: 'King County Sheriff\'s Office',
      banner: '🚔 KCSO - Serving and Protecting King County',
      description: 'The King County Sheriff\'s Office is dedicated to maintaining law and order throughout King County.',
      subdivisions: ['Patrol Division', 'Detective Division', 'Traffic Unit', 'K-9 Unit', 'SWAT Team']
    },
    MSP: {
      name: 'Maryland State Police',
      banner: '🚨 MSP - Maryland State Police',
      description: 'The Maryland State Police provides statewide law enforcement services with professionalism and integrity.',
      subdivisions: ['Highway Patrol', 'Criminal Investigation Division', 'Aviation Unit', 'Marine Unit']
    },
    MFD: {
      name: 'Montgomery Fire Department',
      banner: '🚒 MFD - Montgomery Fire Department',
      description: 'Montgomery Fire Department provides fire suppression, emergency medical services, and rescue operations.',
      subdivisions: ['Fire Suppression', 'Emergency Medical Services', 'Hazmat Team', 'Technical Rescue']
    }
  };

  const recentActions = {
    bans: [
      { id: 1, player: 'PlayerName123', moderator: 'ModeratorAlex', reason: 'Cheating/Exploiting', duration: '7 days', time: '2 hours ago' },
      { id: 2, player: 'ToxicUser456', moderator: 'AdminSarah', reason: 'Harassment', duration: '3 days', time: '5 hours ago' },
      { id: 3, player: 'SpeedHacker789', moderator: 'ModeratorMike', reason: 'Speed hacking', duration: '14 days', time: '1 day ago' },
      { id: 4, player: 'RuleBreaker101', moderator: 'AdminJohn', reason: 'Multiple violations', duration: '30 days', time: '2 days ago' },
      { id: 5, player: 'Griefer555', moderator: 'ModeratorAlex', reason: 'Griefing', duration: '1 day', time: '3 days ago' }
    ],
    kicks: [
      { id: 1, player: 'PlayerABC', moderator: 'ModeratorAlex', reason: 'Mic spam', time: '30 minutes ago' },
      { id: 2, player: 'UserXYZ', moderator: 'AdminSarah', reason: 'Inappropriate language', time: '1 hour ago' },
      { id: 3, player: 'NewPlayer123', moderator: 'ModeratorMike', reason: 'Not following RP', time: '2 hours ago' },
      { id: 4, player: 'RandomUser456', moderator: 'AdminJohn', reason: 'Disturbing peace', time: '4 hours ago' },
      { id: 5, player: 'Player789', moderator: 'ModeratorAlex', reason: 'AFK in important role', time: '6 hours ago' }
    ],
    warns: [
      { id: 1, player: 'MinorOffender', moderator: 'ModeratorAlex', reason: 'Minor rule violation', time: '15 minutes ago' },
      { id: 2, player: 'NewbiePlayer', moderator: 'AdminSarah', reason: 'First time offense', time: '45 minutes ago' },
      { id: 3, player: 'RegularUser', moderator: 'ModeratorMike', reason: 'Improper vehicle usage', time: '1 hour ago' },
      { id: 4, player: 'CasualPlayer', moderator: 'AdminJohn', reason: 'Minor RP break', time: '2 hours ago' },
      { id: 5, player: 'SomeUser', moderator: 'ModeratorAlex', reason: 'Uniform violation', time: '3 hours ago' }
    ]
  };

  const livePlayers = [
    { id: 1, name: 'ActivePlayer1', discordId: '123456789', trustScore: 85, notes: 'Good player, follows rules', onlineTime: '2h 34m' },
    { id: 2, name: 'SuspiciousUser', discordId: '987654321', trustScore: 42, notes: 'Previous warnings for mic spam', onlineTime: '45m' },
    { id: 3, name: 'VeteranPlayer', discordId: '456789123', trustScore: 95, notes: 'Veteran player, very reliable', onlineTime: '4h 12m' },
    { id: 4, name: 'NewcomerUser', discordId: '789123456', trustScore: 70, notes: 'New player, learning the ropes', onlineTime: '1h 8m' },
    { id: 5, name: 'RegularMember', discordId: '321654987', trustScore: 78, notes: 'Regular player, occasional minor issues', onlineTime: '3h 22m' }
  ];

  const topOffenders = [
    { name: 'RepeatOffender1', bans: 5, kicks: 12, warns: 23 },
    { name: 'ProblemPlayer2', bans: 3, kicks: 8, warns: 19 },
    { name: 'TroubleUser3', bans: 4, kicks: 6, warns: 15 },
    { name: 'DifficultPlayer4', bans: 2, kicks: 9, warns: 14 },
    { name: 'IssueUser5', bans: 1, kicks: 11, warns: 13 }
  ];

  const handleSubmit = () => {
    console.log(`${modalType} action:`, formData);
    setModalType(null);
    setFormData({ playerId: '', reason: '', duration: '', amount: '', moneyType: 'cash', commandName: '', commandRank: '', commandDiscord: '' });
  };

  const handleAddCommand = () => {
    console.log('Adding command member:', formData);
    setShowAddCommand(false);
    setFormData({ playerId: '', reason: '', duration: '', amount: '', moneyType: 'cash', commandName: '', commandRank: '', commandDiscord: '' });
  };

  const handleLogin = (method) => {
    console.log(`Logging in with ${method}`);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('Dashboard');
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-96 max-w-90vw">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Server Management</h1>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={() => handleLogin('email')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <button
              onClick={() => handleLogin('discord')}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <span>🎮</span>
              <span>Sign in with Discord</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ActionModal = ({ type, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold capitalize">{type} Player</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Player ID (Discord ID or In-Game ID)</label>
            <input
              type="text"
              value={formData.playerId}
              onChange={(e) => setFormData({...formData, playerId: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          {type === 'ban' && (
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select duration</option>
                <option value="1 hour">1 Hour</option>
                <option value="6 hours">6 Hours</option>
                <option value="1 day">1 Day</option>
                <option value="3 days">3 Days</option>
                <option value="7 days">7 Days</option>
                <option value="14 days">14 Days</option>
                <option value="30 days">30 Days</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              {type === 'ban' ? 'Ban' : type === 'kick' ? 'Kick' : 'Warn'} Player
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const MoneyModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Add Money</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Player ID</label>
            <input
              type="text"
              value={formData.playerId}
              onChange={(e) => setFormData({...formData, playerId: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Money Type</label>
            <select
              value={formData.moneyType}
              onChange={(e) => setFormData({...formData, moneyType: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
            >
              Add Money
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AddCommandModal = ({ department, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Add Command Member</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.commandName}
              onChange={(e) => setFormData({...formData, commandName: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rank</label>
            <input
              type="text"
              value={formData.commandRank}
              onChange={(e) => setFormData({...formData, commandRank: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discord</label>
            <input
              type="text"
              value={formData.commandDiscord}
              onChange={(e) => setFormData({...formData, commandDiscord: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Username#1234"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddCommand}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Add Member
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              {tabs.filter(tab => hasAccess(tab)).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {userRole}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard */}
      {activeTab === 'Dashboard' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Server Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of server statistics and player information</p>
          </div>

          {/* Player Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Most Hours</p>
                  <p className="text-lg font-bold text-gray-900">{playerStats.mostHours.name}</p>
                  <p className="text-sm text-gray-500">{playerStats.mostHours.hours} hours</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Skull className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Most Deaths</p>
                  <p className="text-lg font-bold text-gray-900">{playerStats.mostDeaths.name}</p>
                  <p className="text-sm text-gray-500">{playerStats.mostDeaths.deaths} deaths</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Most Kills</p>
                  <p className="text-lg font-bold text-gray-900">{playerStats.mostKills.name}</p>
                  <p className="text-sm text-gray-500">{playerStats.mostKills.kills} kills</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Wifi className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Connection</p>
                  <p className="text-lg font-bold text-gray-900">{playerStats.recentConnection.name}</p>
                  <p className="text-sm text-gray-500">{playerStats.recentConnection.lastSeen}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-pink-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Donor</p>
                  <p className="text-lg font-bold text-gray-900">{playerStats.mostDonated.name}</p>
                  <p className="text-sm text-gray-500">{playerStats.mostDonated.amount} donated</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Coins className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Richest Player</p>
                  <p className="text-lg font-bold text-gray-900">{playerStats.richestPlayer.name}</p>
                  <p className="text-sm text-gray-500">{playerStats.richestPlayer.money}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Most Discord Roles</p>
                  <p className="text-lg font-bold text-gray-900">{playerStats.mostRoles.name}</p>
                  <p className="text-sm text-gray-500">{playerStats.mostRoles.roles} roles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Server Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBans}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Kicks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalKicks}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Warns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalWarns}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Players</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activePlayers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Page */}
      {activeTab === 'Staff' && hasAccess('Staff') && (
        <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Staff Management Dashboard</h1>
          
          {/* Main Grid Layout */}
          <div className="space-y-6">
            
            {/* Top Level - 2 sections: Moderation (1/2) and Stats (1/2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Moderation Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="text-blue-400" />
                  Player Moderation
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Player ID</label>
                    <input
                      type="text"
                      value={moderationForm.playerId}
                      onChange={(e) => setModerationForm({...moderationForm, playerId: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Discord/In-Game ID"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Action</label>
                    <select
                      value={moderationForm.action}
                      onChange={(e) => setModerationForm({...moderationForm, action: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="warn">Warn</option>
                      <option value="kick">Kick</option>
                      <option value="ban">Ban</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason</label>
                    <textarea
                      value={moderationForm.reason}
                      onChange={(e) => setModerationForm({...moderationForm, reason: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter reason"
                    />
                  </div>
                  
                  {moderationForm.action === 'ban' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <input
                        type="text"
                        value={moderationForm.duration}
                        onChange={(e) => setModerationForm({...moderationForm, duration: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleModerationSubmit}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Apply {moderationForm.action.toUpperCase()}
                  </button>
                </div>
              </div>
  
              {/* Stats Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="text-green-400" />
                  Statistics
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span>Total Bans</span>
                    <span className="text-xl font-bold text-red-400">{stats.totalBans || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span>Total Kicks</span>
                    <span className="text-xl font-bold text-yellow-400">{stats.totalKicks || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span>Total Warns</span>
                    <span className="text-xl font-bold text-orange-400">{stats.totalWarns || 0}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mt-6 mb-3 flex items-center gap-2">
                  <AlertTriangle className="text-red-400" />
                  Top Offenders
                </h3>
                <div className="space-y-2">
                  {stats.topOffenders && stats.topOffenders.length > 0 ? (
                    stats.topOffenders.map((player, index) => (
                      <div key={index} className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">{player.name}</span>
                          <span className="text-sm text-gray-400">#{index + 1}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="text-orange-400">W: {player.warns}</div>
                          <div className="text-yellow-400">K: {player.kicks}</div>
                          <div className="text-red-400">B: {player.bans}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-700 rounded-lg text-gray-400 text-center">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>
  
            {/* Second Level - Money (1/3) and Live Players (2/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Money Section - 1/3 width */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="text-green-400" />
                  Add Money
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Player ID</label>
                    <input
                      type="text"
                      value={moneyForm.playerId}
                      onChange={(e) => setMoneyForm({...moneyForm, playerId: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter Player ID"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={moneyForm.amount}
                      onChange={(e) => setMoneyForm({...moneyForm, amount: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Add to</label>
                    <select
                      value={moneyForm.type}
                      onChange={(e) => setMoneyForm({...moneyForm, type: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleMoneySubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Add ${moneyForm.amount || '0'} to {moneyForm.type}
                  </button>
                </div>
              </div>
  
              {/* Live Players - 2/3 width */}
              <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="text-blue-400" />
                  Live Server Players
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {livePlayers && livePlayers.length > 0 ? (
                    livePlayers.map((player) => (
                      <div key={player.id} className="p-4 bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{player.name}</h3>
                            <p className="text-xs text-gray-400">ID: {player.id}</p>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-sm ${getTrustScoreColor(player.trustScore)}`}>
                              {player.trustScore}%
                            </div>
                            <div className="text-green-400 text-xs">● Online</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 mb-3">{player.notes}</p>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => handleQuickAction(player, 'warn')}
                            className="bg-orange-600 hover:bg-orange-700 text-white py-1 px-2 rounded text-xs transition-colors"
                          >
                            Warn
                          </button>
                          <button
                            onClick={() => handleQuickAction(player, 'kick')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-2 rounded text-xs transition-colors"
                          >
                            Kick
                          </button>
                          <button
                            onClick={() => handleQuickAction(player, 'ban')}
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs transition-colors"
                          >
                            Ban
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 bg-gray-700 rounded-lg text-gray-400 text-center">
                      No players online
                    </div>
                  )}
                </div>
              </div>
            </div>
  
            {/* Third Level - Recent Actions (3 equal columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Bans */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Ban className="text-red-400" />
                  Last 5 Bans
                </h3>
                <div className="space-y-2">
                  {recentActions.bans && recentActions.bans.length > 0 ? (
                    recentActions.bans.slice(0, 5).map((ban, index) => (
                      <div key={index} className="p-3 bg-gray-700 rounded-lg">
                        <div className="font-semibold text-red-400 text-sm">{ban.player}</div>
                        <div className="text-xs text-gray-300">by {ban.moderator}</div>
                        <div className="text-xs text-gray-400">{ban.reason}</div>
                        <div className="text-xs text-gray-500">{ban.duration} • {ban.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-700 rounded-lg text-gray-400 text-center">
                      No recent bans
                    </div>
                  )}
                </div>
              </div>
  
              {/* Recent Kicks */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="text-yellow-400" />
                  Last 5 Kicks
                </h3>
                <div className="space-y-2">
                  {recentActions.kicks && recentActions.kicks.length > 0 ? (
                    recentActions.kicks.slice(0, 5).map((kick, index) => (
                      <div key={index} className="p-3 bg-gray-700 rounded-lg">
                        <div className="font-semibold text-yellow-400 text-sm">{kick.player}</div>
                        <div className="text-xs text-gray-300">by {kick.moderator}</div>
                        <div className="text-xs text-gray-400">{kick.reason}</div>
                        <div className="text-xs text-gray-500">{kick.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-700 rounded-lg text-gray-400 text-center">
                      No recent kicks
                    </div>
                  )}
                </div>
              </div>
  
              {/* Recent Warns */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-orange-400" />
                  Last 5 Warns
                </h3>
                <div className="space-y-2">
                  {recentActions.warns && recentActions.warns.length > 0 ? (
                    recentActions.warns.slice(0, 5).map((warn, index) => (
                      <div key={index} className="p-3 bg-gray-700 rounded-lg">
                        <div className="font-semibold text-orange-400 text-sm">{warn.player}</div>
                        <div className="text-xs text-gray-300">by {warn.moderator}</div>
                        <div className="text-xs text-gray-400">{warn.reason}</div>
                        <div className="text-xs text-gray-500">{warn.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-700 rounded-lg text-gray-400 text-center">
                      No recent warns
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Department Pages */}
      {(activeTab === 'KCSO' || activeTab === 'MSP' || activeTab === 'MFD') && hasAccess(activeTab) && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Department Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg shadow-lg mb-8 p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{departments[activeTab].banner}</h1>
            <p className="text-xl opacity-90">{departments[activeTab].description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chain of Command */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Chain of Command</h2>
                {userRole === 'Director' && (
                  <button
                    onClick={() => setShowAddCommand(true)}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Member</span>
                  </button>
                )}
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {chainOfCommand[activeTab].map((member, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-blue-600 font-medium">{member.rank}</p>
                        <p className="text-sm text-gray-500">{member.discord}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-bronze-400'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Subdivisions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Subdivisions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  {departments[activeTab].subdivisions.map((subdivision, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">{subdivision}</h3>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Department Documents and Applications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Department Documents */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Department Documents</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3" href="www.mauvehub.ca">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-900">Standard Operating Procedures</span>
                    </div>
                    <span className="text-sm text-gray-500">Updated 2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-500" />
                      <span className="text-gray-900">Training Manual</span>
                    </div>
                    <span className="text-sm text-gray-500">Updated 1 week ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <span className="text-gray-900">Code of Conduct</span>
                    </div>
                    <span className="text-sm text-gray-500">Updated 3 weeks ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-orange-500" />
                      <span className="text-gray-900">Equipment Guidelines</span>
                    </div>
                    <span className="text-sm text-gray-500">Updated 1 month ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subdivision Applications */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Subdivision Applications</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {departments[activeTab].subdivisions.map((subdivision, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">{subdivision}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Open
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Application for joining the {subdivision}. Review requirements and submit your application.
                      </p>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Page */}
      {activeTab === 'Settings' && hasAccess('Settings') && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600 mt-2">Server configuration and management settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Server Configuration */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Server Configuration</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Server Name</label>
                  <input
                    type="text"
                    defaultValue="RP Server Community"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Players</label>
                  <input
                    type="number"
                    defaultValue="200"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discord Guild ID</label>
                  <input
                    type="text"
                    defaultValue="123456789012345678"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Configuration
                </button>
              </div>
            </div>

            {/* Role Management */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Discord Role Mapping</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Director Role ID</label>
                  <input
                    type="text"
                    defaultValue="987654321098765432"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Staff Role ID</label>
                  <input
                    type="text"
                    defaultValue="876543210987654321"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KCSO Role ID</label>
                  <input
                    type="text"
                    defaultValue="765432109876543210"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MSP Role ID</label>
                  <input
                    type="text"
                    defaultValue="654321098765432109"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MFD Role ID</label>
                  <input
                    type="text"
                    defaultValue="543210987654321098"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Update Role Mapping
                </button>
              </div>
            </div>

            {/* Bot Configuration */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Discord Bot Configuration</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                  <input
                    type="text"
                    defaultValue="123456789012345678"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="botEnabled"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="botEnabled" className="text-sm font-medium text-gray-700">
                    Enable Discord Bot
                  </label>
                </div>
                <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Save Bot Configuration
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">System Status</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="text-gray-700">Database Connection</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Online</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="text-gray-700">Discord Bot Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Connected</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="text-gray-700">Game Server</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Running</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="text-gray-700">Last Backup</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                  Create Manual Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Denied */}
      {!hasAccess(activeTab) && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-500 mb-4">
              <Shield className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this section.</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalType && modalType !== 'money' && (
        <ActionModal type={modalType} onClose={() => setModalType(null)} />
      )}
      {modalType === 'money' && (
        <MoneyModal onClose={() => setModalType(null)} />
      )}
      {showAddCommand && (
        <AddCommandModal department={activeTab} onClose={() => setShowAddCommand(false)} />
      )}
    </div>
  );
};

export default ServerManagementSystem;