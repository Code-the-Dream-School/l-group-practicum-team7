const toolDefinitions = {
  breathing: {
    id: 'breathing',
    name: 'Breathing',
    type: 'timer',
    durationSeconds: 60,
    description: 'Guided breathing prompts to help you relax.',
    instruction:
      'Take 1 minute. Breathe in slowly, pause for a moment, then breathe out longer than you breathed in. Repeat 5 times.',
    sample:
      'I breathed slowly for 1 minute. My body feels a little calmer.',
  },

  grounding: {
    id: 'grounding',
    name: 'Grounding',
    type: 'fields',
    description:
      'Simple grounding prompts to return attention to the present.',
    instruction:
      'Look around and name 5 things you see, 4 things you feel, 3 sounds you hear, 2 smells, and 1 thing you can taste or notice in your body.',
    sample:
      'I see my desk, screen, cup, wall, and window.\nI feel my feet on the floor.\nI hear the fan.\nI smell coffee.\nI taste water.',
    fields: [
      {
        key: 'see',
        label: 'I see',
        prefix: 'I see',
        placeholder: 'my desk, screen, cup, wall, and window',
      },
      {
        key: 'feel',
        label: 'I feel',
        prefix: 'I feel',
        placeholder: 'my feet on the floor',
      },
      {
        key: 'hear',
        label: 'I hear',
        prefix: 'I hear',
        placeholder: 'the fan, keyboard, or traffic outside',
      },
      {
        key: 'smell',
        label: 'I smell',
        prefix: 'I smell',
        placeholder: 'coffee, fresh air, or soap',
      },
      {
        key: 'taste',
        label: 'I taste / notice',
        prefix: 'I taste or notice',
        placeholder: 'water, mint, my breath, or my body',
      },
    ],
  },

  thought_dump: {
    id: 'thought_dump',
    name: 'Thought Dump',
    type: 'fields',
    description: 'Write down a few worries to clear your mind.',
    instruction:
      'Write down 3 worries without trying to solve them right now.',
    sample:
      'I worry about deadlines.\nI worry about my project.\nI worry that I am falling behind.',
    fields: [
      {
        key: 'worry1',
        label: 'I worry',
        prefix: 'I worry',
        placeholder: 'about deadlines',
      },
      {
        key: 'worry2',
        label: 'I worry',
        prefix: 'I worry',
        placeholder: 'about my project',
      },
      {
        key: 'worry3',
        label: 'I worry',
        prefix: 'I worry',
        placeholder: 'that I am falling behind',
      },
    ],
  },

  over_responsibility: {
    id: 'over_responsibility',
    name: 'Working with Over-Responsibility',
    type: 'fields',
    description: 'Strategies to reduce over-responsibility.',
    instruction:
      'Write one task you feel responsible for. Then separate what is real, what is partly yours, and what you can refuse.',
    sample:
      'Task: Fix everything today.\nReality: This is partly mine. I can do one part today, not everything.\nI refuse to take responsibility for everything because this is not fully mine.',
    fields: [
      {
        key: 'task',
        label: 'Task',
        prefix: 'Task:',
        placeholder: 'Fix everything today',
      },
      {
        key: 'reality',
        label: 'Reality',
        prefix: 'Reality:',
        placeholder:
          'This is partly mine. I can do one part today, not everything',
      },
      {
        key: 'refusal',
        label: 'I refuse',
        prefix: 'I refuse',
        placeholder:
          'to take responsibility for everything because this is not fully mine',
      },
    ],
  },

  strategic_refusal: {
    id: 'strategic_refusal',
    name: 'Strategic Refusal',
    type: 'fields',
    description: 'Decide what no longer deserves your time or energy.',
    instruction:
      'Write one unrealistic, outdated, or unachievable task you should not continue doing. Explain why refusing it protects your real priorities.',
    sample:
      'Unrealistic task: I wanted to program, work delivery shifts, and learn Chinese at the same time.\nReality: I cannot realistically do all of that right now.\nI need to refuse learning Chinese for now because programming and work are higher priorities.',
    fields: [
      {
        key: 'unrealisticTask',
        label: 'Unrealistic task',
        prefix: 'Unrealistic task:',
        placeholder:
          'I want to program, work delivery shifts, and learn Chinese at the same time',
      },
      {
        key: 'reality',
        label: 'Reality changed',
        prefix: 'Reality:',
        placeholder:
          'I cannot realistically do all of that right now',
      },
      {
        key: 'refusal',
        label: 'I need to refuse',
        prefix: 'I need to refuse',
        placeholder:
          'learning Chinese for now because programming and work are higher priorities',
      },
    ],
  },

  prioritization: {
    id: 'prioritization',
    name: 'Prioritization',
    type: 'priority',
    rows: 3,
    description: 'Sort tasks by urgency and importance.',
    instruction:
      'Write 3 tasks. Mark each one as urgent/not urgent and important/not important.',
    sample:
      'Submit assignment — urgent, important.\nClean files — not urgent, not important.\nFix login bug — not urgent, important.',
    options: {
      urgency: [
        {
          value: 'urgent',
          label: 'Urgent',
        },
        {
          value: 'not urgent',
          label: 'Not urgent',
        },
      ],
      importance: [
        {
          value: 'important',
          label: 'Important',
        },
        {
          value: 'not important',
          label: 'Not important',
        },
      ],
    },
  },

  asking_for_support: {
    id: 'asking_for_support',
    name: 'Asking for Support',
    type: 'fields',
    description: 'Practice asking someone for help clearly.',
    instruction:
      'Write what you need help with and who you asked.',
    sample:
      'I need help with understanding the project structure.\nI asked my teammate to explain the main files.',
    fields: [
      {
        key: 'needHelp',
        label: 'I need help with',
        prefix: 'I need help with',
        placeholder: 'understanding the project structure',
      },
      {
        key: 'asked',
        label: 'I asked',
        prefix: 'I asked',
        placeholder: 'my teammate to explain the main files',
      },
    ],
  },

  future_me_letter: {
    id: 'future_me_letter',
    name: 'Future Me Letter',
    type: 'textarea',
    description: 'Write a short letter to your future self.',
    instruction:
      'Write 3–5 sentences to your future self about what you are working for and what you should protect today.',
    sample:
      'Dear future me, I am working to build a stable life. I do not need to destroy myself to get there. Today I will protect my health and take one real step.',
  },

  five_minute_pause: {
    id: 'five_minute_pause',
    name: '5-Minute Pause',
    type: 'timer',
    durationSeconds: 300,
    description: 'Short pause exercise to notice how you feel.',
    instruction:
      'Pause for 5 minutes. Do not fix anything. Just notice what you feel in your body and mind.',
    sample:
      'I paused for 5 minutes. I noticed tension in my chest and pressure in my head. I feel scared, but I do not need to act immediately.',
  },

  five_minute_task: {
    id: 'five_minute_task',
    name: '5-Minute Task',
    type: 'fields',
    description: 'Pick one task you can do in 5 minutes.',
    instruction:
      'Pick one tiny task you can do in 5 minutes. Stop when the timer ends, even if it is not perfect.',
    sample:
      'Task: Open the project and find the broken component.\nResult: I found the file. That is enough for now.',
    fields: [
      {
        key: 'task',
        label: 'Task',
        prefix: 'Task:',
        placeholder: 'Open the project and find the broken component',
      },
      {
        key: 'result',
        label: 'Result',
        prefix: 'Result:',
        placeholder: 'I found the file. That is enough for now',
      },
    ],
  },

  evening_release: {
    id: 'evening_release',
    name: 'Evening Release',
    type: 'fields',
    description: 'Put worries down and decide what can wait.',
    instruction:
      'Write what you are worried about, what can wait until tomorrow, and what you will do next.',
    sample:
      'I worry about finishing the whole project tonight.\nIt can wait until tomorrow: debugging the whole thing.\nTomorrow I will check one error first.',
    fields: [
      {
        key: 'worry',
        label: 'I worry about',
        prefix: 'I worry about',
        placeholder: 'finishing the whole project tonight',
      },
      {
        key: 'wait',
        label: 'It can wait until tomorrow',
        prefix: 'It can wait until tomorrow:',
        placeholder: 'debugging the whole thing',
      },
      {
        key: 'tomorrow',
        label: 'Tomorrow I will',
        prefix: 'Tomorrow I will',
        placeholder: 'check one error first',
      },
    ],
  },

  letter_to_tomorrow_me: {
    id: 'letter_to_tomorrow_me',
    name: 'Letter to Tomorrow Me',
    type: 'textarea',
    description: 'A note to yourself to close the day.',
    instruction:
      'Write a short note giving tomorrow’s version of you the next step.',
    sample:
      'Tomorrow me, start with the API error. You do not need to fix everything at once. Just check the first failing request.',
  },

  tomorrow_list: {
    id: 'tomorrow_list',
    name: 'Tomorrow List',
    type: 'fields',
    description:
      'Choose one realistic task for tomorrow and one thing to postpone.',
    instruction:
      'Write one thing you can do tomorrow and one thing you can safely postpone.',
    sample:
      'Tomorrow I can finish one assignment section.\nI can safely postpone redesigning the whole interface.',
    fields: [
      {
        key: 'tomorrow',
        label: 'Tomorrow I can',
        prefix: 'Tomorrow I can',
        placeholder: 'finish one assignment section',
      },
      {
        key: 'postpone',
        label: 'I can safely postpone',
        prefix: 'I can safely postpone',
        placeholder: 'redesigning the whole interface',
      },
    ],
  },

  light_mode: {
    id: 'light_mode',
    name: 'Light Mode',
    type: 'fields',
    description: 'Choose the smallest achievable part of a larger task.',
    instruction:
      'Write the full task, then choose the smallest achievable part.',
    sample:
      'Full task: finish the whole page.\nAchievable part: make the page open without crashing.',
    fields: [
      {
        key: 'fullTask',
        label: 'Full task',
        prefix: 'Full task:',
        placeholder: 'finish the whole page',
      },
      {
        key: 'achievablePart',
        label: 'Achievable part',
        prefix: 'Achievable part:',
        placeholder: 'make the page open without crashing',
      },
    ],
  },

  body_reset: {
    id: 'body_reset',
    name: 'Body Reset',
    type: 'fields',
    description: 'Drink water, eat something, and move briefly.',
    instruction:
      'Drink water, eat something simple, and move for 2 minutes.',
    sample:
      'I drank water.\nI ate a snack.\nI moved around the room for 2 minutes.',
    fields: [
      {
        key: 'water',
        label: 'I drank',
        prefix: 'I drank',
        placeholder: 'water',
      },
      {
        key: 'food',
        label: 'I ate',
        prefix: 'I ate',
        placeholder: 'a snack',
      },
      {
        key: 'movement',
        label: 'I moved',
        prefix: 'I moved',
        placeholder: 'around the room for 2 minutes',
      },
    ],
  },

  future_sentence: {
    id: 'future_sentence',
    name: 'Future Sentence',
    type: 'fields',
    description: 'Connect this task to your future.',
    instruction:
      'Complete the sentence: “Doing this helps my future because…”',
    sample:
      'Doing this helps my future because finishing this project moves me closer to practice and work.',
    fields: [
      {
        key: 'futureReason',
        label: 'Doing this helps my future because',
        prefix: 'Doing this helps my future because',
        placeholder:
          'finishing this project moves me closer to practice and work',
      },
    ],
  },

  three_good_things: {
    id: 'three_good_things',
    name: 'Three Good Things',
    type: 'fields',
    description: 'List three small good things that happened today.',
    instruction:
      'Write three small good things. They can be very small.',
    sample:
      'Good thing 1: I cleaned my desk.\nGood thing 2: I went for a walk.\nGood thing 3: I asked for help instead of giving up.',
    fields: [
      {
        key: 'goodThing1',
        label: 'Good thing 1',
        prefix: 'Good thing 1:',
        placeholder: 'I cleaned my desk',
      },
      {
        key: 'goodThing2',
        label: 'Good thing 2',
        prefix: 'Good thing 2:',
        placeholder: 'I went for a walk',
      },
      {
        key: 'goodThing3',
        label: 'Good thing 3',
        prefix: 'Good thing 3:',
        placeholder: 'I asked for help instead of giving up',
      },
    ],
  },
};

export const toolIds = Object.keys(toolDefinitions);

export default toolDefinitions;
