/**
 * Code Block Extractor - Main Application
 * Web-based interface for extracting code blocks from files
 */

class CodeExtractorApp {
    constructor() {
        this.extractor = new CodeExtractor();
        this.selectedFiles = new Map();
        this.extractionResults = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File input and drag-and-drop
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Buttons
        document.getElementById('processBtn').addEventListener('click', () => this.processFiles());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearFiles());
        document.getElementById('downloadAllBtn').addEventListener('click', () => this.downloadAll());
        document.getElementById('newExtractionBtn').addEventListener('click', () => this.startNewExtraction());
        document.getElementById('retryBtn').addEventListener('click', () => this.hideError());

        // Settings
        document.getElementById('outputName').addEventListener('input', (e) => {
            this.extractor.outputName = e.target.value || 'extracted_code';
        });
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.addFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        this.addFiles(files);
    }

    addFiles(files) {
        const validExtensions = ['.md', '.txt', '.log', '.rtf', '.text'];
        const validFiles = files.filter(file => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            return validExtensions.includes(ext) || !file.name.includes('.');
        });

        if (validFiles.length !== files.length) {
            this.showNotification('Some files were skipped. Only text files are supported.', 'warning');
        }

        validFiles.forEach(file => {
            if (!this.selectedFiles.has(file.name)) {
                this.selectedFiles.set(file.name, file);
            }
        });

        this.updateFileList();
        this.updateUI();
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        if (this.selectedFiles.size === 0) {
            fileList.innerHTML = '<p class="no-files">No files selected</p>';
            return;
        }

        this.selectedFiles.forEach((file, fileName) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item fade-in';
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-text"></i>
                    <div class="file-details">
                        <div class="file-name">${fileName}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="file-remove" onclick="app.removeFile('${fileName}')" title="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            `;

            fileList.appendChild(fileItem);
        });
    }

    removeFile(fileName) {
        this.selectedFiles.delete(fileName);
        this.updateFileList();
        this.updateUI();
    }

    clearFiles() {
        this.selectedFiles.clear();
        this.updateFileList();
        this.updateUI();
        document.getElementById('fileInput').value = '';
    }

    updateUI() {
        const hasFiles = this.selectedFiles.size > 0;
        
        document.getElementById('optionsSection').style.display = hasFiles ? 'block' : 'none';
        document.getElementById('fileListSection').style.display = hasFiles ? 'block' : 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
    }

    async processFiles() {
        if (this.selectedFiles.size === 0) {
            this.showNotification('Please select files to process', 'error');
            return;
        }

        this.showProgress();
        this.extractor.reset();

        const files = Array.from(this.selectedFiles.values());
        const results = [];
        let processed = 0;

        try {
            for (const file of files) {
                this.updateProgress((processed / files.length) * 100, `Processing ${file.name}...`);
                this.addProgressDetail(`📁 Processing file: ${file.name}`);

                const result = await this.extractor.processFile(file);
                results.push({ file: file.name, result });

                if (result.error) {
                    this.addProgressDetail(`❌ Error: ${result.error}`);
                } else if (result.message) {
                    this.addProgressDetail(`ℹ️ ${result.message}`);
                } else {
                    this.addProgressDetail(`✅ Extracted ${result.blocksExtracted} code blocks -> ${result.topic}`);
                }

                processed++;
            }

            this.updateProgress(100, 'Processing complete!');
            
            // Wait a moment to show completion
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.extractionResults = results;
            this.showResults();

        } catch (error) {
            this.showError(`Processing failed: ${error.message}`);
        }
    }

    showProgress() {
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('progressSection').scrollIntoView({ behavior: 'smooth' });
    }

    updateProgress(percentage, text) {
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = text;
    }

    addProgressDetail(detail) {
        const progressDetails = document.getElementById('progressDetails');
        progressDetails.innerHTML += detail + '\n';
        progressDetails.scrollTop = progressDetails.scrollHeight;
    }

    showResults() {
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });

        const stats = this.extractor.getStats();
        this.displayStats(stats);
        this.displayExtractedFiles();
    }

    displayStats(stats) {
        const statsGrid = document.getElementById('extractionStats');
        statsGrid.innerHTML = `
            <div class="stat-card">
                <span class="stat-number">${stats.filesProcessed}</span>
                <span class="stat-label">Files Processed</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.codeBlocksFound}</span>
                <span class="stat-label">Code Blocks Found</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.topicsCreated.length}</span>
                <span class="stat-label">Topics Created</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.languagesDetected.length}</span>
                <span class="stat-label">Languages Detected</span>
            </div>
        `;
    }

    displayExtractedFiles() {
        const extractedFilesDiv = document.getElementById('extractedFiles');
        extractedFilesDiv.innerHTML = '';

        if (!this.extractionResults || this.extractionResults.length === 0) {
            extractedFilesDiv.innerHTML = '<p>No results to display</p>';
            return;
        }

        // Group results by topic
        const topicGroups = new Map();
        
        this.extractionResults.forEach(({ file, result }) => {
            if (result.files && result.files.length > 0) {
                if (!topicGroups.has(result.topic)) {
                    topicGroups.set(result.topic, []);
                }
                topicGroups.get(result.topic).push({ sourceFile: file, ...result });
            }
        });

        topicGroups.forEach((topicResults, topicName) => {
            const topicGroup = document.createElement('div');
            topicGroup.className = 'topic-group fade-in';

            const allFiles = topicResults.flatMap(r => r.files);
            const totalBlocks = topicResults.reduce((sum, r) => sum + r.blocksExtracted, 0);

            topicGroup.innerHTML = `
                <div class="topic-title">
                    <i class="fas fa-folder"></i>
                    ${topicName} (${totalBlocks} code blocks)
                </div>
                <div class="code-files">
                    ${allFiles.map(file => this.createCodeFileHTML(file, topicName)).join('')}
                </div>
            `;

            extractedFilesDiv.appendChild(topicGroup);
        });
    }

    createCodeFileHTML(file, topicName) {
        const languageColors = {
            python: '#3776ab',
            javascript: '#f7df1e',
            java: '#f89820',
            html: '#e34c26',
            css: '#1572b6',
            sql: '#00618a',
            bash: '#89e051',
            json: '#000000',
            yaml: '#cc1018',
            cpp: '#00599c',
            c: '#555555'
        };

        const bgColor = languageColors[file.language] || '#6c757d';

        return `
            <div class="code-file">
                <div class="code-file-info">
                    <span class="language-badge" style="background-color: ${bgColor}">
                        ${file.language}
                    </span>
                    <span class="code-file-name">${file.fileName}</span>
                    <span class="code-file-stats">${file.lines} lines</span>
                </div>
                <button class="download-single" onclick="app.downloadSingleFile('${topicName}', '${file.fileName}', \`${file.content.replace(/`/g, '\\`')}\`)">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
    }

    async downloadAll() {
        if (!this.extractionResults) return;

        try {
            const zip = new JSZip();
            const stats = this.extractor.getStats();

            // Group files by topic
            const topicGroups = new Map();
            
            this.extractionResults.forEach(({ file, result }) => {
                if (result.files && result.files.length > 0) {
                    if (!topicGroups.has(result.topic)) {
                        topicGroups.set(result.topic, { files: [], metadata: result.metadata });
                    }
                    topicGroups.get(result.topic).files.push(...result.files);
                }
            });

            // Add files to ZIP
            topicGroups.forEach((topicData, topicName) => {
                const folder = zip.folder(topicName);
                
                // Add code files
                topicData.files.forEach(file => {
                    folder.file(file.fileName, file.content);
                });

                // Add metadata if enabled
                if (document.getElementById('includeMetadata').checked && topicData.metadata) {
                    folder.file('metadata.json', JSON.stringify(topicData.metadata, null, 2));
                }
            });

            // Add summary file
            const summary = {
                extraction_summary: {
                    total_files_processed: stats.filesProcessed,
                    total_code_blocks: stats.codeBlocksFound,
                    topics_created: stats.topicsCreated,
                    languages_detected: stats.languagesDetected,
                    processed_at: new Date().toISOString()
                },
                topics: Array.from(topicGroups.keys())
            };
            
            zip.file('EXTRACTION_SUMMARY.json', JSON.stringify(summary, null, 2));

            // Generate and download ZIP
            const blob = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(blob, `${this.extractor.outputName}.zip`);

            this.showNotification('Download started successfully!', 'success');

        } catch (error) {
            this.showError(`Failed to create download: ${error.message}`);
        }
    }

    downloadSingleFile(topicName, fileName, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        this.downloadBlob(blob, fileName);
    }

    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    startNewExtraction() {
        this.clearFiles();
        this.extractionResults = null;
        this.extractor.reset();
        
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showError(message) {
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'block';
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorSection').scrollIntoView({ behavior: 'smooth' });
    }

    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Add animation class
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showHelp() {
        document.getElementById('helpModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeHelp() {
        document.getElementById('helpModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    async loadDemo() {
        try {
            // Create a demo file with sample content
            const demoContent = `# Demo Conversation - Code Extraction Example

This is a demonstration of the code extraction capabilities.

## Python Database Connection

Here's a Python script for database operations:

\`\`\`python
import sqlite3
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path):
        self.db_path = db_path
        self.connection = None
    
    def connect(self):
        """Connect to SQLite database"""
        try:
            self.connection = sqlite3.connect(self.db_path)
            print(f"Connected to {self.db_path}")
            return True
        except sqlite3.Error as e:
            print(f"Error connecting: {e}")
            return False
    
    def create_users_table(self):
        """Create users table if it doesn't exist"""
        query = """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor = self.connection.cursor()
        cursor.execute(query)
        self.connection.commit()
        print("Users table created successfully")
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            print("Database connection closed")

# Usage example
if __name__ == "__main__":
    db = DatabaseManager("demo.db")
    if db.connect():
        db.create_users_table()
        db.close()
\`\`\`

## JavaScript Frontend Code

And here's the corresponding frontend JavaScript:

\`\`\`javascript
class UserInterface {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadUsers();
        this.renderUserList();
    }

    setupEventListeners() {
        const form = document.getElementById('user-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/users');
            this.users = await response.json();
            console.log(\`Loaded \${this.users.length} users\`);
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showNotification('Failed to load users', 'error');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const newUser = await response.json();
                this.users.push(newUser);
                this.renderUserList();
                event.target.reset();
                this.showNotification('User added successfully!', 'success');
            }
        } catch (error) {
            this.showNotification('Error adding user', 'error');
        }
    }

    renderUserList() {
        const container = document.getElementById('users-container');
        container.innerHTML = '';

        this.users.forEach(user => {
            const userCard = this.createUserCard(user);
            container.appendChild(userCard);
        });
    }

    createUserCard(user) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = \`
            <h3>\${user.name}</h3>
            <p>\${user.email}</p>
            <small>Joined: \${new Date(user.created_at).toLocaleDateString()}</small>
            <div class="actions">
                <button onclick="ui.editUser(\${user.id})">Edit</button>
                <button onclick="ui.deleteUser(\${user.id})" class="delete-btn">Delete</button>
            </div>
        \`;
        return card;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = \`notification \${type}\`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UserInterface();
});
\`\`\`

## SQL Queries

Some useful SQL queries for the database:

\`\`\`sql
-- Select all users with their details
SELECT 
    id,
    name,
    email,
    created_at,
    strftime('%Y-%m-%d', created_at) as join_date
FROM users 
ORDER BY created_at DESC;

-- Find users by email domain
SELECT * FROM users 
WHERE email LIKE '%@company.com%';

-- Count users by join month
SELECT 
    strftime('%Y-%m', created_at) as month,
    COUNT(*) as user_count
FROM users 
GROUP BY strftime('%Y-%m', created_at)
ORDER BY month DESC;

-- Update user information
UPDATE users 
SET name = 'John Smith Updated'
WHERE email = 'john@example.com';

-- Delete inactive users (example criteria)
DELETE FROM users 
WHERE created_at < datetime('now', '-1 year');
\`\`\`

## Configuration YAML

Application configuration file:

\`\`\`yaml
# Application Configuration
app:
  name: "User Management Demo"
  version: "2.0.0"
  environment: "development"
  debug: true

database:
  type: "sqlite"
  path: "./data/demo.db"
  pool_size: 5
  timeout: 30
  backup_enabled: true

server:
  host: "localhost"
  port: 3000
  cors_enabled: true
  rate_limiting:
    enabled: true
    max_requests: 100
    window_minutes: 15

logging:
  level: "DEBUG"
  format: "json"
  output: "console"
  file_path: "./logs/app.log"

features:
  user_registration: true
  email_verification: false
  password_reset: true
  admin_panel: true
  api_documentation: true

security:
  jwt_secret: "demo-secret-key"
  token_expiry_hours: 24
  password_requirements:
    min_length: 8
    require_uppercase: true
    require_lowercase: true
    require_numbers: true
    require_symbols: false
\`\`\`

This demo file contains multiple programming languages and code blocks that will be extracted and organized by the tool!`;

            // Create a blob and simulate file selection
            const blob = new Blob([demoContent], { type: 'text/markdown' });
            const file = new File([blob], 'demo_conversation.md', { type: 'text/markdown' });
            
            // Clear existing files and add demo
            this.selectedFiles.clear();
            this.selectedFiles.set(file.name, file);
            
            // Update UI
            this.updateFileList();
            this.updateUI();
            
            this.showNotification('Demo file loaded! Click "Extract Code Blocks" to see it in action.', 'success');
            
            // Scroll to file list
            document.getElementById('fileListSection').scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            this.showError('Failed to load demo file');
        }
    }
}

// Initialize the application when the page loads
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new CodeExtractorApp();
    
    // Add notification styles if not already present
    if (!document.querySelector('style[data-notifications]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notifications', 'true');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                background: #27ae60;
            }
            
            .notification-error {
                background: #e74c3c;
            }
            
            .notification-warning {
                background: #f39c12;
            }
            
            .notification-info {
                background: #3498db;
            }
        `;
        document.head.appendChild(style);
    }

    // Add modal click-outside-to-close functionality
    document.addEventListener('click', (e) => {
        if (e.target.id === 'helpModal') {
            app.closeHelp();
        }
    });
    
    // Add escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            app.closeHelp();
        }
    });
});