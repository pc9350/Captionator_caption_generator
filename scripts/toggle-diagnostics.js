const fs = require('fs');
const path = require('path');

// Paths to the diagnostics files
const diagnosticsFiles = [
  path.join(__dirname, '..', 'app', 'utils', 'firebaseDiagnostics.ts'),
  path.join(__dirname, '..', 'app', 'components', 'FirebaseDiagnostics.tsx'),
  path.join(__dirname, '..', 'app', 'components', 'FirebaseDiagnosticsProvider.tsx'),
];

// Backup directory
const backupDir = path.join(__dirname, '..', '.diagnostics-backup');

// Check if diagnostics are currently enabled
const isDiagnosticsEnabled = () => {
  return fs.existsSync(diagnosticsFiles[0]);
};

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Toggle diagnostics
if (isDiagnosticsEnabled()) {
  // Disable diagnostics by moving files to backup
  console.log('Disabling Firebase diagnostics...');
  
  diagnosticsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const fileName = path.basename(file);
      const backupFile = path.join(backupDir, fileName);
      fs.renameSync(file, backupFile);
      console.log(`Moved ${fileName} to backup`);
    }
  });
  
  console.log('Firebase diagnostics disabled. Files are backed up in .diagnostics-backup/');
} else {
  // Enable diagnostics by restoring files from backup
  console.log('Enabling Firebase diagnostics...');
  
  // Check if backup files exist
  const backupFiles = fs.readdirSync(backupDir);
  
  if (backupFiles.length === 0) {
    console.error('No backup files found. Cannot enable diagnostics.');
    process.exit(1);
  }
  
  // Restore each file
  backupFiles.forEach(fileName => {
    const backupFile = path.join(backupDir, fileName);
    const originalDir = fileName.endsWith('.tsx') 
      ? path.join(__dirname, '..', 'app', 'components')
      : path.join(__dirname, '..', 'app', 'utils');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir, { recursive: true });
    }
    
    const originalFile = path.join(originalDir, fileName);
    fs.renameSync(backupFile, originalFile);
    console.log(`Restored ${fileName}`);
  });
  
  console.log('Firebase diagnostics enabled.');
}

console.log('\nTo use this script:');
console.log('- Run "node scripts/toggle-diagnostics.js" to toggle diagnostics on/off');
console.log('- When diagnostics are enabled, you can access them in development mode');
console.log('- When disabled, the files are safely stored in .diagnostics-backup/');
console.log('- This helps keep your production build clean while allowing easy debugging'); 