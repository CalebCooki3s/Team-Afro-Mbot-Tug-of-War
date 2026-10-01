import type { Difficulty, MicrogameDefinition, PlayerId } from './types'

export interface DodgePayload {
  code: string
  lanes: string[]
  safeIndex: number
  explanation: string
}

export interface TracePayload {
  code: string
  steps: string[]
  correctIndex: number
  explanation: string
}

export interface ChoicePayload {
  code: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface BugHuntPayload {
  code: string[]
  bugIndex: number
  bugIndices?: number[]
  explanation: string
}

export interface BuildCodePayload {
  blocks: string[]
  correctOrder: number[]
  explanation: string
}

export interface BubblePayload {
  prompt: string
  code?: string
  bubbles: string[]
  correctIndex: number
  explanation: string
  positions?: Array<{ x: number; y: number; size: number }>
}

export interface MatchPayload {
  left: string[]
  right: string[]
  pairs: number[]
  explanation: string
}

export interface BooleanPayload {
  expression: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface LoopPayload {
  code: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface FunctionPayload {
  code: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ComplexityPayload {
  code: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface LoopCountPayload {
  code: string
  answer: number
  explanation: string
}

export interface AlgorithmArenaPayload {
  maze: string[]
  start1: [number, number]
  start2: [number, number]
  crown: [number, number]
  raceSeconds: number
}

export type ChallengePayload = ChoicePayload | BugHuntPayload | BuildCodePayload | BubblePayload | MatchPayload | BooleanPayload | LoopPayload | FunctionPayload | ComplexityPayload | LoopCountPayload | AlgorithmArenaPayload

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const shuffle = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
const uniqueId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const choiceChallenges = [
  () => {
    const a = 2 + Math.floor(Math.random() * 8)
    const b = 2 + Math.floor(Math.random() * 8)
    const answer = a + b
    const options = shuffle([answer, answer + 1, answer - 2, answer + 3].map(String))
    return {
      code: `x = ${a}\nx = x + ${b}`,
      question: 'What does x equal after this code?',
      options,
      correctIndex: options.indexOf(String(answer)),
      explanation: `x starts at ${a}. Adding ${b} gives ${answer}.`,
    }
  },
  () => {
    const n = 2 + Math.floor(Math.random() * 7)
    const answer = n * 2 + 1
    const options = shuffle([answer, answer - 1, answer + 2, n].map(String))
    return {
      question: 'What value is printed?',
      code: `n = ${n}\nprint(n * 2 + 1)`,
      options,
      correctIndex: options.indexOf(String(answer)),
      explanation: `Multiply ${n} by 2 to get ${n * 2}, then add 1. The result is ${answer}.`,
    }
  },
  () => {
    const options = shuffle(['True', 'False', '0', 'Error'])
    return {
      question: 'What does this expression evaluate to?',
      code: `print(8 > 3 and 2 == 2)`,
      options,
      correctIndex: options.indexOf('True'),
      explanation: 'Both comparisons are true, and True and True evaluates to True.',
    }
  },
]

const bugChallenges = [
  () => ({
    code: ['def greet(name):', '    message = "Hi " + name', '    print(mesage)', 'greet("Ada")'],
    bugIndex: 2,
    explanation: 'The variable was created as message, but line 3 tries to print mesage. That misspelling causes a NameError.',
  }),
  () => ({
    code: ['numbers = [10, 20, 30]', 'for i in range(4):', '    print(numbers[i])', 'print("done")'],
    bugIndex: 1,
    explanation: 'The list has indexes 0 through 2, but range(4) eventually asks for index 3. Use range(3) or range(len(numbers)).',
  }),
  () => ({
    code: ['score = 10', 'if score > 5', '    print("Win!")', 'else:', '    print("Try again")'],
    bugIndex: 1,
    explanation: 'Python needs a colon after the if condition: if score > 5:',
  }),
  () => ({
    code: ['name = "Ada"', 'age = 20', 'print("Hello " + name)', 'print(age + " years old")'],
    bugIndex: 3,
    explanation: 'age is an integer. Python cannot concatenate an int directly with a string; use str(age).',
  }),
]

const buildChallenges = [
  () => ({
    blocks: ['print("Go!")', 'if ready:', 'ready = True', '    print("Ready!")'],
    correctOrder: [2, 1, 3, 0],
    explanation: 'Create the variable first, test it with if, indent the body, then print the final message.',
  }),
  () => ({
    blocks: ['return total', 'def add(a, b):', '    total = a + b', 'print(add(2, 3))'],
    correctOrder: [1, 2, 0, 3],
    explanation: 'A function definition comes first, then its body, then the return, and finally the function call.',
  }),
  () => ({
    blocks: ['print(count)', 'count = 0', 'for i in range(3):', '    count += 1'],
    correctOrder: [1, 2, 3, 0],
    explanation: 'Initialize count, start the loop, update count inside it, then print the result.',
  }),
]


const advancedChoiceChallenges = [
  () => {
    const n = 4 + Math.floor(Math.random() * 4)
    const answer = n === 0 ? 0 : n * (n - 1) / 2
    const options = shuffle([answer, answer + 1, answer * 2, n])
    return {
      code: `total = 0\nfor i in range(${n}):\n    total += i\nprint(total)`,
      question: 'What does total equal?',
      options: options.map(String),
      correctIndex: options.indexOf(answer),
      explanation: `range(${n}) produces 0 through ${n - 1}. Adding those values gives ${answer}.`,
    }
  },
  () => {
    const answer = 24
    const options = shuffle([24, 12, 16, 8].map(String))
    return {
      code: `def mystery(n):\n    if n == 1:\n        return 1\n    return n * mystery(n - 1)\n\nprint(mystery(4))`,
      question: 'What does mystery(4) print?',
      options,
      correctIndex: options.indexOf('24'),
      explanation: 'The function multiplies 4 × 3 × 2 × 1, which is 24. This is a recursive factorial pattern.',
    }
  },
  () => {
    const options = shuffle(['O(n)', 'O(1)', 'O(log n)', 'O(n²)'])
    return {
      code: `for i in range(n):\n    print(i)`,
      question: 'What is the time complexity?',
      options,
      correctIndex: options.indexOf('O(n)'),
      explanation: 'The loop runs once for each value of n, so the work grows linearly: O(n).',
    }
  },
]

const advancedBugChallenges = [
  () => ({
    code: ['def factorial(n):', '    if n == 0:', '        return 0', '    return n * factorial(n - 1)'],
    bugIndex: 2,
    explanation: 'The base case should return 1, not 0. Returning 0 makes every factorial result become 0.',
  }),
  () => ({
    code: ['items = [1, 2, 3, 4]', 'for item in items:', '    if item % 2 == 0:', '        print(items[item])'],
    bugIndex: 3,
    explanation: 'item is a value, not a safe index. When item is 4, items[4] is out of range. Print item instead.',
  }),
]

const bubbleChallenges = [
  () => {
    const answer = 3 + Math.floor(Math.random() * 6)
    const bubbles = shuffle([String(answer), String(answer + 2), String(answer - 1), String(answer + 5)])
    return {
      prompt: `POP the output of this code!`,
      code: `x = ${answer - 1}\nprint(x + 1)`,
      bubbles,
      correctIndex: bubbles.indexOf(String(answer)),
      explanation: `x is ${answer - 1}; adding 1 produces ${answer}. Pop that bubble.`,
    }
  },
  () => {
    const bubbles = shuffle(['str', 'int', 'float', 'bool'])
    return {
      prompt: 'POP the correct type!',
      code: 'value = "42"\nprint(type(value))',
      bubbles,
      correctIndex: bubbles.indexOf('str'),
      explanation: '"42" is inside quotes, so Python treats it as a string (str), not an integer.',
    }
  },
]

const matchChallenges = [
  () => ({
    left: ['x = 7', 'name = "Ada"', 'ready = True'],
    right: ['bool', 'int', 'str'],
    pairs: [1, 2, 0],
    explanation: '7 is an int, "Ada" is a str, and True is a bool. Match each value to its type.',
  }),
  () => ({
    left: ['+', '==', 'and'],
    right: ['comparison', 'logical', 'addition'],
    pairs: [2, 0, 1],
    explanation: '+ performs addition, == compares values, and and combines boolean conditions.',
  }),
]

const dodgeChallenges = [
  () => ({
    code: 'score = 8\nif score > 5:\n    lane = "RIGHT"\nelse:\n    lane = "LEFT"',
    lanes: ['LEFT', 'CENTER', 'RIGHT'], safeIndex: 2,
    explanation: '8 is greater than 5, so the condition chooses the RIGHT lane.',
  }),
  () => ({
    code: 'lives = 2\nif lives == 0:\n    lane = "CENTER"\nelse:\n    lane = "LEFT"',
    lanes: ['LEFT', 'CENTER', 'RIGHT'], safeIndex: 0,
    explanation: 'lives is 2, so the else branch runs and selects LEFT.',
  }),
]

const traceChallenges = [
  () => ({
    code: 'x = 2\nfor i in range(3):\n    x += i\nprint(x)',
    steps: ['2', '3', '5', '5'], correctIndex: 3,
    explanation: 'The loop adds 0, then 1, then 2. Starting at 2 gives 5.',
  }),
  () => ({
    code: 'def double(n):\n    return n * 2\n\nvalue = double(4) + 1\nprint(value)',
    steps: ['8', '9', '10', '12'], correctIndex: 1,
    explanation: 'double(4) returns 8, then 1 is added, producing 9.',
  }),
]

const booleanChallenges = [
  () => {
    const a = 2 + Math.floor(Math.random() * 8)
    const b = 1 + Math.floor(Math.random() * 8)
    const truth = a > b && b > 0
    const options = shuffle(['True', 'False', '0', 'Error'])
    return {
      expression: `${a} > ${b} and ${b} > 0`,
      options,
      correctIndex: options.indexOf(String(truth)),
      explanation: `${a} > ${b} is ${a > b}, and ${b} > 0 is True. The and operator requires both sides to be True.`,
    }
  },
  () => {
    const value = 2 + Math.floor(Math.random() * 6)
    const truth = !(value === value + 1)
    const options = shuffle(['True', 'False', '0', 'Error'])
    return {
      expression: `not (${value} == ${value + 1})`,
      options,
      correctIndex: options.indexOf(String(truth)),
      explanation: `${value} is not equal to ${value + 1}, so the comparison is False. not False becomes True.`,
    }
  },
]

const loopChallenges = [
  () => {
    const start = 1 + Math.floor(Math.random() * 4)
    const count = 3 + Math.floor(Math.random() * 3)
    const answer = start + (count - 1) * count / 2
    const options = shuffle([answer, answer + 1, answer - 1, answer + 3].map(String))
    return {
      code: `x = ${start}\nfor i in range(${count}):\n    x += i\nprint(x)`,
      options,
      correctIndex: options.indexOf(String(answer)),
      explanation: `The loop adds 0 through ${count - 1}. Starting at ${start} produces ${answer}.`,
    }
  },
  () => {
    const count = 2 + Math.floor(Math.random() * 4)
    const answer = count * 2
    const options = shuffle([answer, count, answer + 1, answer - 2].map(String))
    return {
      code: `total = 0\nfor i in range(${count}):\n    total += 2\nprint(total)`,
      options,
      correctIndex: options.indexOf(String(answer)),
      explanation: `The loop runs ${count} times and adds 2 each time, so the total is ${answer}.`,
    }
  },
]

const functionChallenges = [
  () => {
    const n = 2 + Math.floor(Math.random() * 6)
    const add = 1 + Math.floor(Math.random() * 5)
    const answer = n * 2 + add
    const options = shuffle([answer, answer - 1, answer + 2, n + add].map(String))
    return {
      code: `def transform(x):\n    return x * 2 + ${add}\n\nprint(transform(${n}))`,
      options,
      correctIndex: options.indexOf(String(answer)),
      explanation: `transform(${n}) doubles ${n} to ${n * 2}, then adds ${add}, producing ${answer}.`,
    }
  },
  () => {
    const n = 2 + Math.floor(Math.random() * 6)
    const answer = n * n
    const options = shuffle([answer, answer + n, n * 2, answer - 1].map(String))
    return {
      code: `def square(x):\n    return x * x\n\nresult = square(${n})`,
      options,
      correctIndex: options.indexOf(String(answer)),
      explanation: `square(${n}) multiplies ${n} by itself, giving ${answer}.`,
    }
  },
]

const complexityChallenges = [
  () => {
    const options = shuffle(['O(1)', 'O(n)', 'O(log n)', 'O(n²)'])
    return {
      code: `for i in range(n):\n    print(i)`,
      options,
      correctIndex: options.indexOf('O(n)'),
      explanation: 'The loop runs once for each value of n, so the work grows linearly: O(n).',
    }
  },
  () => {
    const options = shuffle(['O(1)', 'O(n)', 'O(log n)', 'O(n²)'])
    return {
      code: `for i in range(n):\n    for j in range(n):\n        print(i, j)`,
      options,
      correctIndex: options.indexOf('O(n²)'),
      explanation: 'There are n iterations of the outer loop and n for each inner loop, giving n × n = O(n²).',
    }
  },
]



const DIFFICULTY_LEVEL: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3, extreme: 4 }


function makeLoopCountPayload(difficulty: Difficulty): LoopCountPayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  if (level === 1) {
    const count = 3 + Math.floor(Math.random() * 5)
    return { code: `for i in range(${count}):\n    print(i)`, answer: count, explanation: `range(${count}) produces ${count} iterations: 0 through ${count - 1}.` }
  }
  if (level === 2) {
    const start = 1 + Math.floor(Math.random() * 3)
    const stop = start + 3 + Math.floor(Math.random() * 4)
    const step = Math.random() < 0.5 ? 1 : 2
    const answer = Math.max(0, Math.ceil((stop - start) / step))
    return { code: `for i in range(${start}, ${stop}, ${step}):\n    print(i)`, answer, explanation: `The loop starts at ${start}, stops before ${stop}, and advances by ${step}. That produces ${answer} iterations.` }
  }
  if (level === 3) {
    const outer = 2 + Math.floor(Math.random() * 3)
    const inner = 2 + Math.floor(Math.random() * 3)
    const answer = outer * inner
    return { code: `for i in range(${outer}):\n    for j in range(${inner}):\n        print(i, j)`, answer, explanation: `The inner loop runs ${inner} times for each of ${outer} outer iterations: ${outer} × ${inner} = ${answer}.` }
  }
  const outer = 3 + Math.floor(Math.random() * 2)
  const inner = 3
  const answer = Array.from({ length: outer }, (_, i) => Array.from({ length: inner }, (_, j) => (i + j) % 2 === 0).filter(Boolean).length).reduce((a, b) => a + b, 0)
  return {
    code: `hits = 0\nfor i in range(${outer}):\n    for j in range(${inner}):\n        if (i + j) % 2 == 0:\n            hits += 1`,
    answer,
    explanation: `Only iterations where (i + j) is even increment hits. Trace the nested loop pairs and count those matches: ${answer}.`,
  }
}


function makeBubblePayload(difficulty: Difficulty, serial = 0): BubblePayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  const count =
  level === 1 ? 4 :
  level === 2 ? 8 :
  level === 3 ? 12 :
  16
  const a = level === 1 ? 2 + Math.floor(Math.random() * 8) : 4 + Math.floor(Math.random() * 18)
  const b = level === 1 ? 1 + Math.floor(Math.random() * 5) : 2 + Math.floor(Math.random() * 12)
  const mode = Math.floor(Math.random() * 3)
  let answer: number
  let code: string
  let explanation: string
  if (mode === 0) {
    answer = a + b
    code = `x = ${a}\nx = x + ${b}\nprint(x)`
    explanation = `x starts at ${a}. The program adds ${b}, so the correct output is ${answer}.`
  } else if (mode === 1) {
    answer = a + a * b
    code = `x = ${a}\nfor i in range(${b}):\n    x += ${a}\nprint(x)`
    explanation = `The loop runs ${b} times and adds ${a} each time. Starting at ${a} gives ${answer}.`
  } else {
    answer = a * 2 - b
    code = `value = ${a}\nvalue *= 2\nvalue -= ${b}\nprint(value)`
    explanation = `Double ${a} to get ${a * 2}, then subtract ${b}. The output is ${answer}.`
  }

  const mistakes = [answer - 1, answer + 1, answer - b, answer + b, a, b, answer * 2, Math.max(0, answer - 2), answer + 2, a * b, a + b, answer + 3, answer - 3, answer + 4]
  const values = new Set<string>([String(answer)])
  for (const value of mistakes) if (values.size < count) values.add(String(value))
  let filler = Math.max(0, answer - 10)
  while (values.size < count) {
    const candidate = String(filler++)
    if (!values.has(candidate)) values.add(candidate)
  }
  let bubbles = shuffle([...values])
  // Rotate the correct option to a different logical slot each round so the
  // player cannot learn a repeated answer position.
  const answerValue = String(answer)
  const targetIndex = ((serial % count) + count) % count
  const currentAnswerIndex = bubbles.indexOf(answerValue)
  if (currentAnswerIndex !== targetIndex) {
    ;[bubbles[currentAnswerIndex], bubbles[targetIndex]] = [bubbles[targetIndex]!, bubbles[currentAnswerIndex]!]
  }


 return {
  prompt: count === 4 ? 'POP the output!' : `POP the correct output — ${count} targets!`,
  code,
  bubbles,
  correctIndex: bubbles.indexOf(String(answer)),
  explanation,
}
}

function makeMatchPayload(difficulty: Difficulty): MatchPayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  const sets = [
    [['x = 7', 'name = "Ada"', 'ready = True'], ['bool', 'int', 'str'], [1, 2, 0], '7 is an int, "Ada" is a str, and True is a bool.'],
    [['len([1,2,3])', '"7"', '3.14', 'False', 'range(4)'], ['float', 'range', 'str', 'int', 'bool'], [3, 2, 0, 4, 1], 'len([1,2,3]) returns an int, "7" is a str, 3.14 is a float, False is a bool, and range(4) creates a range object.'],
    [['for', 'def', 'return', '==', '[]', 'if', 'len()'], ['loop', 'function definition', 'send a value back', 'comparison', 'list', 'conditional', 'size'], [0, 1, 2, 3, 4, 5, 6], 'Match each Python token to what it does.'],
    [['append()', 'len()', 'range()', '==', 'and', 'def', 'return', 'if'], ['add to a list', 'get a size', 'generate a sequence', 'compare values', 'combine conditions', 'define a function', 'send a value back', 'branch on a condition'], [0, 1, 2, 3, 4, 5, 6, 7], 'Extreme Match Attack mixes built-ins, operators, and control-flow keywords.']
  ] as const
  const chosen = sets[Math.min(level - 1, sets.length - 1)]
  const right = shuffle([...chosen[1]])
  const pairs = chosen[2].map((targetIndex) => right.indexOf(chosen[1][targetIndex]!))
  return { left: [...chosen[0]], right, pairs, explanation: chosen[3] }
}

function makeDodgePayload(difficulty: Difficulty): DodgePayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  const score = 3 + Math.floor(Math.random() * 9)
  const bonus = 1 + Math.floor(Math.random() * 5)
  if (level === 1) return { code: `score = ${score}\nif score > 5:\n    lane = "RIGHT"\nelse:\n    lane = "LEFT"`, lanes: ['LEFT', 'CENTER', 'RIGHT'], safeIndex: score > 5 ? 2 : 0, explanation: `score is ${score}, so the ${score > 5 ? 'if' : 'else'} branch selects ${score > 5 ? 'RIGHT' : 'LEFT'}.` }
  if (level === 2) return { code: `score = ${score}\nbonus = ${bonus}\nif score >= 8:\n    lane = "RIGHT"\nelif bonus >= 4:\n    lane = "CENTER"\nelse:\n    lane = "LEFT"`, lanes: ['LEFT', 'CENTER', 'RIGHT'], safeIndex: score >= 8 ? 2 : bonus >= 4 ? 1 : 0, explanation: `Check the branches top to bottom. score >= 8 wins first; otherwise bonus >= 4 selects CENTER; otherwise LEFT.` }
  if (level === 3) {
    const lives = 1 + Math.floor(Math.random() * 4)
    const combo = 2 + Math.floor(Math.random() * 6)
    const first = score >= 9 && combo >= 5
    const second = lives === 1 || combo >= 6
    const third = score >= 5
    const safe = first ? 2 : second ? 1 : third ? 2 : 0
    return { code: `score = ${score}\nlives = ${lives}\ncombo = ${combo}\nif score >= 9 and combo >= 5:\n    lane = "RIGHT"\nelif lives == 1 or combo >= 6:\n    lane = "CENTER"\nelif score >= 5:\n    lane = "RIGHT"\nelse:\n    lane = "LEFT"`, lanes: ['LEFT', 'CENTER', 'RIGHT'], safeIndex: safe, explanation: `Evaluate each condition in order. Python stops at the first true branch; remember that and/or combine the sub-conditions.` }
  }
  const lives = 1 + Math.floor(Math.random() * 3)
  const combo = 3 + Math.floor(Math.random() * 8)
  const shield = Math.floor(Math.random() * 2) === 1
  const first = (score >= 10 && combo >= 8) || (shield && lives > 2)
  const second = (shield && lives > 1) || combo >= 9
  const third = score >= 7 || combo >= 6
  const safe = first ? 2 : second ? 1 : third ? 2 : 0
  return { code: `score = ${score}\nlives = ${lives}\ncombo = ${combo}\nshield = ${shield}\nif (score >= 10 and combo >= 8) or shield and lives > 2:\n    lane = "RIGHT"\nelif (shield and lives > 1) or combo >= 9:\n    lane = "CENTER"\nelif score >= 7 or combo >= 6:\n    lane = "RIGHT"\nelse:\n    lane = "LEFT"`, lanes: ['LEFT', 'CENTER', 'RIGHT'], safeIndex: safe, explanation: `Extreme Lane Logic mixes parentheses with and/or and multiple branches. Evaluate the grouped condition first, then move to the next elif only if the earlier branch is false.` }
}

function makeBuildPayload(difficulty: Difficulty): BuildCodePayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  const programs: string[][] = [
    ['score = 0', 'score += 1', 'if score == 1:', '    print("Ready")'],
    ['def add(a, b):', '    total = a + b', '    return total', 'result = add(2, 3)', 'print(result)'],
    ['numbers = [1, 2, 3]', 'total = 0', 'for number in numbers:', '    total += number', 'if total > 5:', '    print("big")', 'print(total)'],
    ['def classify(values):', '    total = 0', '    for value in values:', '        if value % 2 == 0:', '            total += value', '    return total', 'values = [2, 5, 8, 11]', 'result = classify(values)', 'print(result)', 'print("done")'],
  ]
  const blocks = [...programs[level - 1]]
  const shuffled = shuffle(blocks.map((block, index) => ({ block, index })))
  const indexMap = new Map(shuffled.map((item, i) => [item.index, i]))
  const correctOrder = blocks.map((_, i) => indexMap.get(i) ?? 0)
  return { blocks: shuffled.map((item) => item.block), correctOrder, explanation: level === 1 ? 'Initialize the value, change it, check the condition, then execute the indented body.' : 'Use Python structure: define or initialize first, execute loops/conditions in order, then use the resulting value. Indentation determines which lines belong together.' }
}

function makeBugPayload(difficulty: Difficulty): BugHuntPayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  const sets = [
    { code: ['name = "Ada"', 'print(nam)', 'print("Ready")'], bugs: [1] },
    { code: ['numbers = [10, 20, 30]', 'for i in range(4):', '    print(numbers[i])', 'print("done")'], bugs: [1] },
    { code: ['def factorial(n):', '    if n == 0:', '        return 0', '    return n * factorial(n - 1)', 'print(factorial(4))', 'print("done")'], bugs: [2] },
    { code: ['items = [2, 4, 6, 8]', 'total = 0', 'for item in items:', '    if item % 2 == 0:', '        total += items[item]', 'print(total)', 'print(complet)', 'print("audit")'], bugs: [4, 6] },
  ]
  const chosen = sets[level - 1]
  const bugs = chosen.bugs.length ? chosen.bugs : [0]
  const explanation = level >= 4 ? 'Extreme mode contains multiple bugs. Line 5 uses the value as an index instead of a valid position, and line 7 misspells the function name. Find both broken lines before submitting.' : level === 3 ? 'The factorial base case must return 1. Returning 0 makes every recursive result become 0.' : level === 2 ? 'range(4) reaches index 3, but the list only has indexes 0 through 2. Use range(3) or range(len(numbers)).' : 'Read each line in context; the basic version has no hidden syntax trick.'
  return { code: chosen.code, bugIndex: bugs[0], bugIndices: bugs, explanation }
}

function makeTracePayload(difficulty: Difficulty): TracePayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  if (level <= 2) return level === 1
    ? { code: 'x = 2\nfor i in range(3):\n    x += i\nprint(x)', steps: ['After i=0: 2', 'After i=1: 3', 'After i=2: 5', 'Final: 5'], correctIndex: 3, explanation: 'The loop adds 0, then 1, then 2. The next step after i=1 is x = 5.', }
    : { code: 'x = 3\nfor i in range(4):\n    x += i\nprint(x)', steps: ['x becomes 3', 'x becomes 4', 'x becomes 6', 'x becomes 9'], correctIndex: 3, explanation: 'range(4) contributes 0, 1, 2, and 3. Follow the accumulator after each iteration.', }
  if (level === 3) return { code: 'value = 1\nfor i in range(1, 4):\n    value *= i\n    print(value)', steps: ['Next: 1', 'Next: 2', 'Next: 6', 'Next: 24'], correctIndex: 2, explanation: 'The next printed value after the first two iterations is 6 because 1 × 1 × 2 × 3 = 6.' }
  return { code: 'def step(x):\n    if x % 2 == 0:\n        return x // 2\n    return x * 3 + 1\n\nvalue = 10\nvalue = step(value)\nvalue = step(value)\nprint(value)', steps: ['After first step: 5', 'After second step: 16', 'After second step: 10', 'After second step: 20'], correctIndex: 1, explanation: 'Predict the next state instead of jumping to the final output: step(10) returns 5, then step(5) returns 16.' }
}

function makeChoicePayload(difficulty: Difficulty): ChoicePayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  if (level === 1) {
    const a = 2 + Math.floor(Math.random() * 8), b = 2 + Math.floor(Math.random() * 8), answer = a + b
    const options = shuffle([String(answer), String(answer + 1), String(answer - 1), String(a)])
    return { code: `x = ${a}\nx = x + ${b}`, question: 'What does x equal after this code?', options, correctIndex: options.indexOf(String(answer)), explanation: `x starts at ${a}; adding ${b} produces ${answer}. The nearby distractors represent common off-by-one or stale-value mistakes.` }
  }
  if (level === 2) {
    const n = 3 + Math.floor(Math.random() * 5)
    const answer = n * 2 + 1
    const options = shuffle([String(answer), String(answer - 1), String(answer + 1), String(n * 2)])
    return { code: `n = ${n}\nresult = n * 2 + 1\nprint(result)`, question: 'What value is printed?', options, correctIndex: options.indexOf(String(answer)), explanation: `Double ${n}, then add 1. The distractors target forgetting the +1 or stopping at n * 2.` }
  }
  if (level === 3) {
    const n = 5 + Math.floor(Math.random() * 5)
    const answer = n + 4 + 3
    const options = shuffle([String(answer), String(n + 4), String(n + 3), String(n + 7), String(n * 2)])
    return { code: `x = ${n}\nif x > 6:\n    x += 4\nif x > 8:\n    x += 3\nprint(x)`, question: 'What is printed after both conditions are evaluated?', options, correctIndex: options.indexOf(String(answer)), explanation: `Both if statements are checked independently. After adding 4, x is ${n + 4}; it then exceeds 8, so another 3 is added. The distractors reflect treating the second if like else or missing the second update.` }
  }
  const n = 4 + Math.floor(Math.random() * 5)
  const answer = n % 2 === 0 ? n * 3 + 1 : n + 5
  const options = shuffle([String(answer), String(n * 3), String(n + 5), String(n)])
  return { code: `x = ${n}\nif x % 2 == 0:\n    x = x * 3 + 1\nelif x > 6:\n    x = x + 5\nelse:\n    x = 0\nprint(x)`, question: 'Which value is printed?', options, correctIndex: options.indexOf(String(answer)), explanation: `Evaluate the branches in order. Only the first true branch runs. The distractors represent common mistakes such as running both branches or confusing the elif condition.` }
}

function makeBooleanPayload(difficulty: Difficulty): BooleanPayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  if (level === 1) { const a: number = 4, b: number = 2; const truth = a > b && b > 0; const options = shuffle(['True','False','0','Error']); return { expression: `${a} > ${b} and ${b} > 0`, options, correctIndex: options.indexOf(truth ? 'True' : 'False'), explanation: 'Both comparisons are true, so True and True evaluates to True.' } }
  if (level === 2) { const a: number = 7, b: number = 4; const truth = !(a < b) || b === 0; const options = shuffle(['True','False','0','Error']); return { expression: `not (${a} < ${b}) or ${b} == 0`, options, correctIndex: options.indexOf(truth ? 'True' : 'False'), explanation: 'The comparison is false, not false becomes true, and True or anything is True.' } }
  if (level === 3) { const a: number = 9, b: number = 6, c: number = 2; const truth = (a > b && b > c) || c === 0; const options = shuffle(['True','False','Short-circuit','Error']); return { expression: `(${a} > ${b} and ${b} > ${c}) or ${c} == 0`, options, correctIndex: options.indexOf(truth ? 'True' : 'False'), explanation: 'The grouped and expression is true because 9 > 6 and 6 > 2. True or anything is True.' } }
  const truth = !((5 > 3 && 2 > 7) || (4 == 4 && 1 > 9)); const options = shuffle(['True','False','None','Error']); return { expression: `not ((5 > 3 and 2 > 7) or (4 == 4 and 1 > 9))`, options, correctIndex: options.indexOf(truth ? 'True' : 'False'), explanation: 'Each inner and group is false, so the or expression is false. not False becomes True.' }
}

function makeLoopPayload(difficulty: Difficulty, serial = 0): LoopPayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  const variant = ((serial % 4) + 4) % 4

  if (level === 1) {
    const questions = [
      { code: 'total = 0\nfor i in range(3):\n    total += 2\nprint(total)', options: ['4', '6', '8', '3'], answer: '6', explanation: 'The loop runs three times and adds 2 each time: 2 + 2 + 2 = 6.' },
      { code: 'x = 5\nfor i in range(2):\n    x += 3\nprint(x)', options: ['8', '10', '11', '13'], answer: '11', explanation: 'The loop runs twice, adding 3 each time. Starting at 5 gives 11.' },
      { code: 'count = 1\nfor i in range(4):\n    count += 1\nprint(count)', options: ['4', '5', '6', '3'], answer: '5', explanation: 'The loop executes four times and increases count from 1 to 5.' },
      { code: 'for i in range(3):\n    print(i)', options: ['2', '3', '4', '0'], answer: '3', explanation: 'range(3) produces 0, 1, and 2, so the loop executes three times.' },
    ]
    const q = questions[variant]!
    const options = shuffle(q.options)
    return { code: q.code, options, correctIndex: options.indexOf(q.answer), explanation: q.explanation }
  }

  if (level === 2) {
    const questions = [
      { code: 'x = 1\nfor i in range(1, 5):\n    x += i\nprint(x)', options: ['10', '11', '12', '15'], answer: '11', explanation: 'Add 1 + 2 + 3 + 4 to the starting value 1, producing 11.' },
      { code: 'total = 0\nfor i in range(2, 6):\n    total += i\nprint(total)', options: ['12', '14', '16', '18'], answer: '14', explanation: 'range(2, 6) gives 2, 3, 4, 5. Their sum is 14.' },
      { code: 'x = 10\nfor i in range(3):\n    x -= 2\nprint(x)', options: ['4', '6', '8', '10'], answer: '4', explanation: 'The loop runs three times and subtracts 2 each time: 10 → 8 → 6 → 4.' },
      { code: 'total = 1\nfor i in range(1, 4):\n    total *= i\nprint(total)', options: ['6', '7', '9', '12'], answer: '6', explanation: 'The accumulator becomes 1 × 1 × 2 × 3 = 6.' },
    ]
    const q = questions[variant]!
    const options = shuffle(q.options)
    return { code: q.code, options, correctIndex: options.indexOf(q.answer), explanation: q.explanation }
  }

  if (level === 3) {
    const questions = [
      { code: 'total = 0\nfor i in range(2, 8):\n    if i % 2 == 0:\n        total += i\n    else:\n        total -= 1\nprint(total)', options: ['8', '9', '10', '12'], answer: '9', explanation: 'Even values add themselves; odd values subtract 1: 2 - 1 + 4 - 1 + 6 - 1 = 9.' },
      { code: 'value = 2\nfor i in range(4):\n    if i % 2 == 0:\n        value += 3\n    else:\n        value *= 2\nprint(value)', options: ['13', '16', '22', '26'], answer: '26', explanation: 'Trace each iteration: 2 → 5 → 10 → 13 → 26. The operations alternate.' },
      { code: 'total = 0\nfor i in range(3):\n    for j in range(2):\n        total += i + j\nprint(total)', options: ['6', '7', '8', '9'], answer: '9', explanation: 'The inner loop contributes 0+1, then 1+2, then 2+3. The total is 9.' },
      { code: 'x = 5\nfor i in range(1, 5):\n    if x % 2 == 1:\n        x += i\n    else:\n        x -= 1\nprint(x)', options: ['7', '8', '9', '10'], answer: '7', explanation: 'Trace the changing parity: 5→6→5→8→7. The condition is reevaluated every iteration.' },
    ]
    const q = questions[variant]!
    const options = shuffle(q.options)
    return { code: q.code, options, correctIndex: options.indexOf(q.answer), explanation: q.explanation }
  }

  const questions = [
    { code: 'total = 1\nfor i in range(1, 5):\n    for j in range(i):\n        if (i + j) % 2 == 0:\n            total += j\n        else:\n            total -= 1\nprint(total)', answer: (() => { let a=1; for(let i=1;i<5;i++) for(let j=0;j<i;j++) a += (i+j)%2===0 ? j : -1; return a })(), explanation: 'Extreme Loop Lab nests two loops and changes the accumulator based on parity. Trace every inner iteration before moving to the next outer iteration.' },
    { code: 'hits = 0\nfor i in range(4):\n    for j in range(3):\n        if (i + j) % 2 == 0:\n            hits += 1\nprint(hits)', answer: 6, explanation: 'Only pairs where i + j is even increment hits. Count those matching pairs across the nested loops.' },
    { code: 'score = 0\nfor i in range(1, 5):\n    for j in range(i):\n        if j == 0:\n            score += i\n        elif i % 2 == 0:\n            score += j\n        else:\n            score -= 1\nprint(score)', answer: (() => { let a=0; for(let i=1;i<5;i++) for(let j=0;j<i;j++) a += j===0 ? i : i%2===0 ? j : -1; return a })(), explanation: 'The nested loop changes behavior based on both j and the parity of i. Work through each inner iteration carefully.' },
    { code: 'value = 0\nfor i in range(5):\n    for j in range(i + 1):\n        if (i * j) % 3 == 0:\n            value += 2\n        else:\n            value -= 1\nprint(value)', answer: (() => { let a=0; for(let i=0;i<5;i++) for(let j=0;j<i+1;j++) a += (i*j)%3===0 ? 2 : -1; return a })(), explanation: 'This combines nested loops, multiplication, modulo, and two branches. Trace the condition rather than trying to guess the final value.' },
  ].map((q) => ({ ...q, options: shuffle([String(q.answer), String(q.answer + 1), String(q.answer - 2), String(q.answer + 3)]) }))
  const q = questions[variant]!
  return { code: q.code, options: q.options, correctIndex: q.options.indexOf(String(q.answer)), explanation: q.explanation }
}

function makeFunctionPayload(difficulty: Difficulty, serial = 0): FunctionPayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  const variant = ((serial % 4) + 4) % 4

  if (level === 1) {
    const questions = [
      { code: 'def double(x):\n    return x * 2\n\nprint(double(4))', options: ['6', '8', '10', '4'], answer: '8', explanation: 'double(4) returns 4 × 2 = 8.' },
      { code: 'def add_one(x):\n    return x + 1\n\nprint(add_one(7))', options: ['6', '7', '8', '9'], answer: '8', explanation: 'The function adds 1 to its input: 7 + 1 = 8.' },
      { code: 'def triple(x):\n    return x * 3\n\nprint(triple(3))', options: ['6', '9', '12', '3'], answer: '9', explanation: 'triple(3) multiplies 3 by 3, giving 9.' },
      { code: 'def subtract(x):\n    return x - 2\n\nprint(subtract(9))', options: ['5', '7', '9', '11'], answer: '7', explanation: 'The function subtracts 2 from 9, producing 7.' },
    ]
    const q = questions[variant]!
    const options = shuffle(q.options)
    return { code: q.code, options, correctIndex: options.indexOf(q.answer), explanation: q.explanation }
  }

  if (level === 2) {
    const questions = [
      { code: 'def transform(x):\n    return x * 2 + 3\n\nprint(transform(5))', options: ['10', '11', '13', '15'], answer: '13', explanation: 'transform(5) doubles 5 to 10, then adds 3 for 13.' },
      { code: 'def add(a, b):\n    return a + b\n\nprint(add(4, 7) * 2)', options: ['11', '18', '22', '24'], answer: '22', explanation: 'add(4, 7) returns 11, and the caller then multiplies that result by 2.' },
      { code: 'def change(x):\n    x -= 2\n    return x * 3\n\nprint(change(6))', options: ['10', '12', '14', '18'], answer: '12', explanation: 'The function first changes 6 to 4, then returns 4 × 3 = 12.' },
      { code: 'def power(x):\n    return x * x\n\nprint(power(5) - 4)', options: ['21', '25', '29', '9'], answer: '21', explanation: 'power(5) returns 25, then the caller subtracts 4 to get 21.' },
    ]
    const q = questions[variant]!
    const options = shuffle(q.options)
    return { code: q.code, options, correctIndex: options.indexOf(q.answer), explanation: q.explanation }
  }

  if (level === 3) {
    const questions = [
      { code: 'def step(x):\n    if x > 5:\n        return x - 2\n    return x + 4\n\nprint(step(step(8)))', options: ['4', '6', '8', '10'], answer: '4', explanation: 'step(8) returns 6; step(6) returns 4. The inner function call finishes before the outer one.' },
      { code: 'def update(x):\n    if x % 2 == 0:\n        return x // 2\n    return x + 3\n\nprint(update(update(9)))', options: ['6', '12', '9', '15'], answer: '6', explanation: 'update(9) returns 12, then update(12) returns 6. The second call sees the changed value.' },
      { code: 'def calc(x):\n    total = 0\n    for i in range(x):\n        if i % 2 == 0:\n            total += i\n    return total\n\nprint(calc(6))', options: ['6', '8', '9', '12'], answer: '6', explanation: 'The even values below 6 are 0, 2, and 4. Their sum is 6.' },
      { code: 'def adjust(x):\n    for i in range(3):\n        x += i\n    return x\n\nprint(adjust(4) + adjust(2))', options: ['12', '13', '14', '15'], answer: '12', explanation: 'Each call adds 0 + 1 + 2 = 3. So adjust(4)=7 and adjust(2)=5; together they make 12.' },
    ]
    const q = questions[variant]!
    const options = shuffle(q.options)
    return { code: q.code, options, correctIndex: options.indexOf(q.answer), explanation: q.explanation }
  }

  const questions = [
    { code: 'def transform(x):\n    if x % 2 == 0:\n        x //= 2\n    else:\n        x = x * 3 + 1\n    return x + 2\n\nvalue = transform(transform(10))\nprint(value)', options: ['24', '26', '28', '32'], answer: '26', explanation: 'transform(10) returns 7. Then transform(7) returns 24, and the final +2 produces 26.' },
    { code: 'def fold(n):\n    if n <= 1:\n        return 1\n    return n + fold(n - 2)\n\nprint(fold(7))', options: ['10', '12', '16', '18'], answer: '16', explanation: 'fold(7) becomes 7 + fold(5), then 5 + fold(3), then 3 + fold(1), and fold(1)=1. Total: 16.' },
    { code: 'def score(values):\n    total = 0\n    for i, value in enumerate(values):\n        if i % 2 == 0:\n            total += value * 2\n        else:\n            total -= value\n    return total\n\nprint(score([2, 3, 4, 5]))', options: ['2', '4', '5', '7'], answer: '4', explanation: 'Even indexes add double the value: 4 + 8. Odd indexes subtract: 3 + 5. The total is 4 + 8 - 3 - 5 = 4.' },
    { code: 'def mystery(n):\n    if n <= 0:\n        return 0\n    return n + mystery(n - 3)\n\nprint(mystery(10))', options: ['16', '18', '21', '22'], answer: '22', explanation: 'The recursive calls are 10 + 7 + 4 + 1 + 0 = 22. Track the decreasing argument until the base case.' },
  ]
  const q = questions[variant]!
  const options = shuffle(q.options)
  return { code: q.code, options, correctIndex: options.indexOf(q.answer), explanation: q.explanation }
}

function makeComplexityPayload(difficulty: Difficulty): ComplexityPayload {
  const level = DIFFICULTY_LEVEL[difficulty]
  if (level === 1) return { code: 'x = values[0]\nprint(x)', options: ['O(1)','O(n)','O(log n)','O(n²)'], correctIndex: 0, explanation: 'Accessing one known list position is constant time: O(1).' }
  if (level === 2) return { code: 'for i in range(n):\n    print(i)', options: ['O(1)','O(n)','O(log n)','O(n²)'], correctIndex: 1, explanation: 'One loop through n items is linear: O(n).' }
  if (level === 3) return { code: 'for i in range(n):\n    for j in range(n):\n        print(i, j)', options: ['O(log n)','O(n)','O(n²)','O(n³)'], correctIndex: 2, explanation: 'Two nested n-sized loops perform about n × n operations: O(n²).' }
  return { code: 'for i in range(n):\n    for j in range(i, n):\n        for k in range(2):\n            print(i, j, k)', options: ['O(n)','O(n log n)','O(n²)','O(n³)'], correctIndex: 2, explanation: 'The outer and middle loops combine for roughly n² work. The innermost loop only runs twice, a constant factor, so the total is O(n²).' }
}



function makeAlgorithmArenaPayload(difficulty: Difficulty): AlgorithmArenaPayload {
  const size = 15
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => '#'))
  const carve = (r: number, c: number) => { grid[r]![c] = ' ' }
  const stack: Array<[number, number]> = [[1, 1]]
  carve(1, 1)
  while (stack.length) {
    const current = stack[stack.length - 1]!
    const [r, c] = current
    const neighbors: Array<[number, number, number, number]> = []
    if (r > 1 && grid[r - 2]![c] === '#') neighbors.push([r - 2, c, r - 1, c])
    if (r < size - 2 && grid[r + 2]![c] === '#') neighbors.push([r + 2, c, r + 1, c])
    if (c > 1 && grid[r]![c - 2] === '#') neighbors.push([r, c - 2, r, c - 1])
    if (c < size - 2 && grid[r]![c + 2] === '#') neighbors.push([r, c + 2, r, c + 1])
    if (!neighbors.length) { stack.pop(); continue }
    const next = neighbors[Math.floor(Math.random() * neighbors.length)]!
    carve(next[0], next[1]); carve(next[2], next[3]); stack.push([next[0], next[1]])
  }
  const start1: [number, number] = [1, 1]
  const start2: [number, number] = [13, 13]
  const crown: [number, number] = [7, 7]
  carve(...start1); carve(...start2); carve(...crown)
  grid[start1[0]]![start1[1]] = '1'
  grid[start2[0]]![start2[1]] = '2'
  grid[crown[0]]![crown[1]] = 'C'
  return { maze: grid.map((row) => row.join('')), start1, start2, crown, raceSeconds: 90 }
}

function timeLimitFor(difficulty: Difficulty) {
  return difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20
}

export function generateMicrogame(difficulty: Difficulty, serial = 0, forcedFamily?: 'bubble' | 'choice' | 'match' | 'dodge' | 'boolean' | 'loop' | 'function' | 'complexity' | 'trace' | 'bug' | 'build' | 'loop-count' | 'algorithm'): MicrogameDefinition {
  const level = { easy: 1, medium: 2, hard: 3, extreme: 4 }[difficulty]
  const families =
    level === 1
      ? ['bubble', 'choice', 'match', 'dodge', 'boolean', 'loop', 'build', 'loop-count']
      : level === 2
        ? ['bubble', 'bug', 'match', 'build', 'dodge', 'boolean', 'loop', 'function', 'trace', 'loop-count']
        : level === 3
          ? ['bug', 'build', 'choice', 'match', 'dodge', 'trace', 'boolean', 'loop', 'function', 'complexity', 'loop-count', 'algorithm']
          : ['bug', 'build', 'choice', 'match', 'bubble', 'dodge', 'trace', 'boolean', 'loop', 'function', 'complexity', 'loop-count', 'algorithm']

  const family = forcedFamily ?? pick(families)
  const choiceControls = [
    { input: 'cross' as const, label: 'Answer 1' },
    { input: 'circle' as const, label: 'Answer 2' },
    { input: 'square' as const, label: 'Answer 3' },
    { input: 'triangle' as const, label: 'Answer 4' },
  ]
  const controls = {
    choice: [
      { input: 'cross' as const, label: 'Answer 1' },
      { input: 'circle' as const, label: 'Answer 2' },
      { input: 'square' as const, label: 'Answer 3' },
      { input: 'triangle' as const, label: 'Answer 4' },
    ],
    bubble: [
      { input: 'cross' as const, label: 'Pop target' },
      { input: 'lstick' as const, label: 'Aim / move' },
    ],
    bug: [
      { input: 'dpad' as const, label: 'Select line' },
      { input: 'cross' as const, label: 'Submit' },
    ],
    build: [
      { input: 'dpad' as const, label: 'Choose block' },
      { input: 'cross' as const, label: 'Place block' },
    ],
    match: [
      { input: 'dpad' as const, label: 'Select item' },
      { input: 'cross' as const, label: 'Match' },
    ],
    dodge: [
      { input: 'left' as const, label: 'Move left' },
      { input: 'right' as const, label: 'Move right' },
      { input: 'cross' as const, label: 'Lock lane' },
    ],
    trace: [
      { input: 'up' as const, label: 'Choose output' },
      { input: 'down' as const, label: 'Choose output' },
      { input: 'cross' as const, label: 'Lock answer' },
    ],
    boolean: choiceControls,
    loop: choiceControls,
    function: choiceControls,
    complexity: choiceControls,
    'loop-count': [
      { input: 'cross' as const, label: 'Count one loop' },
    ],
  } as const

  if (family === 'loop-count') {
    const payload = makeLoopCountPayload(difficulty)
    return { id: uniqueId(`loop-count-${serial}`), kind: 'loop-count', mechanic: 'trace', name: 'LOOP COUNT', description: 'Count the executions without seeing your running total.', objective: 'Press ✕ once for every loop execution. Your count stays hidden until time is up.', controls: [...controls['loop-count']], difficulty, timeLimit: timeLimitFor(difficulty), payload }
  }


  if (family === 'boolean') {
    const payload = makeBooleanPayload(difficulty)
    return { id: uniqueId(`boolean-${serial}`), kind: 'boolean-blitz', mechanic: 'predict', name: 'BOOLEAN BLITZ', description: 'Crack the logic before the signal flips.', objective: 'Decide whether the expression is True or False.', controls: [...controls.boolean], difficulty, timeLimit: timeLimitFor(difficulty), payload }
  }

  if (family === 'loop') {
    const payload = makeLoopPayload(difficulty, serial)
    return { id: uniqueId(`loop-${serial}`), kind: 'loop-lab', mechanic: 'trace', name: 'LOOP LAB', description: 'Trace every iteration before the counter hits zero.', objective: difficulty === 'easy' ? 'Predict the final value printed by the loop.' : 'Trace the loop carefully and predict the result.', controls: [...controls.loop], difficulty, timeLimit: timeLimitFor(difficulty), payload }
  }

  if (family === 'function') {
    const payload = makeFunctionPayload(difficulty, serial)
    return { id: uniqueId(`function-${serial}`), kind: 'function-forge', mechanic: 'predict', name: 'FUNCTION FORGE', description: 'Send the input through the function machine.', objective: 'Predict the function output.', controls: [...controls.function], difficulty, timeLimit: timeLimitFor(difficulty), payload }
  }

  if (family === 'algorithm') {
    const payload = makeAlgorithmArenaPayload(difficulty)
    return { id: uniqueId(`algorithm-${serial}`), kind: 'algorithm-arena', mechanic: 'algorithm', name: 'ALGORITHM ARENA', description: 'Race through the maze by choosing the movement program that gets your robot closer to the crown.', objective: 'Choose one of four movement programs. Execute it, move through the maze, and reach the crown before the other player.', controls: [...controls.choice], difficulty, timeLimit: payload.raceSeconds, payload }
  }

  if (family === 'complexity') {
    const payload = makeComplexityPayload(difficulty)
    return { id: uniqueId(`complexity-${serial}`), kind: 'complexity-crash', mechanic: 'algorithm', name: 'COMPLEXITY CRASH', description: 'Spot the growth rate before the code explodes.', objective: 'Identify the time complexity.', controls: [...controls.complexity], difficulty, timeLimit: timeLimitFor(difficulty), payload }
  }

  if (family === 'dodge') {
    const payload = makeDodgePayload(difficulty)
    return { id: uniqueId(`dodge-${serial}`), kind: 'dodge-code', mechanic: 'dodge', name: 'LANE LOGIC', description: 'Read the condition, dodge the crash, and lock the safe lane.', objective: difficulty === 'easy' ? 'Use the code to choose the safe lane.' : 'Evaluate every branch in order and choose the safe lane.', controls: [...controls.dodge], difficulty, timeLimit: timeLimitFor(difficulty), payload }
  }

  if (family === 'trace') {
    const payload = makeTracePayload(difficulty)
    return { id: uniqueId(`trace-${serial}`), kind: 'trace-race', mechanic: 'trace', name: 'TRACE RACE', description: 'Follow the code before the call stack catches you.', objective: difficulty === 'easy' ? 'Predict the output.' : 'Predict the next meaningful state, not just the final output.', controls: [...controls.trace], difficulty, timeLimit: timeLimitFor(difficulty), payload }
  }


  if (family === 'bug') {
    const payload = makeBugPayload(difficulty)
    return {
      id: uniqueId(`bug-${serial}`),
      kind: 'bug-hunt',
      mechanic: 'debug',
      name: 'BUG HUNT',
      description: 'Find the broken line before the timer bites back.',
      objective: 'Select the line containing the bug.',
      controls: [...controls.bug],
      difficulty,
      timeLimit: timeLimitFor(difficulty),
      payload,
    }
  }

  if (family === 'build') {
    const payload = makeBuildPayload(difficulty)

    return {
      id: uniqueId(`build-${serial}`),
      kind: 'code-build',
      mechanic: 'build',
      name: 'CODE ORDER',
      description: 'Arrange the scrambled lines into a working program.',
      objective: 'Click code blocks in the correct execution order.',
      controls: [...controls.build],
      difficulty,
      timeLimit: timeLimitFor(difficulty),
      payload,
    }
  }

  if (family === 'bubble') {
    const raw = makeBubblePayload(difficulty, serial)
    return {
      id: uniqueId(`bubble-${serial}`),
      kind: 'bubble-blitz',
      mechanic: 'catch',
      name: 'BUBBLE BLITZ',
      description: 'Pop the answer before it escapes!',
      objective: raw.prompt,
      controls: [...controls.bubble],
      difficulty,
      timeLimit: timeLimitFor(difficulty),
      payload: raw,
    }
  }

  if (family === 'match') {
    const payload = makeMatchPayload(difficulty)
    return {
      id: uniqueId(`match-${serial}`),
      kind: 'match-pairs',
      mechanic: 'match',
      name: 'MATCH ATTACK',
      description: 'Pair the programming concepts before the clock hits zero.',
      objective: 'Match every item on the left with its correct partner.',
      controls: [...controls.match],
      difficulty,
      timeLimit: timeLimitFor(difficulty),
      payload,
    }
  }

  const payload = makeChoicePayload(difficulty)
  return {
    id: uniqueId(`choice-${serial}`),
    kind: 'quick-choice',
    mechanic: level >= 3 ? 'predict' : 'predict',
    name: level >= 3 ? 'CODE SNAP' : 'QUICK CODE',
    description: 'Read it. Think fast. Lock your answer.',
    objective: payload.question,
    controls: [...controls.choice],
    difficulty,
    timeLimit: timeLimitFor(difficulty),
    payload,
  }
}
