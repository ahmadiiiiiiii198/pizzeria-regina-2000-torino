const fs = require('fs');
const path = require('path');

// Function to recursively scan directories
function scanDirectory(dir, results = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
          scanDirectory(fullPath, results);
        }
      } else if (file.match(/\.(tsx|ts|jsx|js)$/)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

// Check for common import issues
function checkImportIssues() {
  console.log('🔍 Checking for import issues...\n');
  
  const files = scanDirectory('src');
  let issuesFound = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(process.cwd(), file);
      
      // Check for createPortal usage without import
      if (content.includes('createPortal') && !content.includes('import { createPortal }') && !content.includes('import { createPortal')) {
        console.log(`❌ ${relativePath}: Uses createPortal but missing import`);
        issuesFound++;
      }
      
      // Check for React hooks usage without React import
      const reactHooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'];
      const hasReactHooks = reactHooks.some(hook => content.includes(hook));
      const hasReactImport = content.includes('import React') || content.includes('import { ') && reactHooks.some(hook => content.includes(hook));
      
      if (hasReactHooks && !hasReactImport && !content.includes('import React')) {
        console.log(`⚠️  ${relativePath}: Uses React hooks but may be missing React import`);
      }
      
      // Check for common missing imports
      const commonChecks = [
        { usage: 'forwardRef', import: 'React.forwardRef' },
        { usage: 'memo', import: 'React.memo' },
        { usage: 'Fragment', import: 'React.Fragment' },
        { usage: 'Portal', import: 'createPortal' }
      ];
      
      for (const check of commonChecks) {
        if (content.includes(check.usage) && !content.includes(check.import) && !content.includes(`import { ${check.usage} }`)) {
          // Skip false positives
          if (check.usage === 'memo' && content.includes('useMemo')) continue;
          if (check.usage === 'Fragment' && content.includes('<>')) continue;
          
          console.log(`⚠️  ${relativePath}: Uses ${check.usage} but may be missing proper import`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error reading ${file}: ${error.message}`);
      issuesFound++;
    }
  }
  
  if (issuesFound === 0) {
    console.log('✅ No critical import issues found!');
  } else {
    console.log(`\n⚠️  Found ${issuesFound} potential import issues`);
  }
  
  return issuesFound === 0;
}

// Check for TypeScript errors
function checkTypeScriptErrors() {
  console.log('\n🔍 Checking TypeScript compilation...\n');
  
  try {
    const { execSync } = require('child_process');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful!');
    return true;
  } catch (error) {
    console.log('❌ TypeScript compilation errors:');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🚀 Running comprehensive import and compilation check...\n');
  
  const importCheck = checkImportIssues();
  const tsCheck = checkTypeScriptErrors();
  
  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  console.log(`Import Issues: ${importCheck ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`TypeScript: ${tsCheck ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (importCheck && tsCheck) {
    console.log('\n🎉 All checks passed! No critical issues found.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some issues found. Please review and fix.');
    process.exit(1);
  }
}

main();
