import type { Step } from 'react-joyride'

export const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content: 'Welcome to Leisurely — your group vacation meal planner. Let\'s take a quick look around.',
    placement: 'center',
  },
  {
    target: '[data-tour="plan-tab"]',
    content: 'The Plan tab is your home base. Set your trip dates and fill in meals for each day — breakfast through snacks.',
    placement: 'top',
  },
  {
    target: '[data-tour="grocery-tab"]',
    content: 'As you add meals, your grocery list builds itself automatically. Check items off as you shop.',
    placement: 'top',
  },
  {
    target: '[data-tour="notes-tab"]',
    content: 'The Bulletin Board is your group\'s shared notepad. Post reminders, ideas, or anything the whole group should see.',
    placement: 'top',
  },
  {
    target: '[data-tour="packing-tab"]',
    content: 'Track what everyone needs to pack, organized by category. Use suggestions to build your list fast.',
    placement: 'top',
  },
  {
    target: '[data-tour="settings-tab"]',
    content: 'Export your plan as a PDF, share it with a link, or back it up as JSON — all from Settings. That\'s it, enjoy the trip!',
    placement: 'top',
  },
]
