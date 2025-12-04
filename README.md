# 🚀 NtandoStore V6 - Digital Services Platform 2026

A futuristic, responsive web platform for digital services including domain sales, web development, hosting, WhatsApp bots, APIs, business emails, and design services.

## ✨ Features

### Core Services
- **🌐 Domain Sales**: Premium domains (nett.to, zone.id)
- **💻 Website Development**: Modern, responsive web design
- **🚀 Web Hosting**: Reliable hosting solutions
- **🤖 WhatsApp Bots**: Development and troubleshooting
- **🔌 API Services**: Custom API development
- **📧 Business Emails**: Professional email solutions
- **🎨 Design Services**: Posters, business cards, and more

### Technical Features
- **🎨 Futuristic 2026 Design**: Modern UI with animations
- **📱 Mobile Responsive**: Works on all devices
- **⚡ Fast Performance**: Optimized for speed
- **🔒 Secure**: Built with security best practices
- **🌐 SEO Optimized**: Search engine friendly
- **🔄 Dynamic Content**: API-driven service展示

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with animations and gradients
- **Deployment**: Optimized for Render.com
- **Security**: Helmet.js, CORS, Rate Limiting
- **Performance**: Compression, Caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ntandostore-v6
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:10000`

## 🌐 Deployment on Render.com

### Automatic Deployment

1. **Push to GitHub**
   - Push your code to a GitHub repository
   - Make sure all files are committed

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select "Node" as the runtime
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Starter (or higher)
     - **Region**: Choose closest to your audience

3. **Environment Variables**
   Add these environment variables in Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

### Using render.yaml (Recommended)

The `render.yaml` file is already configured for automatic deployment. Just connect your repository to Render and it will deploy automatically with the optimal settings.

## 📁 Project Structure

```
ntandostore-v6/
├── public/
│   ├── css/
│   │   └── style.css          # Main styles with 2026 design
│   ├── js/
│   │   └── main.js            # Interactive JavaScript
│   └── index.html             # Main HTML file
├── server.js                  # Express.js server
├── package.json               # Dependencies and scripts
├── render.yaml               # Render.com configuration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔧 API Endpoints

### GET /api/services
Returns all available services with details.

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "name": "Domain Sales",
      "description": "Premium domains: nett.to, zone.id",
      "icon": "🌐",
      "features": ["Premium TLDs", "Instant Transfer", "Free DNS"]
    }
  ]
}
```

### GET /api/domains
Returns available premium domains.

**Response:**
```json
{
  "success": true,
  "domains": [
    {
      "name": "nett.to",
      "price": "$299",
      "status": "available",
      "description": "Premium .to domain for tech projects"
    }
  ]
}
```

### POST /api/contact
Handles contact form submissions.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "service": "domains",
  "message": "I'm interested in purchasing nett.to"
}
```

## 🎨 Customization

### Adding New Services

1. **Update the API** in `server.js`:
   ```javascript
   // Add to the services array in /api/services endpoint
   {
     id: 8,
     name: 'Your New Service',
     description: 'Service description',
     icon: '🎯',
     features: ['Feature 1', 'Feature 2']
   }
   ```

2. **Update the contact form** in `index.html`:
   ```html
   <option value="new-service">Your New Service</option>
   ```

### Modifying Styles

- Edit `public/css/style.css` for visual changes
- CSS variables are defined at the top for easy theme changes
- Animation effects are in the `@keyframes` sections

### Adding New Pages

1. Create new HTML files in the `public/` directory
2. Add routing in `server.js`:
   ```javascript
   app.get('/your-page', (req, res) => {
     res.sendFile(path.join(__dirname, 'public', 'your-page.html'));
   });
   ```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents abuse
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Form data validation
- **HTTPS Ready**: SSL configuration

## 📊 Performance Optimization

- **Compression**: Gzip compression enabled
- **Static Caching**: Efficient asset delivery
- **Lazy Loading**: Images and content load as needed
- **Minification**: CSS and JS optimization ready
- **CDN Ready**: Asset delivery optimization

## 🛠️ Development Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run build    # Build command (placeholder)
```

## 📱 Mobile Optimization

- Fully responsive design
- Touch-friendly interactions
- Optimized for all screen sizes
- Fast loading on mobile networks

## 🌍 SEO Features

- Semantic HTML5 structure
- Meta tags optimization
- Open Graph tags ready
- Structured data ready
- Sitemap ready

## 🔧 Maintenance

### Regular Updates
1. Update dependencies: `npm update`
2. Monitor performance with Render analytics
3. Check error logs regularly
4. Update content as needed

### Backup Strategy
- Code is version-controlled in Git
- Database backups (if added) should be configured
- Asset backups via Git

## 📞 Support

For support or questions:
- Email: admin@ntandostore.com
- Website: ntandostore.com
- GitHub Issues: Create an issue in the repository

## 📄 License

MIT License - feel free to use this project for commercial or personal use.

---

**Built with ❤️ for the future of digital services**
**Version 6.0.0 - 2026 Ready**