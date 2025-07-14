// Discord OAuth2 and role management utilities

export const discordAuth = {
    // Redirect to Discord OAuth
    login: () => {
      const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/discord/callback`);
      const scope = encodeURIComponent('identify guilds.members.read');
      
      const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
      
      window.location.href = discordAuthUrl;
    },
  
    // Handle Discord callback (called from backend)
    handleCallback: async (code) => {
      try {
        const response = await fetch('/auth/discord/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('token', data.token);
          return { success: true, user: data.user };
        }
        
        return { success: false, error: data.error };
      } catch (error) {
        return { success: false, error: 'Discord authentication failed' };
      }
    }
  };
  
  export const roleUtils = {
    // Map Discord roles to internal roles
    mapDiscordRole: (discordRoles) => {
      const roleMap = {
        [process.env.REACT_APP_DIRECTOR_ROLE_ID]: 'Director',
        [process.env.REACT_APP_STAFF_ROLE_ID]: 'Staff',
        [process.env.REACT_APP_KCSO_COMMAND_ROLE_ID]: 'KCSO_Command',
        [process.env.REACT_APP_KCSO_ROLE_ID]: 'KCSO',
        [process.env.REACT_APP_MSP_COMMAND_ROLE_ID]: 'MSP_Command',
        [process.env.REACT_APP_MSP_ROLE_ID]: 'MSP',
        [process.env.REACT_APP_MFD_COMMAND_ROLE_ID]: 'MFD_Command',
        [process.env.REACT_APP_MFD_ROLE_ID]: 'MFD'
      };
  
      // Find highest priority role
      const rolePriority = [
        'Director',
        'Staff',
        'KCSO_Command',
        'MSP_Command', 
        'MFD_Command',
        'KCSO',
        'MSP',
        'MFD'
      ];
  
      for (const role of discordRoles) {
        const mappedRole = roleMap[role.id];
        if (mappedRole) {
          return mappedRole;
        }
      }
  
      return 'Civilian'; // Default role
    },
  
    // Get role display info
    getRoleInfo: (role) => {
      const roleInfo = {
        'Director': { 
          color: 'from-red-500 to-red-600', 
          badge: '👑', 
          label: 'Director' 
        },
        'Staff': { 
          color: 'from-purple-500 to-purple-600', 
          badge: '⚡', 
          label: 'Staff' 
        },
        'KCSO_Command': { 
          color: 'from-blue-500 to-blue-600', 
          badge: '🛡️', 
          label: 'KCSO Command' 
        },
        'MSP_Command': { 
          color: 'from-indigo-500 to-indigo-600', 
          badge: '🚔', 
          label: 'MSP Command' 
        },
        'MFD_Command': { 
          color: 'from-red-500 to-orange-500', 
          badge: '🚒', 
          label: 'MFD Command' 
        },
        'KCSO': { 
          color: 'from-blue-400 to-blue-500', 
          badge: '👮', 
          label: 'KCSO Officer' 
        },
        'MSP': { 
          color: 'from-indigo-400 to-indigo-500', 
          badge: '🚨', 
          label: 'MSP Trooper' 
        },
        'MFD': { 
          color: 'from-red-400 to-orange-400', 
          badge: '🚑', 
          label: 'MFD Firefighter' 
        },
        'Civilian': { 
          color: 'from-gray-400 to-gray-500', 
          badge: '👤', 
          label: 'Civilian' 
        }
      };
  
      return roleInfo[role] || roleInfo['Civilian'];
    }
  };