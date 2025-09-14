# Database Setup Discussion

Today we discussed setting up a new database system for our web application. Here are the key components we need to implement.

## Python Backend

Here's the Python script to create the database:

```python
import sqlite3
import os
from datetime import datetime

def create_database():
    """Create the main application database with all necessary tables."""
    
    # Ensure database directory exists
    os.makedirs('data', exist_ok=True)
    
    conn = sqlite3.connect('data/app.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )
    ''')
    
    # Create posts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Insert sample data
    sample_users = [
        ('John Doe', 'john@example.com'),
        ('Jane Smith', 'jane@example.com'),
        ('Bob Johnson', 'bob@example.com')
    ]
    
    cursor.executemany('INSERT INTO users (name, email) VALUES (?, ?)', sample_users)
    
    conn.commit()
    conn.close()
    print("Database created successfully!")

if __name__ == '__main__':
    create_database()
```

## JavaScript Frontend

And here's the JavaScript frontend code to interact with the API:

```javascript
class UserManager {
    constructor(apiBaseUrl = '/api') {
        this.apiBaseUrl = apiBaseUrl;
    }
    
    async loadUsers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const users = await response.json();
            this.displayUsers(users);
            return users;
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users');
        }
    }
    
    displayUsers(users) {
        const userList = document.getElementById('users');
        userList.innerHTML = ''; // Clear existing content
        
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-card';
            userElement.innerHTML = `
                <h3>${user.name}</h3>
                <p>Email: ${user.email}</p>
                <p>Created: ${new Date(user.created_at).toLocaleDateString()}</p>
                <button onclick="userManager.deleteUser(${user.id})">Delete</button>
            `;
            userList.appendChild(userElement);
        });
    }
    
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.loadUsers(); // Reload the list
                this.showSuccess('User deleted successfully');
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showError('Failed to delete user');
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => errorDiv.style.display = 'none', 5000);
    }
    
    showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => successDiv.style.display = 'none', 3000);
    }
}

// Initialize when DOM is loaded
const userManager = new UserManager();
document.addEventListener('DOMContentLoaded', () => {
    userManager.loadUsers();
});
```

## HTML Structure

We also need the HTML structure:

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
            <h1>User Management System</h1>
        </header>
        
        <main>
            <div id="error-message" class="message error" style="display: none;"></div>
            <div id="success-message" class="message success" style="display: none;"></div>
            
            <section class="user-section">
                <h2>Users</h2>
                <button id="refresh-btn" onclick="userManager.loadUsers()">Refresh</button>
                <div id="users" class="user-list">
                    <!-- Users will be loaded here -->
                </div>
            </section>
        </main>
    </div>
    
    <script src="user-manager.js"></script>
</body>
</html>
```

## CSS Styling

And some basic CSS for styling:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    background: #007bff;
    color: white;
    padding: 1rem;
    margin-bottom: 2rem;
    border-radius: 5px;
}

.message {
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
}

.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.user-card {
    background: white;
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.user-card h3 {
    color: #007bff;
    margin-bottom: 10px;
}

.user-card button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    margin-top: 10px;
}

.user-card button:hover {
    background: #c82333;
}

#refresh-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 20px;
}

#refresh-btn:hover {
    background: #218838;
}
```

## SQL Schema

Here's the complete SQL schema for reference:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Posts table  
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Sample data
INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com');
```

## Next Steps

1. Set up the database using the Python script
2. Create the HTML/CSS files
3. Implement the REST API endpoints
4. Test the frontend functionality
5. Add authentication and authorization

Let me know if you need any clarification on these components!