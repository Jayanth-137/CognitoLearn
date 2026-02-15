// Mock data for multiple roadmaps
export const roadmapsData = [
    {
        id: 'react-fundamentals',
        title: 'React Developer Path',
        description: 'Master React from basics to advanced patterns',
        icon: '⚛️',
        color: 'from-blue-500 to-cyan-500',
        progress: 45,
        totalTopics: 12,
        completedTopics: 5,
        estimatedHours: 40,
        difficulty: 'Intermediate',
        topics: [
            {
                id: 'topic-react-1',
                title: 'React Fundamentals',
                description: 'Learn the core building blocks of React applications',
                status: 'in-progress',
                type: 'milestone',
                subtopics: [
                    { id: 'sub-11', title: 'JSX and Components', completed: true },
                    { id: 'sub-12', title: 'Props and State', completed: true },
                    { id: 'sub-13', title: 'Component Lifecycle', completed: false },
                    { id: 'sub-14', title: 'Virtual DOM', completed: false }
                ]
            },
            {
                id: 'topic-react-2',
                title: 'Advanced Patterns',
                description: 'Master advanced React patterns and best practices',
                status: 'locked',
                type: 'milestone',
                subtopics: [
                    { id: 'sub-21', title: 'Context API', completed: false },
                    { id: 'sub-22', title: 'HOCs and Render Props', completed: false },
                    { id: 'sub-23', title: 'Performance Optimization', completed: false }
                ]
            },
            {
                id: 'topic-react-3',
                title: 'State Management',
                description: 'Learn modern state management solutions',
                status: 'locked',
                type: 'milestone',
                subtopics: [
                    { id: 'sub-31', title: 'Redux Toolkit', completed: false },
                    { id: 'sub-32', title: 'Zustand', completed: false }
                ]
            }
        ]
    },
    {
        id: 'python-data-science',
        title: 'Python for Data Science',
        description: 'Learn Python, NumPy, Pandas, and ML basics',
        icon: '🐍',
        color: 'from-green-500 to-emerald-500',
        progress: 20,
        totalTopics: 15,
        completedTopics: 3,
        estimatedHours: 60,
        difficulty: 'Beginner',
        topics: [
            {
                id: 'topic-python-1',
                title: 'Python Basics',
                description: 'Master the fundamentals of Python programming',
                status: 'in-progress',
                type: 'milestone',
                subtopics: [
                    { id: 'sub-py-11', title: 'Variables and Data Types', completed: true },
                    { id: 'sub-py-12', title: 'Control Flow', completed: true },
                    { id: 'sub-py-13', title: 'Functions', completed: false },
                    { id: 'sub-py-14', title: 'OOP Concepts', completed: false }
                ]
            },
            {
                id: 'topic-python-2',
                title: 'NumPy & Pandas',
                description: 'Work with arrays and dataframes for data analysis',
                status: 'locked',
                type: 'milestone',
                subtopics: [
                    { id: 'sub-py-21', title: 'NumPy Arrays', completed: false },
                    { id: 'sub-py-22', title: 'Pandas DataFrames', completed: false }
                ]
            }
        ]
    },
    {
        id: 'web-development',
        title: 'Full Stack Web Development',
        description: 'HTML, CSS, JavaScript, Node.js, and databases',
        icon: '🌐',
        color: 'from-purple-500 to-pink-500',
        progress: 0,
        totalTopics: 20,
        completedTopics: 0,
        estimatedHours: 80,
        difficulty: 'Beginner',
        topics: [
            {
                id: 'topic-web-1',
                title: 'HTML & CSS Foundations',
                description: 'Build the structure and style of web pages',
                status: 'locked',
                type: 'milestone',
                subtopics: [
                    { id: 'sub-web-11', title: 'HTML Structure', completed: false },
                    { id: 'sub-web-12', title: 'CSS Styling', completed: false },
                    { id: 'sub-web-13', title: 'Flexbox & Grid', completed: false }
                ]
            }
        ]
    },
    {
        id: 'machine-learning',
        title: 'Machine Learning Fundamentals',
        description: 'Supervised, unsupervised learning, and neural networks',
        icon: '🤖',
        color: 'from-orange-500 to-red-500',
        progress: 0,
        totalTopics: 18,
        completedTopics: 0,
        estimatedHours: 100,
        difficulty: 'Advanced',
        topics: [
            {
                id: 'topic-ml-1',
                title: 'Introduction to ML',
                description: 'Understand the foundations of machine learning',
                status: 'locked',
                type: 'milestone',
                subtopics: [
                    { id: 'sub-ml-11', title: 'What is Machine Learning?', completed: false },
                    { id: 'sub-ml-12', title: 'Types of ML', completed: false }
                ]
            }
        ]
    }
];

