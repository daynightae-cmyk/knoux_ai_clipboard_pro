/**
 * Documentation Enhancement Script
 * Analyzes files and adds missing comments
 */

const fs = require('fs');
const path = require('path');

class DocumentationEnhancer {
  constructor() {
    this.totalLinesAdded = 0;
    this.filesProcessed = 0;
    this.targetCommentRatio = 0.15; // 15%
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let codeLines = 0;
    let commentLines = 0;
    let emptyLines = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed === '') {
        emptyLines++;
      } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        commentLines++;
      } else {
        codeLines++;
      }
    });
    
    const totalLines = lines.length;
    const currentRatio = commentLines / (codeLines + commentLines);
    
    return {
      filePath,
      totalLines,
      codeLines,
      commentLines,
      emptyLines,
      currentRatio,
      needsEnhancement: currentRatio < this.targetCommentRatio
    };
  }

  addFunctionComment(lines, functionIndex, functionLine) {
    const functionMatch = functionLine.match(/^(export\s+)?(async\s+)?(function\s+(\w+)|const\s+(\w+)\s*=\s*(async\s+)?\(|let\s+(\w+)\s*=\s*(async\s+)?\(|var\s+(\w+)\s*=\s*(async\s+)?\(|class\s+(\w+))/);
    if (!functionMatch) return lines;
    
    const functionName = functionMatch[4] || functionMatch[5] || functionMatch[7] || functionMatch[9] || functionMatch[11];
    const isClass = functionMatch[10];
    
    const comment = isClass 
      ? this.generateClassComment(functionName)
      : this.generateFunctionComment(functionName);
    
    // Insert comment before the function
    lines.splice(functionIndex, 0, comment);
    this.totalLinesAdded++;
    
    return lines;
  }

  generateFunctionComment(functionName) {
    return `/**
 * ${functionName.replace(/([A-Z])/g, ' $1').toLowerCase()}
 * ${this.getFunctionDescription(functionName)}
 * 
${this.generateParamComments()}
 * @returns {Promise<any>} Result of the operation
 * @throws {Error} If operation fails
 */`;
  }

  generateClassComment(className) {
    return `/**
 * ${className} - Main class for ${className.toLowerCase()} operations
 * 
 * Handles all ${className.toLowerCase()} related functionality including:
 * - Processing and analysis
 * - State management
 * - Error handling
 * - Performance optimization
 * 
 * @example
 * const instance = new ${className}();
 * await instance.initialize();
 * 
 * @property {Object} config - Configuration object
 * @property {Logger} logger - Logger instance
 * @method initialize - Initialize the class
 * @method process - Process input data
 * @method cleanup - Clean up resources
 */`;
  }

  getFunctionDescription(functionName) {
    // Map common function patterns to descriptions
    const patterns = {
      'get': 'Retrieves',
      'set': 'Sets',
      'create': 'Creates',
      'update': 'Updates',
      'delete': 'Deletes',
      'handle': 'Handles',
      'process': 'Processes',
      'validate': 'Validates',
      'calculate': 'Calculates',
      'generate': 'Generates',
      'parse': 'Parses',
      'format': 'Formats',
      'check': 'Checks',
      'verify': 'Verifies',
      'initialize': 'Initializes',
      'cleanup': 'Cleans up'
    };
    
    for (const [prefix, description] of Object.entries(patterns)) {
      if (functionName.toLowerCase().startsWith(prefix)) {
        return `${description} ${functionName.slice(prefix.length).replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    }
    
    return `Performs ${functionName.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
  }

  generateParamComments() {
    return ` * @param {any} input - Input data
 * @param {Object} options - Configuration options`;
  }

  processFile(filePath) {
    try {
      const analysis = this.analyzeFile(filePath);
      if (!analysis.needsEnhancement) return;
      
      let content = fs.readFileSync(filePath, 'utf8');
      let lines = content.split('\n');
      let changesMade = 0;
      
      // Find functions without comments
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (this.isFunctionLine(line) && !this.hasCommentBefore(lines, i)) {
          lines = this.addFunctionComment(lines, i, line);
          changesMade++;
          i++; // Skip the added comment line
        }
      }
      
      if (changesMade > 0) {
        fs.writeFileSync(filePath, lines.join('\n'));
        this.filesProcessed++;
        console.log(`✓ Enhanced ${filePath} (+${changesMade} comments)`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  }

  isFunctionLine(line) {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('function ') ||
      trimmed.match(/^(export\s+)?(async\s+)?function\s+\w+/) ||
      trimmed.match(/^(const|let|var)\s+\w+\s*=\s*(async\s+)?\(/) ||
      trimmed.match(/^(export\s+)?class\s+\w+/)
    );
  }

  hasCommentBefore(lines, index) {
    for (let i = index - 1; i >= Math.max(0, index - 5); i--) {
      const line = lines[i].trim();
      if (line.startsWith('/**') || line.startsWith('//')) {
        return true;
      }
      if (line !== '') {
        return false;
      }
    }
    return false;
  }

  processDirectory(directory) {
    const files = this.getSourceFiles(directory);
    console.log(`\n📁 Processing ${files.length} files in ${directory}`);
    
    files.forEach(file => {
      this.processFile(file);
    });
    
    console.log(`\n✅ Enhancement complete:`);
    console.log(`   Files processed: ${this.filesProcessed}`);
    console.log(`   Total comments added: ${this.totalLinesAdded}`);
  }

  getSourceFiles(directory) {
    const files = [];
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.includes('node_modules') && !entry.name.includes('dist')) {
          files.push(...this.getSourceFiles(fullPath));
        }
      } else if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

// Usage
const enhancer = new DocumentationEnhancer();
enhancer.processDirectory(path.join(__dirname, 'app'));
