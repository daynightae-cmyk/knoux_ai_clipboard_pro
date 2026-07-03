const fs = require('fs');
const path = require('path');

const componentsDir = 'app/renderer/components';
const files = [
  'BlockchainSecurityUI.tsx',
  'NeuralStyleTransferUI.tsx',
  'UIMorpherUI.tsx',
  'ProductivityScorerUI.tsx'
];

const backendImportPattern = /import\s+.*from\s+['"]\.\.\/\.\.\/\.\.\/backend\/[^'"]+['"]/g;

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - Not found`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(backendImportPattern);
  
  if (matches) {
    console.log(`❌ ${file} - Has backend imports:`);
    matches.forEach(m => console.log(`   ${m}`));
  } else {
    console.log(`✅ ${file} - Clean`);
  }
});

console.log('\n📋 Files to fix manually:');
files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.match(backendImportPattern)) {
      console.log(`   - ${file}`);
    }
  }
});
