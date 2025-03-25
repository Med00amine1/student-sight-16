
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
QUIZ_RESULTS_FILE = 'data/quiz_results.json'

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
initialize_json_file(QUIZ_RESULTS_FILE, {'quiz_results': []})

# Helper functions to read and write data
def read_json_file(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def write_json_file(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

# ... keep existing code (Authentication routes)

# Course content and quiz submission route
@app.route('/api/courses/<course_id>/submit-quiz', methods=['POST'])
def submit_quiz():
    user_id = session.get('user_id')
    
    # Also accept token-based auth
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    
    if not user_id and not token:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    course_id = data.get('courseId')
    section_index = data.get('sectionIndex')
    lecture_index = data.get('lectureIndex')
    answers = data.get('answers', {})
    score = data.get('score', 0)
    total_questions = data.get('totalQuestions', 0)
    
    if not course_id or section_index is None or lecture_index is None:
        return jsonify({"error": "Missing required data"}), 400
    
    # Read existing quiz results
    quiz_data = read_json_file(QUIZ_RESULTS_FILE)
    
    # Add new quiz result
    quiz_result = {
        'id': str(uuid.uuid4()),
        'userId': user_id,
        'courseId': course_id,
        'sectionIndex': section_index,
        'lectureIndex': lecture_index,
        'answers': answers,
        'score': score,
        'totalQuestions': total_questions,
        'passed': score / total_questions >= 0.7,  # Pass if 70% or higher
        'submittedAt': datetime.now().isoformat()
    }
    
    quiz_data['quiz_results'].append(quiz_result)
    write_json_file(QUIZ_RESULTS_FILE, quiz_data)
    
    # Update user progress if passed
    if quiz_result['passed']:
        progress_data = read_json_file(PROGRESS_FILE)
        
        # Find user's progress for this course
        user_progress = None
        for progress in progress_data['progress']:
            if progress['userId'] == user_id and progress['courseId'] == course_id:
                user_progress = progress
                break
        
        # If no progress record exists, create one
        if not user_progress:
            user_progress = {
                'id': str(uuid.uuid4()),
                'userId': user_id,
                'courseId': course_id,
                'completedLectures': [],
                'completedSections': [],
                'quizzesPassed': [],
                'lastActivity': datetime.now().isoformat()
            }
            progress_data['progress'].append(user_progress)
        
        # Add this quiz to passed quizzes if not already there
        quiz_id = f"{section_index}_{lecture_index}"
        if quiz_id not in user_progress.get('quizzesPassed', []):
            if 'quizzesPassed' not in user_progress:
                user_progress['quizzesPassed'] = []
            user_progress['quizzesPassed'].append(quiz_id)
        
        # Check if all lectures in this section are completed
        courses_data = read_json_file(COURSES_FILE)
        for course in courses_data['courses']:
            if course['id'] == course_id:
                section = course['sections'][section_index]
                all_section_lectures = [f"{section_index}_{i}" for i in range(len(section['lectures']))]
                completed_lectures = [lec for lec in user_progress.get('completedLectures', []) 
                                     if lec.startswith(f"{section_index}_")]
                
                # Mark section as completed if all lectures and quizzes are done
                if len(completed_lectures) == len(all_section_lectures) and all(f"{section_index}_{i}" in user_progress.get('quizzesPassed', []) 
                                                                             for i in range(len(section['lectures']))):
                    if str(section_index) not in user_progress.get('completedSections', []):
                        if 'completedSections' not in user_progress:
                            user_progress['completedSections'] = []
                        user_progress['completedSections'].append(str(section_index))
                break
        
        user_progress['lastActivity'] = datetime.now().isoformat()
        write_json_file(PROGRESS_FILE, progress_data)
    
    return jsonify({"message": "Quiz submitted successfully", "passed": quiz_result['passed']}), 200

@app.route('/api/courses/<course_id>/complete-lecture', methods=['POST'])
def complete_lecture():
    user_id = session.get('user_id')
    
    # Also accept token-based auth
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    
    if not user_id and not token:
        return jsonify({"error": "Not authenticated"}), 401
    
    course_id = request.view_args.get('course_id')
    data = request.get_json()
    section_index = data.get('sectionIndex')
    lecture_index = data.get('lectureIndex')
    
    if section_index is None or lecture_index is None:
        return jsonify({"error": "Missing required data"}), 400
    
    # Read existing progress
    progress_data = read_json_file(PROGRESS_FILE)
    
    # Find user's progress for this course
    user_progress = None
    for progress in progress_data['progress']:
        if progress['userId'] == user_id and progress['courseId'] == course_id:
            user_progress = progress
            break
    
    # If no progress record exists, create one
    if not user_progress:
        user_progress = {
            'id': str(uuid.uuid4()),
            'userId': user_id,
            'courseId': course_id,
            'completedLectures': [],
            'completedSections': [],
            'quizzesPassed': [],
            'lastActivity': datetime.now().isoformat()
        }
        progress_data['progress'].append(user_progress)
    
    # Add this lecture to completed lectures if not already there
    lecture_id = f"{section_index}_{lecture_index}"
    if lecture_id not in user_progress.get('completedLectures', []):
        if 'completedLectures' not in user_progress:
            user_progress['completedLectures'] = []
        user_progress['completedLectures'].append(lecture_id)
    
    user_progress['lastActivity'] = datetime.now().isoformat()
    write_json_file(PROGRESS_FILE, progress_data)
    
    return jsonify({"message": "Lecture marked as completed"}), 200

@app.route('/api/courses/<course_id>/progress', methods=['GET'])
def get_course_progress(course_id):
    user_id = session.get('user_id')
    
    # Also accept token-based auth
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    
    if not user_id and not token:
        return jsonify({"error": "Not authenticated"}), 401
    
    # Read progress data
    progress_data = read_json_file(PROGRESS_FILE)
    
    # Find user's progress for this course
    user_progress = None
    for progress in progress_data['progress']:
        if progress['userId'] == user_id and progress['courseId'] == course_id:
            user_progress = progress
            break
    
    if not user_progress:
        return jsonify({
            "completedLectures": [],
            "completedSections": [],
            "quizzesPassed": [],
            "completionPercentage": 0
        }), 200
    
    # Calculate completion percentage
    courses_data = read_json_file(COURSES_FILE)
    course = None
    for c in courses_data['courses']:
        if c['id'] == course_id:
            course = c
            break
    
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    total_lectures = sum(len(section['lectures']) for section in course['sections'])
    completed_lectures = len(user_progress.get('completedLectures', []))
    completion_percentage = (completed_lectures / total_lectures * 100) if total_lectures > 0 else 0
    
    return jsonify({
        "completedLectures": user_progress.get('completedLectures', []),
        "completedSections": user_progress.get('completedSections', []),
        "quizzesPassed": user_progress.get('quizzesPassed', []),
        "completionPercentage": round(completion_percentage)
    }), 200

# ... keep existing code (course routes, enrollment routes, search, teacher dashboard, payment)

# Initialize demo data if users.json is empty
def initialize_demo_data():
    # ... keep existing code (initialize_demo_data initial part)
    
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
                                },
                                {
                                    'question': 'Which symbol is used for comments in Python?',
                                    'options': ['// comment', '# comment', '/* comment */', '<!-- comment -->'],
                                    'correctAnswer': '# comment'
                                },
                                {
                                    'question': 'Python is an interpreted language?',
                                    'options': ['True', 'False'],
                                    'correctAnswer': 'True'
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
                                },
                                {
                                    'question': 'What is the correct syntax to print "Hello World" in Python?',
                                    'options': ['echo("Hello World");', 'print("Hello World")', 'Console.WriteLine("Hello World");', 'System.out.println("Hello World")'],
                                    'correctAnswer': 'print("Hello World")'
                                },
                                {
                                    'question': 'What is the output of 3 * 4?',
                                    'options': ['7', '12', '34', 'Error'],
                                    'correctAnswer': '12'
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
                                },
                                {
                                    'question': 'How do you create an empty list in Python?',
                                    'options': ['list()', '[]', '{}', '()'],
                                    'correctAnswer': '[]'
                                },
                                {
                                    'question': 'What will len([1, 2, 3]) return?',
                                    'options': ['1', '2', '3', '4'],
                                    'correctAnswer': '3'
                                }
                            ]
                        }
                    },
                    {
                        'id': 'l4',
                        'title': 'Dictionaries and Sets',
                        'description': 'Working with dictionaries and sets in Python',
                        'videoUrl': 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                        'duration': 25,
                        'qna': [],
                        'quiz': {
                            'questions': [
                                {
                                    'question': 'How do you create an empty dictionary in Python?',
                                    'options': ['dict()', '{}', '[]', '()'],
                                    'correctAnswer': '{}'
                                },
                                {
                                    'question': 'Which data structure stores unique values?',
                                    'options': ['List', 'Dictionary', 'Set', 'All of them'],
                                    'correctAnswer': 'Set'
                                },
                                {
                                    'question': 'How do you access the value for key "name" in a dictionary called "person"?',
                                    'options': ['person["name"]', 'person.name', 'person->name', 'person.get_name()'],
                                    'correctAnswer': 'person["name"]'
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
    
    # ... keep existing code (react_course and course data initialization)
    
    courses_data['courses'] = [python_course, react_course]
    write_json_file(COURSES_FILE, courses_data)

# Initialize demo data on startup
initialize_demo_data()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
