# Usage Examples

## Basic Usage

Extract code blocks from a single conversation file:

```bash
python code_extractor.py conversation.md
```

Or using the shell wrapper:

```bash
./extract_code.sh conversation.md
```

## Multiple Files

Process multiple conversation files at once:

```bash
python code_extractor.py conversation1.md conversation2.md notes.txt
./extract_code.sh *.md *.txt
```

## Custom Output Directory

Specify a custom output directory:

```bash
python code_extractor.py -o my_extracted_code conversation.md
./extract_code.sh -o my_extracted_code conversation.md
```

## Verbose Output

Get detailed information about extraction:

```bash
python code_extractor.py -v conversation.md
./extract_code.sh -v conversation.md
```

## Real-World Examples

### Example 1: Chat Logs

If you have chat logs or conversation dumps from coding sessions:

```bash
# Extract from Slack exports, Discord logs, etc.
python code_extractor.py slack_coding_session.md discord_help.txt

# Output structure:
# extracted_code/
# ├── slack_coding_session/
# │   ├── code_01_python_abc123.py
# │   ├── code_02_javascript_def456.js
# │   └── metadata.json
# └── discord_help/
#     ├── code_01_sql_ghi789.sql
#     └── metadata.json
```

### Example 2: Meeting Notes

For technical meeting notes with code snippets:

```bash
python code_extractor.py "Sprint Planning 2023-12-01.md" "Architecture Review.md"
```

### Example 3: Documentation Cleanup

Extract code from documentation that needs to be separated:

```bash
./extract_code.sh -o cleaned_docs README.md API_DOCS.md TUTORIAL.md
```

## Output Structure

The tool creates a structured output:

```
extracted_code/
├── topic_name_1/
│   ├── code_01_python_abc123.py     # Python script
│   ├── code_02_javascript_def456.js # JavaScript code  
│   ├── code_03_dockerfile_ghi789.dockerfile # Docker config
│   ├── code_04_yaml_jkl012.yml      # YAML configuration
│   └── metadata.json               # Extraction metadata
├── topic_name_2/
│   ├── code_01_sql_mno345.sql      # SQL queries
│   ├── code_02_html_pqr678.html    # HTML template
│   └── metadata.json
└── ...
```

## Metadata Information

Each extracted topic includes a `metadata.json` file:

```json
{
  "source_file": "conversation.md",
  "topic": "Database_Setup_Discussion", 
  "total_blocks": 5,
  "code_files": [
    {
      "path": "extracted_code/Database_Setup_Discussion/code_01_python_abc123.py",
      "language": "python",
      "lines": 51,
      "hash": "abc123"
    }
  ],
  "processed_at": "/path/to/working/directory"
}
```

## Supported Input Formats

The tool works with various text formats:

- **Markdown** (`.md`): Fenced code blocks with \`\`\`language
- **Plain text** (`.txt`): Indented code blocks
- **RestructuredText** (`.rst`): Code blocks
- **Log files** (`.log`): Code snippets in logs
- **Any text file**: Mixed content with code

## Language Detection

Automatically detects and properly formats:

| Language | Extension | Detection Patterns |
|----------|-----------|-------------------|
| Python | `.py` | `def`, `import`, `class`, `print()` |
| JavaScript | `.js` | `function`, `const`, `let`, `console.log()` |
| HTML | `.html` | `<html>`, `<div>`, `<!DOCTYPE>` |
| CSS | `.css` | `selector { }`, `@media` |
| SQL | `.sql` | `SELECT`, `FROM`, `WHERE` |
| Docker | `.dockerfile` | `FROM`, `RUN`, `COPY` |
| YAML | `.yml` | `key:`, `- item` |
| JSON | `.json` | `{"key": "value"}` |
| Bash | `.sh` | `#!/bin/bash`, `echo`, `$var` |

## Tips and Best Practices

1. **Organize by topic**: Use descriptive filenames that reflect the conversation topic
2. **Clean input**: Remove personal information before processing
3. **Review output**: Check the extracted code files before using them
4. **Version control**: Consider adding `extracted_code/` to `.gitignore` if these are temporary
5. **Batch processing**: Use shell globbing to process multiple files efficiently

## Troubleshooting

### No code blocks found

If no code blocks are extracted:
- Check that code is properly formatted (fenced with \`\`\` or indented)
- Ensure code blocks are substantial (>20 characters)
- Verify the file is readable and has content

### Wrong language detection

If language detection is incorrect:
- Use explicit language tags in markdown: \`\`\`python
- Check that code has recognizable patterns
- Consider the code might be too generic

### Large number of small extractions

If too many tiny code snippets are extracted:
- The tool filters out very small blocks automatically
- Consider using more specific input files
- Review the `_looks_like_code()` function settings