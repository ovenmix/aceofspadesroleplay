// Permission checking utilities

export const ROLES = {
    DIRECTOR: 'Director',
    STAFF: 'Staff',
    KCSO_COMMAND: 'KCSO_Command',
    MSP_COMMAND: 'MSP_Command',
    MFD_COMMAND: 'MFD_Command',
    KCSO: 'KCSO',
    MSP: 'MSP',
    MFD: 'MFD',
    CIVILIAN: 'Civilian'
  };
  
  export const PERMISSIONS = {
    TABS: {
      Dashboard: [
        ROLES.DIRECTOR, 
        ROLES.STAFF, 
        ROLES.KCSO_COMMAND, 
        ROLES.MSP_COMMAND, 
        ROLES.MFD_COMMAND,
        ROLES.KCSO, 
        ROLES.MSP, 
        ROLES.MFD, 
        ROLES.CIVILIAN
      ],
      Staff: [
        ROLES.DIRECTOR, 
        ROLES.STAFF
      ],
      KCSO: [
        ROLES.DIRECTOR, 
        ROLES.KCSO_COMMAND, 
        ROLES.KCSO
      ],
      MSP: [
        ROLES.DIRECTOR, 
        ROLES.MSP_COMMAND, 
        ROLES.MSP
      ],
      MFD: [
        ROLES.DIRECTOR, 
        ROLES.MFD_COMMAND, 
        ROLES.MFD
      ],
      Settings: [
        ROLES.DIRECTOR
      ]
    },
    
    EDIT: {
      KCSO: [
        ROLES.DIRECTOR, 
        ROLES.KCSO_COMMAND
      ],
      MSP: [
        ROLES.DIRECTOR, 
        ROLES.MSP_COMMAND
      ],
      MFD: [
        ROLES.DIRECTOR, 
        ROLES.MFD_COMMAND
      ]
    },
  
    MODERATION: [
      ROLES.DIRECTOR, 
      ROLES.STAFF
    ]
  };
  
  export const checkPermission = (userRole, permissionType, resource = null) => {
    if (!userRole) return false;
  
    switch (permissionType) {
      case 'tab_access':
        return PERMISSIONS.TABS[resource]?.includes(userRole) || false;
      
      case 'edit':
        return PERMISSIONS.EDIT[resource]?.includes(userRole) || false;
      
      case 'moderation':
        return PERMISSIONS.MODERATION.includes(userRole);
      
      case 'is_command':
        return userRole.includes('Command') || userRole === ROLES.DIRECTOR;
      
      case 'is_director':
        return userRole === ROLES.DIRECTOR;
      
      default:
        return false;
    }
  };
  
  export const getRoleHierarchy = () => {
    return [
      ROLES.DIRECTOR,
      ROLES.STAFF,
      ROLES.KCSO_COMMAND,
      ROLES.MSP_COMMAND,
      ROLES.MFD_COMMAND,
      ROLES.KCSO,
      ROLES.MSP,
      ROLES.MFD,
      ROLES.CIVILIAN
    ];
  };
  
  export const getRolePriority = (role) => {
    const hierarchy = getRoleHierarchy();
    return hierarchy.indexOf(role);
  };
  
  export const hasHigherRole = (userRole, targetRole) => {
    return getRolePriority(userRole) < getRolePriority(targetRole);
  };