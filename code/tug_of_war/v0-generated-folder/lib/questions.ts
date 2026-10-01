export type Question = {
  id: number
  /** The prompt shown to both players. */
  prompt: string
  /** Optional code snippet rendered in a monospace block. */
  code?: string
  /** Exactly four answer choices. */
  choices: string[]
  /** Index (0-3) of the correct choice. */
  correctIndex: number
}

/**
 * Static question bank used while the game runs fully client-side.
 * Questions are intentionally elementary/middle-school friendly.
 */
export const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: "Which line prints the word Hello to the screen?",
    choices: ['print("Hello")', 'echo "Hello"', 'printf(Hello)', 'say(Hello)'],
    correctIndex: 0,
  },
  {
    id: 2,
    prompt: "What symbol starts a comment in Python?",
    choices: ["//", "#", "<!--", "/*"],
    correctIndex: 1,
  },
  {
    id: 3,
    prompt: "What will this code print?",
    code: "print(2 + 3 * 2)",
    choices: ["10", "8", "12", "7"],
    correctIndex: 1,
  },
  {
    id: 4,
    prompt: "How do you create a variable that stores the number 7?",
    choices: ["age = 7", "7 = age", "int age = 7", "var age := 7"],
    correctIndex: 0,
  },
  {
    id: 5,
    prompt: "Which of these is a Python list?",
    choices: ["{1, 2, 3}", "(1; 2; 3)", "[1, 2, 3]", "<1, 2, 3>"],
    correctIndex: 2,
  },
  {
    id: 6,
    prompt: "What does len() do?",
    code: 'len("cat")',
    choices: ["Counts the items or letters", "Makes text longer", "Lowercases text", "Reverses text"],
    correctIndex: 0,
  },
  {
    id: 7,
    prompt: "Which value is a boolean in Python?",
    choices: ['"yes"', "True", "1.5", "[0]"],
    correctIndex: 1,
  },
  {
    id: 8,
    prompt: "What will this loop print in total?",
    code: "for i in range(3):\n    print(i)",
    choices: ["1 2 3", "0 1 2", "0 1 2 3", "3 times nothing"],
    correctIndex: 1,
  },
  {
    id: 9,
    prompt: "How do you join text together in Python?",
    choices: ['"Hi" + "!"', '"Hi" & "!"', '"Hi" . "!"', '"Hi" join "!"'],
    correctIndex: 0,
  },
  {
    id: 10,
    prompt: "Which keyword makes a decision (runs code only if something is true)?",
    choices: ["when", "check", "if", "maybe"],
    correctIndex: 2,
  },
  {
    id: 11,
    prompt: "What is the result of this comparison?",
    code: "print(10 > 5)",
    choices: ["True", "False", "10", "Error"],
    correctIndex: 0,
  },
  {
    id: 12,
    prompt: "How do you get input typed by a user?",
    choices: ["get()", "input()", "read()", "ask()"],
    correctIndex: 1,
  },
  {
    id: 13,
    prompt: "What data type is the value 3.14?",
    choices: ["int", "string", "float", "list"],
    correctIndex: 2,
  },
  {
    id: 14,
    prompt: "What will this code print?",
    code: 'name = "Sam"\nprint("Hi " + name)',
    choices: ["Hi name", "Hi Sam", "name", "Error"],
    correctIndex: 1,
  },
  {
    id: 15,
    prompt: "Which word is used to create a function?",
    choices: ["func", "def", "function", "make"],
    correctIndex: 1,
  },
  {
    id: 16,
    prompt: "What does this code print?",
    code: "x = 5\nx = x + 1\nprint(x)",
    choices: ["5", "6", "1", "x"],
    correctIndex: 1,
  },
]

/**
 * Loads the question bank.
 *
 * This is intentionally async and isolated so it can later be swapped for a
 * real backend call (e.g. `await fetch('/api/questions')`) without touching
 * any UI component.
 */
export async function getQuestions(): Promise<Question[]> {
  // Simulated async boundary — replace the body with a fetch when the API is ready.
  return Promise.resolve(QUESTIONS)
}
