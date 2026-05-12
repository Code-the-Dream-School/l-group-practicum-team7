// Tool definitions with instruction and sample fields
const toolDefinitions = {
  breathing: {
    id: 'breathing',
    name: 'Breathing',
    description: 'Guided breathing prompts to help you relax.',
    instruction: 'Take 1 minute. Breathe in slowly, pause for a moment, then breathe out longer than you breathed in. Repeat 5 times.',
    sample: 'I breathed slowly for 1 minute. My body feels a little calmer.'
  },
  grounding: {
    id: 'grounding',
    name: 'Grounding',
    description: 'Simple grounding prompts to return attention to the present.',
    instruction: 'Look around and name 5 things you see, 4 things you feel, 3 sounds you hear, 2 smells, and 1 thing you can taste or notice in your body.',
    sample: 'I see my desk, screen, cup, wall, and window. I feel my feet on the floor. I hear the fan.'
  },
  thought_dump: {
    id: 'thought_dump',
    name: 'Thought Dump',
    description: 'Write down a few worries to clear your mind.',
    instruction: 'Write down 3 worries without trying to solve them right now.',
    sample: 'I am worried about deadlines.\nI am worried about my project.\nI am worried I am falling behind.'
  },
  over_responsibility: {
    id: 'over_responsibility',
    name: 'Working with Over-Responsibility',
    description: 'Strategies to reduce over-responsibility.',
    instruction: 'Write one task you feel responsible for. Then ask: “Is this fully mine, partly mine, or not mine?”',
    sample: 'Task: Fix everything today.\nReality: This is partly mine. I can do one part today, not everything.'
  },
  strategic_refusal: {
    id: 'strategic_refusal',
    name: 'Strategic Refusal',
    description: 'Practice saying no to unnecessary tasks.',
    instruction: 'Choose one task you can refuse, postpone, simplify, or stop doing today.',
    sample: 'I will not rewrite the whole project today. I will only fix one broken screen.'
  },
  prioritization: {
    id: 'prioritization',
    name: 'Prioritization',
    description: 'Sort tasks by urgency and importance.',
    instruction: 'Write 3 tasks. Mark each one as urgent/not urgent and important/not important.',
    sample: 'Submit assignment — urgent, important.\nClean files — not urgent, less important.\nFix login bug — important, not urgent.'
  },
  asking_for_support: {
    id: 'asking_for_support',
    name: 'Asking for Support',
    description: 'Tips for asking others for help.',
    instruction: 'Write one thing you need help with and one person you could ask.',
    sample: 'I need help understanding the project structure. I can ask my teammate to explain the main files.'
  },
  future_me_letter: {
    id: 'future_me_letter',
    name: 'Future Me Letter',
    description: 'Write a short letter to your future self.',
    instruction: 'Write 3–5 sentences to your future self about what you are working for and what you should protect today.',
    sample: 'Dear future me, I am working to build a stable life. I do not need to destroy myself to get there. Today I will protect my health and take one real step.'
  },
  five_minute_pause: {
    id: 'five_minute_pause',
    name: '5-Minute Pause',
    description: 'Short pause exercises to notice how you feel.',
    instruction: 'Pause for 5 minutes. Do not fix anything. Just notice what you feel in your body and mind.',
    sample: 'I feel tension in my chest and pressure in my head. I feel scared, but I do not need to act immediately.'
  },
  five_minute_task: {
    id: 'five_minute_task',
    name: '5-Minute Task',
    description: 'Pick one task you can do in 5 minutes.',
    instruction: 'Pick one tiny task you can do in 5 minutes. Stop when the timer ends, even if it is not perfect.',
    sample: 'Task: Open the project and find the broken component.\nResult: I found the file. That is enough for now.'
  },
  evening_release: {
    id: 'evening_release',
    name: 'Evening Release',
    description: 'Write what can wait until tomorrow.',
    instruction: 'Write what is worrying you tonight and what can wait until tomorrow.',
    sample: 'Worry: I need to finish the project.\nCan wait: debugging the whole thing.\nTomorrow: I will check one error first.'
  },
  letter_to_tomorrow_me: {
    id: 'letter_to_tomorrow_me',
    name: 'Letter to Tomorrow Me',
    description: 'A note to yourself to close the day.',
    instruction: 'Write a short note giving tomorrow’s version of you the next step.',
    sample: 'Tomorrow me, start with the API error. You do not need to fix everything at once. Just check the first failing request.'
  },
  tomorrow_list: {
    id: 'tomorrow_list',
    name: 'Tomorrow List',
    description: 'List one task for tomorrow and one postponable item.',
    instruction: 'Write one task for tomorrow and one thing you can safely postpone.',
    sample: 'Tomorrow task: Finish one assignment section.\nPostpone: redesigning the whole interface.'
  },
  light_mode: {
    id: 'light_mode',
    name: 'Light Mode',
    description: 'Choose the smallest acceptable version of your task.',
    instruction: 'Choose the smallest acceptable version of your task and do only that.',
    sample: 'Full task: finish the whole page.\nLight mode: make the page open without crashing.'
  },
  body_reset: {
    id: 'body_reset',
    name: 'Body Reset',
    description: 'Drink water, eat something, and move briefly.',
    instruction: 'Drink water, eat something simple, and move for 2 minutes.',
    sample: 'I drank water, ate a snack, and walked around the room. I feel slightly more awake.'
  },
  future_sentence: {
    id: 'future_sentence',
    name: 'Future Sentence',
    description: 'Write why this task helps your future.',
    instruction: 'Complete the sentence: “Doing this helps my future because…”',
    sample: 'Doing this helps my future because finishing this project can move me closer to practice and work.'
  },
  three_good_things: {
    id: 'three_good_things',
    name: 'Three Good Things',
    description: 'List three small good things that happened today.',
    instruction: 'Write 3 small good things that happened today. They can be very small.',
    sample: 'I cleaned my desk.\nI went for a walk.\nI asked for help instead of giving up.'
  }
};

export default toolDefinitions;
