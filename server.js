const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'ntandostore-v6-secret-key-2026';

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for permanent file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    const permanentPath = path.join(__dirname, 'data', 'permanent-uploads');
    
    // Ensure both directories exist
    [uploadPath, permanentPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

// Enhanced file upload handler with permanent storage
const handlePermanentUpload = (req, res, fieldName, updateSetting) => {
  return (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    try {
      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Copy to permanent storage
      const permanentPath = path.join(__dirname, 'data', 'permanent-uploads', req.file.filename);
      const tempPath = req.file.path;
      
      fs.copyFileSync(tempPath, permanentPath);
      
      // Update setting
      updateSetting(fileUrl);
      saveData();
      
      res.json({
        success: true,
        message: `${fieldName} uploaded and saved permanently`,
        [fieldName.toLowerCase()]: fileUrl
      });
      
      console.log(`✅ ${fieldName} saved permanently: ${fileUrl}`);
    } catch (error) {
      console.error('Permanent storage error:', error);
      res.status(500).json({ success: false, message: 'Error saving file permanently' });
    }
  };
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, WEBP, MP3, WAV, OGG files are allowed.'));
    }
  }
});

// Initialize permanent data storage
const dataFile = path.join(__dirname, 'data', 'admin-data.json');
const backupDir = path.join(__dirname, 'data', 'backups');
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

// Ensure all required directories exist
[dataDir, backupDir, uploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize admin data if it doesn't exist
let adminData = {
  services: [
    {
      id: 1,
      name: 'Domain Sales',
      description: 'Premium domains: nett.to, zone.id',
      icon: '🌐',
      features: ['Premium TLDs', 'Instant Transfer', 'Free DNS']
    },
    {
      id: 2,
      name: 'Website Development',
      description: 'Modern, responsive web design',
      icon: '💻',
      features: ['React/Vue/Next.js', 'Mobile First', 'SEO Optimized']
    },
    {
      id: 3,
      name: 'Web Hosting',
      description: 'Reliable hosting solutions',
      icon: '🚀',
      features: ['99.9% Uptime', 'SSL Certificate', 'Daily Backups']
    },
    {
      id: 4,
      name: 'WhatsApp Bots',
      description: 'Fix and develop WhatsApp bots',
      icon: '🤖',
      features: ['24/7 Support', 'Custom Flows', 'API Integration']
    },
    {
      id: 5,
      name: 'API Services',
      description: 'Working APIs for your business',
      icon: '🔌',
      features: ['REST APIs', 'GraphQL', 'Documentation']
    },
    {
      id: 6,
      name: 'Business Emails',
      description: 'Professional email solutions',
      icon: '📧',
      features: ['Custom Domain', '50GB Storage', 'Mobile Sync']
    },
    {
      id: 7,
      name: 'Design Services',
      description: 'Posters, business cards & more',
      icon: '🎨',
      features: ['Print Ready', 'Digital Formats', 'Quick Delivery']
    }
  ],
  domains: [
    { name: 'nett.to', price: '$299', status: 'available', description: 'Premium .to domain for tech projects' },
    { name: 'zone.id', price: '$199', status: 'available', description: 'Perfect .id domain for Indonesian market' }
  ],
  settings: {
    siteTitle: '🚀 NtandoStore V6',
    heroTitle: 'Welcome to the Future 2026',
    heroSubtitle: 'Your complete digital solution provider - from premium domains to cutting-edge web development',
    backgroundImage: '',
    backgroundMusic: '',
    logo: '',
    primaryColor: '#6366f1',
    secondaryColor: '#22d3ee',
    accentColor: '#f43f5e'
  },
  contacts: []
};

// Load data from file
if (fs.existsSync(dataFile)) {
  try {
    const fileData = fs.readFileSync(dataFile, 'utf8');
    adminData = JSON.parse(fileData);
  } catch (error) {
    console.log('Using default admin data');
  }
}

// Save data to file with permanent storage
function saveData() {
  try {
    // Main data save
    fs.writeFileSync(dataFile, JSON.stringify(adminData, null, 2));
    
    // Create backup
    createBackup();
    
    // Sync uploads to permanent storage
    syncUploadsToPermanentStorage();
    
    console.log('✅ Data saved permanently with backup');
  } catch (error) {
    console.error('❌ Error saving data:', error);
  }
}

// Create backup of current data
function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `admin-data-backup-${timestamp}.json`);
    
    // Create backup copy
    fs.copyFileSync(dataFile, backupFile);
    
    // Also create a latest backup
    const latestBackup = path.join(backupDir, 'latest-backup.json');
    fs.copyFileSync(dataFile, latestBackup);
    
    // Keep only last 10 backups to save space
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('admin-data-backup-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (backups.length > 10) {
      const filesToDelete = backups.slice(10);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
      });
    }
    
    console.log(`📦 Backup created: ${backupFile}`);
  } catch (error) {
    console.error('❌ Error creating backup:', error);
  }
}

// Sync uploads to permanent storage
function syncUploadsToPermanentStorage() {
  try {
    const permanentUploadsDir = path.join(__dirname, 'data', 'permanent-uploads');
    
    if (!fs.existsSync(permanentUploadsDir)) {
      fs.mkdirSync(permanentUploadsDir, { recursive: true });
    }
    
    // Copy all upload files to permanent storage
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const sourcePath = path.join(uploadsDir, file);
        const destPath = path.join(permanentUploadsDir, file);
        
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
        }
      });
    }
    
    console.log('🔄 Uploads synced to permanent storage');
  } catch (error) {
    console.error('❌ Error syncing uploads:', error);
  }
}

// Restore from backup
function restoreFromBackup(backupFile) {
  try {
    if (fs.existsSync(backupFile)) {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      adminData = backupData;
      saveData();
      console.log('✅ Data restored from backup');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error restoring from backup:', error);
    return false;
  }
}

// Export all data
function exportAllData() {
  try {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '6.0.0',
      data: adminData,
      uploads: {}
    };
    
    // Include upload file info
    const permanentUploadsDir = path.join(__dirname, 'data', 'permanent-uploads');
    if (fs.existsSync(permanentUploadsDir)) {
      const files = fs.readdirSync(permanentUploadsDir);
      files.forEach(file => {
        const filePath = path.join(permanentUploadsDir, file);
        const stats = fs.statSync(filePath);
        exportData.uploads[file] = {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: path.extname(file)
        };
      });
    }
    
    const exportFile = path.join(backupDir, `ntandostore-export-${Date.now()}.json`);
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    
    return exportFile;
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    return null;
  }
}

// Import data from file
function importData(importFile) {
  try {
    if (fs.existsSync(importFile)) {
      const importData = JSON.parse(fs.readFileSync(importFile, 'utf8'));
      
      // Validate import data
      if (importData.data && typeof importData.data === 'object') {
        // Create backup before import
        createBackup();
        
        // Import the data
        adminData = importData.data;
        saveData();
        
        console.log('✅ Data imported successfully');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Error importing data:', error);
    return false;
  }
}

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Admin Authentication
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Hardcoded admin credentials
  const ADMIN_USERNAME = 'Ntando';
  const ADMIN_PASSWORD = 'Ntando';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { username: ADMIN_USERNAME, role: 'admin' }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Admin Dashboard Data
app.get('/api/admin/dashboard', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    data: {
      totalServices: adminData.services.length,
      totalDomains: adminData.domains.length,
      totalContacts: adminData.contacts.length,
      recentContacts: adminData.contacts.slice(-5).reverse()
    }
  });
});

// Get Services (Public)
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    services: adminData.services
  });
});

// Get Domains (Public)
app.get('/api/domains', (req, res) => {
  res.json({
    success: true,
    domains: adminData.domains
  });
});

// Get Settings (Public)
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    settings: adminData.settings
  });
});

// Admin Routes - Services
app.get('/api/admin/services', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    services: adminData.services
  });
});

app.post('/api/admin/services', authenticateAdmin, (req, res) => {
  const { name, description, icon, features } = req.body;
  const newService = {
    id: adminData.services.length > 0 ? Math.max(...adminData.services.map(s => s.id)) + 1 : 1,
    name,
    description,
    icon,
    features: features || []
  };
  
  adminData.services.push(newService);
  saveData();
  
  res.json({
    success: true,
    message: 'Service added successfully',
    service: newService
  });
});

app.put('/api/admin/services/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, icon, features } = req.body;
  
  const serviceIndex = adminData.services.findIndex(s => s.id == id);
  if (serviceIndex === -1) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  
  adminData.services[serviceIndex] = { ...adminData.services[serviceIndex], name, description, icon, features };
  saveData();
  
  res.json({
    success: true,
    message: 'Service updated successfully',
    service: adminData.services[serviceIndex]
  });
});

app.delete('/api/admin/services/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  const serviceIndex = adminData.services.findIndex(s => s.id == id);
  if (serviceIndex === -1) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  
  adminData.services.splice(serviceIndex, 1);
  saveData();
  
  res.json({
    success: true,
    message: 'Service deleted successfully'
  });
});

// Admin Routes - Domains
app.get('/api/admin/domains', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    domains: adminData.domains
  });
});

app.post('/api/admin/domains', authenticateAdmin, (req, res) => {
  const { name, price, status, description } = req.body;
  const newDomain = { name, price, status, description };
  
  adminData.domains.push(newDomain);
  saveData();
  
  res.json({
    success: true,
    message: 'Domain added successfully',
    domain: newDomain
  });
});

app.put('/api/admin/domains/:index', authenticateAdmin, (req, res) => {
  const { index } = req.params;
  const { name, price, status, description } = req.body;
  
  if (index < 0 || index >= adminData.domains.length) {
    return res.status(404).json({ success: false, message: 'Domain not found' });
  }
  
  adminData.domains[index] = { name, price, status, description };
  saveData();
  
  res.json({
    success: true,
    message: 'Domain updated successfully',
    domain: adminData.domains[index]
  });
});

app.delete('/api/admin/domains/:index', authenticateAdmin, (req, res) => {
  const { index } = req.params;
  
  if (index < 0 || index >= adminData.domains.length) {
    return res.status(404).json({ success: false, message: 'Domain not found' });
  }
  
  adminData.domains.splice(index, 1);
  saveData();
  
  res.json({
    success: true,
    message: 'Domain deleted successfully'
  });
});

// Admin Routes - Settings
app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    settings: adminData.settings
  });
});

app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  adminData.settings = { ...adminData.settings, ...req.body };
  saveData();
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: adminData.settings
  });
});

// File Upload Routes with Permanent Storage
app.post('/api/admin/upload/logo', authenticateAdmin, upload.single('logo'), (req, res) => {
  handlePermanentUpload(req, res, 'Logo', (logoUrl) => {
    adminData.settings.logo = logoUrl;
  })(null);
});

app.post('/api/admin/upload/background', authenticateAdmin, upload.single('background'), (req, res) => {
  handlePermanentUpload(req, res, 'Background', (backgroundUrl) => {
    adminData.settings.backgroundImage = backgroundUrl;
  })(null);
});

app.post('/api/admin/upload/music', authenticateAdmin, upload.single('music'), (req, res) => {
  handlePermanentUpload(req, res, 'Background Music', (musicUrl) => {
    adminData.settings.backgroundMusic = musicUrl;
  })(null);
});

// Admin Contacts
app.get('/api/admin/contacts', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    contacts: adminData.contacts
  });
});

// Permanent Storage Management API
app.get('/api/admin/backup/list', authenticateAdmin, (req, res) => {
  try {
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('admin-data-backup-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          created: stats.birthtime,
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json({
      success: true,
      backups
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error listing backups' });
  }
});

app.post('/api/admin/backup/create', authenticateAdmin, (req, res) => {
  try {
    createBackup();
    res.json({
      success: true,
      message: 'Backup created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating backup' });
  }
});

app.post('/api/admin/backup/restore/:filename', authenticateAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const backupFile = path.join(backupDir, filename);
    
    if (restoreFromBackup(backupFile)) {
      res.json({
        success: true,
        message: 'Data restored successfully'
      });
    } else {
      res.status(404).json({ success: false, message: 'Backup not found or invalid' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error restoring backup' });
  }
});

app.get('/api/admin/backup/download/:filename', authenticateAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const backupFile = path.join(backupDir, filename);
    
    if (fs.existsSync(backupFile)) {
      res.download(backupFile, filename, (err) => {
        if (err) {
          res.status(500).json({ success: false, message: 'Error downloading backup' });
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Backup not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error downloading backup' });
  }
});

// Export/Import API
app.get('/api/admin/export', authenticateAdmin, (req, res) => {
  try {
    const exportFile = exportAllData();
    
    if (exportFile) {
      res.download(exportFile, `ntandostore-export-${Date.now()}.json`, (err) => {
        if (err) {
          res.status(500).json({ success: false, message: 'Error exporting data' });
        }
      });
    } else {
      res.status(500).json({ success: false, message: 'Error creating export' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error exporting data' });
  }
});

app.post('/api/admin/import', authenticateAdmin, upload.single('importFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    if (importData(req.file.path)) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: 'Data imported successfully'
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid import file' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error importing data' });
  }
});

// Permanent Uploads API
app.get('/api/admin/uploads', authenticateAdmin, (req, res) => {
  try {
    const permanentUploadsDir = path.join(__dirname, 'data', 'permanent-uploads');
    let files = [];
    
    if (fs.existsSync(permanentUploadsDir)) {
      files = fs.readdirSync(permanentUploadsDir).map(file => {
        const filePath = path.join(permanentUploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: path.extname(file),
          url: `/uploads/${file}`
        };
      });
    }
    
    res.json({
      success: true,
      files
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error listing uploads' });
  }
});

app.delete('/api/admin/uploads/:filename', authenticateAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    const permanentPath = path.join(__dirname, 'data', 'permanent-uploads', filename);
    
    // Delete from both locations
    let deleted = false;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deleted = true;
    }
    
    if (fs.existsSync(permanentPath)) {
      fs.unlinkSync(permanentPath);
      deleted = true;
    }
    
    if (deleted) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting file' });
  }
});

// System Info API
app.get('/api/admin/system', authenticateAdmin, (req, res) => {
  try {
    const dataDirSize = getDirectorySize(dataDir);
    const uploadsSize = getDirectorySize(uploadsDir);
    const backupsCount = fs.readdirSync(backupDir).length;
    
    res.json({
      success: true,
      system: {
        dataDirSize: formatBytes(dataDirSize),
        uploadsSize: formatBytes(uploadsSize),
        backupsCount,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting system info' });
  }
});

// Utility functions for file size
function getDirectorySize(dirPath) {
  try {
    let totalSize = 0;
    
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    }
    
    return totalSize;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Public Contact Form
app.post('/api/contact', (req, res) => {
  const { name, email, service, message } = req.body;
  
  const newContact = {
    id: adminData.contacts.length > 0 ? Math.max(...adminData.contacts.map(c => c.id)) + 1 : 1,
    name,
    email,
    service,
    message,
    date: new Date().toISOString(),
    status: 'new'
  };
  
  adminData.contacts.push(newContact);
  saveData();
  
  console.log('Contact form submission:', newContact);
  
  res.json({
    success: true,
    message: 'Thank you for contacting us! We will get back to you within 24 hours.'
  });
});

// Admin Login Page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin Dashboard Page
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Serve main HTML file for all routes (SPA-like behavior)
app.get('*', (req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.status(404).send('Admin page not found');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ntandostore V6 server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
});

module.exports = app;