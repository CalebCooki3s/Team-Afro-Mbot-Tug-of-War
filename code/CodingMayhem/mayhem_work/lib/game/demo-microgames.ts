import type { MicrogameControl, MicrogameDefinition } from './types'

/** Payload for the placeholder "demo-choice" renderer. */
export interface DemoChoicePayload {
  code: string
  question: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

const FOUR_CHOICE_CONTROLS: MicrogameControl[] = [
  { input: 'cross', label: 'Choice 1' },
  { input: 'circle', label: 'Choice 2' },
  { input: 'square', label: 'Choice 3' },
  { input: 'triangle', label: 'Choice 4' },
]

type DemoTemplate = Omit<MicrogameDefinition<DemoChoicePayload>, 'difficulty' | 'kind'>

/**
 * Placeholder content only. These exist so the full flow can be navigated.
 * Replace with the real dynamic challenge system later.
 */
export const DEMO_MICROGAMES: DemoTemplate[] = [
  {
    id: 'demo-debug',
    mechanic: 'debug',
    name: 'Debug This!',
    description: "Something's broken. Fix it before time runs out!",
    objective: 'Find the line that contains the bug.',
    controls: FOUR_CHOICE_CONTROLS.map((c, i) => ({ ...c, label: `Line ${i + 1}` })),
    timeLimit: 10,
    payload: {
      code: 'def greet(name):\n    message = "Hi " + name\n    print(mesage)\ngreet("Ada")',
      question: 'Which line is broken?',
      options: ['Line 1', 'Line 2', 'Line 3', 'Line 4'],
      correctIndex: 2,
    },
  },
  {
    id: 'demo-predict',
    mechanic: 'predict',
    name: 'What Prints?',
    description: 'Read the code. Predict the output. Beat the clock.',
    objective: 'Choose the value this code prints.',
    controls: FOUR_CHOICE_CONTROLS,
    timeLimit: 9,
    payload: {
      code: 'x = 3\nx = x * 2\nprint(x + 1)',
      question: 'What is printed?',
      options: ['6', '7', '4', 'x + 1'],
      correctIndex: 1,
    },
  },
  {
    id: 'demo-type',
    mechanic: 'match',
    name: 'Type Check!',
    description: 'Every value has a type. Name this one — fast.',
    objective: 'Match the value to its Python type.',
    controls: FOUR_CHOICE_CONTROLS,
    timeLimit: 8,
    payload: {
      code: 'value = "42"\nprint(type(value))',
      question: 'What type is value?',
      options: ['int', 'float', 'str', 'bool'],
      correctIndex: 2,
    },
  },
  {
    id: 'demo-loop',
    mechanic: 'trace',
    name: 'Loop Count',
    description: 'Round and round it goes. How many times?',
    objective: 'Count how many times the loop body runs.',
    controls: FOUR_CHOICE_CONTROLS,
    timeLimit: 9,
    payload: {
      code: 'for i in range(4):\n    print("beep")',
      question: 'How many beeps?',
      options: ['3', '5', '0', '4'],
      correctIndex: 3,
    },
  },
  {
    id: 'demo-logic',
    mechanic: 'predict',
    name: 'True or False?',
    description: 'Logic gates are closing. Evaluate the expression!',
    objective: 'Decide what this boolean expression prints.',
    controls: FOUR_CHOICE_CONTROLS,
    timeLimit: 8,
    payload: {
      code: 'print(10 > 3 and 2 == 2)',
      question: 'What is printed?',
      options: ['True', 'False', 'Error', 'None'],
      correctIndex: 0,
    },
  },
  {
    id: 'demo-function',
    mechanic: 'trace',
    name: 'Call It!',
    description: 'A function is waiting to be called. What comes back?',
    objective: 'Find the value returned by the function.',
    controls: FOUR_CHOICE_CONTROLS,
    timeLimit: 10,
    payload: {
      code: 'def double(n):\n    return n * 2\n\nprint(double(5))',
      question: 'What is printed?',
      options: ['25', '10', '52', '7'],
      correctIndex: 1,
    },
  },
]
