import type { GroceryCategory } from '../types'

const KEYWORD_MAP: Record<GroceryCategory, string[]> = {
  produce: [
    'tomato', 'lettuce', 'onion', 'garlic', 'potato', 'apple', 'lemon', 'lime',
    'avocado', 'pepper', 'carrot', 'spinach', 'mushroom', 'cucumber', 'herb',
    'basil', 'parsley', 'cilantro', 'zucchini', 'eggplant', 'broccoli',
    'cauliflower', 'kale', 'arugula', 'celery', 'leek', 'shallot', 'ginger',
    'orange', 'banana', 'berry', 'strawberry', 'blueberry', 'mango', 'peach',
    'pear', 'grape', 'melon', 'watermelon', 'pineapple', 'radish', 'turnip',
    'beet', 'corn', 'asparagus', 'artichoke', 'fennel', 'cabbage', 'bok choy',
    'mint', 'thyme', 'rosemary', 'sage', 'dill', 'chive', 'scallion',
  ],
  dairy: [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'parmesan',
    'mozzarella', 'feta', 'ricotta', 'sour cream', 'cream cheese', 'cheddar',
    'brie', 'gouda', 'gruyere', 'half and half', 'whipping cream', 'ghee',
  ],
  meat: [
    'chicken', 'beef', 'pork', 'lamb', 'bacon', 'sausage', 'fish', 'salmon',
    'shrimp', 'tuna', 'turkey', 'steak', 'mince', 'minced', 'ground beef',
    'ground turkey', 'chorizo', 'prosciutto', 'ham', 'duck', 'veal', 'brisket',
    'rib', 'loin', 'fillet', 'anchovy', 'cod', 'halibut', 'tilapia', 'scallop',
    'crab', 'lobster', 'clam', 'oyster', 'mussel', 'squid',
  ],
  bakery: [
    'bread', 'baguette', 'roll', 'pita', 'wrap', 'tortilla', 'croissant',
    'bagel', 'muffin', 'brioche', 'ciabatta', 'sourdough', 'focaccia',
    'naan', 'flatbread', 'cracker', 'breadcrumb',
  ],
  'dry-goods': [
    'pasta', 'rice', 'flour', 'sugar', 'lentil', 'bean', 'chickpea', 'canned',
    'tin', 'broth', 'stock', 'oat', 'cereal', 'quinoa', 'couscous', 'bulgur',
    'barley', 'farro', 'polenta', 'cornmeal', 'baking powder', 'baking soda',
    'yeast', 'cocoa', 'chocolate chip', 'raisin', 'nut', 'almond', 'walnut',
    'pecan', 'cashew', 'peanut', 'pistachio', 'seed', 'lentil', 'split pea',
    'black bean', 'kidney bean', 'cannellini', 'navy bean', 'pinto bean',
    'tomato paste', 'tomato sauce', 'crushed tomato', 'diced tomato',
    'coconut milk', 'coconut cream', 'evaporated milk', 'condensed milk',
  ],
  frozen: [
    'frozen', 'ice cream', 'gelato', 'sorbet', 'freezer', 'edamame',
  ],
  beverages: [
    'water', 'juice', 'wine', 'beer', 'coffee', 'tea', 'soda', 'sparkling',
    'kombucha', 'smoothie', 'lemonade', 'cider', 'spirits', 'whiskey', 'vodka',
  ],
  condiments: [
    'oil', 'olive oil', 'vinegar', 'sauce', 'mustard', 'ketchup', 'salt',
    'pepper', 'spice', 'soy sauce', 'honey', 'maple syrup', 'hot sauce',
    'worcestershire', 'fish sauce', 'oyster sauce', 'tahini', 'miso',
    'sriracha', 'pesto', 'aioli', 'mayo', 'mayonnaise', 'ranch', 'bbq sauce',
    'teriyaki', 'hoisin', 'curry paste', 'paprika', 'cumin', 'coriander',
    'cinnamon', 'nutmeg', 'turmeric', 'chili flake', 'oregano', 'bay leaf',
    'vanilla', 'sesame oil', 'canola oil', 'vegetable oil', 'coconut oil',
    'balsamic', 'apple cider vinegar', 'rice vinegar', 'jam', 'jelly',
    'peanut butter', 'almond butter',
  ],
  household: [
    'towel', 'paper towel', 'foil', 'aluminum foil', 'plastic wrap', 'bag',
    'zip', 'trash bag', 'detergent', 'soap', 'sponge', 'napkin', 'toothpick',
    'skewer', 'parchment', 'wax paper', 'cling wrap',
  ],
  other: [],
}

export function inferCategory(name: string): GroceryCategory {
  const lower = name.toLowerCase()
  for (const [category, keywords] of Object.entries(KEYWORD_MAP) as [GroceryCategory, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return 'other'
}
