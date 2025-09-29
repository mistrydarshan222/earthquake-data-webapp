# 🚀 Deployment Guide

## Production Deployment

### Build Process
```bash
# Create optimized production build
npm run build

# Verify build output
ls dist/
# Expected output:
# - index.html
# - assets/
#   - index-[hash].js
#   - index-[hash].css
#   - vite.svg
```

### Environment Variables
Create `.env.production` for production configuration:
```env
# API Configuration
VITE_USGS_API_BASE=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/
VITE_DEFAULT_DATASET=all_month.csv

# Performance Settings
VITE_MAX_CHART_POINTS=2000
VITE_VIRTUAL_TABLE_BUFFER=10

# Feature Flags
VITE_ENABLE_PERFORMANCE_MONITOR=false
VITE_ENABLE_ERROR_REPORTING=true
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Static Hosting (GitHub Pages, etc.)
```bash
# Build for static hosting
npm run build

# Upload dist/ folder contents to your hosting provider
```

### Performance Optimizations

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['zustand', 'papaparse']
        }
      }
    },
    sourcemap: false, // Disable in production
    minify: 'terser',
    target: 'es2020'
  }
});
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Local Development
```bash
# Clone and setup
git clone https://github.com/mistrydarshan222/earthquake-data-webapp.git
cd earthquake-data-webapp
npm install

# Start development server
npm run dev
# Open http://localhost:5173
```

### Development Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Code linting
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript checking
```

## Security Considerations

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://earthquake.usgs.gov;
  img-src 'self' data: https:;
  font-src 'self';
">
```

### HTTPS Only
- Ensure all deployments use HTTPS
- USGS API requires HTTPS for production use
- Service workers require HTTPS for offline functionality

## Monitoring & Analytics

### Performance Monitoring
```typescript
// Add to main.tsx for production
if (process.env.NODE_ENV === 'production') {
  // Web Vitals monitoring
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}
```

### Error Reporting
```typescript
// Optional: Add error reporting service
window.addEventListener('error', (event) => {
  // Send to error reporting service
  console.error('Global error:', event.error);
});
```

## Browser Compatibility

### Supported Browsers
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

### Polyfills (if needed)
```bash
# Add polyfills for older browsers
npm install --save-dev @vitejs/plugin-legacy
```

## Maintenance

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

### Performance Monitoring
- Monitor bundle size with `npm run analyze`
- Check Core Web Vitals in production
- Monitor error rates and user feedback