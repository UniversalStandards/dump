# Code Block Extractor

A Python tool to automatically extract code blocks from conversation dumps and organize them into topic-based folders.

## Features

- Extracts code blocks from markdown fenced blocks (```language)
- Detects indented code blocks (4+ spaces)
- Automatically detects programming languages
- Organizes code into topic-based folders
- Generates appropriate file extensions
- Provides metadata for each extraction
- Avoids duplicate code blocks

## Usage

### Basic Usage

```bash
python code_extractor.py conversation.md
```

### Process Multiple Files

```bash
python code_extractor.py conversation1.md conversation2.txt notes.md
```

### Specify Output Directory

```bash
python code_extractor.py -o my_extracted_code conversation.md
```

### Verbose Output

```bash
python code_extractor.py -v conversation.md
```

## Supported Languages

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
- Plain text (.txt)

## Output Structure

```
extracted_code/
├── topic_name_1/
│   ├── code_01_python_abc123.py
│   ├── code_02_javascript_def456.js
│   └── metadata.json
├── topic_name_2/
│   ├── code_01_sql_ghi789.sql
│   └── metadata.json
└── ...
```

Each topic folder contains:
- Individual code files with descriptive names
- A `metadata.json` file with extraction details

## Examples

### Sample Input (conversation.md)

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

### Expected Output

```
extracted_code/
└── Database_Setup_Discussion/
    ├── code_01_python_a1b2c3d4.py
    ├── code_02_javascript_e5f6g7h8.js
    └── metadata.json
```

## Requirements

- Python 3.6+
- No external dependencies

## License

MIT License
