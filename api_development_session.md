# API Development Session

## Planning a REST API

Today we discussed creating a REST API for a todo application. Here are the components we decided on:

### Python Flask Backend

```python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///todo.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'due_date': self.due_date.isoformat() if self.due_date else None
        }

@app.route('/api/todos', methods=['GET'])
def get_todos():
    todos = Todo.query.all()
    return jsonify([todo.to_dict() for todo in todos])

@app.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    todo = Todo(
        title=data['title'],
        description=data.get('description', ''),
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
    )
    
    db.session.add(todo)
    db.session.commit()
    
    return jsonify(todo.to_dict()), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    data = request.get_json()
    
    if 'title' in data:
        todo.title = data['title']
    if 'description' in data:
        todo.description = data['description']
    if 'completed' in data:
        todo.completed = data['completed']
    if 'due_date' in data:
        todo.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
    
    db.session.commit()
    return jsonify(todo.to_dict())

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
```

### React Frontend Component

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoApp = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: '', description: '', due_date: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/todos');
            setTodos(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch todos');
            console.error('Error fetching todos:', err);
        } finally {
            setLoading(false);
        }
    };

    const createTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            const response = await axios.post('/api/todos', newTodo);
            setTodos([...todos, response.data]);
            setNewTodo({ title: '', description: '', due_date: '' });
            setError('');
        } catch (err) {
            setError('Failed to create todo');
            console.error('Error creating todo:', err);
        }
    };

    const toggleTodo = async (id, completed) => {
        try {
            const response = await axios.put(`/api/todos/${id}`, { completed: !completed });
            setTodos(todos.map(todo => 
                todo.id === id ? response.data : todo
            ));
        } catch (err) {
            setError('Failed to update todo');
            console.error('Error updating todo:', err);
        }
    };

    const deleteTodo = async (id) => {
        if (!window.confirm('Are you sure you want to delete this todo?')) {
            return;
        }

        try {
            await axios.delete(`/api/todos/${id}`);
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (err) {
            setError('Failed to delete todo');
            console.error('Error deleting todo:', err);
        }
    };

    return (
        <div className="todo-app">
            <h1>Todo App</h1>
            
            {error && <div className="error">{error}</div>}
            
            <form onSubmit={createTodo} className="todo-form">
                <input
                    type="text"
                    placeholder="Todo title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                />
                <textarea
                    placeholder="Description (optional)"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                />
                <input
                    type="datetime-local"
                    value={newTodo.due_date}
                    onChange={(e) => setNewTodo({...newTodo, due_date: e.target.value})}
                />
                <button type="submit">Add Todo</button>
            </form>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="todo-list">
                    {todos.map(todo => (
                        <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                            <div className="todo-content">
                                <h3>{todo.title}</h3>
                                {todo.description && <p>{todo.description}</p>}
                                {todo.due_date && (
                                    <small>Due: {new Date(todo.due_date).toLocaleString()}</small>
                                )}
                            </div>
                            <div className="todo-actions">
                                <button 
                                    onClick={() => toggleTodo(todo.id, todo.completed)}
                                    className={todo.completed ? 'uncomplete' : 'complete'}
                                >
                                    {todo.completed ? 'Undo' : 'Complete'}
                                </button>
                                <button 
                                    onClick={() => deleteTodo(todo.id)}
                                    className="delete"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TodoApp;
```

### Docker Configuration

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

The requirements.txt file:

```txt
Flask==2.3.2
Flask-SQLAlchemy==3.0.5
python-dotenv==1.0.0
gunicorn==20.1.0
psycopg2-binary==2.9.6
```

### Docker Compose for Development

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/todoapp
      - FLASK_ENV=development
    depends_on:
      - db
    volumes:
      - .:/app

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=todoapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Testing with pytest

```python
import pytest
import json
from app import app, db, Todo

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_get_empty_todos(client):
    response = client.get('/api/todos')
    assert response.status_code == 200
    assert json.loads(response.data) == []

def test_create_todo(client):
    todo_data = {
        'title': 'Test Todo',
        'description': 'Test Description'
    }
    
    response = client.post('/api/todos', 
                          data=json.dumps(todo_data),
                          content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Test Todo'
    assert data['description'] == 'Test Description'
    assert data['completed'] is False

def test_create_todo_missing_title(client):
    todo_data = {'description': 'Test Description'}
    
    response = client.post('/api/todos',
                          data=json.dumps(todo_data),
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_update_todo(client):
    # Create a todo first
    todo_data = {'title': 'Original Title'}
    response = client.post('/api/todos',
                          data=json.dumps(todo_data),
                          content_type='application/json')
    todo_id = json.loads(response.data)['id']
    
    # Update it
    update_data = {'title': 'Updated Title', 'completed': True}
    response = client.put(f'/api/todos/{todo_id}',
                         data=json.dumps(update_data),
                         content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Updated Title'
    assert data['completed'] is True

def test_delete_todo(client):
    # Create a todo first
    todo_data = {'title': 'To be deleted'}
    response = client.post('/api/todos',
                          data=json.dumps(todo_data),
                          content_type='application/json')
    todo_id = json.loads(response.data)['id']
    
    # Delete it
    response = client.delete(f'/api/todos/{todo_id}')
    assert response.status_code == 204
    
    # Verify it's gone
    response = client.get('/api/todos')
    todos = json.loads(response.data)
    assert len(todos) == 0
```

## Next Steps

1. Set up the development environment
2. Implement authentication
3. Add input validation
4. Set up CI/CD pipeline
5. Deploy to production

This should give us a solid foundation for the todo application!