/**
 * Code Block Extractor - JavaScript Implementation
 * Ported from Python to JavaScript for web-based extraction
 */

class CodeBlock {
    constructor(content, language = null, startLine = 0) {
        this.content = content.trim();
        this.language = language || this.detectLanguage();
        this.startLine = startLine;
        this.hash = this.generateHash(this.content);
    }

    detectLanguage() {
        const content = this.content.toLowerCase();
        
        // Language detection patterns
        const patterns = {
            python: [
                /def\s+\w+\(/,
                /import\s+\w+/,
                /from\s+\w+\s+import/,
                /print\s*\(/,
                /class\s+\w+/
            ],
            javascript: [
                /function\s+\w+\(/,
                /const\s+\w+\s*=/,
                /let\s+\w+\s*=/,
                /console\.log\(/,
                /document\./
            ],
            java: [
                /public\s+class\s+\w+/,
                /public\s+static\s+void\s+main/,
                /System\.out\.print/
            ],
            c: [
                /#include\s*</,
                /int\s+main\s*\(/,
                /printf\s*\(/
            ],
            cpp: [
                /#include\s*</,
                /std::/,
                /cout\s*<</
            ],
            html: [
                /<html/,
                /<div/,
                /<body/,
                /<!DOCTYPE/
            ],
            css: [
                /\w+\s*\{[^}]*\}/,
                /@media/,
                /\.[\w-]+\s*\{/
            ],
            sql: [
                /SELECT\s+/i,
                /FROM\s+/i,
                /WHERE\s+/i,
                /INSERT\s+INTO/i
            ],
            bash: [
                /#!/bin\/bash/,
                /echo\s+/,
                /\$\w+/,
                /if\s*\[\s*/
            ],
            dockerfile: [
                /FROM\s+\w+/,
                /RUN\s+/,
                /COPY\s+/,
                /WORKDIR\s+/,
                /EXPOSE\s+/,
                /CMD\s*\[/
            ],
            json: [
                /^\s*\{/,
                /^\s*\[/,
                /"\w+":\s*/
            ],
            yaml: [
                /^\w+:/m,
                /^\s*-\s+\w+/m
            ],
            xml: [
                /<\?xml/,
                /<\w+.*>.*<\/\w+>/
            ]
        };

        for (const [lang, patternList] of Object.entries(patterns)) {
            for (const pattern of patternList) {
                if (pattern.test(this.content)) {
                    return lang;
                }
            }
        }

        return 'txt';
    }

    getFileExtension() {
        const extensions = {
            python: '.py',
            javascript: '.js',
            java: '.java',
            c: '.c',
            cpp: '.cpp',
            html: '.html',
            css: '.css',
            sql: '.sql',
            bash: '.sh',
            dockerfile: '.dockerfile',
            json: '.json',
            yaml: '.yml',
            xml: '.xml',
            txt: '.txt'
        };
        return extensions[this.language] || '.txt';
    }

    generateHash(content) {
        let hash = 0;
        if (content.length === 0) return hash.toString(16).padStart(8, '0');
        
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
    }
}

class CodeExtractor {
    constructor(outputName = "extracted_code") {
        this.outputName = outputName;
        this.stats = {
            filesProcessed: 0,
            codeBlocksFound: 0,
            languagesDetected: new Set(),
            topicsCreated: new Set()
        };
    }

    extractMarkdownCodeBlocks(content) {
        const codeBlocks = [];
        
        // Pattern for fenced code blocks with optional language
        const pattern = /```(\w+)?\n([\s\S]*?)\n```/g;
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            const language = match[1];
            const codeContent = match[2];
            const startLine = content.substring(0, match.index).split('\n').length;
            
            // Only add non-empty blocks with substantial content
            if (codeContent.trim() && codeContent.trim().length > 20) {
                codeBlocks.push(new CodeBlock(codeContent, language, startLine));
            }
        }
        
        return codeBlocks;
    }

    extractIndentedCodeBlocks(content) {
        const lines = content.split('\n');
        const codeBlocks = [];
        let currentBlock = [];
        let currentStart = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if line is indented with 4+ spaces or starts with tab
            if (/^(    |\t)/.test(line) || (line.trim() === '' && currentBlock.length > 0)) {
                if (currentBlock.length === 0) {
                    currentStart = i;
                }
                currentBlock.push(line);
            } else {
                if (currentBlock.length > 0 && currentBlock.some(l => l.trim())) {
                    const blockContent = currentBlock.join('\n').trim();
                    
                    // Only add blocks that are substantial and look like code
                    if (blockContent && currentBlock.length > 3 && blockContent.length > 50) {
                        if (this.looksLikeCode(blockContent)) {
                            codeBlocks.push(new CodeBlock(blockContent, null, currentStart));
                        }
                    }
                }
                currentBlock = [];
            }
        }

        // Handle last block
        if (currentBlock.length > 0 && currentBlock.some(l => l.trim())) {
            const blockContent = currentBlock.join('\n').trim();
            if (blockContent && currentBlock.length > 3 && blockContent.length > 50) {
                if (this.looksLikeCode(blockContent)) {
                    codeBlocks.push(new CodeBlock(blockContent, null, currentStart));
                }
            }
        }

        return codeBlocks;
    }

    looksLikeCode(content) {
        // Look for programming patterns
        const codePatterns = [
            /[a-zA-Z_]\w*\s*\(/,  // Function calls
            /[a-zA-Z_]\w*\s*=/,   // Variable assignments
            /\{[^}]*\}/,          // Braces
            /["\'][^"\']*["\']/, // Quoted strings
            /\/\/.*|\/\*.*\*\/|#.*/, // Comments
            /\w+\.\w+/,           // Method calls
            /if\s*\(|while\s*\(|for\s*\(/, // Control structures
            /<\/?\w+[^>]*>/,      // HTML tags
            /[a-zA-Z-]+:\s*[^;]+;/ // CSS properties
        ];

        let matches = 0;
        for (const pattern of codePatterns) {
            if (pattern.test(content)) {
                matches++;
            }
        }

        // Consider it code if it has at least 2 programming patterns
        return matches >= 2;
    }

    extractCodeBlocks(content) {
        const codeBlocks = [];

        // Extract markdown fenced code blocks
        codeBlocks.push(...this.extractMarkdownCodeBlocks(content));

        // Extract indented code blocks (but avoid duplicates)
        const indentedBlocks = this.extractIndentedCodeBlocks(content);
        
        // Filter out indented blocks that overlap with fenced blocks
        for (const indentedBlock of indentedBlocks) {
            let isDuplicate = false;
            for (const existingBlock of codeBlocks) {
                // Simple overlap detection
                if (Math.abs(indentedBlock.startLine - existingBlock.startLine) < 5 &&
                    existingBlock.content.includes(indentedBlock.content.substring(0, 100))) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                codeBlocks.push(indentedBlock);
            }
        }

        return codeBlocks;
    }

    generateTopicName(fileName, content) {
        // Try to extract topic from content (look for titles, headers)
        const titlePatterns = [
            /^#\s+(.+)$/m,  // Markdown h1
            /^##\s+(.+)$/m, // Markdown h2
            /^Title:\s*(.+)$/m, // Title: format
            /^Subject:\s*(.+)$/m // Subject: format
        ];

        for (const pattern of titlePatterns) {
            const match = content.match(pattern);
            if (match) {
                let topic = match[1].replace(/[^\w\s-]/g, '').trim();
                topic = topic.replace(/\s+/g, '_');
                return topic.slice(0, 50); // Limit length
            }
        }

        // Fall back to filename
        const baseName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
        return baseName || 'unknown_topic';
    }

    async processFile(file) {
        try {
            const content = await this.readFileAsText(file);
            
            // Extract code blocks
            const codeBlocks = this.extractCodeBlocks(content);
            
            if (codeBlocks.length === 0) {
                return { message: 'No code blocks found' };
            }

            // Generate topic name
            const topicName = this.generateTopicName(file.name, content);
            
            // Create file structure
            const extractedFiles = [];
            for (let i = 0; i < codeBlocks.length; i++) {
                const codeBlock = codeBlocks[i];
                const index = i + 1;
                
                let fileName;
                if (codeBlock.language && codeBlock.language !== 'txt') {
                    fileName = `code_${index.toString().padStart(2, '0')}_${codeBlock.language}_${codeBlock.hash}${codeBlock.getFileExtension()}`;
                } else {
                    fileName = `code_${index.toString().padStart(2, '0')}_${codeBlock.hash}${codeBlock.getFileExtension()}`;
                }

                extractedFiles.push({
                    fileName: fileName,
                    content: codeBlock.content,
                    language: codeBlock.language,
                    lines: codeBlock.content.split('\n').length,
                    hash: codeBlock.hash,
                    extension: codeBlock.getFileExtension()
                });

                // Update stats
                this.stats.languagesDetected.add(codeBlock.language);
            }

            // Create metadata
            const metadata = {
                sourceFile: file.name,
                topic: topicName,
                totalBlocks: codeBlocks.length,
                codeFiles: extractedFiles.map(f => ({
                    fileName: f.fileName,
                    language: f.language,
                    lines: f.lines,
                    hash: f.hash
                })),
                processedAt: new Date().toISOString()
            };

            // Update stats
            this.stats.filesProcessed += 1;
            this.stats.codeBlocksFound += codeBlocks.length;
            this.stats.topicsCreated.add(topicName);

            return {
                topic: topicName,
                blocksExtracted: codeBlocks.length,
                files: extractedFiles,
                metadata: metadata
            };

        } catch (error) {
            return { error: `Failed to process file: ${error.message}` };
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    getStats() {
        return {
            filesProcessed: this.stats.filesProcessed,
            codeBlocksFound: this.stats.codeBlocksFound,
            languagesDetected: Array.from(this.stats.languagesDetected),
            topicsCreated: Array.from(this.stats.topicsCreated)
        };
    }

    reset() {
        this.stats = {
            filesProcessed: 0,
            codeBlocksFound: 0,
            languagesDetected: new Set(),
            topicsCreated: new Set()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CodeExtractor, CodeBlock };
}