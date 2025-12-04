# 🚀 Deployment Guide - NtandoStore V6

## Quick Deployment to Render.com

### Method 1: Auto-Deploy with render.yaml (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NtandoStore V6"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Click "Deploy Web Service"

3. **Deployment Complete!**
   - Your site will be live at: `https://ntandostore-v6.onrender.com`

### Method 2: Manual Setup

1. **Create Web Service**
   - Name: `ntandostore-v6`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Starter`

2. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   ```

3. **Deploy**

## Custom Domain Setup (Optional)

1. **In Render Dashboard**
   - Go to your service → Settings → Custom Domains
   - Add your custom domain (e.g., `ntandostore.com`)

2. **DNS Configuration**
   - Point your domain to: `your-service-name.onrender.com`
   - Use CNAME record for subdomains
   - Use A records for root domain

## Environment Variables

### Required
- `NODE_ENV`: Set to `production`
- `PORT`: Set to `10000` (Render's default)

### Optional (for contact form emails)
- `EMAIL_HOST`: SMTP server
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: Email username
- `EMAIL_PASS`: Email password
- `CONTACT_EMAIL`: Recipient email

## Performance Optimization

### Enabled Features
- ✅ Gzip compression
- ✅ Rate limiting
- ✅ Security headers
- ✅ Static file caching
- ✅ Mobile optimization

### Additional Optimizations
- Add CDN for static assets
- Enable HTTP/2
- Implement service worker
- Add database for persistent storage

## Monitoring

### Render Analytics
- Visit your Render dashboard
- Check metrics, logs, and performance
- Monitor uptime and response times

### Health Checks
- The app includes health check at `/`
- Monitor via Render's health check system

## Scaling

### Vertical Scaling
- Upgrade to larger instance types in Render
- More RAM and CPU for higher traffic

### Horizontal Scaling
- Add multiple instances
- Load balancing automatically configured

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check package.json dependencies
   - Verify Node.js version compatibility
   - Review build logs in Render

2. **Server Doesn't Start**
   - Check PORT environment variable
   - Verify start command in package.json
   - Review server logs

3. **Static Files Not Loading**
   - Check file paths in HTML/CSS
   - Verify express.static configuration
   - Clear browser cache

4. **API Calls Fail**
   - Check CORS settings
   - Verify API endpoints
   - Review network tab in browser

### Debug Mode
```bash
# Local debugging
npm run dev

# Check Render logs
# Go to Dashboard → Service → Logs
```

## Backup and Recovery

### Automatic Backups
- Code is safe in Git
- Render provides service snapshots
- Environment variables are backed up

### Recovery Steps
1. Re-deploy from Git
2. Restore environment variables
3. Verify functionality

## Security Considerations

### Implemented Security
- ✅ Helmet.js for security headers
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS configuration

### Additional Security
- Add SSL certificate (auto with Render)
- Implement authentication if needed
- Regular dependency updates
- Security scanning

## Updates and Maintenance

### Updating Dependencies
```bash
npm update
npm audit fix
git add .
git commit -m "Update dependencies"
git push
```

### Content Updates
- Edit HTML, CSS, JS files
- Commit and push changes
- Render auto-deploys

### Monitoring Updates
- Check Render dashboard regularly
- Monitor performance metrics
- Review error logs

## Cost Optimization

### Current Setup
- Starter plan: ~$7/month
- Includes 750 hours build time
- 100GB bandwidth

### Optimization Tips
- Optimize images and assets
- Implement caching
- Monitor bandwidth usage
- Consider CDN for heavy assets

## Support

### Render Support
- Documentation: render.com/docs
- Support: support@render.com
- Status: status.render.com

### Project Support
- GitHub Issues for bugs
- Email for feature requests
- Documentation in README.md

---

**Your NtandoStore V6 is ready for 2026! 🚀**