import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasAccess = (tab) => {
    if (!user) return false;

    const permissions = {
      'Dashboard': ['Director', 'Staff', 'KCSO', 'MSP', 'MFD', 'KCSO_Command', 'MSP_Command', 'MFD_Command', 'Civilian'],
      'Staff': ['Director', 'Staff'],
      'KCSO': ['Director', 'KCSO', 'KCSO_Command'],
      'MSP': ['Director', 'MSP', 'MSP_Command'],
      'MFD': ['Director', 'MFD', 'MFD_Command'],
      'Settings': ['Director']
    };

    return permissions[tab]?.includes(user.role) || false;
  };

  const canEdit = (tab) => {
    if (!user) return false;

    const editPermissions = {
      'KCSO': ['Director', 'KCSO_Command'],
      'MSP': ['Director', 'MSP_Command'],
      'MFD': ['Director', 'MFD_Command']
    };

    return editPermissions[tab]?.includes(user.role) || false;
  };

  const canModerate = () => {
    return user && ['Director', 'Staff'].includes(user.role);
  };

  const isCommand = () => {
    return user && (user.role.includes('Command') || user.role === 'Director');
  };

  const isDirector = () => {
    return user && user.role === 'Director';
  };

  return {
    hasAccess,
    canEdit,
    canModerate,
    isCommand,
    isDirector,
    userRole: user?.role || 'Civilian'
  };
};