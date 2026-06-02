const dialogueFlows = {
  overwhelmedByMultitasking: {
    id: "overwhelmedByMultitasking",
    title: "Overwhelmed by Multi-tasking",
    startNodeId: "start",

    nodes: {
      start: {
        id: "start",
        speaker: "Mascot",
        text:
          "When many things happen at once, your brain may not have time to process everything. It makes sense that you feel tense. Do you want to resolve the problem or just relax?",
        choices: [
          {
            id: "try_relax",
            text: "Try to relax",
            next: "relax_check"
          },
          {
            id: "try_resolve",
            text: "Try to resolve",
            next: "resolve_intro"
          }
        ]
      },

      relax_check: {
        id: "relax_check",
        type: "condition",
        seenKey: "stress_relax_branch",
        ifSeen: "grounding_tool",
        ifNew: "breathing_tool"
      },

      breathing_tool: {
        id: "breathing_tool",
        speaker: "Mascot",
        text: "Tool: Breathing.\nTry to breathe slowly for a moment.",
        unlockTool: {
          key: "breathing",
          title: "Breathing"
        },
        markSeen: ["stress_relax_branch"],
        next: "final_check"
      },

      grounding_tool: {
        id: "grounding_tool",
        speaker: "Mascot",
        text: "Tool: Grounding.\nTry to notice yourself and the world around you.",
        unlockTool: {
          key: "grounding",
          title: "Grounding"
        },
        next: "final_check"
      },

      resolve_intro: {
        id: "resolve_intro",
        speaker: "Mascot",
        text:
          "Let’s understand what is overwhelming you more: your thoughts or the events themselves? Okay, this really sounds hard.",
        choices: [
          {
            id: "thoughts",
            text: "Thoughts",
            next: "thoughts_loop"
          },
          {
            id: "events",
            text: "Events",
            next: "events_overload"
          }
        ]
      },

      thoughts_loop: {
        id: "thoughts_loop",
        speaker: "Mascot",
        text:
          "If the same thoughts keep repeating, they may not be helping you solve the problem. They may be turning into a loop.",
        next: "thought_dump_tool"
      },

      thought_dump_tool: {
        id: "thought_dump_tool",
        speaker: "Mascot",
        text:
          "Tool: Thought Dump.\nWrite down 3 things that are worrying you right now.",
        unlockTool: {
          key: "thought_dump",
          title: "Thought Dump"
        },
        next: "final_check"
      },

      events_overload: {
        id: "events_overload",
        speaker: "Mascot",
        text:
          "It looks like your system is overloaded. If you removed half of your tasks today, what would actually break?",
        choices: [
          {
            id: "nothing_would_break",
            text: "No / Nothing would break",
            next: "nothing_breaks_check"
          },
          {
            id: "things_would_break",
            text: "Yes / Things would break",
            next: "things_break_check"
          }
        ]
      },

      nothing_breaks_check: {
        id: "nothing_breaks_check",
        type: "condition",
        seenKey: "stress_nothing_breaks_branch",
        ifSeen: "strategic_refusal_tool",
        ifNew: "over_responsibility_tool"
      },

      over_responsibility_tool: {
        id: "over_responsibility_tool",
        speaker: "Mascot",
        text:
          "Try to reduce your workload.\nTool: Working with Over-Responsibility.",
        unlockTool: {
          key: "over_responsibility",
          title: "Working with Over-Responsibility"
        },
        markSeen: ["stress_nothing_breaks_branch"],
        next: "final_check"
      },

      strategic_refusal_tool: {
        id: "strategic_refusal_tool",
        speaker: "Mascot",
        text:
          "If you have been here before, think about your goals.\nWhich tasks truly move you closer to them?\nTool: Strategic Refusal.",
        unlockTool: {
          key: "strategic_refusal",
          title: "Strategic Refusal"
        },
        next: "final_check"
      },

      things_break_check: {
        id: "things_break_check",
        type: "condition",
        seenKey: "stress_things_break_branch",
        ifSeen: "asking_support_tool",
        ifNew: "prioritization_tool"
      },

      prioritization_tool: {
        id: "prioritization_tool",
        speaker: "Mascot",
        text:
          "If many things would actually break, you may need to sort tasks by urgency and importance.\nTool: Prioritization.",
        unlockTool: {
          key: "prioritization",
          title: "Prioritization"
        },
        markSeen: ["stress_things_break_branch"],
        next: "final_check"
      },

      asking_support_tool: {
        id: "asking_support_tool",
        speaker: "Mascot",
        text:
          "Do not be afraid to ask for help with your tasks.\nTool: Asking for Support.",
        unlockTool: {
          key: "asking_for_support",
          title: "Asking for Support"
        },
        next: "final_check"
      },

      final_check: {
        id: "final_check",
        type: "condition",
        seenKey: "stress_final_message",
        ifSeen: "catchphrase",
        ifNew: "final_summary"
      },

      catchphrase: {
        id: "catchphrase",
        speaker: "Mascot",
        text:
          "You have been here before. Return to the tool that helped you most, or try the next small step.",
        next: "end"
      },

      final_summary: {
        id: "final_summary",
        speaker: "Mascot",
        text:
          "Reminder example:\nAre you still doing N? Keep going! / Return to this action.\n\nOne small step is enough for today. Come back to this later if you need to.",
        markSeen: ["stress_final_message"],
        next: "end"
      },

      end: {
        id: "end",
        speaker: "Mascot",
        text: "Dialogue finished.",
        choices: []
      }
    }
  },

  highWorkload: {
    id: "highWorkload",
    title: "High Workload",
    startNodeId: "start",

    nodes: {
      start: {
        id: "start",
        speaker: "Mascot",
        text: "You have a high workload. How do you feel?",
        choices: [
          {
            id: "overloaded",
            text: "I am overloaded",
            next: "why_working_hard"
          },
          {
            id: "handle_it",
            text: "I just have to handle it",
            next: "test_handle_it"
          }
        ]
      },

      test_handle_it: {
        id: "test_handle_it",
        speaker: "Mascot",
        text:
          "Okay. Let’s test that gently. If you continue this way for 7 days, will things get better or worse?",
        next: "why_working_hard"
      },

      why_working_hard: {
        id: "why_working_hard",
        speaker: "Mascot",
        text: "Why are you working this hard?",
        choices: [
          {
            id: "for_future",
            text: "For the future",
            next: "future_check"
          },
          {
            id: "guilty",
            text: "Because I feel guilty",
            next: "guilt_reflection"
          },
          {
            id: "dont_know",
            text: "I don’t know",
            next: "minimal_step_intro"
          }
        ]
      },

      future_check: {
        id: "future_check",
        speaker: "Mascot",
        text: "If you burn out, will that bring you closer to your future?",
        choices: [
          {
            id: "no",
            text: "No",
            next: "future_me_letter_tool"
          }
        ]
      },

      future_me_letter_tool: {
        id: "future_me_letter_tool",
        speaker: "Mascot",
        text:
          "Write a short message to your future self:\n\n“What future am I working for, and what should I protect today to reach it?”\n\nTool: Future Me Letter.",
        unlockTool: {
          key: "future_me_letter",
          title: "Future Me Letter"
        },
        next: "end_summary"
      },

      guilt_reflection: {
        id: "guilt_reflection",
        speaker: "Mascot",
        text:
          "It looks like you may be working to avoid a feeling, not to move toward a goal.",
        next: "five_minute_pause_tool"
      },

      five_minute_pause_tool: {
        id: "five_minute_pause_tool",
        speaker: "Mascot",
        text:
          "Tool: 5-Minute Pause.\nTake 5 minutes and simply notice what you are feeling.",
        unlockTool: {
          key: "five_minute_pause",
          title: "5-Minute Pause"
        },
        next: "end_summary"
      },

      minimal_step_intro: {
        id: "minimal_step_intro",
        speaker: "Mascot",
        text:
          "Okay, then we do not need to search for meaning right now. Let’s choose one minimal step.",
        next: "five_minute_task_tool"
      },

      five_minute_task_tool: {
        id: "five_minute_task_tool",
        speaker: "Mascot",
        text:
          "Tool: 5-Minute Task.\nChoose one task you can do in 5 minutes.",
        unlockTool: {
          key: "five_minute_task",
          title: "5-Minute Task"
        },
        next: "end_summary"
      },

      end_summary: {
        id: "end_summary",
        speaker: "Mascot",
        text: "One small, reasonable step is enough for today.",
        choices: []
      }
    }
  },

  sleepDeprivation: {
    id: "sleepDeprivation",
    title: "Sleep Deprivation",
    startNodeId: "start",

    nodes: {
      start: {
        id: "start",
        speaker: "Mascot",
        text:
          "It looks like you did not sleep enough. That can affect your mood, focus, and how heavy everything feels.",
        choices: [
          {
            id: "feel_tired",
            text: "I feel tired",
            next: "validate_tired"
          },
          {
            id: "not_important",
            text: "It is not important",
            next: "gentle_sleep_check"
          },
          {
            id: "catch_up_later",
            text: "I will catch up later",
            next: "catch_up_warning"
          }
        ]
      },

      validate_tired: {
        id: "validate_tired",
        speaker: "Mascot",
        text:
          "That makes sense. When you are sleep-deprived, even normal tasks can feel heavier.",
        next: "sleep_need_choice"
      },

      gentle_sleep_check: {
        id: "gentle_sleep_check",
        speaker: "Mascot",
        text:
          "Maybe. But let’s check it gently: if you were well-rested, would this situation feel a little easier?",
        choices: [
          {
            id: "yes",
            text: "Yes",
            next: "sleep_makes_harder"
          }
        ]
      },

      sleep_makes_harder: {
        id: "sleep_makes_harder",
        speaker: "Mascot",
        text:
          "Sleep may not solve everything, but low sleep can make everything harder.",
        next: "sleep_need_choice"
      },

      catch_up_warning: {
        id: "catch_up_warning",
        speaker: "Mascot",
        text:
          "That can work once in a while. But if this becomes a pattern, your body may not recover fast enough.",
        next: "sleep_need_choice"
      },

      sleep_need_choice: {
        id: "sleep_need_choice",
        speaker: "Mascot",
        text: "What do you need most right now to sleep?",
        choices: [
          {
            id: "calm_down",
            text: "To calm down",
            next: "calm_down_intro"
          },
          {
            id: "finish_tasks",
            text: "To finish tasks",
            next: "finish_tasks_intro"
          }
        ]
      },

      calm_down_intro: {
        id: "calm_down_intro",
        speaker: "Mascot",
        text:
          "If your mind is still active, you do not need to solve everything tonight. You only need to leave it somewhere safe.",
        next: "evening_release_check"
      },

      evening_release_check: {
        id: "evening_release_check",
        type: "condition",
        seenKey: "sleep_evening_release_branch",
        ifSeen: "letter_to_tomorrow_tool",
        ifNew: "evening_release_tool"
      },

      evening_release_tool: {
        id: "evening_release_tool",
        speaker: "Mascot",
        text:
          "Tool: Evening Release.\nWrite down what is worrying you and what can wait until tomorrow.",
        unlockTool: {
          key: "evening_release",
          title: "Evening Release"
        },
        markSeen: ["sleep_evening_release_branch"],
        next: "end_summary"
      },

      letter_to_tomorrow_tool: {
        id: "letter_to_tomorrow_tool",
        speaker: "Mascot",
        text:
          "Tool: Letter to Tomorrow Me.\nWrite: “I am leaving these worries for tomorrow. Tonight I only need to rest.”",
        unlockTool: {
          key: "letter_to_tomorrow_me",
          title: "Letter to Tomorrow Me"
        },
        next: "end_summary"
      },

      finish_tasks_intro: {
        id: "finish_tasks_intro",
        speaker: "Mascot",
        text:
          "Not every task has to be solved tonight. Let’s separate what is truly urgent from what can wait.",
        next: "tomorrow_list_check"
      },

      tomorrow_list_check: {
        id: "tomorrow_list_check",
        type: "condition",
        seenKey: "sleep_tomorrow_list_branch",
        ifSeen: "light_mode_tool",
        ifNew: "tomorrow_list_tool"
      },

      tomorrow_list_tool: {
        id: "tomorrow_list_tool",
        speaker: "Mascot",
        text:
          "Tool: Tomorrow List.\nWrite down 1 task for tomorrow and 1 thing you can safely postpone.",
        unlockTool: {
          key: "tomorrow_list",
          title: "Tomorrow List"
        },
        markSeen: ["sleep_tomorrow_list_branch"],
        next: "end_summary"
      },

      light_mode_tool: {
        id: "light_mode_tool",
        speaker: "Mascot",
        text:
          "Tool: Light Mode.\nChoose the smallest acceptable version of your task, then stop.",
        unlockTool: {
          key: "light_mode",
          title: "Light Mode"
        },
        next: "end_summary"
      },

      end_summary: {
        id: "end_summary",
        speaker: "Mascot",
        text:
          "You do not need to solve your whole life while tired. One small step is enough for tonight.",
        choices: []
      }
    }
  },

  lowEnergy: {
    id: "lowEnergy",
    title: "Low Energy",
    startNodeId: "start",

    nodes: {
      start: {
        id: "start",
        speaker: "Mascot",
        text:
          "It looks like you have low energy. That does not automatically mean you are lazy. Let’s check what your system is missing.",
        choices: [
          {
            id: "no_strength",
            text: "I have no strength at all",
            next: "body_check"
          },
          {
            id: "lazy",
            text: "I think I am just being lazy",
            next: "lazy_check"
          },
          {
            id: "hard",
            text: "I can do something, but it feels hard",
            next: "body_check"
          }
        ]
      },

      lazy_check: {
        id: "lazy_check",
        speaker: "Mascot",
        text:
          "Maybe, but let’s not judge too early. If you had more energy, would you act differently?",
        choices: [
          {
            id: "yes",
            text: "Yes",
            next: "body_check"
          },
          {
            id: "no",
            text: "No",
            next: "not_only_energy"
          }
        ]
      },

      not_only_energy: {
        id: "not_only_energy",
        speaker: "Mascot",
        text:
          "Then this may not be only about energy. Maybe the task feels unclear, too big, or not meaningful.",
        next: "body_check"
      },

      body_check: {
        id: "body_check",
        speaker: "Mascot",
        text:
          "Before we talk about motivation, let’s check the basics. Today, did you sleep, eat, drink water, and move at least a little?",
        choices: [
          {
            id: "not_really",
            text: "No, not really",
            next: "body_deficit"
          },
          {
            id: "yes_did",
            text: "Yes, I did",
            next: "task_check"
          }
        ]
      },

      body_deficit: {
        id: "body_deficit",
        speaker: "Mascot",
        text:
          "Then this may not be a character problem. Your body may simply not have enough fuel.",
        next: "body_reset_tool"
      },

      body_reset_tool: {
        id: "body_reset_tool",
        speaker: "Mascot",
        text:
          "Tool: Body Reset.\nDrink water, eat something simple, and move for 2 minutes. Then come back and choose one tiny action.",
        unlockTool: {
          key: "body_reset",
          title: "Body Reset"
        },
        next: "can_do_reset_now"
      },

      can_do_reset_now: {
        id: "can_do_reset_now",
        speaker: "Mascot",
        text: "Can you do one of these now?",
        choices: [
          {
            id: "will_try",
            text: "I will try",
            next: "end_summary"
          },
          {
            id: "no_time",
            text: "I don’t have time",
            next: "short_reset_reminder"
          }
        ]
      },

      short_reset_reminder: {
        id: "short_reset_reminder",
        speaker: "Mascot",
        text:
          "This takes less than 3 minutes. A short reset may help you work better than pushing through empty.",
        next: "end_summary"
      },

      task_check: {
        id: "task_check",
        speaker: "Mascot",
        text:
          "Okay. Then let’s look at the task itself. What makes action hard right now?",
        choices: [
          {
            id: "too_big",
            text: "The task feels too big",
            next: "too_big_intro"
          },
          {
            id: "no_point",
            text: "I do not see the point",
            next: "meaning_intro"
          },
          {
            id: "low_mood",
            text: "My mood is low",
            next: "low_mood_intro"
          }
        ]
      },

      too_big_intro: {
        id: "too_big_intro",
        speaker: "Mascot",
        text:
          "If the task feels too big, your brain may be avoiding the whole mountain. Let’s make the entry point smaller.",
        next: "five_minute_task_tool"
      },

      five_minute_task_tool: {
        id: "five_minute_task_tool",
        speaker: "Mascot",
        text:
          "Tool: 5-Minute Task.\nChoose one action you can do in 5 minutes. Stopping after 5 minutes is allowed.",
        unlockTool: {
          key: "five_minute_task",
          title: "5-Minute Task"
        },
        next: "end_summary"
      },

      meaning_intro: {
        id: "meaning_intro",
        speaker: "Mascot",
        text:
          "If the task feels meaningless, forcing yourself may not help. Let’s reconnect it to your future.",
        next: "future_sentence_tool"
      },

      future_sentence_tool: {
        id: "future_sentence_tool",
        speaker: "Mascot",
        text:
          "Tool: Future Sentence.\nWrite one sentence: “Doing this helps my future because…”\nIf it does not help your future, consider removing or simplifying it.",
        unlockTool: {
          key: "future_sentence",
          title: "Doing This Helps My Future Because..."
        },
        next: "end_summary"
      },

      low_mood_intro: {
        id: "low_mood_intro",
        speaker: "Mascot",
        text:
          "Low mood can hide your progress from you. Let’s help your brain notice something real and good.",
        next: "three_good_things_tool"
      },

      three_good_things_tool: {
        id: "three_good_things_tool",
        speaker: "Mascot",
        text:
          "Tool: Three Good Things.\nWrite down 3 small good things that happened today. Small things count.",
        unlockTool: {
          key: "three_good_things",
          title: "Three Good Things"
        },
        next: "end_summary"
      },

      end_summary: {
        id: "end_summary",
        speaker: "Mascot",
        text:
          "A short reset may help you work better than pushing through empty.",
        choices: []
      }
    }
  }
};

export default dialogueFlows;