from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime

# Import Supabase client
from supabase_client import get_supabase_client

# Import auth functions
from auth import login_user, register_user, logout_user, get_current_user, login_required

# Load environment variables
load_dotenv()

# Initialize app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-key-for-development-only')

# Enable CORS
CORS(app, supports_credentials=True)

# Get Supabase client
supabase = get_supabase_client()

# Sample data - will be replaced with Supabase data
sample_data = {
    'tasks': [
        {'id': 1, 'title': 'Task 1', 'completed': False},
        {'id': 2, 'title': 'Task 2', 'completed': True},
        {'id': 3, 'title': 'Task 3', 'completed': False}
    ]
}

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Use the auth module's register_user function
    result = register_user(email, password, username)
    
    if result.get('success'):
        return jsonify(result)
    else:
        return jsonify({'error': result.get('error')}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Use the auth module's login_user function
    result = login_user(email, password)
    
    if result.get('success'):
        return jsonify(result)
    else:
        return jsonify({'error': result.get('error')}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    # Use the auth module's logout_user function
    result = logout_user()
    return jsonify(result)

@app.route('/api/auth/user', methods=['GET'])
def get_user():
    # Use the auth module's get_current_user function
    user = get_current_user()
    if user:
        return jsonify(user)
    return jsonify({'error': 'Not authenticated'}), 401

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

# Task API Routes
@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    try:
        user_id = session.get('user_id')
        # Get tasks from Supabase
        response = supabase.table('tasks').select('*').eq('user_id', user_id).execute()
        return jsonify(response.data)
    except Exception as e:
        # Fall back to sample data in case of error
        print(f"Error fetching tasks: {str(e)}")
        return jsonify(sample_data['tasks'])

@app.route('/api/tasks', methods=['POST'])
@login_required
def create_task():
    task_data = request.json
    user_id = session.get('user_id')
    
    # Add user_id and created_at to task data
    task_data['user_id'] = user_id
    task_data['created_at'] = datetime.now().isoformat()
    
    try:
        # Insert task into Supabase
        response = supabase.table('tasks').insert(task_data).execute()
        return jsonify(response.data[0]), 201
    except Exception as e:
        print(f"Error creating task: {str(e)}")
        # Fall back to sample data
        task_data['id'] = len(sample_data['tasks']) + 1
        sample_data['tasks'].append(task_data)
        return jsonify(task_data), 201

@app.route('/api/tasks/<task_id>', methods=['GET'])
@login_required
def get_task(task_id):
    user_id = session.get('user_id')
    
    try:
        # Get task from Supabase
        response = supabase.table('tasks').select('*').eq('id', task_id).eq('user_id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0])
        return jsonify({'error': 'Task not found'}), 404
    except Exception as e:
        print(f"Error fetching task: {str(e)}")
        # Fall back to sample data
        for task in sample_data['tasks']:
            if task['id'] == int(task_id):
                return jsonify(task)
        return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task_data = request.json
    user_id = session.get('user_id')
    
    # Add updated_at to task data
    task_data['updated_at'] = datetime.now().isoformat()
    
    try:
        # Update task in Supabase
        response = supabase.table('tasks').update(task_data).eq('id', task_id).eq('user_id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0])
        return jsonify({'error': 'Task not found'}), 404
    except Exception as e:
        print(f"Error updating task: {str(e)}")
        # Fall back to sample data
        for i, task in enumerate(sample_data['tasks']):
            if task['id'] == int(task_id):
                sample_data['tasks'][i] = task_data
                sample_data['tasks'][i]['id'] = int(task_id)
                return jsonify(sample_data['tasks'][i])
        return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    user_id = session.get('user_id')
    
    try:
        # Delete task from Supabase
        response = supabase.table('tasks').delete().eq('id', task_id).eq('user_id', user_id).execute()
        return '', 204
    except Exception as e:
        print(f"Error deleting task: {str(e)}")
        # Fall back to sample data
        for i, task in enumerate(sample_data['tasks']):
            if task['id'] == int(task_id):
                del sample_data['tasks'][i]
                return '', 204
        return jsonify({'error': 'Task not found'}), 404

@app.route('/profile')
@login_required
def profile_page():
    return render_template('profile.html')

# Profile API Routes
@app.route('/api/profile', methods=['GET'])
@login_required
def get_profile():
    user_id = session.get('user_id')
    
    try:
        # Get profile from Supabase
        response = supabase.table('profiles').select('*').eq('id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0])
        
        return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        print(f"Error fetching profile: {str(e)}")
        return jsonify({'error': 'Failed to load profile'}), 500

@app.route('/api/profile', methods=['PUT'])
@login_required
def update_profile():
    profile_data = request.json
    user_id = session.get('user_id')
    
    # Only allow updating certain fields
    allowed_fields = {
        'username': profile_data.get('username')
    }
    
    # Filter out None values
    update_data = {k: v for k, v in allowed_fields.items() if v is not None}
    
    try:
        # Update profile in Supabase
        response = supabase.table('profiles').update(update_data).eq('id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0])
        
        return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Failed to update profile'}), 500

if __name__ == '__main__':
    app.run(debug=True) 