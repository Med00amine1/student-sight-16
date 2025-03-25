
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
app.secret_key = 'your_secret_key_here'  # Change this to a secure random key in production

# Initialize our data storage (in a real app, this would be a database)
USERS_FILE = 'data/users.json'
COURSES_FILE = 'data/courses.json'
ENROLLMENTS_FILE = 'data/enrollments.json'
PROGRESS_FILE = 'data/progress.json'

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Initialize files if they don't exist
def initialize_json_file(file_path, initial_data):
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump(initial_data, f)

# Initialize all data files
initialize_json_file(USERS_FILE, {'users': []})
initialize_json_file(COURSES_FILE, {'courses': []})
initialize_json_file(ENROLLMENTS_FILE, {'enrollments': []})
initialize_json_file(PROGRESS_FILE, {'progress': []})

# Helper functions to read and write data
def read_json_file(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def write_json_file(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password', '')
    name = data.get('name', '')
    
    if not email or not password or not name:
        return jsonify({"error": "All fields are required"}), 400
    
    users_data = read_json_file(USERS_FILE)
    
    # Check if user already exists
    for user in users_data['users']:
        if user['email'] == email:
            return jsonify({"error": "Email already registered"}), 400
    
    # Create new user
    new_user = {
        'id': str(uuid.uuid4()),
        'name': name,
        'email': email,
        'password': generate_password_hash(password),
        'isTeacher': False,
        'createdAt': datetime.now().isoformat()
    }
    
    users_data['users'].append(new_user)
    write_json_file(USERS_FILE, users_data)
    
    # Remove password before sending to client
    user_response = {k: v for k, v in new_user.items() if k != 'password'}
    
    # Set session
    session['user_id'] = new_user['id']
    
    # Create token (in a real app, use JWT)
    token = str(uuid.uuid4())
    
    return jsonify({"user": user_response, "token": token}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    users_data = read_json_file(USERS_FILE)
    
    for user in users_data['users']:
        if user['email'] == email and check_password_hash(user['password'], password):
            # Set session
            session['user_id'] = user['id']
            
            # Remove password before sending to client
            user_response = {k: v for k, v in user.items() if k != 'password'}
            
            # Create token (in a real app, use JWT)
            token = str(uuid.uuid4())
            
            return jsonify({"user": user_response, "token": token}), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    
    # Check Authorization header for token-based auth
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    
    if not user_id and not token:
        return jsonify({"error": "Not authenticated"}), 401
    
    users_data = read_json_file(USERS_FILE)
    
    # In a real app, validate the token properly
    # Here we're just checking if any user exists
    if user_id:
        for user in users_data['users']:
            if user['id'] == user_id:
                # Remove password before sending to client
                user_response = {k: v for k, v in user.items() if k != 'password'}
                return jsonify(user_response), 200
    
    return jsonify({"error": "User not found"}), 404

@app.route('/api/auth/switch-mode', methods=['POST'])
def switch_mode():
    user_id = session.get('user_id')
    
    # Also accept token-based auth
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    
    if not user_id and not token:
        return jsonify({"error": "Not authenticated"}), 401
    
    users_data = read_json_file(USERS_FILE)
    
    if user_id:
        for user in users_data['users']:
            if user['id'] == user_id:
                user['isTeacher'] = not user.get('isTeacher', False)
                write_json_file(USERS_FILE, users_data)
                
                # Remove password before sending to client
                user_response = {k: v for k, v in user.items() if k != 'password'}
                return jsonify(user_response), 200
    
    return jsonify({"error": "User not found"}), 404

# ... keep existing code (course routes, enrollment routes, progress tracking, search, teacher dashboard, payment)

# Initialize demo data if users.json is empty
def initialize_demo_data():
    users_data = read_json_file(USERS_FILE)
    
    if not users_data['users']:
        # Create demo users
        users_data['users'] = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Admin User',
                'email': 'admin@example.com',
                'password': generate_password_hash('admin123'),
                'isTeacher': True,
                'createdAt': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Student User',
                'email': 'student@example.com',
                'password': generate_password_hash('student123'),
                'isTeacher': False,
                'createdAt': datetime.now().isoformat()
            }
        ]
        write_json_file(USERS_FILE, users_data)
        
        # Create demo courses
        courses_data = read_json_file(COURSES_FILE)
        
        admin_id = users_data['users'][0]['id']
        
        python_course = {
            'id': str(uuid.uuid4()),
            'title': 'Python Mastery Course',
            'description': 'Master Python programming from basics to advanced topics',
            'price': 49.99,
            'originalPrice': 99.99,
            'instructor': 'Admin User',
            'instructorId': admin_id,
            'rating': 4.8,
            'reviewCount': 122,
            'image': 'https://source.unsplash.com/random/300x200/?python',
            'category': 'Programming',
            'level': 'beginner',
            'enrolledCount': 0,
            'duration': '30h',
            'sections': [
                {
                    'id': 's1',
                    'title': 'Introduction to Python',
                    'lectures': [
                        {
                            'id': 'l1',
                            'title': 'Getting Started with Python',
                            'description': 'Introduction to Python and setting up your environment',
                            'videoUrl': 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                            'duration': 10,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'What is Python?',
                                        'options': ['A programming language', 'A snake', 'A game', 'A web browser'],
                                        'correctAnswer': 'A programming language'
                                    }
                                ]
                            }
                        },
                        {
                            'id': 'l2',
                            'title': 'Python Syntax Basics',
                            'description': 'Learn the basic syntax of Python',
                            'videoUrl': 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                            'duration': 15,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'How do you create a comment in Python?',
                                        'options': ['// Comment', '# Comment', '/* Comment */', '<!-- Comment -->'],
                                        'correctAnswer': '# Comment'
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    'id': 's2',
                    'title': 'Data Structures in Python',
                    'lectures': [
                        {
                            'id': 'l3',
                            'title': 'Lists and Tuples',
                            'description': 'Understanding lists and tuples in Python',
                            'videoUrl': 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                            'duration': 20,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'Which of these is mutable?',
                                        'options': ['Tuple', 'List', 'Both', 'Neither'],
                                        'correctAnswer': 'List'
                                    }
                                ]
                            }
                        }
                    ]
                }
            ],
            'annonces': [
                {
                    'id': 1,
                    'title': 'New Programming Exercise Added',
                    'content': 'Check out the new programming exercise in Section 2!',
                    'date': '2023-06-15'
                },
                {
                    'id': 2,
                    'title': 'Live Q&A Session',
                    'content': 'Join us for a live Q&A session next Friday at 7 PM EST.',
                    'date': '2023-06-10'
                }
            ],
            'reviews': [
                {
                    'id': 1,
                    'user': 'John D.',
                    'rating': 5,
                    'comment': 'Great course! I learned a lot about Python.',
                    'date': '2023-05-20'
                },
                {
                    'id': 2,
                    'user': 'Sarah M.',
                    'rating': 4,
                    'comment': 'Very informative, but some sections could be more detailed.',
                    'date': '2023-05-15'
                }
            ],
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        react_course = {
            'id': str(uuid.uuid4()),
            'title': 'React JS Modern Web Development',
            'description': 'Build modern web applications with React JS',
            'price': 59.99,
            'originalPrice': 119.99,
            'instructor': 'Admin User',
            'instructorId': admin_id,
            'rating': 4.7,
            'reviewCount': 98,
            'image': 'https://source.unsplash.com/random/300x200/?javascript',
            'category': 'Web Development',
            'level': 'intermediate',
            'enrolledCount': 0,
            'duration': '25h',
            'sections': [
                {
                    'id': 's1',
                    'title': 'Getting Started with React',
                    'lectures': [
                        {
                            'id': 'l1',
                            'title': 'Introduction to React',
                            'description': 'Learn the basics of React and its ecosystem',
                            'videoUrl': 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                            'duration': 15,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'What is React?',
                                        'options': ['A JavaScript library', 'A programming language', 'A database', 'An operating system'],
                                        'correctAnswer': 'A JavaScript library'
                                    }
                                ]
                            }
                        }
                    ]
                }
            ],
            'annonces': [],
            'reviews': [],
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        courses_data['courses'] = [python_course, react_course]
        write_json_file(COURSES_FILE, courses_data)

# Initialize demo data on startup
initialize_demo_data()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
