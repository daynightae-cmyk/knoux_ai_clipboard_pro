/**
 * Code Quality Analyzer
 * Monitors and reports on code quality metrics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeAnalyzer {
  constructor() {
    this.metrics = {
      totalFiles: 0,
      totalLines: 0,
      codeLines: 0,
      commentLines: 0,
      emptyLines: 0,
      functions: 0,
      classes: 0,
      components: 0,
      tests: 0
    };
    
    this.thresholds = {
      commentRatio: 0.15,
      maxFileSize: 800,
      maxFunctionsPerFile: 25,
      testCoverage: 0.7
    };
    
    this.problems = [];
  }

  analyzeProject(rootDir) {
    console.log('🔍 Analyzing Knoux Clipboard AI project...\n');
    
    this.analyzeDirectory(rootDir);
    this.calculateMetrics();
    this.generateReport();
    
    return {
      metrics: this.metrics,
      problems: this.problems,
      grade: this.calculateGrade()
    };
  }

  analyzeDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldSkipDirectory(entry.name)) {
          this.analyzeDirectory(fullPath);
        }
      } else if (this.isSourceFile(entry.name)) {
        this.analyzeFile(fullPath);
      }
    }
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.metrics.totalFiles++;
      this.metrics.totalLines += lines.length;
      
      let fileMetrics = {
        code: 0,
        comments: 0,
        empty: 0,
        functions: 0,
        classes: 0,
        components: 0
      };
      
      lines.forEach(line => {
        const trimmed = line.trim();
        
        if (trimmed === '') {
          fileMetrics.empty++;
          this.metrics.emptyLines++;
        } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          fileMetrics.comments++;
          this.metrics.commentLines++;
        } else {
          fileMetrics.code++;
          this.metrics.codeLines++;
          
          // Count functions
          if (trimmed.match(/^(export\s+)?(async\s+)?function\s+\w+|^(const|let|var)\s+\w+\s*=\s*(async\s+)?\(|^\s*\w+\(/)) {
            fileMetrics.functions++;
            this.metrics.functions++;
          }
          
          // Count classes
          if (trimmed.match(/^class\s+\w+/)) {
            fileMetrics.classes++;
            this.metrics.classes++;
          }
          
          // Count React components
          if (trimmed.match(/export\s+(default\s+)?(function|const)\s+\w+.*=>|class\s+\w+.*extends\s+(React\.)?Component/)) {
            if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
              fileMetrics.components++;
              this.metrics.components++;
            }
          }
        }
      });
      
      // Check for problems
      this.checkFileProblems(relativePath, fileMetrics, lines.length);
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  checkFileProblems(filePath, metrics, totalLines) {
    // Check comment ratio
    const commentRatio = metrics.comments / (metrics.code + metrics.comments);
    if (commentRatio < this.thresholds.commentRatio) {
      this.problems.push({
        type: 'low_comments',
        file: filePath,
        severity: 'warning',
        message: `Low comment ratio: ${(commentRatio * 100).toFixed(1)}% (target: ${this.thresholds.commentRatio * 100}%)`,
        value: commentRatio
      });
    }
    
    // Check file size
    if (totalLines > this.thresholds.maxFileSize) {
      this.problems.push({
        type: 'large_file',
        file: filePath,
        severity: 'error',
        message: `File too large: ${totalLines} lines (max: ${this.thresholds.maxFileSize})`,
        value: totalLines
      });
    }
    
    // Check function count
    if (metrics.functions > this.thresholds.maxFunctionsPerFile) {
      this.problems.push({
        type: 'many_functions',
        file: filePath,
        severity: 'warning',
        message: `Too many functions: ${metrics.functions} (max: ${this.thresholds.maxFunctionsPerFile})`,
        value: metrics.functions
      });
    }
  }

  calculateMetrics() {
    // Calculate ratios
    this.metrics.commentRatio = this.metrics.commentLines / (this.metrics.codeLines + this.metrics.commentLines);
    this.metrics.emptyLineRatio = this.metrics.emptyLines / this.metrics.totalLines;
    this.metrics.functionsPerFile = this.metrics.functions / this.metrics.totalFiles;
    this.metrics.linesPerFile = this.metrics.totalLines / this.metrics.totalFiles;
    
    // Count tests
    this.countTests();
  }

  countTests() {
    const testDir = path.join(process.cwd(), 'app', 'tests');
    if (fs.existsSync(testDir)) {
      const testFiles = this.getFilesRecursive(testDir, /\.test\.(ts|tsx|js|jsx)$/);
      this.metrics.tests = testFiles.length;
    }
  }

  getFilesRecursive(dir, pattern) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files = files.concat(this.getFilesRecursive(fullPath, pattern));
      } else if (entry.name.match(pattern)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  generateReport() {
    console.log('📊 CODE QUALITY REPORT\n');
    console.log('📈 Metrics Summary:');
    console.log(`   Total Files: ${this.metrics.totalFiles}`);
    console.log(`   Total Lines: ${this.metrics.totalLines.toLocaleString()}`);
    console.log(`   Code Lines: ${this.metrics.codeLines.toLocaleString()}`);
    console.log(`   Comment Lines: ${this.metrics.commentLines.toLocaleString()}`);
    console.log(`   Comment Ratio: ${(this.metrics.commentRatio * 100).toFixed(1)}%`);
    console.log(`   Functions: ${this.metrics.functions}`);
    console.log(`   Classes: ${this.metrics.classes}`);
    console.log(`   Components: ${this.metrics.components}`);
    console.log(`   Tests: ${this.metrics.tests}`);
    console.log(`   Lines per File: ${this.metrics.linesPerFile.toFixed(1)}`);
    console.log(`   Functions per File: ${this.metrics.functionsPerFile.toFixed(1)}`);
    
    console.log('\n⚠️  Problems Found:');
    if (this.problems.length === 0) {
      console.log('   ✅ No problems found!');
    } else {
      const errors = this.problems.filter(p => p.severity === 'error');
      const warnings = this.problems.filter(p => p.severity === 'warning');
      
      if (errors.length > 0) {
        console.log(`   ❌ ${errors.length} Errors:`);
        errors.forEach(problem => {
          console.log(`      ${problem.file}: ${problem.message}`);
        });
      }
      
      if (warnings.length > 0) {
        console.log(`   ⚠️  ${warnings.length} Warnings:`);
        warnings.forEach(problem => {
          console.log(`      ${problem.file}: ${problem.message}`);
        });
      }
    }
    
    console.log('\n🏆 Grade:', this.calculateGrade());
    console.log('\n💡 Recommendations:');
    this.generateRecommendations();
  }

  calculateGrade() {
    let score = 100;
    
    // Deduct for problems
    this.problems.forEach(problem => {
      if (problem.severity === 'error') score -= 10;
      if (problem.severity === 'warning') score -= 5;
    });
    
    // Deduct for low comment ratio
    if (this.metrics.commentRatio < this.thresholds.commentRatio) {
      score -= 20;
    }
    
    // Deduct for low test coverage
    const testRatio = this.metrics.tests / this.metrics.totalFiles;
    if (testRatio < this.thresholds.testCoverage) {
      score -= 15;
    }
    
    // Cap score
    score = Math.max(0, Math.min(100, score));
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.commentRatio < this.thresholds.commentRatio) {
      const neededComments = Math.ceil(
        (this.thresholds.commentRatio * (this.metrics.codeLines + this.metrics.commentLines)) - this.metrics.commentLines
      );
      recommendations.push(`Add approximately ${neededComments} more comment lines to reach ${this.thresholds.commentRatio * 100}% target`);
    }
    
    const largeFiles = this.problems.filter(p => p.type === 'large_file');
    if (largeFiles.length > 0) {
      recommendations.push(`Split ${largeFiles.length} large files into smaller modules`);
    }
    
    const manyFunctions = this.problems.filter(p => p.type === 'many_functions');
    if (manyFunctions.length > 0) {
      recommendations.push(`Refactor ${manyFunctions.length} files with too many functions`);
    }
    
    const testRatio = this.metrics.tests / this.metrics.totalFiles;
    if (testRatio < this.thresholds.testCoverage) {
      const neededTests = Math.ceil(this.thresholds.testCoverage * this.metrics.totalFiles - this.metrics.tests);
      recommendations.push(`Add ${neededTests} more test files to reach ${this.thresholds.testCoverage * 100}% coverage`);
    }
    
    if (this.metrics.classes < this.metrics.functions / 50) {
      recommendations.push('Consider converting some functions to classes for better organization');
    }
    
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '.git',
      '.vscode',
      '.idea'
    ];
    return skipDirs.includes(dirName);
  }

  isSourceFile(fileName) {
    return /\.(ts|tsx|js|jsx)$/.test(fileName);
  }
}

// Run analysis
const analyzer = new CodeAnalyzer();
const results = analyzer.analyzeProject(process.cwd());

// Save results to file
const reportFile = path.join(process.cwd(), 'code-quality-report.json');
fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
console.log(`\n📄 Report saved to: ${reportFile}`);
