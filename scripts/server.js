const next = require('next');
const http = require('http');
require('dotenv').config();

const port = process.env.PORT || 4200;
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

let server;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit immediately, allow graceful shutdown
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, allow graceful shutdown
  gracefulShutdown('unhandledRejection');
});

// Graceful shutdown handler
function gracefulShutdown(signal) {
  console.log(`Received ${signal}, starting graceful shutdown...`);
  
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      console.log('Server closed successfully');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  gracefulShutdown('SIGINT');
});

// Start the server
app.prepare()
  .then(() => {
    server = http.createServer((req, res) => {
      handle(req, res).catch((err) => {
        console.error('Error handling request:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
    });

    server.listen(port, (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
      console.log(`Ready on port ${port}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
      }
    });
  })
  .catch((err) => {
    console.error('Failed to prepare Next.js app:', err);
    process.exit(1);
  });