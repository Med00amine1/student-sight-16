
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import uuid
from datetime import datetime, timedelta
import random

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
            json.dump(initial_data, f, indent=4)

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

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

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

# Initialize demo data with more comprehensive content
def initialize_demo_data():
    users_data = read_json_file(USERS_FILE)
    
    if not users_data['users']:
        # Create demo users
        admin_id = str(uuid.uuid4())
        student_id = str(uuid.uuid4())
        
        users_data['users'] = [
            {
                'id': admin_id,
                'name': 'Admin User',
                'email': 'admin@example.com',
                'password': generate_password_hash('admin123'),
                'isTeacher': True,
                'createdAt': datetime.now().isoformat()
            },
            {
                'id': student_id,
                'name': 'Student User',
                'email': 'student@example.com',
                'password': generate_password_hash('student123'),
                'isTeacher': False,
                'createdAt': datetime.now().isoformat()
            }
        ]
        write_json_file(USERS_FILE, users_data)
        
        # Create demo courses with rich content
        courses_data = read_json_file(COURSES_FILE)
        
        # Video URLs - replace with actual video URLs in production
        video_urls = [
            "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4",
            "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4",
            "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4"
        ]
        
        # Create Python course with detailed content
        python_course_id = str(uuid.uuid4())
        python_course = {
            'id': python_course_id,
            'title': 'Python Mastery Course',
            'description': 'Master Python programming from basics to advanced topics. This comprehensive course takes you from zero to hero with hands-on projects and real-world applications.',
            'price': 49.99,
            'originalPrice': 99.99,
            'instructor': 'Admin User',
            'instructorId': admin_id,
            'rating': 4.8,
            'reviewCount': 122,
            'image': 'https://source.unsplash.com/random/300x200/?python,coding',
            'category': 'Programming',
            'level': 'beginner',
            'enrolledCount': 1,  # Student is enrolled
            'duration': '30h',
            'sections': [
                {
                    'id': 's1',
                    'title': 'Introduction to Python',
                    'lectures': [
                        {
                            'id': 'l1',
                            'title': 'Getting Started with Python',
                            'description': 'Introduction to Python and setting up your environment. Learn why Python is so popular and how to install it on any platform.',
                            'videoUrl': video_urls[0],
                            'duration': 10,
                            'qna': [
                                {
                                    'id': 1,
                                    'question': 'How do I install Python on Windows?',
                                    'answer': 'You can download Python from python.org and follow the installation instructions. Make sure to check "Add Python to PATH" during installation.'
                                },
                                {
                                    'id': 2,
                                    'question': 'Which IDE do you recommend for Python?',
                                    'answer': 'PyCharm is excellent for larger projects, while VS Code with Python extension offers great flexibility. For beginners, I recommend starting with VS Code or even IDLE which comes with Python.'
                                }
                            ],
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
                            'description': 'Learn the basic syntax of Python including variables, operators, and control flow structures.',
                            'videoUrl': video_urls[1],
                            'duration': 15,
                            'qna': [
                                {
                                    'id': 1,
                                    'question': 'What is the difference between == and is in Python?',
                                    'answer': '== compares the values of objects, while "is" compares whether two variables refer to the same object in memory.'
                                }
                            ],
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
                            'description': 'Understanding lists and tuples in Python and when to use each one.',
                            'videoUrl': video_urls[2],
                            'duration': 20,
                            'qna': [
                                {
                                    'id': 1,
                                    'question': 'Can I mix data types in a Python list?',
                                    'answer': 'Yes, Python lists can contain elements of different data types, including other lists, tuples, dictionaries, etc.'
                                }
                            ],
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
                            'description': 'Working with dictionaries and sets in Python for efficient data storage and retrieval.',
                            'videoUrl': video_urls[3],
                            'duration': 25,
                            'qna': [
                                {
                                    'id': 1,
                                    'question': 'What happens if I try to access a key that doesn\'t exist in a dictionary?',
                                    'answer': 'It will raise a KeyError. To avoid this, you can use the get() method which returns None (or a specified default value) if the key doesn\'t exist.'
                                }
                            ],
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
                },
                {
                    'id': 's3',
                    'title': 'Functions and Modules',
                    'lectures': [
                        {
                            'id': 'l5',
                            'title': 'Creating and Using Functions',
                            'description': 'Learn how to create reusable code with functions in Python.',
                            'videoUrl': video_urls[0],
                            'duration': 18,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'What keyword is used to define a function in Python?',
                                        'options': ['function', 'def', 'func', 'define'],
                                        'correctAnswer': 'def'
                                    },
                                    {
                                        'question': 'What does the return statement do in a function?',
                                        'options': [
                                            'Prints a value to the console',
                                            'Exits the function and returns a value',
                                            'Creates a new variable',
                                            'None of the above'
                                        ],
                                        'correctAnswer': 'Exits the function and returns a value'
                                    }
                                ]
                            }
                        },
                        {
                            'id': 'l6',
                            'title': 'Working with Modules and Packages',
                            'description': 'Understand how to organize code with modules and packages in Python.',
                            'videoUrl': video_urls[1],
                            'duration': 22,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'What statement is used to import a module in Python?',
                                        'options': ['include', 'import', 'require', 'using'],
                                        'correctAnswer': 'import'
                                    },
                                    {
                                        'question': 'What file must be present to make a directory a package in Python?',
                                        'options': ['__package__.py', '__init__.py', 'package.json', 'setup.py'],
                                        'correctAnswer': '__init__.py'
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
                    'content': 'Check out the new programming exercise in Section 2! We\'ve added a challenging problem that will test your understanding of dictionaries and sets.',
                    'date': (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
                },
                {
                    'id': 2,
                    'title': 'Live Q&A Session',
                    'content': 'Join us for a live Q&A session next Friday at 7 PM EST. Bring your questions about Python or programming in general!',
                    'date': (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')
                },
                {
                    'id': 3,
                    'title': 'Course Update',
                    'content': 'We\'ve updated the course with new content on advanced Python concepts. Check out the new lectures in Section 4!',
                    'date': datetime.now().strftime('%Y-%m-%d')
                }
            ],
            'reviews': [
                {
                    'id': 1,
                    'user': 'John D.',
                    'rating': 5,
                    'comment': 'Great course! I learned a lot about Python. The instructor explains concepts clearly and the exercises reinforce the learning.',
                    'date': (datetime.now() - timedelta(days=20)).strftime('%Y-%m-%d')
                },
                {
                    'id': 2,
                    'user': 'Sarah M.',
                    'rating': 4,
                    'comment': 'Very informative, but some sections could be more detailed. Overall a good introduction to Python.',
                    'date': (datetime.now() - timedelta(days=15)).strftime('%Y-%m-%d')
                },
                {
                    'id': 3,
                    'user': 'Michael P.',
                    'rating': 5,
                    'comment': 'Excellent course! I started with zero programming knowledge and now I feel confident writing Python code.',
                    'date': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
                },
                {
                    'id': 4,
                    'user': 'Emily L.',
                    'rating': 5,
                    'comment': 'The projects in this course are really helpful for understanding how to apply Python in real-world scenarios.',
                    'date': (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
                }
            ],
            'createdAt': (datetime.now() - timedelta(days=60)).isoformat(),
            'updatedAt': (datetime.now() - timedelta(days=5)).isoformat()
        }
        
        # Create React course with detailed content
        react_course_id = str(uuid.uuid4())
        react_course = {
            'id': react_course_id,
            'title': 'React JS Modern Web Development',
            'description': 'Build modern web applications with React JS. Learn component-based architecture, state management, and more.',
            'price': 59.99,
            'originalPrice': 119.99,
            'instructor': 'Admin User',
            'instructorId': admin_id,
            'rating': 4.7,
            'reviewCount': 98,
            'image': 'https://source.unsplash.com/random/300x200/?javascript,react',
            'category': 'Web Development',
            'level': 'intermediate',
            'enrolledCount': 1,  # Student is enrolled
            'duration': '25h',
            'sections': [
                {
                    'id': 's1',
                    'title': 'Getting Started with React',
                    'lectures': [
                        {
                            'id': 'l1',
                            'title': 'Introduction to React',
                            'description': 'Learn the basics of React and its ecosystem. Understand why React is so popular and how it fits into modern web development.',
                            'videoUrl': video_urls[0],
                            'duration': 15,
                            'qna': [
                                {
                                    'id': 1,
                                    'question': 'Is React a framework or a library?',
                                    'answer': 'React is a JavaScript library for building user interfaces, not a full framework. It focuses on the view layer of applications.'
                                }
                            ],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'What is React?',
                                        'options': ['A JavaScript library', 'A programming language', 'A database', 'An operating system'],
                                        'correctAnswer': 'A JavaScript library'
                                    },
                                    {
                                        'question': 'Who developed React?',
                                        'options': ['Google', 'Microsoft', 'Facebook', 'Amazon'],
                                        'correctAnswer': 'Facebook'
                                    },
                                    {
                                        'question': 'What does JSX stand for?',
                                        'options': ['JavaScript XML', 'JavaScript Extension', 'Java Syntax Extension', 'JavaScript Experience'],
                                        'correctAnswer': 'JavaScript XML'
                                    }
                                ]
                            }
                        },
                        {
                            'id': 'l2',
                            'title': 'Setting Up Your Development Environment',
                            'description': 'Learn how to set up a React development environment with Create React App and other tools.',
                            'videoUrl': video_urls[1],
                            'duration': 20,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'Which command is used to create a new React app with Create React App?',
                                        'options': [
                                            'npm create-react-app my-app',
                                            'npx create-react-app my-app',
                                            'npm install react my-app',
                                            'react new my-app'
                                        ],
                                        'correctAnswer': 'npx create-react-app my-app'
                                    },
                                    {
                                        'question': 'What is the development server port number by default?',
                                        'options': ['3000', '8000', '8080', '5000'],
                                        'correctAnswer': '3000'
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    'id': 's2',
                    'title': 'React Components and Props',
                    'lectures': [
                        {
                            'id': 'l3',
                            'title': 'Functional and Class Components',
                            'description': 'Understand the two types of components in React and when to use each.',
                            'videoUrl': video_urls[2],
                            'duration': 18,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'Which is the simpler way to define a React component?',
                                        'options': ['Functional component', 'Class component', 'Both are equally simple', 'Neither'],
                                        'correctAnswer': 'Functional component'
                                    },
                                    {
                                        'question': 'Prior to React 16.8, which component type could use state?',
                                        'options': ['Functional components', 'Class components', 'Both', 'Neither'],
                                        'correctAnswer': 'Class components'
                                    }
                                ]
                            }
                        },
                        {
                            'id': 'l4',
                            'title': 'Working with Props',
                            'description': 'Learn how to pass and use props in React components.',
                            'videoUrl': video_urls[3],
                            'duration': 22,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'What does "props" stand for in React?',
                                        'options': ['Proper Options', 'Properties', 'Proportions', 'Procedures'],
                                        'correctAnswer': 'Properties'
                                    },
                                    {
                                        'question': 'Are props mutable or immutable in React?',
                                        'options': ['Mutable', 'Immutable', 'Both', 'Neither'],
                                        'correctAnswer': 'Immutable'
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    'id': 's3',
                    'title': 'State and Lifecycle',
                    'lectures': [
                        {
                            'id': 'l5',
                            'title': 'Understanding State in React',
                            'description': 'Learn about state in React and how it differs from props.',
                            'videoUrl': video_urls[0],
                            'duration': 25,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'Which hook is used to add state to a functional component?',
                                        'options': ['useEffect', 'useState', 'useContext', 'useReducer'],
                                        'correctAnswer': 'useState'
                                    },
                                    {
                                        'question': 'Can we modify state directly in React?',
                                        'options': ['Yes', 'No', 'Only in class components', 'Only in functional components'],
                                        'correctAnswer': 'No'
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
                    'title': 'New Section on Hooks',
                    'content': 'We\'ve added a new section on React Hooks! Learn how to use useState, useEffect, and more.',
                    'date': (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
                },
                {
                    'id': 2,
                    'title': 'Workshop Announcement',
                    'content': 'Join our upcoming workshop on building a full-stack app with React and Node.js!',
                    'date': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
                }
            ],
            'reviews': [
                {
                    'id': 1,
                    'user': 'Alex K.',
                    'rating': 5,
                    'comment': 'This course helped me land a job as a React developer! The content is up-to-date and relevant.',
                    'date': (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')
                },
                {
                    'id': 2,
                    'user': 'Jennifer R.',
                    'rating': 4,
                    'comment': 'Great introduction to React, but I wish there was more content on Redux.',
                    'date': (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
                }
            ],
            'createdAt': (datetime.now() - timedelta(days=45)).isoformat(),
            'updatedAt': (datetime.now() - timedelta(days=2)).isoformat()
        }
        
        # Create a JavaScript course
        js_course_id = str(uuid.uuid4())
        js_course = {
            'id': js_course_id,
            'title': 'JavaScript Fundamentals',
            'description': 'Learn the core concepts of JavaScript from the ground up. This course covers everything from basic syntax to advanced topics like asynchronous programming.',
            'price': 39.99,
            'originalPrice': 79.99,
            'instructor': 'Admin User',
            'instructorId': admin_id,
            'rating': 4.6,
            'reviewCount': 75,
            'image': 'https://source.unsplash.com/random/300x200/?javascript,code',
            'category': 'Web Development',
            'level': 'beginner',
            'enrolledCount': 0,
            'duration': '20h',
            'sections': [
                {
                    'id': 's1',
                    'title': 'JavaScript Basics',
                    'lectures': [
                        {
                            'id': 'l1',
                            'title': 'Introduction to JavaScript',
                            'description': 'Learn about the history and importance of JavaScript in web development.',
                            'videoUrl': video_urls[0],
                            'duration': 12,
                            'qna': [],
                            'quiz': {
                                'questions': [
                                    {
                                        'question': 'JavaScript was created in how many days?',
                                        'options': ['10 days', '14 days', '30 days', '60 days'],
                                        'correctAnswer': '10 days'
                                    },
                                    {
                                        'question': 'Which company developed JavaScript?',
                                        'options': ['Microsoft', 'Google', 'Netscape', 'Apple'],
                                        'correctAnswer': 'Netscape'
                                    }
                                ]
                            }
                        }
                    ]
                }
            ],
            'annonces': [],
            'reviews': [],
            'createdAt': (datetime.now() - timedelta(days=30)).isoformat(),
            'updatedAt': (datetime.now() - timedelta(days=1)).isoformat()
        }
        
        courses_data['courses'] = [python_course, react_course, js_course]
        write_json_file(COURSES_FILE, courses_data)
        
        # Create enrollments for the student
        enrollments_data = read_json_file(ENROLLMENTS_FILE)
        
        # Enroll the student in Python and React courses
        python_enrollment = {
            'id': str(uuid.uuid4()),
            'userId': student_id,
            'courseId': python_course_id,
            'enrolledAt': (datetime.now() - timedelta(days=20)).isoformat()
        }
        
        react_enrollment = {
            'id': str(uuid.uuid4()),
            'userId': student_id,
            'courseId': react_course_id,
            'enrolledAt': (datetime.now() - timedelta(days=15)).isoformat()
        }
        
        enrollments_data['enrollments'] = [python_enrollment, react_enrollment]
        write_json_file(ENROLLMENTS_FILE, enrollments_data)
        
        # Create progress data for the student
        progress_data = read_json_file(PROGRESS_FILE)
        
        # Python course progress (partially completed)
        python_progress = {
            'id': str(uuid.uuid4()),
            'userId': student_id,
            'courseId': python_course_id,
            'completedLectures': ['0_0', '0_1', '1_0'],  # Section 0, Lectures 0 and 1, and Section 1, Lecture 0
            'completedSections': ['0'],  # Completed Section 0
            'quizzesPassed': ['0_0', '0_1'],  # Passed quizzes for Section 0
            'completionPercentage': 45,
            'lastWatchedSection': 1,
            'lastWatchedLecture': 0,
            'lastActivity': (datetime.now() - timedelta(days=2)).isoformat()
        }
        
        # React course progress (just started)
        react_progress = {
            'id': str(uuid.uuid4()),
            'userId': student_id,
            'courseId': react_course_id,
            'completedLectures': ['0_0'],  # Section 0, Lecture 0
            'completedSections': [],
            'quizzesPassed': ['0_0'],  # Passed quiz for Section 0, Lecture 0
            'completionPercentage': 15,
            'lastWatchedSection': 0,
            'lastWatchedLecture': 1,
            'lastActivity': (datetime.now() - timedelta(days=1)).isoformat()
        }
        
        progress_data['progress'] = [python_progress, react_progress]
        write_json_file(PROGRESS_FILE, progress_data)
        
        # Create some quiz results
        quiz_data = read_json_file(QUIZ_RESULTS_FILE)
        
        # Python course quizzes
        python_quiz1 = {
            'id': str(uuid.uuid4()),
            'userId': student_id,
            'courseId': python_course_id,
            'sectionIndex': 0,
            'lectureIndex': 0,
            'answers': {
                '0': 'A programming language',
                '1': '# comment',
                '2': 'True'
            },
            'score': 3,
            'totalQuestions': 3,
            'passed': True,
            'submittedAt': (datetime.now() - timedelta(days=18)).isoformat()
        }
        
        python_quiz2 = {
            'id': str(uuid.uuid4()),
            'userId': student_id,
            'courseId': python_course_id,
            'sectionIndex': 0,
            'lectureIndex': 1,
            'answers': {
                '0': '# Comment',
                '1': 'print("Hello World")',
                '2': '12'
            },
            'score': 3,
            'totalQuestions': 3,
            'passed': True,
            'submittedAt': (datetime.now() - timedelta(days=16)).isoformat()
        }
        
        # React course quiz
        react_quiz1 = {
            'id': str(uuid.uuid4()),
            'userId': student_id,
            'courseId': react_course_id,
            'sectionIndex': 0,
            'lectureIndex': 0,
            'answers': {
                '0': 'A JavaScript library',
                '1': 'Facebook',
                '2': 'JavaScript XML'
            },
            'score': 3,
            'totalQuestions': 3,
            'passed': True,
            'submittedAt': (datetime.now() - timedelta(days=10)).isoformat()
        }
        
        quiz_data['quiz_results'] = [python_quiz1, python_quiz2, react_quiz1]
        write_json_file(QUIZ_RESULTS_FILE, quiz_data)
        
        print("Demo data initialized successfully")

# Initialize demo data on startup
initialize_demo_data()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
