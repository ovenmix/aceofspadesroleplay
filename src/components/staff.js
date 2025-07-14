import React, { useState } from 'react';
import { AlertTriangle, Shield, Users, DollarSign, Clock, User, Ban, AlertCircle, Eye } from 'lucide-react';

const StaffPageUI = ({ 
  stats = {},
  recentActions = {},
  livePlayerList = [],
  onModerationAction,
  onAddMoney 
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
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

  return (
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
                {livePlayerList && livePlayerList.length > 0 ? (
                  livePlayerList.map((player) => (
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
  );
};

export default StaffPageUI;