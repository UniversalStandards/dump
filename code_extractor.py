#!/usr/bin/env python3
"""
Code Block Extractor

This script processes files (especially conversation dumps) and extracts code blocks
into separate files organized by topic/conversation.
"""

import os
import re
import argparse
import hashlib
from pathlib import Path
from typing import List, Tuple, Dict
import json


class CodeBlock:
    """Represents a code block with metadata."""
    
    def __init__(self, content: str, language: str = None, start_line: int = 0):
        self.content = content.strip()
        self.language = language or self._detect_language()
        self.start_line = start_line
        self.hash = hashlib.md5(self.content.encode()).hexdigest()[:8]
    
    def _detect_language(self) -> str:
        """Detect programming language from content."""
        content_lower = self.content.lower()
        
        # Common patterns for language detection
        patterns = {
            'python': [r'def\s+\w+\(', r'import\s+\w+', r'from\s+\w+\s+import', r'print\s*\(', r'class\s+\w+'],
            'javascript': [r'function\s+\w+\(', r'const\s+\w+\s*=', r'let\s+\w+\s*=', r'console\.log\(', r'document\.'],
            'java': [r'public\s+class\s+\w+', r'public\s+static\s+void\s+main', r'System\.out\.print'],
            'c': [r'#include\s*<', r'int\s+main\s*\(', r'printf\s*\('],
            'cpp': [r'#include\s*<', r'std::', r'cout\s*<<'],
            'html': [r'<html', r'<div', r'<body', r'<!DOCTYPE'],
            'css': [r'\w+\s*\{[^}]*\}', r'@media', r'\.[\w-]+\s*\{'],
            'sql': [r'SELECT\s+', r'FROM\s+', r'WHERE\s+', r'INSERT\s+INTO'],
            'bash': [r'#!/bin/bash', r'echo\s+', r'\$\w+', r'if\s*\[\s*'],
            'dockerfile': [r'FROM\s+\w+', r'RUN\s+', r'COPY\s+', r'WORKDIR\s+', r'EXPOSE\s+', r'CMD\s*\['],
            'json': [r'^\s*\{', r'^\s*\[', r'"\w+":\s*'],
            'yaml': [r'^\w+:', r'^\s*-\s+\w+'],
            'xml': [r'<\?xml', r'<\w+.*>.*</\w+>']
        }
        
        for lang, pattern_list in patterns.items():
            for pattern in pattern_list:
                if re.search(pattern, self.content, re.MULTILINE | re.IGNORECASE):
                    return lang
        
        return 'txt'
    
    def get_file_extension(self) -> str:
        """Get appropriate file extension for the language."""
        extensions = {
            'python': '.py',
            'javascript': '.js',
            'java': '.java',
            'c': '.c',
            'cpp': '.cpp',
            'html': '.html',
            'css': '.css',
            'sql': '.sql',
            'bash': '.sh',
            'dockerfile': '.dockerfile',
            'json': '.json',
            'yaml': '.yml',
            'xml': '.xml',
            'txt': '.txt'
        }
        return extensions.get(self.language, '.txt')


class CodeExtractor:
    """Main class for extracting code blocks from files."""
    
    def __init__(self, output_dir: str = "extracted_code"):
        self.output_dir = Path(output_dir)
        self.stats = {
            'files_processed': 0,
            'code_blocks_found': 0,
            'languages_detected': set(),
            'topics_created': set()
        }
    
    def extract_markdown_code_blocks(self, content: str) -> List[CodeBlock]:
        """Extract code blocks from markdown format."""
        code_blocks = []
        
        # Pattern for fenced code blocks with optional language
        pattern = r'```(\w+)?\n(.*?)\n```'
        matches = re.finditer(pattern, content, re.DOTALL)
        
        for match in matches:
            language = match.group(1)
            code_content = match.group(2)
            start_line = content[:match.start()].count('\n')
            
            # Only add non-empty blocks with substantial content
            if code_content.strip() and len(code_content.strip()) > 20:
                code_blocks.append(CodeBlock(code_content, language, start_line))
        
        return code_blocks
    
    def extract_indented_code_blocks(self, content: str) -> List[CodeBlock]:
        """Extract indented code blocks (4+ spaces or tabs)."""
        lines = content.split('\n')
        code_blocks = []
        current_block = []
        current_start = 0
        
        for i, line in enumerate(lines):
            # Check if line is indented with 4+ spaces or starts with tab
            if re.match(r'^(    |\t)', line) or (line.strip() == '' and current_block):
                if not current_block:
                    current_start = i
                current_block.append(line)
            else:
                if current_block and any(line.strip() for line in current_block):
                    # Remove common indentation
                    block_content = '\n'.join(current_block).strip()
                    # Only add blocks that are substantial (more than 3 lines and 50 characters)
                    if block_content and len(current_block) > 3 and len(block_content) > 50:
                        # Check if it looks like actual code (has some programming patterns)
                        if self._looks_like_code(block_content):
                            code_blocks.append(CodeBlock(block_content, None, current_start))
                current_block = []
        
        # Handle last block
        if current_block and any(line.strip() for line in current_block):
            block_content = '\n'.join(current_block).strip()
            if block_content and len(current_block) > 3 and len(block_content) > 50:
                if self._looks_like_code(block_content):
                    code_blocks.append(CodeBlock(block_content, None, current_start))
        
        return code_blocks
    
    def _looks_like_code(self, content: str) -> bool:
        """Check if content looks like actual code."""
        # Look for programming patterns
        code_patterns = [
            r'[a-zA-Z_]\w*\s*\(',  # Function calls
            r'[a-zA-Z_]\w*\s*=',   # Variable assignments
            r'\{[^}]*\}',          # Braces
            r'["\'][^"\']*["\']',  # Quoted strings
            r'//.*|/\*.*\*/|#.*',  # Comments
            r'\w+\.\w+',           # Method calls
            r'if\s*\(|while\s*\(|for\s*\(',  # Control structures
            r'</?\w+[^>]*>',       # HTML tags
            r'[a-zA-Z-]+:\s*[^;]+;',  # CSS properties
        ]
        
        matches = 0
        for pattern in code_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                matches += 1
        
        # Consider it code if it has at least 2 programming patterns
        return matches >= 2
    
    def extract_code_blocks(self, content: str) -> List[CodeBlock]:
        """Extract all code blocks from content."""
        code_blocks = []
        
        # Extract markdown fenced code blocks
        code_blocks.extend(self.extract_markdown_code_blocks(content))
        
        # Extract indented code blocks (but avoid duplicates)
        indented_blocks = self.extract_indented_code_blocks(content)
        
        # Filter out indented blocks that overlap with fenced blocks
        for indented_block in indented_blocks:
            is_duplicate = False
            for existing_block in code_blocks:
                # Simple overlap detection
                if (abs(indented_block.start_line - existing_block.start_line) < 5 and
                    indented_block.content in existing_block.content):
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                code_blocks.append(indented_block)
        
        return code_blocks
    
    def generate_topic_name(self, file_path: str, content: str) -> str:
        """Generate a topic name based on file path and content."""
        file_stem = Path(file_path).stem
        
        # Try to extract topic from content (look for titles, headers)
        title_patterns = [
            r'^#\s+(.+)$',  # Markdown h1
            r'^##\s+(.+)$',  # Markdown h2
            r'^Title:\s*(.+)$',  # Title: format
            r'^Subject:\s*(.+)$',  # Subject: format
        ]
        
        for pattern in title_patterns:
            match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
            if match:
                topic = re.sub(r'[^\w\s-]', '', match.group(1)).strip()
                topic = re.sub(r'\s+', '_', topic)
                return topic[:50]  # Limit length
        
        # Fall back to filename
        return file_stem or 'unknown_topic'
    
    def save_code_block(self, code_block: CodeBlock, topic_dir: Path, index: int) -> str:
        """Save a code block to file."""
        # Generate filename
        if code_block.language and code_block.language != 'txt':
            filename = f"code_{index:02d}_{code_block.language}_{code_block.hash}{code_block.get_file_extension()}"
        else:
            filename = f"code_{index:02d}_{code_block.hash}{code_block.get_file_extension()}"
        
        file_path = topic_dir / filename
        
        # Create directory if it doesn't exist
        topic_dir.mkdir(parents=True, exist_ok=True)
        
        # Write the code block
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code_block.content)
        
        return str(file_path)
    
    def process_file(self, file_path: str) -> Dict:
        """Process a single file and extract code blocks."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {'error': f"Failed to read file: {e}"}
        
        # Extract code blocks
        code_blocks = self.extract_code_blocks(content)
        
        if not code_blocks:
            return {'message': 'No code blocks found'}
        
        # Generate topic name
        topic_name = self.generate_topic_name(file_path, content)
        topic_dir = self.output_dir / topic_name
        
        # Save code blocks
        saved_files = []
        for i, code_block in enumerate(code_blocks, 1):
            saved_path = self.save_code_block(code_block, topic_dir, i)
            saved_files.append({
                'path': saved_path,
                'language': code_block.language,
                'lines': len(code_block.content.split('\n')),
                'hash': code_block.hash
            })
            
            # Update stats
            self.stats['languages_detected'].add(code_block.language)
        
        # Save metadata
        metadata_path = topic_dir / 'metadata.json'
        metadata = {
            'source_file': str(file_path),
            'topic': topic_name,
            'total_blocks': len(code_blocks),
            'code_files': saved_files,
            'processed_at': str(Path().cwd())
        }
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        # Update stats
        self.stats['files_processed'] += 1
        self.stats['code_blocks_found'] += len(code_blocks)
        self.stats['topics_created'].add(topic_name)
        
        return {
            'topic': topic_name,
            'blocks_extracted': len(code_blocks),
            'files_created': saved_files,
            'metadata_file': str(metadata_path)
        }
    
    def get_stats(self) -> Dict:
        """Get processing statistics."""
        stats = dict(self.stats)
        stats['languages_detected'] = list(stats['languages_detected'])
        stats['topics_created'] = list(stats['topics_created'])
        return stats


def main():
    parser = argparse.ArgumentParser(description='Extract code blocks from files')
    parser.add_argument('files', nargs='+', help='Files to process')
    parser.add_argument('-o', '--output', default='extracted_code', 
                       help='Output directory (default: extracted_code)')
    parser.add_argument('-v', '--verbose', action='store_true',
                       help='Verbose output')
    
    args = parser.parse_args()
    
    extractor = CodeExtractor(args.output)
    
    for file_path in args.files:
        if not os.path.exists(file_path):
            print(f"Error: File not found: {file_path}")
            continue
        
        if args.verbose:
            print(f"Processing: {file_path}")
        
        result = extractor.process_file(file_path)
        
        if 'error' in result:
            print(f"Error processing {file_path}: {result['error']}")
        elif 'message' in result:
            print(f"{file_path}: {result['message']}")
        else:
            print(f"✓ {file_path} -> {result['topic']} ({result['blocks_extracted']} code blocks)")
            if args.verbose:
                for file_info in result['files_created']:
                    print(f"  - {file_info['path']} ({file_info['language']}, {file_info['lines']} lines)")
    
    # Print final stats
    stats = extractor.get_stats()
    print(f"\n--- Processing Summary ---")
    print(f"Files processed: {stats['files_processed']}")
    print(f"Code blocks found: {stats['code_blocks_found']}")
    print(f"Topics created: {len(stats['topics_created'])}")
    print(f"Languages detected: {', '.join(stats['languages_detected'])}")


if __name__ == '__main__':
    main()