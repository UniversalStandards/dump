# Code Block Extractor

A comprehensive tool to automatically extract code blocks from conversation dumps, chat logs, and text files, with both **command-line** and **web-based** interfaces.

## 🌐 Web Interface (GitHub Pages)

**Use the tool online:** [https://universalstandards.github.io/dump](https://universalstandards.github.io/dump)

### Features:
- **Drag & Drop File Upload** - Simply drag your files into the browser
- **Real-time Processing** - Watch as your code blocks are extracted
- **Smart Downloads** - Get individual files or everything as a ZIP
- **Mobile Friendly** - Works on desktop, tablet, and mobile devices
- **No Installation Required** - Runs entirely in your browser

### Supported File Types:
- Markdown files (`.md`)
- Text files (`.txt`)
- Log files (`.log`)
- Rich text files (`.rtf`)

## 🖥️ Command Line Interface

A Python tool to automatically extract code blocks from conversation dumps and organize them into topic-based folders.

### Features

- Extracts code blocks from markdown fenced blocks (```language)
- Detects indented code blocks (4+ spaces)
- Automatically detects programming languages
- Organizes code into topic-based folders
- Generates appropriate file extensions
- Provides metadata for each extraction
- Avoids duplicate code blocks

### Usage

#### Basic Usage

```bash
python code_extractor.py conversation.md
```

#### Process Multiple Files

```bash
python code_extractor.py conversation1.md conversation2.txt notes.md
```

#### Specify Output Directory

```bash
python code_extractor.py -o my_extracted_code conversation.md
```

#### Verbose Output

```bash
python code_extractor.py -v conversation.md
```

#### Using Shell Wrapper

```bash
./extract_code.sh conversation.md
./extract_code.sh -v -o my_code *.md *.txt
```

## 🔧 Supported Languages

The tool automatically detects and properly formats code for:

- Python (.py)
- JavaScript (.js)
- Java (.java)
- C (.c)
- C++ (.cpp)
- HTML (.html)
- CSS (.css)
- SQL (.sql)
- Bash (.sh)
- JSON (.json)
- YAML (.yml)
- XML (.xml)
- Dockerfile (.dockerfile)
- Plain text (.txt)

## 📁 Output Structure

```
extracted_code/
├── topic_name_1/
│   ├── code_01_python_abc123.py
│   ├── code_02_javascript_def456.js
│   └── metadata.json
├── topic_name_2/
│   ├── code_01_sql_ghi789.sql
│   └── metadata.json
└── EXTRACTION_SUMMARY.json
```

Each topic folder contains:
- Individual code files with descriptive names
- A `metadata.json` file with extraction details
- Hash-based naming to avoid conflicts

## 🚀 Quick Start Examples

### Web Interface
1. Visit [https://universalstandards.github.io/dump](https://universalstandards.github.io/dump)
2. Drag and drop your conversation files
3. Click "Extract Code Blocks"
4. Download your organized code files

### Command Line
```bash
# Clone the repository
git clone https://github.com/UniversalStandards/dump.git
cd dump

# Extract code from a conversation file
python code_extractor.py sample_conversation.md

# Or use the shell wrapper
chmod +x extract_code.sh
./extract_code.sh sample_conversation.md
```

## 📋 Sample Input

````markdown
# Database Setup Discussion

Here's the Python script to create the database:

```python
import sqlite3

def create_database():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE
        )
    ''')
    
    conn.commit()
    conn.close()

create_database()
```

And here's the JavaScript frontend code:

```javascript
function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('users');
            users.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.name} (${user.email})`;
                userList.appendChild(li);
            });
        });
}

document.addEventListener('DOMContentLoaded', loadUsers);
```
````

## 📦 Expected Output

```
extracted_code/
└── Database_Setup_Discussion/
    ├── code_01_python_a1b2c3d4.py
    ├── code_02_javascript_e5f6g7h8.js
    ├── metadata.json
    └── EXTRACTION_SUMMARY.json
```

## 📋 Requirements

### Command Line
- Python 3.6+
- No external dependencies

### Web Interface
- Modern web browser
- JavaScript enabled
- Internet connection for initial load

## 🔄 How It Works

1. **File Analysis** - Scans input files for code patterns
2. **Code Detection** - Identifies fenced code blocks and indented code
3. **Language Recognition** - Automatically detects programming languages
4. **Smart Organization** - Groups code by conversation topics
5. **File Generation** - Creates properly named files with extensions
6. **Metadata Tracking** - Records extraction details and statistics

## 🎯 Use Cases

- **Chat Log Processing** - Extract code snippets from Discord/Slack conversations
- **Meeting Notes** - Organize code examples from technical meetings
- **Documentation** - Extract code samples from markdown documentation
- **Code Review** - Organize code snippets from review discussions
- **Learning Materials** - Extract examples from educational content

## 📱 Mobile Support

The web interface is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

## 🔒 Privacy & Security

- **Client-side Processing** - All code extraction happens in your browser
- **No Data Upload** - Your files never leave your device
- **Open Source** - Fully transparent and auditable code
- **No Tracking** - No analytics or user tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details
