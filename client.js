// client.js - Client-side authentication and dashboard management
let currentUser = null;
let userRoles = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

async function initializeApp() {
    // Check URL parameters for auth status
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    
    if (authStatus) {
        handleAuthCallback(authStatus, urlParams.get('message'));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Load user session if exists
    await loadUserSession();
    
    // Show home page by default
    showPage('home');
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleEmailLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleEmailRegister);
    }
    
    // Close modals when clicking outside
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.auth-modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

async function loadUserSession() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const user = await response.json();
            setCurrentUser(user);
        }
    } catch (error) {
        console.log('No active session');
    }
}

function handleAuthCallback(status, message) {
    let alertMessage = '';
    let alertType = 'info';
    
    switch(status) {
        case 'success':
            alertMessage = 'Successfully logged in with Discord!';
            alertType = 'success';
            break;
        case 'linked':
            alertMessage = 'Discord account linked successfully!';
            alertType = 'success';
            break;
        case 'error':
            alertMessage = `Authentication failed: ${message || 'Unknown error'}`;
            alertType = 'error';
            break;
    }
    
    if (alertMessage) {
        showAlert(alertMessage, alertType);
    }
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `auth-alert ${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 2001;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

async function handleEmailLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Login successful!', 'success');
            closeModal('loginModal');
            await loadUserSession();
            showPage('dashboard');
        } else {
            showAlert(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showAlert('Network error occurred', 'error');
    }
}

async function handleEmailRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!email || !username || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Account created successfully! Please log in.', 'success');
            switchModal('registerModal', 'loginModal');
            // Pre-fill login form
            document.getElementById('loginEmail').value = email;
        } else {
            showAlert(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showAlert('Network error occurred', 'error');
    }
}

function loginWithDiscord() {
    window.location.href = '/auth/discord';
}

function setCurrentUser(user) {
    currentUser = user;
    userRoles = user.roles || [];
    
    // Update UI
    document.getElementById('authLinks').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('welcomeMessage').textContent = `Welcome, ${user.username}!`;
    
    document.getElementById('mainAuthLinks').classList.add('hidden');
    document.getElementById('mainUserInfo').classList.remove('hidden');
    document.getElementById('mainWelcomeMessage').textContent = `Welcome, ${user.username}!`;
    
    // Set avatar
    const avatars = document.querySelectorAll('#userAvatar, #mainUserAvatar');
    avatars.forEach(avatar => {
        avatar.src = user.avatar || '/images/default-avatar.png';
    });
    
    updateTabVisibility();
    updateDashboardContent();
}

function updateTabVisibility() {
    if (!currentUser) return;
    
    const staffTab = document.getElementById('staffTab');
    const kcsoTab = document.getElementById('kcsoTab');
    const mspTab = document.getElementById('mspTab');
    const mfdTab = document.getElementById('mfdTab');
    const settingsTab = document.getElementById('settingsTab');

    // Hide all restricted tabs by default
    [staffTab, kcsoTab, mspTab, mfdTab, settingsTab].forEach(tab => {
        if (tab) tab.style.display = 'none';
    });

    // Show tabs based on roles
    if (hasPermission('Staff')) {
        if (staffTab) staffTab.style.display = 'block';
    }

    if (hasPermission('KCSO Member') || hasPermission('Admin') || hasPermission('Server Director')) {
        if (kcsoTab) kcsoTab.style.display = 'block';
    }

    if (hasPermission('MSP Member') || hasPermission('Admin') || hasPermission('Server Director')) {
        if (mspTab) mspTab.style.display = 'block';
    }

    if (hasPermission('MFD Member') || hasPermission('Admin') || hasPermission('Server Director')) {
        if (mfdTab) mfdTab.style.display = 'block';
    }

    if (hasPermission('Admin') || hasPermission('Server Director')) {
        if (settingsTab) settingsTab.style.display = 'block';
    }
}

async function updateDashboardContent() {
    if (!currentUser) return;
    
    // Update account info
    document.getElementById('profileUsername').textContent = currentUser.username || '-';
    document.getElementById('profileEmail').textContent = currentUser.email || 'Discord Only';
    document.getElementById('profileRoles').textContent = userRoles.join(', ') || 'User';
    document.getElementById('profileLastLogin').textContent = currentUser.lastLogin 
        ? new Date(currentUser.lastLogin).toLocaleString() 
        : 'Never';
    
    // Update Discord status
    if (currentUser.discordId) {
        document.getElementById('discordStatusText').textContent = 'Connected';
        document.getElementById('discordStatusText').style.color = '#4caf50';
        document.getElementById('discordUsername').textContent = currentUser.discordUsername || 'Unknown';
        document.getElementById('discordActionBtn').textContent = 'Unlink Discord';
        document.getElementById('discordActionBtn').className = 'action-btn ban-btn';
        document.getElementById('discordActionBtn').onclick = unlinkDiscord;
    } else {
        document.getElementById('discordStatusText').textContent = 'Not Connected';
        document.getElementById('discordStatusText').style.color = '#f44336';
        document.getElementById('discordUsername').textContent = '-';
        document.getElementById('discordActionBtn').textContent = 'Link Discord';
        document.getElementById('discordActionBtn').className = 'action-btn link-btn';
        document.getElementById('discordActionBtn').onclick = linkDiscord;
    }
    
    // Load server stats
    await loadServerStats();
    
    // Load department content
    await loadDepartmentContent();
    
    // Load admin content if applicable
    if (hasPermission('Admin')) {
        await loadAdminContent();
    }
}

async function loadServerStats() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            const stats = await response.json();
            
            document.getElementById('stat-total-playtime').textContent = stats.totalUsers || '0';
            document.querySelector('#stat-total-playtime').nextElementSibling.textContent = 'Total Users';
            
            // You can add more real stats here as your server grows
            document.getElementById('stat-online-now').textContent = '0'; // Would need real-time tracking
            document.getElementById('stat-total-deaths').textContent = stats.discordLinked || '0';
            document.querySelector('#stat-total-deaths').nextElementSibling.textContent = 'Discord Linked';
            document.getElementById('stat-total-arrests').textContent = stats.staffCount || '0';
            document.querySelector('#stat-total-arrests').nextElementSibling.textContent = 'Staff Members';
        }
    } catch (error) {
        console.error('Failed to load server stats:', error);
    }
}

async function loadDepartmentContent() {
    const departments = ['kcso', 'msp', 'mfd'];
    
    for (const dept of departments) {
        if (hasPermission(`${dept.toUpperCase()} Member`) || hasPermission('Admin') || hasPermission('Server Director')) {
            try {
                const response = await fetch(`/api/department/${dept}/members`);
                if (response.ok) {
                    const members = await response.json();
                    displayDepartmentMembers(dept, members);
                }
            } catch (error) {
                console.error(`Failed to load ${dept} members:`, error);
            }
        }
    }
}

function displayDepartmentMembers(dept, members) {
    const contentElement = document.getElementById(`${dept}-content`);
    if (!contentElement) return;
    
    if (members.length === 0) {
        contentElement.innerHTML = `
            <div class="empty-content">
                <h3>👥 No Department Members</h3>
                <p>No members found for this department yet.</p>
            </div>
        `;
        return;
    }
    
    const membersHTML = members.map(member => `
        <div class="member-card">
            <img src="${member.avatar}" alt="Avatar" class="member-avatar">
            <div>
                <h4 style="color: #e9e9e9;">${member.username}</h4>
                <p style="color: #666;">${member.roles.join(', ')} • ${member.discordUsername}</p>
                <p style="color: #666; font-size: 0.8em;">Last seen: ${member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}</p>
            </div>
        </div>
    `).join('');
    
    contentElement.innerHTML = `
        <div class="coc-section">
            <h3 style="color: #a61000; margin-bottom: 20px;">👥 Department Members (${members.length})</h3>
            ${membersHTML}
        </div>
    `;
}

async function loadAdminContent() {
    try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
            const users = await response.json();
            displayUserManagement(users);
        }
    } catch (error) {
        console.error('Failed to load admin content:', error);
    }
}

function displayUserManagement(users) {
    const settingsContent = document.getElementById('settings-content');
    if (!settingsContent) return;
    
    const usersHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.discordUsername}</td>
            <td><span class="role-badges">${user.roles.map(role => `<span class="role-badge">${role}</span>`).join('')}</span></td>
            <td>${user.lastLogin !== 'Never' ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
            <td>${user.status}</td>
            <td>
                ${user.id !== 0 ? `
                    <button class="action-btn edit-btn" onclick="editUserRoles(${user.id}, '${user.username}', ${JSON.stringify(user.roles).replace(/"/g, '&quot;')})">Edit Roles</button>
                    <button class="action-btn ban-btn" onclick="deleteUser(${user.id}, '${user.username}')">Delete</button>
                ` : '<span style="color: #666;">Owner</span>'}
            </td>
        </tr>
    `).join('');
    
    settingsContent.innerHTML = `
        <h3 style="color: #a61000; margin-bottom: 20px;">👥 User Management (${users.length} users)</h3>
        <div style="overflow-x: auto;">
            <table class="settings-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Discord</th>
                        <th>Roles</th>
                        <th>Last Login</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${usersHTML}
                </tbody>
            </table>
        </div>
        
        <style>
            .role-badges { display: flex; gap: 5px; flex-wrap: wrap; }
            .role-badge { 
                background: #a61000; 
                color: white; 
                padding: 2px 6px; 
                border-radius: 3px; 
                font-size: 0.7em; 
            }
        </style>
    `;
}

function editUserRoles(userId, username, currentRoles) {
    const availableRoles = ['User', 'Staff', 'Admin', 'Server Director', 'KCSO Member', 'KCSO Command', 'MSP Member', 'MSP Command', 'MFD Member', 'MFD Command'];
    
    const checkboxes = availableRoles.map(role => `
        <label style="display: block; margin: 10px 0; color: #e9e9e9;">
            <input type="checkbox" value="${role}" ${currentRoles.includes(role) ? 'checked' : ''}> ${role}
        </label>
    `).join('');
    
    const modalHTML = `
        <div id="roleEditModal" class="auth-modal" style="display: block;">
            <div class="auth-modal-content">
                <span class="close" onclick="document.getElementById('roleEditModal').remove()">&times;</span>
                <h2 style="color: #a61000; margin-bottom: 20px;">Edit Roles - ${username}</h2>
                <form id="roleEditForm">
                    ${checkboxes}
                    <button type="submit" class="auth-button" style="margin-top: 20px;">Update Roles</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('roleEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const checkboxes = e.target.querySelectorAll('input[type="checkbox"]:checked');
        const selectedRoles = Array.from(checkboxes).map(cb => cb.value);
        
        try {
            const response = await fetch(`/api/admin/users/${userId}/roles`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roles: selectedRoles })
            });
            
            if (response.ok) {
                showAlert(`Roles updated for ${username}`, 'success');
                document.getElementById('roleEditModal').remove();
                loadAdminContent(); // Refresh the user list
            } else {
                const data = await response.json();
                showAlert(data.error || 'Failed to update roles', 'error');
            }
        } catch (error) {
            showAlert('Network error occurred', 'error');
        }
    });
}

async function deleteUser(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert(`User ${username} deleted successfully`, 'success');
            loadAdminContent(); // Refresh the user list
        } else {
            const data = await response.json();
            showAlert(data.error || 'Failed to delete user', 'error');
        }
    } catch (error) {
        showAlert('Network error occurred', 'error');
    }
}

function linkDiscord() {
    window.location.href = '/auth/discord';
}

async function unlinkDiscord() {
    if (!confirm('Are you sure you want to unlink your Discord account? You may lose some permissions.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/account/unlink-discord', {
            method: 'POST'
        });
        
        if (response.ok) {
            showAlert('Discord account unlinked successfully', 'success');
            await loadUserSession(); // Refresh user data
        } else {
            const data = await response.json();
            showAlert(data.error || 'Failed to unlink Discord', 'error');
        }
    } catch (error) {
        showAlert('Network error occurred', 'error');
    }
}

function hasPermission(permission) {
    return userRoles.includes(permission);
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            currentUser = null;
            userRoles = [];
            
            // Update UI
            document.getElementById('authLinks').classList.remove('hidden');
            document.getElementById('userInfo').classList.add('hidden');
            document.getElementById('mainAuthLinks').classList.remove('hidden');
            document.getElementById('mainUserInfo').classList.add('hidden');
            
            showAlert('Logged out successfully', 'success');
            showPage('home');
        } else {
            showAlert('Logout failed', 'error');
        }
    } catch (error) {
        showAlert('Network error occurred', 'error');
    }
}

// Navigation functions (Make sure these are in global scope)
window.showPage = function(pageId) {
    console.log('Showing page:', pageId); // Debug log
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        console.log('Page shown:', pageId); // Debug log
    } else {
        console.error('Page not found:', pageId + '-page'); // Debug log
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
};

window.openDashboard = function() {
    console.log('Opening dashboard, current user:', currentUser); // Debug log
    if (!currentUser) {
        openModal('loginModal');
    } else {
        showPage('dashboard');
    }
};

window.openModal = function(modalId) {
    console.log('Opening modal:', modalId); // Debug log
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
};

window.closeModal = function(modalId) {
    console.log('Closing modal:', modalId); // Debug log
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
};

window.switchModal = function(fromModal, toModal) {
    closeModal(fromModal);
    openModal(toModal);
};

window.showDashboardTab = function(tabName) {
    console.log('Showing dashboard tab:', tabName); // Debug log
    
    // Remove active class from all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Hide all tab contents
    document.querySelectorAll('.dashboard-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab content
    const tabContent = document.getElementById(tabName + '-tab');
    if (tabContent) {
        tabContent.classList.remove('hidden');
    }
    
    // Load content for specific tabs
    if (tabName === 'dashboard' && currentUser) {
        loadServerStats();
    }
};

window.loginWithDiscord = function() {
    console.log('Redirecting to Discord OAuth'); // Debug log
    window.location.href = '/auth/discord';
};

window.logout = function() {
    console.log('Logging out'); // Debug log
    logout();
};

window.linkDiscord = function() {
    console.log('Linking Discord account'); // Debug log
    window.location.href = '/auth/discord';
};

window.unlinkDiscord = function() {
    console.log('Unlinking Discord account'); // Debug log
    unlinkDiscord();
};

// Add parallax effect to banner
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const banner = document.querySelector('.banner');
    if (banner) {
        banner.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading states
function showLoading(element) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <div style="font-size: 2em; margin-bottom: 10px;">🔄</div>
                <div>Loading...</div>
            </div>
        `;
    }
}

function showError(element, message) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #f44336;">
                <div style="font-size: 2em; margin-bottom: 10px;">❌</div>
                <div>${message}</div>
            </div>
        `;
    }
}

// Enhanced error handling for fetch requests
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            if (response.status === 401) {
                // User session expired
                currentUser = null;
                userRoles = [];
                showAlert('Session expired. Please log in again.', 'error');
                showPage('home');
                return null;
            } else if (response.status === 403) {
                showAlert('Access denied. Insufficient permissions.', 'error');
                return null;
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        showAlert(error.message || 'Network error occurred', 'error');
        return null;
    }
}

// Real-time features (if you want to add them later)
function initializeRealTimeFeatures() {
    // You can add WebSocket connection here for real-time updates
    // For example: online user count, live notifications, etc.
    console.log('Real-time features can be added here');
}

// Call this when the app initializes
// initializeRealTimeFeatures();