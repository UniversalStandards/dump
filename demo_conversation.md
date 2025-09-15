# Web Interface Demo File

This file demonstrates the code extraction capabilities of the web interface.

## Python Database Example

Here's a simple database connection example:

```python
import sqlite3
import os

def create_connection(db_file):
    """Create a database connection to SQLite database"""
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        print(f"Connected to SQLite version: {sqlite3.version}")
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def create_table(conn):
    """Create users table"""
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(create_table_sql)
        print("Table created successfully")
    except sqlite3.Error as e:
        print(f"Error creating table: {e}")

# Initialize database
if __name__ == "__main__":
    database = "example.db"
    conn = create_connection(database)
    
    if conn:
        create_table(conn)
        conn.close()
```

## JavaScript Frontend Code

And here's the corresponding frontend JavaScript:

```javascript
class UserManager {
    constructor() {
        this.apiBase = '/api/users';
        this.users = [];
        this.init();
    }

    async init() {
        await this.loadUsers();
        this.setupEventListeners();
        this.renderUsers();
    }

    async loadUsers() {
        try {
            const response = await fetch(this.apiBase);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.users = await response.json();
            console.log(`Loaded ${this.users.length} users`);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users');
        }
    }

    async createUser(userData) {
        try {
            const response = await fetch(this.apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error(`Failed to create user: ${response.statusText}`);
            }

            const newUser = await response.json();
            this.users.push(newUser);
            this.renderUsers();
            return newUser;

        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    renderUsers() {
        const userList = document.getElementById('userList');
        if (!userList) return;

        userList.innerHTML = '';

        this.users.forEach(user => {
            const userElement = this.createUserElement(user);
            userList.appendChild(userElement);
        });
    }

    createUserElement(user) {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.innerHTML = `
            <div class="user-info">
                <h3>${user.name}</h3>
                <p>${user.email}</p>
                <small>Created: ${new Date(user.created_at).toLocaleDateString()}</small>
            </div>
            <div class="user-actions">
                <button onclick="userManager.editUser(${user.id})">Edit</button>
                <button onclick="userManager.deleteUser(${user.id})" class="delete">Delete</button>
            </div>
        `;
        return div;
    }

    setupEventListeners() {
        const form = document.getElementById('userForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email')
        };

        try {
            await this.createUser(userData);
            event.target.reset();
            this.showSuccess('User created successfully!');
        } catch (error) {
            this.showError('Failed to create user');
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
});
```

## HTML Structure

The corresponding HTML structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management System</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>User Management</h1>
        </header>

        <main>
            <section class="user-form-section">
                <h2>Add New User</h2>
                <form id="userForm">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Add User</button>
                </form>
            </section>

            <section class="users-section">
                <h2>Users List</h2>
                <div id="userList" class="users-grid">
                    <!-- Users will be populated here -->
                </div>
            </section>
        </main>
    </div>

    <script src="js/user-manager.js"></script>
</body>
</html>
```

## CSS Styling

Some basic CSS for styling:

```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.user-form-section {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 30px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.user-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-info h3 {
    margin: 0 0 5px 0;
    color: #333;
}

.user-info p {
    margin: 0 0 5px 0;
    color: #666;
}

.user-info small {
    color: #999;
}

.user-actions button {
    margin-left: 10px;
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.user-actions button.delete {
    background-color: #dc3545;
    color: white;
}

.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    background-color: #28a745;
}

.toast-error {
    background-color: #dc3545;
}
```

## SQL Queries

Some example SQL queries:

```sql
-- Create users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com');

-- Query all users
SELECT * FROM users ORDER BY created_at DESC;

-- Find user by email
SELECT * FROM users WHERE email = 'john@example.com';

-- Update user information
UPDATE users 
SET name = 'John Smith' 
WHERE email = 'john@example.com';

-- Delete user
DELETE FROM users WHERE id = 1;

-- Count total users
SELECT COUNT(*) as total_users FROM users;
```

## Configuration File

A YAML configuration example:

```yaml
# Application Configuration
app:
  name: "User Management System"
  version: "1.0.0"
  debug: true
  
database:
  type: "sqlite"
  path: "users.db"
  pool_size: 10
  timeout: 30
  
server:
  host: "0.0.0.0"
  port: 8000
  ssl_enabled: false
  
logging:
  level: "INFO"
  format: "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
  file: "app.log"
  
features:
  registration_enabled: true
  email_verification: false
  password_reset: true
  
security:
  secret_key: "your-secret-key-here"
  token_expiry: 3600
  max_login_attempts: 3
  
email:
  smtp_server: "smtp.gmail.com"
  smtp_port: 587
  username: "your-email@gmail.com"
  password: "your-password"
  from_address: "noreply@yourapp.com"
```

This demo file shows various code blocks that the extractor can identify and organize!