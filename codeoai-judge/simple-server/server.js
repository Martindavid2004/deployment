const express = require('express');
const cors = require('cors');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 2358; // Keep internal port as 2358

app.use(cors());
app.use(express.json());

// Supported languages
const languages = [
  {
    id: 1,
    name: "C (GCC)",
    extension: "c",
    compile: "gcc {file} -o {executable}",
    run: "./{executable}",
    needsCompile: true
  },
  {
    id: 2, 
    name: "C++ (G++)",
    extension: "cpp",
    compile: "g++ {file} -o {executable}",
    run: "./{executable}",
    needsCompile: true
  },
  {
    id: 3,
    name: "Java (OpenJDK)",
    extension: "java",
    compile: "javac {file}",
    run: "java {className}",
    needsCompile: true
  },
  {
    id: 4,
    name: "Python (3.x)",
    extension: "py", 
    compile: null,
    run: "python3 {file}",
    needsCompile: false
  },
  {
    id: 5,
    name: "JavaScript (Node.js)",
    extension: "js",
    compile: null,
    run: "node {file}",
    needsCompile: false
  }
];

// Create temp directory
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Get supported languages
app.get('/languages', (req, res) => {
  res.json(languages.map(lang => ({
    id: lang.id,
    name: lang.name
  })));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CodoAI is running',
    product: 'CodoAI Code Execution Engine',
    version: '1.0.0'
  });
});

// Execute code
app.post('/submissions', async (req, res) => {
  const { language_id, source_code, stdin = '', wait = false } = req.body;
  
  const submissionId = uuidv4();
  const language = languages.find(l => l.id === language_id);
  
  if (!language) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  try {
    const result = await executeCode(language, source_code, stdin, submissionId);
    
    const response = {
      token: submissionId,
      language_id: language_id,
      language: {
        id: language_id,
        name: language.name
      },
      source_code: source_code,
      stdin: stdin || null,
      stdout: result.stdout,
      stderr: result.stderr || null,
      status_id: result.status_id,
      status: {
        id: result.status_id,
        description: result.status_description
      },
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      time: result.time,
      memory: result.memory,
      exit_code: result.exit_code,
      compile_output: result.compile_output || null,
      message: result.message || null
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      token: submissionId,
      error: error.message,
      status_id: 13,
      status: { id: 13, description: "Internal Error" }
    });
  }
});

async function executeCode(language, sourceCode, stdin, submissionId) {
  const workDir = path.join(tempDir, submissionId);
  fs.mkdirSync(workDir);
  
  try {
    const startTime = Date.now();
    let result = {
      stdout: '',
      stderr: '',
      exit_code: 0,
      time: 0,
      memory: 1024, // placeholder
      status_id: 3,
      status_description: 'Accepted',
      compile_output: null,
      message: null
    };

    // Write source code to file
    let fileName = `main.${language.extension}`;
    
    // Special handling for Java - use Main.java for public class Main
    if (language.id === 3 && sourceCode.includes('public class Main')) {
      fileName = `Main.java`;
    }
    
    const filePath = path.join(workDir, fileName);
    fs.writeFileSync(filePath, sourceCode);

    // Write stdin to file
    const stdinPath = path.join(workDir, 'input.txt');
    fs.writeFileSync(stdinPath, stdin);

    // Change to work directory
    const originalDir = process.cwd();
    process.chdir(workDir);

    try {
      // Compile if needed
      if (language.needsCompile) {
        const executable = language.id === 3 ? 'Main' : 'main'; // Java uses class name
        const className = language.id === 3 ? 'Main' : '';
        
        let compileCmd = language.compile
          .replace('{file}', fileName)
          .replace('{executable}', executable)
          .replace('{className}', className);

        try {
          const compileOutput = execSync(compileCmd, { 
            timeout: 10000,
            encoding: 'utf8',
            cwd: workDir 
          });
          result.compile_output = compileOutput || null;
        } catch (compileError) {
          result.stderr = compileError.stderr || compileError.message;
          result.status_id = 6;
          result.status_description = 'Compilation Error';
          result.exit_code = compileError.status || 1;
          return result;
        }
      }

      // Execute
      const executable = language.id === 3 ? 'Main' : 'main';
      const className = language.id === 3 ? 'Main' : '';
      
      let runCmd = language.run
        .replace('{file}', fileName)
        .replace('{executable}', executable)
        .replace('{className}', className);

      const runResult = execSync(`${runCmd} < input.txt`, {
        timeout: 10000,
        encoding: 'utf8',
        cwd: workDir
      });

      result.stdout = runResult;
      result.time = (Date.now() - startTime) / 1000; // seconds
      
    } catch (runError) {
      result.stderr = runError.stderr || runError.message;
      result.exit_code = runError.status || 1;
      
      if (runError.killed && runError.signal === 'SIGTERM') {
        result.status_id = 5;
        result.status_description = 'Time Limit Exceeded';
      } else {
        result.status_id = 4;
        result.status_description = 'Runtime Error';
      }
    } finally {
      process.chdir(originalDir);
    }

    return result;
    
  } finally {
    // Cleanup
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch (e) {
      console.warn('Cleanup failed:', e.message);
    }
  }
}

app.listen(PORT, () => {
  console.log(`🚀 CodoAI running on http://localhost:${PORT}`);
  console.log(`📝 Supported languages: ${languages.length}`);
  console.log('✅ Ready to execute code!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down CodoAI...');
  process.exit(0);
});