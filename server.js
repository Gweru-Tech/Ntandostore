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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Initialize data storage
const dataFile = path.join(__dirname, 'data', 'admin-data.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

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

// Save data to file
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(adminData, null, 2));
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

// File Upload Routes
app.post('/api/admin/upload/logo', authenticateAdmin, upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const logoUrl = `/uploads/${req.file.filename}`;
  adminData.settings.logo = logoUrl;
  saveData();
  
  res.json({
    success: true,
    message: 'Logo uploaded successfully',
    logoUrl
  });
});

app.post('/api/admin/upload/background', authenticateAdmin, upload.single('background'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const backgroundUrl = `/uploads/${req.file.filename}`;
  adminData.settings.backgroundImage = backgroundUrl;
  saveData();
  
  res.json({
    success: true,
    message: 'Background uploaded successfully',
    backgroundUrl
  });
});

app.post('/api/admin/upload/music', authenticateAdmin, upload.single('music'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const musicUrl = `/uploads/${req.file.filename}`;
  adminData.settings.backgroundMusic = musicUrl;
  saveData();
  
  res.json({
    success: true,
    message: 'Background music uploaded successfully',
    musicUrl
  });
});

// Admin Contacts
app.get('/api/admin/contacts', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    contacts: adminData.contacts
  });
});

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