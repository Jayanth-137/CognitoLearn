export const quizData = {
    // Topic 1: React Fundamentals
    '1': {
        title: 'React Fundamentals Quiz',
        description: 'Test your mastery of JSX, Components, Props, State, and Lifecycle methods.',
        passingScore: 70,
        questions: [
            {
                id: 1,
                type: 'mcq',
                question: 'What is the correct syntax to embed a Javascript expression in JSX?',
                options: ['{{ expression }}', '{ expression }', '${ expression }', '<% expression %>'],
                correctAnswer: 1
            },
            {
                id: 2,
                type: 'mcq',
                question: 'Which method is effectively replaced by the useEffect hook in functional components?',
                options: ['componentDidMount', 'componentWillUnmount', 'componentDidUpdate', 'All of the above'],
                correctAnswer: 3
            },
            {
                id: 3,
                type: 'mcq',
                question: 'State in React is ________.',
                options: ['Immutable', 'Global', 'Mutable via setState/useState', 'Permanent'],
                correctAnswer: 2
            },
            {
                id: 4,
                type: 'mcq',
                question: 'What prop should be unique for every list item in React?',
                options: ['id', 'index', 'key', 'ref'],
                correctAnswer: 2
            },
            {
                id: 5,
                type: 'mcq',
                question: 'Where should you make HTTP requests in a class component?',
                options: ['render', 'componentDidMount', 'constructor', 'static getDerivedStateFromProps'],
                correctAnswer: 1
            }
        ]
    },
    // Topic 2: Advanced Patterns
    '2': {
        title: 'Advanced Patterns Quiz',
        description: 'Challenge your understanding of Context, HOCs, and Performance Optimization.',
        passingScore: 70,
        questions: [
            {
                id: 1,
                type: 'mcq',
                question: 'What is the main purpose of React.memo?',
                options: ['To cache API calls', 'To prevent unnecessary re-renders of functional components', 'To memorize state', 'To create higher-order components'],
                correctAnswer: 1
            },
            {
                id: 2,
                type: 'mcq',
                question: 'Which pattern allows components to share code via a prop whose value is a function?',
                options: ['Higher-Order Components', 'Render Props', 'Compound Components', 'Container Components'],
                correctAnswer: 1
            },
            {
                id: 3,
                type: 'mcq',
                question: 'The Context API is primarily used to solve which problem?',
                options: ['Prop Drilling', 'State Management', 'Routing', 'Asynchronous Logic'],
                correctAnswer: 0
            },
            {
                id: 4,
                type: 'mcq',
                question: 'When using custom hooks, what must the function name start with?',
                options: ['get', 'create', 'use', 'hook'],
                correctAnswer: 2
            },
            {
                id: 5,
                type: 'mcq',
                question: 'What is the second argument of useEffect used for?',
                options: ['Cleanup function', 'Dependency array', 'Initial state', 'Callback function'],
                correctAnswer: 1
            }
        ]
    },
    // Topic 3: State Management
    '3': {
        title: 'State Management Quiz',
        description: 'Evaluate your knowledge of Redux, Zustand, and Global State patterns.',
        passingScore: 75,
        questions: [
            {
                id: 1,
                type: 'mcq',
                question: 'What is the single source of truth in Redux called?',
                options: ['Store', 'Dispatcher', 'Reducer', 'Action'],
                correctAnswer: 0
            },
            {
                id: 2,
                type: 'mcq',
                question: 'In Redux, state changes are made by...',
                options: ['Modifying the state object directly', 'Dispatching actions', 'Calling API functions', 'Using component state'],
                correctAnswer: 1
            },
            {
                id: 3,
                type: 'mcq',
                question: 'Which of these is a key benefit of Zustand compared to Redux?',
                options: ['It uses classes', 'It requires more boilerplate', 'It is simpler and has less boilerplate', 'It does not support hooks'],
                correctAnswer: 2
            },
            {
                id: 4,
                type: 'mcq',
                question: 'What is a "Selector" used for?',
                options: [' Selecting DOM elements', 'Extracting specific pieces of data from the state', 'Selecting CSS classes', 'Choosing the next route'],
                correctAnswer: 1
            },
            {
                id: 5,
                type: 'mcq',
                question: 'Reducers must always be...',
                options: ['Pure functions', 'Async functions', 'Impure functions', 'Recursive functions'],
                correctAnswer: 0
            }
        ]
    },
    // Default fallback
    'default': {
        title: 'General Review',
        description: 'A general quiz to test your overall knowledge.',
        passingScore: 60,
        questions: [
            {
                id: 1,
                type: 'mcq',
                question: 'What library is this app built with?',
                options: ['Vue', 'Angular', 'React', 'Svelte'],
                correctAnswer: 2
            },
            {
                id: 2,
                type: 'mcq',
                question: 'Which hook manages side effects?',
                options: ['useState', 'useEffect', 'useReducer', 'useCallback'],
                correctAnswer: 1
            }
        ]
    }
};
