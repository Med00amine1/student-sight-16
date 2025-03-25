
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)
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
    
    return jsonify(user_response), 201

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
            return jsonify(user_response), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    users_data = read_json_file(USERS_FILE)
    
    for user in users_data['users']:
        if user['id'] == user_id:
            # Remove password before sending to client
            user_response = {k: v for k, v in user.items() if k != 'password'}
            return jsonify(user_response), 200
    
    return jsonify({"error": "User not found"}), 404

@app.route('/api/auth/switch-mode', methods=['POST'])
def switch_mode():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    users_data = read_json_file(USERS_FILE)
    
    for user in users_data['users']:
        if user['id'] == user_id:
            user['isTeacher'] = not user.get('isTeacher', False)
            write_json_file(USERS_FILE, users_data)
            
            # Remove password before sending to client
            user_response = {k: v for k, v in user.items() if k != 'password'}
            return jsonify(user_response), 200
    
    return jsonify({"error": "User not found"}), 404

# Course routes
@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    courses_data = read_json_file(COURSES_FILE)
    return jsonify(courses_data['courses']), 200

@app.route('/api/courses/<course_id>', methods=['GET'])
def get_course_by_id(course_id):
    courses_data = read_json_file(COURSES_FILE)
    
    for course in courses_data['courses']:
        if course['id'] == course_id:
            return jsonify(course), 200
    
    return jsonify({"error": "Course not found"}), 404

@app.route('/api/courses', methods=['POST'])
def create_course():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    users_data = read_json_file(USERS_FILE)
    user = next((u for u in users_data['users'] if u['id'] == user_id), None)
    
    if not user or not user.get('isTeacher', False):
        return jsonify({"error": "Only teachers can create courses"}), 403
    
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    price = data.get('price')
    
    if not title or not description or price is None:
        return jsonify({"error": "Title, description, and price are required"}), 400
    
    new_course = {
        'id': str(uuid.uuid4()),
        'title': title,
        'description': description,
        'price': price,
        'originalPrice': data.get('originalPrice', price),
        'instructor': user['name'],
        'instructorId': user_id,
        'rating': 0,
        'reviewCount': 0,
        'image': data.get('image', ''),
        'category': data.get('category', 'General'),
        'level': data.get('level', 'beginner'),
        'enrolledCount': 0,
        'duration': data.get('duration', '0h'),
        'sections': data.get('sections', []),
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    
    courses_data = read_json_file(COURSES_FILE)
    courses_data['courses'].append(new_course)
    write_json_file(COURSES_FILE, courses_data)
    
    return jsonify(new_course), 201

@app.route('/api/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    courses_data = read_json_file(COURSES_FILE)
    course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
    
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    if course['instructorId'] != user_id:
        return jsonify({"error": "Only the course creator can update this course"}), 403
    
    data = request.get_json()
    
    # Update course fields
    for key, value in data.items():
        if key not in ['id', 'instructorId', 'instructor', 'createdAt', 'enrolledCount']:
            course[key] = value
    
    course['updatedAt'] = datetime.now().isoformat()
    
    write_json_file(COURSES_FILE, courses_data)
    
    return jsonify(course), 200

@app.route('/api/courses/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    courses_data = read_json_file(COURSES_FILE)
    course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
    
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    if course['instructorId'] != user_id:
        return jsonify({"error": "Only the course creator can delete this course"}), 403
    
    courses_data['courses'] = [c for c in courses_data['courses'] if c['id'] != course_id]
    write_json_file(COURSES_FILE, courses_data)
    
    # Also remove enrollments and progress for this course
    enrollments_data = read_json_file(ENROLLMENTS_FILE)
    enrollments_data['enrollments'] = [e for e in enrollments_data['enrollments'] if e['courseId'] != course_id]
    write_json_file(ENROLLMENTS_FILE, enrollments_data)
    
    progress_data = read_json_file(PROGRESS_FILE)
    progress_data['progress'] = [p for p in progress_data['progress'] if p['courseId'] != course_id]
    write_json_file(PROGRESS_FILE, progress_data)
    
    return jsonify({"message": "Course deleted successfully"}), 200

# Enrollment routes
@app.route('/api/courses/<course_id>/enroll', methods=['POST'])
def enroll_in_course(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    courses_data = read_json_file(COURSES_FILE)
    course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
    
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    enrollments_data = read_json_file(ENROLLMENTS_FILE)
    
    # Check if already enrolled
    if any(e['userId'] == user_id and e['courseId'] == course_id for e in enrollments_data['enrollments']):
        return jsonify({"message": "Already enrolled in this course"}), 200
    
    # Create new enrollment
    new_enrollment = {
        'id': str(uuid.uuid4()),
        'userId': user_id,
        'courseId': course_id,
        'enrolledAt': datetime.now().isoformat()
    }
    
    enrollments_data['enrollments'].append(new_enrollment)
    write_json_file(ENROLLMENTS_FILE, enrollments_data)
    
    # Increment enrolled count for the course
    course['enrolledCount'] = course.get('enrolledCount', 0) + 1
    write_json_file(COURSES_FILE, courses_data)
    
    # Initialize progress for this course
    initialize_course_progress(user_id, course_id, course)
    
    return jsonify({"message": "Successfully enrolled in the course"}), 201

@app.route('/api/courses/purchased', methods=['GET'])
def get_purchased_courses():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    enrollments_data = read_json_file(ENROLLMENTS_FILE)
    enrolled_course_ids = [e['courseId'] for e in enrollments_data['enrollments'] if e['userId'] == user_id]
    
    courses_data = read_json_file(COURSES_FILE)
    enrolled_courses = [c for c in courses_data['courses'] if c['id'] in enrolled_course_ids]
    
    return jsonify(enrolled_courses), 200

# Course Content and Progress
def initialize_course_progress(user_id, course_id, course):
    progress_data = read_json_file(PROGRESS_FILE)
    
    # Check if progress already exists
    if any(p['userId'] == user_id and p['courseId'] == course_id for p in progress_data['progress']):
        return
    
    # Initialize lecture completion status
    completed_lectures = []
    section_lecture_map = {}
    
    for s_index, section in enumerate(course.get('sections', [])):
        for l_index, lecture in enumerate(section.get('lectures', [])):
            lecture_id = f"{s_index}_{l_index}"
            section_lecture_map[lecture_id] = {
                'sectionIndex': s_index,
                'lectureIndex': l_index,
                'completed': False,
                'notes': '',
                'quiz_answers': {}
            }
    
    # Create new progress entry
    new_progress = {
        'id': str(uuid.uuid4()),
        'userId': user_id,
        'courseId': course_id,
        'completionPercentage': 0,
        'lastWatchedSection': 0,
        'lastWatchedLecture': 0,
        'lectures': section_lecture_map,
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    
    progress_data['progress'].append(new_progress)
    write_json_file(PROGRESS_FILE, progress_data)

@app.route('/api/courses/<course_id>/content', methods=['GET'])
def get_course_content(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    # Check if enrolled in this course
    enrollments_data = read_json_file(ENROLLMENTS_FILE)
    if not any(e['userId'] == user_id and e['courseId'] == course_id for e in enrollments_data['enrollments']):
        return jsonify({"error": "Not enrolled in this course"}), 403
    
    courses_data = read_json_file(COURSES_FILE)
    course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
    
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    # Get progress data
    progress_data = read_json_file(PROGRESS_FILE)
    progress = next((p for p in progress_data['progress'] if p['userId'] == user_id and p['courseId'] == course_id), None)
    
    if not progress:
        # Initialize progress
        initialize_course_progress(user_id, course_id, course)
        progress_data = read_json_file(PROGRESS_FILE)
        progress = next((p for p in progress_data['progress'] if p['userId'] == user_id and p['courseId'] == course_id), None)
    
    # Create response with course content and progress
    course_content = {
        'id': course['id'],
        'title': course['title'],
        'sections': course.get('sections', []),
        'annonces': course.get('annonces', []),
        'reviews': course.get('reviews', []),
        'completionPercentage': progress.get('completionPercentage', 0),
        'lastWatchedSection': progress.get('lastWatchedSection', 0),
        'lastWatchedLecture': progress.get('lastWatchedLecture', 0)
    }
    
    # Update completion status for each lecture
    for s_index, section in enumerate(course_content['sections']):
        for l_index, lecture in enumerate(section['lectures']):
            lecture_id = f"{s_index}_{l_index}"
            if lecture_id in progress.get('lectures', {}):
                lecture['completed'] = progress['lectures'][lecture_id]['completed']
                lecture['notes'] = progress['lectures'][lecture_id].get('notes', '')
            else:
                lecture['completed'] = False
                lecture['notes'] = ''
    
    return jsonify(course_content), 200

@app.route('/api/courses/<course_id>/progress', methods=['GET'])
def get_course_progress(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    progress_data = read_json_file(PROGRESS_FILE)
    progress = next((p for p in progress_data['progress'] if p['userId'] == user_id and p['courseId'] == course_id), None)
    
    if not progress:
        return jsonify({"error": "No progress found for this course"}), 404
    
    return jsonify(progress), 200

@app.route('/api/courses/<course_id>/complete-lecture', methods=['POST'])
def mark_lecture_completed(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    section_index = data.get('sectionIndex')
    lecture_index = data.get('lectureIndex')
    
    if section_index is None or lecture_index is None:
        return jsonify({"error": "Section index and lecture index are required"}), 400
    
    progress_data = read_json_file(PROGRESS_FILE)
    progress = next((p for p in progress_data['progress'] if p['userId'] == user_id and p['courseId'] == course_id), None)
    
    if not progress:
        return jsonify({"error": "No progress found for this course"}), 404
    
    lecture_id = f"{section_index}_{lecture_index}"
    
    if lecture_id not in progress['lectures']:
        progress['lectures'][lecture_id] = {
            'sectionIndex': section_index,
            'lectureIndex': lecture_index,
            'completed': False,
            'notes': '',
            'quiz_answers': {}
        }
    
    progress['lectures'][lecture_id]['completed'] = True
    progress['lastWatchedSection'] = section_index
    progress['lastWatchedLecture'] = lecture_index
    
    # Calculate completion percentage
    courses_data = read_json_file(COURSES_FILE)
    course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
    
    if course:
        total_lectures = sum(len(section.get('lectures', [])) for section in course.get('sections', []))
        completed_lectures = sum(1 for l_id, l_data in progress['lectures'].items() if l_data['completed'])
        
        if total_lectures > 0:
            progress['completionPercentage'] = int((completed_lectures / total_lectures) * 100)
    
    progress['updatedAt'] = datetime.now().isoformat()
    write_json_file(PROGRESS_FILE, progress_data)
    
    return jsonify({"message": "Lecture marked as completed", "completionPercentage": progress['completionPercentage']}), 200

@app.route('/api/courses/<course_id>/save-notes', methods=['POST'])
def save_lecture_notes(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    section_index = data.get('sectionIndex')
    lecture_index = data.get('lectureIndex')
    notes = data.get('notes', '')
    
    if section_index is None or lecture_index is None:
        return jsonify({"error": "Section index and lecture index are required"}), 400
    
    progress_data = read_json_file(PROGRESS_FILE)
    progress = next((p for p in progress_data['progress'] if p['userId'] == user_id and p['courseId'] == course_id), None)
    
    if not progress:
        return jsonify({"error": "No progress found for this course"}), 404
    
    lecture_id = f"{section_index}_{lecture_index}"
    
    if lecture_id not in progress['lectures']:
        progress['lectures'][lecture_id] = {
            'sectionIndex': section_index,
            'lectureIndex': lecture_index,
            'completed': False,
            'notes': '',
            'quiz_answers': {}
        }
    
    progress['lectures'][lecture_id]['notes'] = notes
    progress['updatedAt'] = datetime.now().isoformat()
    write_json_file(PROGRESS_FILE, progress_data)
    
    return jsonify({"message": "Notes saved successfully"}), 200

@app.route('/api/courses/<course_id>/ask-question', methods=['POST'])
def ask_lecture_question(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    section_index = data.get('sectionIndex')
    lecture_index = data.get('lectureIndex')
    question = data.get('question', '')
    
    if section_index is None or lecture_index is None or not question:
        return jsonify({"error": "Section index, lecture index, and question are required"}), 400
    
    courses_data = read_json_file(COURSES_FILE)
    course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
    
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    if section_index >= len(course['sections']) or lecture_index >= len(course['sections'][section_index]['lectures']):
        return jsonify({"error": "Invalid section or lecture index"}), 400
    
    # Add question to lecture
    if 'qna' not in course['sections'][section_index]['lectures'][lecture_index]:
        course['sections'][section_index]['lectures'][lecture_index]['qna'] = []
    
    users_data = read_json_file(USERS_FILE)
    user = next((u for u in users_data['users'] if u['id'] == user_id), None)
    
    new_question = {
        'id': len(course['sections'][section_index]['lectures'][lecture_index]['qna']) + 1,
        'question': question,
        'answer': "Pending instructor response...",
        'askedBy': user['name'] if user else "Anonymous",
        'askedAt': datetime.now().isoformat()
    }
    
    course['sections'][section_index]['lectures'][lecture_index]['qna'].append(new_question)
    write_json_file(COURSES_FILE, courses_data)
    
    return jsonify(new_question), 201

@app.route('/api/courses/<course_id>/submit-quiz', methods=['POST'])
def submit_quiz_answers(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    section_index = data.get('sectionIndex')
    lecture_index = data.get('lectureIndex')
    answers = data.get('answers', {})
    score = data.get('score', 0)
    total_questions = data.get('totalQuestions', 0)
    
    if section_index is None or lecture_index is None or not answers:
        return jsonify({"error": "Section index, lecture index, and answers are required"}), 400
    
    progress_data = read_json_file(PROGRESS_FILE)
    progress = next((p for p in progress_data['progress'] if p['userId'] == user_id and p['courseId'] == course_id), None)
    
    if not progress:
        return jsonify({"error": "No progress found for this course"}), 404
    
    lecture_id = f"{section_index}_{lecture_index}"
    
    if lecture_id not in progress['lectures']:
        progress['lectures'][lecture_id] = {
            'sectionIndex': section_index,
            'lectureIndex': lecture_index,
            'completed': False,
            'notes': '',
            'quiz_answers': {}
        }
    
    progress['lectures'][lecture_id]['quiz_answers'] = answers
    progress['lectures'][lecture_id]['quiz_score'] = score
    progress['lectures'][lecture_id]['quiz_total'] = total_questions
    
    # Mark as completed if score is good enough (e.g., 70% or better)
    if total_questions > 0 and score / total_questions >= 0.7:
        progress['lectures'][lecture_id]['completed'] = True
        
        # Recalculate completion percentage
        courses_data = read_json_file(COURSES_FILE)
        course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
        
        if course:
            total_lectures = sum(len(section.get('lectures', [])) for section in course.get('sections', []))
            completed_lectures = sum(1 for l_id, l_data in progress['lectures'].items() if l_data['completed'])
            
            if total_lectures > 0:
                progress['completionPercentage'] = int((completed_lectures / total_lectures) * 100)
    
    progress['updatedAt'] = datetime.now().isoformat()
    write_json_file(PROGRESS_FILE, progress_data)
    
    return jsonify({
        "message": "Quiz submitted successfully", 
        "score": score, 
        "totalQuestions": total_questions,
        "completionPercentage": progress['completionPercentage']
    }), 200

@app.route('/api/courses/<course_id>/track-progress', methods=['POST'])
def track_video_progress(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    section_index = data.get('sectionIndex')
    lecture_index = data.get('lectureIndex')
    progress_percent = data.get('progressPercent', 0)
    
    if section_index is None or lecture_index is None:
        return jsonify({"error": "Section index and lecture index are required"}), 400
    
    progress_data = read_json_file(PROGRESS_FILE)
    progress = next((p for p in progress_data['progress'] if p['userId'] == user_id and p['courseId'] == course_id), None)
    
    if not progress:
        return jsonify({"error": "No progress found for this course"}), 404
    
    lecture_id = f"{section_index}_{lecture_index}"
    
    if lecture_id not in progress['lectures']:
        progress['lectures'][lecture_id] = {
            'sectionIndex': section_index,
            'lectureIndex': lecture_index,
            'completed': False,
            'notes': '',
            'quiz_answers': {}
        }
    
    progress['lectures'][lecture_id]['video_progress'] = progress_percent
    
    # Mark as completed if video is watched to at least 90%
    if progress_percent >= 90:
        progress['lectures'][lecture_id]['completed'] = True
        
        # Recalculate completion percentage
        courses_data = read_json_file(COURSES_FILE)
        course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
        
        if course:
            total_lectures = sum(len(section.get('lectures', [])) for section in course.get('sections', []))
            completed_lectures = sum(1 for l_id, l_data in progress['lectures'].items() if l_data['completed'])
            
            if total_lectures > 0:
                progress['completionPercentage'] = int((completed_lectures / total_lectures) * 100)
    
    progress['lastWatchedSection'] = section_index
    progress['lastWatchedLecture'] = lecture_index
    progress['updatedAt'] = datetime.now().isoformat()
    write_json_file(PROGRESS_FILE, progress_data)
    
    return jsonify({"message": "Progress tracked successfully"}), 200

@app.route('/api/courses/<course_id>/certificate', methods=['GET'])
def get_course_certificate(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    progress_data = read_json_file(PROGRESS_FILE)
    progress = next((p for p in progress_data['progress'] if p['userId'] == user_id and p['courseId'] == course_id), None)
    
    if not progress:
        return jsonify({"error": "No progress found for this course"}), 404
    
    # Check if course is completed (e.g., at least 90%)
    if progress.get('completionPercentage', 0) < 90:
        return jsonify({"error": "Course not completed yet"}), 400
    
    # In a real app, you would generate a certificate PDF here
    # For now, just return a mock URL
    certificate_url = f"/certificates/{user_id}_{course_id}.pdf"
    
    return jsonify({"certificateUrl": certificate_url}), 200

# Search and catalog routes
@app.route('/api/catalog/courses', methods=['GET'])
def get_catalog_courses():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    courses_data = read_json_file(COURSES_FILE)
    total = len(courses_data['courses'])
    
    # Paginate results
    start = (page - 1) * limit
    end = start + limit
    paginated_courses = courses_data['courses'][start:end]
    
    return jsonify({
        'courses': paginated_courses,
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit
    }), 200

@app.route('/api/catalog/search', methods=['GET'])
def search_courses():
    query = request.args.get('q', '').lower()
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    courses_data = read_json_file(COURSES_FILE)
    
    # Filter courses by search query
    filtered_courses = []
    for course in courses_data['courses']:
        if (query in course['title'].lower() or 
            query in course['description'].lower() or 
            query in course.get('category', '').lower() or
            query in course.get('instructor', '').lower()):
            filtered_courses.append(course)
    
    total = len(filtered_courses)
    
    # Paginate results
    start = (page - 1) * limit
    end = start + limit
    paginated_courses = filtered_courses[start:end]
    
    return jsonify({
        'courses': paginated_courses,
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit
    }), 200

@app.route('/api/catalog/featured', methods=['GET'])
def get_featured_courses():
    courses_data = read_json_file(COURSES_FILE)
    
    # Sort by rating and take top 4
    featured_courses = sorted(courses_data['courses'], key=lambda c: c.get('rating', 0), reverse=True)[:4]
    
    return jsonify(featured_courses), 200

@app.route('/api/catalog/recommended', methods=['GET'])
def get_recommended_courses():
    user_id = session.get('user_id')
    courses_data = read_json_file(COURSES_FILE)
    
    if user_id:
        # If logged in, get enrolled courses to exclude them
        enrollments_data = read_json_file(ENROLLMENTS_FILE)
        enrolled_course_ids = [e['courseId'] for e in enrollments_data['enrollments'] if e['userId'] == user_id]
        
        # Filter out enrolled courses
        available_courses = [c for c in courses_data['courses'] if c['id'] not in enrolled_course_ids]
    else:
        available_courses = courses_data['courses']
    
    # Sort by enrollment count and take top 4
    recommended_courses = sorted(available_courses, key=lambda c: c.get('enrolledCount', 0), reverse=True)[:4]
    
    return jsonify(recommended_courses), 200

# Teacher dashboard routes
@app.route('/api/courses/instructor', methods=['GET'])
def get_instructor_courses():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    courses_data = read_json_file(COURSES_FILE)
    instructor_courses = [c for c in courses_data['courses'] if c.get('instructorId') == user_id]
    
    return jsonify(instructor_courses), 200

@app.route('/api/courses/<course_id>/students', methods=['GET'])
def get_course_students(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    courses_data = read_json_file(COURSES_FILE)
    course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
    
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    if course.get('instructorId') != user_id:
        return jsonify({"error": "Only the instructor can access student data"}), 403
    
    enrollments_data = read_json_file(ENROLLMENTS_FILE)
    enrolled_user_ids = [e['userId'] for e in enrollments_data['enrollments'] if e['courseId'] == course_id]
    
    users_data = read_json_file(USERS_FILE)
    enrolled_students = []
    
    for user in users_data['users']:
        if user['id'] in enrolled_user_ids:
            # Remove sensitive data
            enrolled_students.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'enrolledAt': next((e['enrolledAt'] for e in enrollments_data['enrollments'] 
                                    if e['userId'] == user['id'] and e['courseId'] == course_id), None)
            })
    
    return jsonify(enrolled_students), 200

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    users_data = read_json_file(USERS_FILE)
    user = next((u for u in users_data['users'] if u['id'] == user_id), None)
    
    if not user or not user.get('isTeacher', False):
        return jsonify({"error": "Only teachers can access metrics"}), 403
    
    courses_data = read_json_file(COURSES_FILE)
    instructor_courses = [c for c in courses_data['courses'] if c.get('instructorId') == user_id]
    
    enrollments_data = read_json_file(ENROLLMENTS_FILE)
    
    # Calculate metrics
    total_courses = len(instructor_courses)
    total_students = len(set(e['userId'] for e in enrollments_data['enrollments'] 
                            if e['courseId'] in [c['id'] for c in instructor_courses]))
    
    total_revenue = sum(c.get('price', 0) * sum(1 for e in enrollments_data['enrollments'] if e['courseId'] == c['id'])
                      for c in instructor_courses)
    
    # Get enrollments by month
    enrollments_by_month = {}
    for enrollment in enrollments_data['enrollments']:
        if enrollment['courseId'] in [c['id'] for c in instructor_courses]:
            date = enrollment['enrolledAt'].split('T')[0].rsplit('-', 1)[0]  # Format: YYYY-MM
            enrollments_by_month[date] = enrollments_by_month.get(date, 0) + 1
    
    # Convert to array for chart data
    enrollment_data = [{"date": date, "count": count} for date, count in enrollments_by_month.items()]
    
    metrics = {
        'totalCourses': total_courses,
        'totalStudents': total_students,
        'totalRevenue': total_revenue,
        'enrollmentData': sorted(enrollment_data, key=lambda x: x['date'])
    }
    
    return jsonify(metrics), 200

# Payment integration routes
@app.route('/api/payment/create-checkout-session', methods=['POST'])
def create_checkout_session():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    course_id = data.get('course_id')
    
    if not course_id:
        return jsonify({"error": "Course ID is required"}), 400
    
    courses_data = read_json_file(COURSES_FILE)
    course = next((c for c in courses_data['courses'] if c['id'] == course_id), None)
    
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    # In a real app, you would integrate with Stripe here
    # For now, just return a success response
    
    # Enroll user in the course
    enrollments_data = read_json_file(ENROLLMENTS_FILE)
    
    # Check if already enrolled
    if any(e['userId'] == user_id and e['courseId'] == course_id for e in enrollments_data['enrollments']):
        return jsonify({"message": "Already enrolled in this course"}), 200
    
    # Create new enrollment
    new_enrollment = {
        'id': str(uuid.uuid4()),
        'userId': user_id,
        'courseId': course_id,
        'enrolledAt': datetime.now().isoformat()
    }
    
    enrollments_data['enrollments'].append(new_enrollment)
    write_json_file(ENROLLMENTS_FILE, enrollments_data)
    
    # Increment enrolled count for the course
    course['enrolledCount'] = course.get('enrolledCount', 0) + 1
    write_json_file(COURSES_FILE, courses_data)
    
    # Initialize progress for this course
    initialize_course_progress(user_id, course_id, course)
    
    return jsonify({
        "id": str(uuid.uuid4()),
        "success": True,
        "message": "Payment successful"
    }), 200

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
    app.run(debug=True)
