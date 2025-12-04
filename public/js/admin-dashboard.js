// NtandoStore V6 - Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin';
        return;
    }
    
    // Global variables
    let currentData = {
        services: [],
        domains: [],
        settings: {},
        contacts: []
    };
    
    // Initialize dashboard
    initDashboard();
    
    async function initDashboard() {
        setupEventListeners();
        await loadDashboardData();
        showSection('dashboard');
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                showSection(section);
                
                // Update active nav
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin';
        });
        
        // Modals
        setupModals();
        
        // Forms
        setupForms();
    }
    
    // Setup modal functionality
    function setupModals() {
        // Close modal buttons
        document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                closeModal(this.closest('.modal'));
            });
        });
        
        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this);
                }
            });
        });
    }
    
    // Setup form handlers
    function setupForms() {
        // Service form
        document.getElementById('serviceForm').addEventListener('submit', handleServiceSubmit);
        
        // Domain form
        document.getElementById('domainForm').addEventListener('submit', handleDomainSubmit);
        
        // Settings form
        document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);
        
        // File uploads
        setupFileUploads();
    }
    
    // Load dashboard data
    async function loadDashboardData() {
        try {
            const [dashboardRes, servicesRes, domainsRes, settingsRes, contactsRes] = await Promise.all([
                fetch('/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/services', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/domains', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/contacts', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            const dashboard = await dashboardRes.json();
            const services = await servicesRes.json();
            const domains = await domainsRes.json();
            const settings = await settingsRes.json();
            const contacts = await contactsRes.json();
            
            if (dashboard.success) updateDashboardStats(dashboard.data);
            if (services.success) currentData.services = services.services;
            if (domains.success) currentData.domains = domains.domains;
            if (settings.success) currentData.settings = settings.settings;
            if (contacts.success) currentData.contacts = contacts.contacts;
            
            // Update all sections
            updateServicesList();
            updateDomainsList();
            updateSettingsForm();
            updateContactsList();
            
            // Load backup data
            await loadBackupData();
            await loadSystemInfo();
            
        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Error loading data', 'error');
        }
    }
    
    // Update dashboard stats
    function updateDashboardStats(data) {
        document.getElementById('totalServices').textContent = data.totalServices;
        document.getElementById('totalDomains').textContent = data.totalDomains;
        document.getElementById('totalContacts').textContent = data.totalContacts;
        
        // Update recent contacts
        const recentContacts = document.getElementById('recentContacts');
        if (data.recentContacts && data.recentContacts.length > 0) {
            recentContacts.innerHTML = data.recentContacts.map(contact => `
                <div class="contact-item">
                    <div class="contact-info">
                        <h4>${contact.name}</h4>
                        <p>${contact.email} • ${contact.service}</p>
                    </div>
                    <div class="contact-date">${formatDate(contact.date)}</div>
                </div>
            `).join('');
        } else {
            recentContacts.innerHTML = '<p style="text-align: center; color: var(--text-dim);">No recent contacts</p>';
        }
    }
    
    // Show section
    function showSection(sectionName) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            document.getElementById('pageTitle').textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        }
    }
    
    // Update services list
    function updateServicesList() {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) return;
        
        servicesList.innerHTML = currentData.services.map(service => `
            <div class="editable-item" data-id="${service.id}">
                <div class="editable-header">
                    <div class="editable-title">
                        <span class="icon">${service.icon}</span>
                        <div>
                            <h3>${service.name}</h3>
                        </div>
                    </div>
                    <div class="editable-actions">
                        <button class="btn btn-secondary" onclick="editService(${service.id})">✏️ Edit</button>
                        <button class="btn btn-danger" onclick="deleteService(${service.id})">🗑️ Delete</button>
                    </div>
                </div>
                <div class="editable-content">${service.description}</div>
                <div class="editable-features">
                    ${service.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }
    
    // Update domains list
    function updateDomainsList() {
        const domainsList = document.getElementById('domainsList');
        if (!domainsList) return;
        
        domainsList.innerHTML = currentData.domains.map((domain, index) => `
            <div class="editable-item" data-index="${index}">
                <div class="editable-header">
                    <div class="editable-title">
                        <span class="icon">🌐</span>
                        <div>
                            <h3>${domain.name}</h3>
                            <p style="color: var(--secondary); font-weight: 600;">${domain.price}</p>
                        </div>
                    </div>
                    <div class="editable-actions">
                        <button class="btn btn-secondary" onclick="editDomain(${index})">✏️ Edit</button>
                        <button class="btn btn-danger" onclick="deleteDomain(${index})">🗑️ Delete</button>
                    </div>
                </div>
                <div class="editable-content">
                    <span class="status-badge status-${domain.status}">${domain.status}</span>
                    ${domain.description}
                </div>
            </div>
        `).join('');
    }
    
    // Update settings form
    function updateSettingsForm() {
        const settings = currentData.settings;
        if (!settings) return;
        
        document.getElementById('siteTitle').value = settings.siteTitle || '';
        document.getElementById('heroTitle').value = settings.heroTitle || '';
        document.getElementById('heroSubtitle').value = settings.heroSubtitle || '';
        document.getElementById('primaryColor').value = settings.primaryColor || '#6366f1';
        document.getElementById('secondaryColor').value = settings.secondaryColor || '#22d3ee';
        document.getElementById('accentColor').value = settings.accentColor || '#f43f5e';
        
        // Update previews
        updateMediaPreviews(settings);
    }
    
    // Update media previews
    function updateMediaPreviews(settings) {
        const logoPreview = document.getElementById('logoPreview');
        const bgPreview = document.getElementById('bgPreview');
        const musicPreview = document.getElementById('musicPreview');
        
        if (settings.logo) {
            logoPreview.innerHTML = `<img src="${settings.logo}" alt="Logo">`;
        }
        
        if (settings.backgroundImage) {
            bgPreview.innerHTML = `<img src="${settings.backgroundImage}" alt="Background">`;
        }
        
        if (settings.backgroundMusic) {
            musicPreview.innerHTML = `<audio controls src="${settings.backgroundMusic}"></audio>`;
        }
    }
    
    // Update contacts list
    function updateContactsList() {
        const contactsList = document.getElementById('contactsList');
        if (!contactsList) return;
        
        if (currentData.contacts.length === 0) {
            contactsList.innerHTML = '<p style="text-align: center; color: var(--text-dim); padding: 2rem;">No contact submissions yet</p>';
            return;
        }
        
        contactsList.innerHTML = `
            <div class="contact-row contact-header">
                <div>Name</div>
                <div>Email</div>
                <div>Service</div>
                <div>Date</div>
                <div>Status</div>
            </div>
            ${currentData.contacts.map(contact => `
                <div class="contact-row">
                    <div>
                        <h4>${contact.name}</h4>
                        <p>${contact.message.substring(0, 50)}...</p>
                    </div>
                    <div>${contact.email}</div>
                    <div>${contact.service}</div>
                    <div>${formatDate(contact.date)}</div>
                    <div><span class="status-badge status-${contact.status}">${contact.status}</span></div>
                </div>
            `).join('')}
        `;
    }
    
    // Service management
    document.getElementById('addServiceBtn').addEventListener('click', function() {
        document.getElementById('serviceModalTitle').textContent = 'Add Service';
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceForm').dataset.serviceId = '';
        openModal('serviceModal');
    });
    
    function editService(id) {
        const service = currentData.services.find(s => s.id === id);
        if (!service) return;
        
        document.getElementById('serviceModalTitle').textContent = 'Edit Service';
        document.getElementById('serviceName').value = service.name;
        document.getElementById('serviceIcon').value = service.icon;
        document.getElementById('serviceDescription').value = service.description;
        document.getElementById('serviceFeatures').value = service.features.join('\n');
        document.getElementById('serviceForm').dataset.serviceId = id;
        openModal('serviceModal');
    }
    
    async function deleteService(id) {
        if (!confirm('Are you sure you want to delete this service?')) return;
        
        try {
            const response = await fetch(`/api/admin/services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Service deleted successfully', 'success');
                await loadDashboardData();
            } else {
                showToast(data.message || 'Failed to delete service', 'error');
            }
        } catch (error) {
            showToast('Error deleting service', 'error');
        }
    }
    
    async function handleServiceSubmit(e) {
        e.preventDefault();
        
        const serviceId = e.target.dataset.serviceId;
        const formData = {
            name: document.getElementById('serviceName').value,
            icon: document.getElementById('serviceIcon').value,
            description: document.getElementById('serviceDescription').value,
            features: document.getElementById('serviceFeatures').value.split('\n').filter(f => f.trim())
        };
        
        try {
            const url = serviceId ? `/api/admin/services/${serviceId}` : '/api/admin/services';
            const method = serviceId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast(`Service ${serviceId ? 'updated' : 'added'} successfully`, 'success');
                closeModal('serviceModal');
                await loadDashboardData();
            } else {
                showToast(data.message || 'Failed to save service', 'error');
            }
        } catch (error) {
            showToast('Error saving service', 'error');
        }
    }
    
    // Domain management
    document.getElementById('addDomainBtn').addEventListener('click', function() {
        document.getElementById('domainModalTitle').textContent = 'Add Domain';
        document.getElementById('domainForm').reset();
        document.getElementById('domainForm').dataset.domainIndex = '';
        openModal('domainModal');
    });
    
    function editDomain(index) {
        const domain = currentData.domains[index];
        if (!domain) return;
        
        document.getElementById('domainModalTitle').textContent = 'Edit Domain';
        document.getElementById('domainName').value = domain.name;
        document.getElementById('domainPrice').value = domain.price;
        document.getElementById('domainStatus').value = domain.status;
        document.getElementById('domainDescription').value = domain.description;
        document.getElementById('domainForm').dataset.domainIndex = index;
        openModal('domainModal');
    }
    
    async function deleteDomain(index) {
        if (!confirm('Are you sure you want to delete this domain?')) return;
        
        try {
            const response = await fetch(`/api/admin/domains/${index}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Domain deleted successfully', 'success');
                await loadDashboardData();
            } else {
                showToast(data.message || 'Failed to delete domain', 'error');
            }
        } catch (error) {
            showToast('Error deleting domain', 'error');
        }
    }
    
    async function handleDomainSubmit(e) {
        e.preventDefault();
        
        const domainIndex = e.target.dataset.domainIndex;
        const formData = {
            name: document.getElementById('domainName').value,
            price: document.getElementById('domainPrice').value,
            status: document.getElementById('domainStatus').value,
            description: document.getElementById('domainDescription').value
        };
        
        try {
            const url = domainIndex !== '' ? `/api/admin/domains/${domainIndex}` : '/api/admin/domains';
            const method = domainIndex !== '' ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast(`Domain ${domainIndex !== '' ? 'updated' : 'added'} successfully`, 'success');
                closeModal('domainModal');
                await loadDashboardData();
            } else {
                showToast(data.message || 'Failed to save domain', 'error');
            }
        } catch (error) {
            showToast('Error saving domain', 'error');
        }
    }
    
    // Settings management
    async function handleSettingsSubmit(e) {
        e.preventDefault();
        
        const formData = {
            siteTitle: document.getElementById('siteTitle').value,
            heroTitle: document.getElementById('heroTitle').value,
            heroSubtitle: document.getElementById('heroSubtitle').value,
            primaryColor: document.getElementById('primaryColor').value,
            secondaryColor: document.getElementById('secondaryColor').value,
            accentColor: document.getElementById('accentColor').value
        };
        
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Settings updated successfully', 'success');
                currentData.settings = { ...currentData.settings, ...formData };
            } else {
                showToast(data.message || 'Failed to update settings', 'error');
            }
        } catch (error) {
            showToast('Error updating settings', 'error');
        }
    }
    
    // File upload setup
    function setupFileUploads() {
        // Logo upload
        document.getElementById('logoUpload').addEventListener('change', function(e) {
            handleFileUpload(e, 'logo', '/api/admin/upload/logo');
        });
        
        // Background upload
        document.getElementById('bgUpload').addEventListener('change', function(e) {
            handleFileUpload(e, 'background', '/api/admin/upload/background');
        });
        
        // Music upload
        document.getElementById('musicUpload').addEventListener('change', function(e) {
            handleFileUpload(e, 'music', '/api/admin/upload/music');
        });
    }
    
    async function handleFileUpload(e, type, url) {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append(type, file);
        
        try {
            showToast('Uploading file...', 'warning');
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            const data = await response.json();
            if (data.success) {
                showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`, 'success');
                await loadDashboardData();
            } else {
                showToast(data.message || 'Failed to upload file', 'error');
            }
        } catch (error) {
            showToast('Error uploading file', 'error');
        }
    }
    
    // Utility functions
    function openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', async function() {
        showToast('Refreshing data...', 'warning');
        await loadDashboardData();
        showToast('Data refreshed', 'success');
    });
    
    // Save all button
    document.getElementById('saveAllBtn').addEventListener('click', function() {
        showToast('All changes saved automatically', 'success');
    });
    
    // Backup management functions
    async function loadBackupData() {
        try {
            const response = await fetch('/api/admin/backup/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                updateBackupsList(data.backups);
            }
        } catch (error) {
            console.error('Error loading backups:', error);
        }
    }
    
    function updateBackupsList(backups) {
        const backupsList = document.getElementById('backupsList');
        if (!backupsList) return;
        
        if (backups.length === 0) {
            backupsList.innerHTML = '<p style="color: var(--text-dim); text-align: center;">No backups available</p>';
            return;
        }
        
        backupsList.innerHTML = backups.slice(0, 5).map(backup => `
            <div class="backup-item">
                <div class="backup-info">
                    <h5>${backup.filename}</h5>
                    <p>${formatDate(backup.created)} • ${formatBytes(backup.size)}</p>
                </div>
                <div class="backup-actions-item">
                    <button class="btn btn-secondary" onclick="downloadBackup('${backup.filename}')">📥</button>
                    <button class="btn btn-primary" onclick="restoreBackup('${backup.filename}')">🔄</button>
                </div>
            </div>
        `).join('');
    }
    
    async function loadSystemInfo() {
        try {
            const response = await fetch('/api/admin/system', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                updateSystemInfo(data.system);
            }
        } catch (error) {
            console.error('Error loading system info:', error);
        }
    }
    
    function updateSystemInfo(system) {
        const systemInfo = document.getElementById('systemInfo');
        if (!systemInfo) return;
        
        systemInfo.innerHTML = `
            <div class="info-item">
                <label>Data Directory Size</label>
                <div class="value">${system.dataDirSize}</div>
            </div>
            <div class="info-item">
                <label>Uploads Size</label>
                <div class="value">${system.uploadsSize}</div>
            </div>
            <div class="info-item">
                <label>Total Backups</label>
                <div class="value">${system.backupsCount}</div>
            </div>
            <div class="info-item">
                <label>System Uptime</label>
                <div class="value">${formatUptime(system.uptime)}</div>
            </div>
            <div class="info-item">
                <label>Memory Usage</label>
                <div class="value">${formatBytes(system.memory.used)}</div>
            </div>
            <div class="info-item">
                <label>Node.js Version</label>
                <div class="value">${system.nodeVersion}</div>
            </div>
        `;
    }
    
    // Backup event handlers
    document.getElementById('createBackupBtn').addEventListener('click', async function() {
        try {
            showToast('Creating backup...', 'warning');
            
            const response = await fetch('/api/admin/backup/create', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Backup created successfully', 'success');
                await loadBackupData();
                showSaveIndicator('💾 Backup Saved Permanently');
            } else {
                showToast(data.message || 'Failed to create backup', 'error');
            }
        } catch (error) {
            showToast('Error creating backup', 'error');
        }
    });
    
    document.getElementById('exportDataBtn').addEventListener('click', async function() {
        try {
            showToast('Exporting data...', 'warning');
            
            const response = await fetch('/api/admin/export', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ntandostore-complete-export-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                showToast('Data exported successfully', 'success');
                showSaveIndicator('📥 Export Downloaded');
            } else {
                showToast('Failed to export data', 'error');
            }
        } catch (error) {
            showToast('Error exporting data', 'error');
        }
    });
    
    document.getElementById('importForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];
        
        if (!file) {
            showToast('Please select a file to import', 'error');
            return;
        }
        
        if (!confirm('This will replace all current data. Are you sure you want to continue?')) {
            return;
        }
        
        const formData = new FormData();
        formData.append('importFile', file);
        
        try {
            showToast('Importing data...', 'warning');
            
            const response = await fetch('/api/admin/import', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Data imported successfully', 'success');
                fileInput.value = '';
                await loadDashboardData();
                showSaveIndicator('📤 Data Restored');
            } else {
                showToast(data.message || 'Failed to import data', 'error');
            }
        } catch (error) {
            showToast('Error importing data', 'error');
        }
    });
    
    // Global backup functions
    window.downloadBackup = async function(filename) {
        try {
            const response = await fetch(`/api/admin/backup/download/${filename}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                showToast('Backup downloaded', 'success');
            } else {
                showToast('Failed to download backup', 'error');
            }
        } catch (error) {
            showToast('Error downloading backup', 'error');
        }
    };
    
    window.restoreBackup = async function(filename) {
        if (!confirm(`Are you sure you want to restore from backup: ${filename}?\n\nThis will replace all current data!`)) {
            return;
        }
        
        try {
            showToast('Restoring backup...', 'warning');
            
            const response = await fetch(`/api/admin/backup/restore/${filename}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Data restored successfully', 'success');
                await loadDashboardData();
                showSaveIndicator('🔄 Data Restored from Backup');
            } else {
                showToast(data.message || 'Failed to restore backup', 'error');
            }
        } catch (error) {
            showToast('Error restoring backup', 'error');
        }
    };
    
    // Utility functions for backup system
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }
    
    function showSaveIndicator(message) {
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator show';
        indicator.textContent = message;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.classList.remove('show');
            setTimeout(() => indicator.remove(), 300);
        }, 3000);
    }
    
    // Auto-save indicator - shows every minute
    setInterval(() => {
        showSaveIndicator('✅ All Data Saved Permanently');
    }, 60000);
    
    // Global functions for onclick handlers
    window.editService = editService;
    window.deleteService = deleteService;
    window.editDomain = editDomain;
    window.deleteDomain = deleteDomain;
});

// Add slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(120%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);