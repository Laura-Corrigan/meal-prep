// Ingredient catalogue. Recipes reference these ids so the shopping list can
// merge quantities across meals and map them onto realistic supermarket packs.
//
// unit:   the base unit recipe quantities are expressed in
// packs:  typical Tesco pack sizes, in the base unit, with a shopper-facing label
//         (approximate — Tesco has no public catalogue API to verify against)
// pantry: assumed to be in the cupboard unless the user says otherwise
// flags:  meat | fish | dairy | gluten | nuts — used for dietary filtering
// search: what to type into Tesco search (defaults to name)

export const CATEGORIES = [
  { id: 'veg', label: 'Fruit & veg' },
  { id: 'meat', label: 'Meat & fish' },
  { id: 'dairy', label: 'Dairy & alternatives' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'cupboard', label: 'Cupboard' },
  { id: 'frozen', label: 'Frozen' },
  { id: 'other', label: 'Other' },
]

const g = (...sizes) => sizes.map(s => [s, s >= 1000 ? `${s / 1000}kg` : `${s}g`])
const ml = (...sizes) => sizes.map(s => [s, s >= 1000 ? `${s / 1000}L` : `${s}ml`])
const each = (...sizes) => sizes.map(s => [s, s === 1 ? 'single' : `${s} pack`])

export const INGREDIENTS = {
  // Meat & fish
  'chicken-breast': { name: 'Chicken breast fillets', cat: 'meat', unit: 'g', packs: g(300, 650, 1000), flags: ['meat'] },
  'chicken-thighs': { name: 'Boneless chicken thighs', cat: 'meat', unit: 'g', packs: g(500, 1000), flags: ['meat'], search: 'boneless skinless chicken thigh fillets' },
  'beef-mince': { name: 'Lean beef mince (5%)', cat: 'meat', unit: 'g', packs: g(500, 750), flags: ['meat'], search: '5% beef mince' },
  'sirloin-steak': { name: 'Sirloin steaks', cat: 'meat', unit: 'each', packs: [[1, 'single'], [2, '2 pack']], flags: ['meat'], plural: true, search: 'sirloin steak' },
  'beef-strips': { name: 'Beef stir-fry strips', cat: 'meat', unit: 'g', packs: g(300), flags: ['meat'] },
  'lamb-mince': { name: 'Lamb mince', cat: 'meat', unit: 'g', packs: g(500), flags: ['meat'] },
  'pork-mince': { name: 'Pork mince', cat: 'meat', unit: 'g', packs: g(500), flags: ['meat'] },
  'turkey-mince': { name: 'Turkey breast mince', cat: 'meat', unit: 'g', packs: g(500), flags: ['meat'] },
  'beef-meatballs': { name: 'Beef meatballs', cat: 'meat', unit: 'each', packs: [[12, '12 pack']], flags: ['meat', 'gluten'] },
  'steak-ale-pie': { name: 'Steak & ale pie (check: no milk)', cat: 'meat', unit: 'each', packs: [[1, 'serves 4']], flags: ['meat', 'gluten'], search: 'steak and ale pie' },
  'pork-sausages': { name: 'Pork sausages', cat: 'meat', unit: 'each', packs: [[6, '6 pack'], [8, '8 pack']], flags: ['meat', 'gluten'] },
  chorizo: { name: 'Cooking chorizo', cat: 'meat', unit: 'g', packs: g(225), flags: ['meat'] },
  'salmon-fillets': { name: 'Salmon fillets', cat: 'meat', unit: 'each', packs: [[2, '2 fillets'], [4, '4 fillets']], flags: ['fish'], plural: true },
  'cod-fillets': { name: 'Cod fillets', cat: 'meat', unit: 'each', packs: [[2, '2 fillets'], [4, '4 fillets']], flags: ['fish'], plural: true },
  'king-prawns': { name: 'Raw king prawns', cat: 'meat', unit: 'g', packs: g(180, 300), flags: ['fish'] },

  // Fruit & veg
  broccoli: { name: 'Broccoli', cat: 'veg', unit: 'each', packs: [[1, 'head']] },
  tenderstem: { name: 'Tenderstem broccoli', cat: 'veg', unit: 'g', packs: g(200) },
  peppers: { name: 'Peppers', cat: 'veg', unit: 'each', packs: [[1, 'loose'], [3, 'mixed 3 pack']], plural: true, search: 'mixed peppers' },
  onions: { name: 'Brown onions', cat: 'veg', unit: 'each', packs: [[1, 'loose'], [3, '3 pack']], plural: true },
  'red-onion': { name: 'Red onions', cat: 'veg', unit: 'each', packs: [[1, 'loose'], [3, '3 pack']], plural: true },
  garlic: { name: 'Garlic', cat: 'veg', unit: 'clove', packs: [[10, 'bulb']], search: 'garlic bulb' },
  ginger: { name: 'Fresh ginger', cat: 'veg', unit: 'cm', packs: [[8, 'root']] },
  'spring-onions': { name: 'Spring onions', cat: 'veg', unit: 'each', packs: [[8, 'bunch']] },
  limes: { name: 'Limes', cat: 'veg', unit: 'each', packs: [[1, 'loose'], [4, '4 pack']], plural: true },
  lemons: { name: 'Lemons', cat: 'veg', unit: 'each', packs: [[1, 'loose'], [4, '4 pack']], plural: true },
  avocados: { name: 'Avocados', cat: 'veg', unit: 'each', packs: [[1, 'loose'], [2, 'ripe 2 pack']], plural: true },
  cucumber: { name: 'Cucumber', cat: 'veg', unit: 'each', packs: [[1, 'whole']] },
  'cherry-tomatoes': { name: 'Cherry tomatoes', cat: 'veg', unit: 'g', packs: g(250) },
  spinach: { name: 'Baby spinach', cat: 'veg', unit: 'g', packs: g(200) },
  'pak-choi': { name: 'Pak choi', cat: 'veg', unit: 'each', packs: [[2, '2 pack']] },
  asparagus: { name: 'Asparagus', cat: 'veg', unit: 'g', packs: g(250) },
  'green-beans': { name: 'Fine green beans', cat: 'veg', unit: 'g', packs: g(200) },
  carrots: { name: 'Carrots', cat: 'veg', unit: 'each', packs: [[1, 'loose'], [7, '1kg bag']], plural: true },
  'baking-potatoes': { name: 'Baking potatoes', cat: 'veg', unit: 'each', packs: [[4, '4 pack']], plural: true },
  'new-potatoes': { name: 'Baby new potatoes', cat: 'veg', unit: 'g', packs: g(1000) },
  potatoes: { name: 'Maris Piper potatoes', cat: 'veg', unit: 'g', packs: g(2000) },
  'sweet-potatoes': { name: 'Sweet potatoes', cat: 'veg', unit: 'each', packs: [[1, 'loose']], plural: true },
  courgettes: { name: 'Courgettes', cat: 'veg', unit: 'each', packs: [[1, 'loose'], [3, '3 pack']], plural: true },
  'little-gem': { name: 'Little gem lettuce', cat: 'veg', unit: 'each', packs: [[2, '2 pack']] },
  'stir-fry-veg': { name: 'Stir-fry vegetables', cat: 'veg', unit: 'g', packs: g(300) },
  beetroot: { name: 'Cooked beetroot', cat: 'veg', unit: 'g', packs: g(250), search: 'cooked beetroot' },
  mangetout: { name: 'Mangetout', cat: 'veg', unit: 'g', packs: g(150) },
  coriander: { name: 'Fresh coriander', cat: 'veg', unit: 'handful', packs: [[2, '30g pack']] },

  // Dairy & alternatives
  'greek-yoghurt': { name: 'Greek-style yoghurt', cat: 'dairy', unit: 'g', packs: g(500), flags: ['dairy'] },
  feta: { name: 'Feta', cat: 'dairy', unit: 'g', packs: g(200), flags: ['dairy'] },
  'sour-cream': { name: 'Soured cream', cat: 'dairy', unit: 'g', packs: g(300), flags: ['dairy'] },
  'grated-cheese': { name: 'Grated mature cheddar', cat: 'dairy', unit: 'g', packs: g(250), flags: ['dairy'] },
  'cheese-slices': { name: 'Cheese slices', cat: 'dairy', unit: 'each', packs: [[10, '10 slices']], flags: ['dairy'] },

  // Bakery
  tortillas: { name: 'Tortilla wraps', cat: 'bakery', unit: 'each', packs: [[8, '8 pack']], flags: ['gluten'] },
  pittas: { name: 'Wholemeal pittas', cat: 'bakery', unit: 'each', packs: [[6, '6 pack']], flags: ['gluten'] },
  flatbreads: { name: 'Flatbreads', cat: 'bakery', unit: 'each', packs: [[4, '4 pack']], flags: ['gluten'] },
  'burger-buns': { name: 'Brioche burger buns', cat: 'bakery', unit: 'each', packs: [[4, '4 pack']], flags: ['gluten', 'dairy'] },
  'garlic-dough-balls': { name: 'Garlic dough balls (check: no milk)', cat: 'bakery', unit: 'each', packs: [[1, 'pack']], flags: ['gluten'], search: 'garlic dough balls' },
  baguette: { name: 'Baguette', cat: 'bakery', unit: 'each', packs: [[1, 'single']], flags: ['gluten'] },

  // Cupboard
  rice: { name: 'Microwave rice', cat: 'cupboard', unit: 'pouch', packs: [[1, '250g pouch']], search: 'microwave rice 250g' },
  arborio: { name: 'Risotto rice', cat: 'cupboard', unit: 'g', packs: g(500) },
  pasta: { name: 'Penne pasta', cat: 'cupboard', unit: 'g', packs: g(500), flags: ['gluten'] },
  spaghetti: { name: 'Spaghetti', cat: 'cupboard', unit: 'g', packs: g(500), flags: ['gluten'] },
  orzo: { name: 'Orzo', cat: 'cupboard', unit: 'g', packs: g(500), flags: ['gluten'] },
  couscous: { name: 'Couscous', cat: 'cupboard', unit: 'g', packs: g(500), flags: ['gluten'] },
  'egg-noodles': { name: 'Medium egg noodles', cat: 'cupboard', unit: 'g', packs: g(300), flags: ['gluten'] },
  'rice-noodles': { name: 'Rice noodles', cat: 'cupboard', unit: 'g', packs: g(250) },
  'wok-noodles': { name: 'Straight-to-wok noodles', cat: 'cupboard', unit: 'g', packs: [[300, '300g pack']], flags: ['gluten'], search: 'straight to wok medium noodles' },
  udon: { name: 'Straight-to-wok udon', cat: 'cupboard', unit: 'g', packs: g(300), flags: ['gluten'] },
  'tinned-tomatoes': { name: 'Chopped tomatoes', cat: 'cupboard', unit: 'tin', packs: [[1, '400g tin'], [4, '4 × 400g']] },
  passata: { name: 'Passata', cat: 'cupboard', unit: 'g', packs: g(500) },
  'coconut-milk': { name: 'Light coconut milk', cat: 'cupboard', unit: 'tin', packs: [[1, '400ml tin']] },
  'black-beans': { name: 'Black beans', cat: 'cupboard', unit: 'tin', packs: [[1, '400g tin']] },
  'kidney-beans': { name: 'Red kidney beans', cat: 'cupboard', unit: 'tin', packs: [[1, '400g tin']] },
  chickpeas: { name: 'Chickpeas', cat: 'cupboard', unit: 'tin', packs: [[1, '400g tin']] },
  cannellini: { name: 'Cannellini beans', cat: 'cupboard', unit: 'tin', packs: [[1, '400g tin']] },
  sweetcorn: { name: 'Sweetcorn', cat: 'cupboard', unit: 'tin', packs: [[1, '198g tin'], [3, '3 × 198g']] },
  tuna: { name: 'Tuna chunks in spring water', cat: 'cupboard', unit: 'tin', packs: [[1, 'single'], [4, '4 × 145g']], flags: ['fish'] },
  'red-curry-paste': { name: 'Thai red curry paste', cat: 'cupboard', unit: 'tbsp', packs: [[10, 'jar']], flags: ['fish'], pantry: true },
  'tikka-paste': { name: 'Tikka masala paste', cat: 'cupboard', unit: 'tbsp', packs: [[10, 'jar']], pantry: true },
  gochujang: { name: 'Gochujang paste', cat: 'cupboard', unit: 'tbsp', packs: [[10, 'tub']], pantry: true },
  'teriyaki-sauce': { name: 'Teriyaki sauce', cat: 'cupboard', unit: 'tbsp', packs: [[16, 'bottle']], flags: ['gluten'], pantry: true },
  'oyster-sauce': { name: 'Oyster sauce', cat: 'cupboard', unit: 'tbsp', packs: [[10, 'bottle']], flags: ['fish'], pantry: true },
  'sweet-chilli-sauce': { name: 'Sweet chilli sauce', cat: 'cupboard', unit: 'tbsp', packs: [[16, 'bottle']], pantry: true },
  'peanut-butter': { name: 'Smooth peanut butter', cat: 'cupboard', unit: 'tbsp', packs: [[20, 'jar']], flags: ['nuts'], pantry: true },
  pesto: { name: 'Green pesto', cat: 'cupboard', unit: 'tbsp', packs: [[10, 'jar']], flags: ['dairy', 'nuts'], pantry: true },
  'taco-kit': { name: 'Taco kit (El Paso or Tesco)', cat: 'cupboard', unit: 'each', packs: [[1, 'kit']], flags: ['gluten'], search: 'taco kit' },
  'fajita-kit': { name: 'Fajita kit (El Paso or Tesco)', cat: 'cupboard', unit: 'each', packs: [[1, 'kit']], flags: ['gluten'], search: 'fajita kit' },
  'bolognese-sauce': { name: 'Heinz bolognese sauce', cat: 'cupboard', unit: 'each', packs: [[1, 'jar']], search: 'Heinz bolognese sauce' },
  'bbq-sauce': { name: 'BBQ sauce', cat: 'cupboard', unit: 'tbsp', packs: [[20, 'bottle']], pantry: true },
  'wholegrain-mustard': { name: 'Wholegrain mustard', cat: 'cupboard', unit: 'tbsp', packs: [[10, 'jar']], pantry: true },
  'spice-tailor-kit': { name: 'The Spice Tailor curry kit', cat: 'cupboard', unit: 'each', packs: [[1, 'kit']], search: 'The Spice Tailor' },
  harissa: { name: 'Rose harissa', cat: 'cupboard', unit: 'tbsp', packs: [[8, 'jar']], pantry: true },
  'chipotle-paste': { name: 'Chipotle paste', cat: 'cupboard', unit: 'tbsp', packs: [[6, 'jar']], pantry: true },
  miso: { name: 'White miso paste', cat: 'cupboard', unit: 'tbsp', packs: [[10, 'jar']], pantry: true },
  'fish-sauce': { name: 'Fish sauce', cat: 'cupboard', unit: 'tbsp', packs: [[10, 'bottle']], flags: ['fish'], pantry: true },
  'fajita-seasoning': { name: 'Fajita seasoning', cat: 'cupboard', unit: 'tbsp', packs: [[3, 'sachet']] },
  salsa: { name: 'Tomato salsa', cat: 'cupboard', unit: 'g', packs: g(300) },
  hummus: { name: 'Reduced-fat hummus', cat: 'dairy', unit: 'g', packs: g(200) },
  croutons: { name: 'Croutons', cat: 'cupboard', unit: 'g', packs: g(70), flags: ['gluten'] },
  panko: { name: 'Panko breadcrumbs', cat: 'cupboard', unit: 'g', packs: g(150), flags: ['gluten'] },

  // Frozen
  'frozen-peas': { name: 'Frozen garden peas', cat: 'frozen', unit: 'g', packs: g(1000) },
  edamame: { name: 'Frozen edamame beans', cat: 'frozen', unit: 'g', packs: g(500) },

  // Pantry staples (assumed in the cupboard by default)
  'lazy-garlic': { name: 'Lazy garlic', cat: 'cupboard', unit: 'tsp', packs: [[40, 'jar']], pantry: true },
  'lazy-ginger': { name: 'Lazy ginger', cat: 'cupboard', unit: 'tsp', packs: [[40, 'jar']], pantry: true },
  worcestershire: { name: 'Worcestershire sauce', cat: 'cupboard', unit: 'tbsp', pantry: true },
  butter: { name: 'Butter', cat: 'dairy', unit: 'tbsp', pantry: true, flags: ['dairy'] },
  'olive-oil': { name: 'Olive oil', cat: 'cupboard', unit: 'tbsp', pantry: true },
  salt: { name: 'Salt', cat: 'cupboard', unit: 'tsp', pantry: true },
  'black-pepper': { name: 'Black pepper', cat: 'cupboard', unit: 'tsp', pantry: true },
  'soy-sauce': { name: 'Soy sauce', cat: 'cupboard', unit: 'tbsp', pantry: true, flags: ['gluten'] },
  honey: { name: 'Honey', cat: 'cupboard', unit: 'tbsp', pantry: true },
  'sesame-oil': { name: 'Sesame oil', cat: 'cupboard', unit: 'tbsp', pantry: true },
  'sesame-seeds': { name: 'Sesame seeds', cat: 'cupboard', unit: 'tbsp', pantry: true },
  'stock-cube': { name: 'Stock cubes', cat: 'cupboard', unit: 'each', pantry: true },
  'tomato-puree': { name: 'Tomato purée', cat: 'cupboard', unit: 'tbsp', pantry: true },
  cornflour: { name: 'Cornflour', cat: 'cupboard', unit: 'tbsp', pantry: true },
  mayo: { name: 'Light mayonnaise', cat: 'cupboard', unit: 'tbsp', pantry: true },
  cumin: { name: 'Ground cumin', cat: 'cupboard', unit: 'tsp', pantry: true },
  'smoked-paprika': { name: 'Smoked paprika', cat: 'cupboard', unit: 'tsp', pantry: true },
  'chilli-flakes': { name: 'Chilli flakes', cat: 'cupboard', unit: 'tsp', pantry: true },
  oregano: { name: 'Dried oregano', cat: 'cupboard', unit: 'tsp', pantry: true },
  'mixed-herbs': { name: 'Dried mixed herbs', cat: 'cupboard', unit: 'tsp', pantry: true },
  'curry-powder': { name: 'Mild curry powder', cat: 'cupboard', unit: 'tbsp', pantry: true },
  'cajun-seasoning': { name: 'Cajun seasoning', cat: 'cupboard', unit: 'tsp', pantry: true },
}

// Words people actually type, mapped to catalogue ids (used by the agent and
// the custom-recipe parser).
export const ALIASES = {
  chicken: 'chicken-thighs', 'chicken breast': 'chicken-breast', 'chicken thigh': 'chicken-thighs', 'chicken thighs': 'chicken-thighs',
  mince: 'beef-mince', beetroot: 'beetroot', croutons: 'croutons', sirloin: 'sirloin-steak', 'stir fry strips': 'beef-strips', meatballs: 'beef-meatballs', pie: 'steak-ale-pie', 'steak pie': 'steak-ale-pie', 'bbq sauce': 'bbq-sauce', mustard: 'wholegrain-mustard', 'beef mince': 'beef-mince', steak: 'sirloin-steak', 'lamb mince': 'lamb-mince', 'pork mince': 'pork-mince',
  'turkey mince': 'turkey-mince', turkey: 'turkey-mince', sausages: 'pork-sausages', sausage: 'pork-sausages',
  salmon: 'salmon-fillets', cod: 'cod-fillets', prawns: 'king-prawns', prawn: 'king-prawns', shrimp: 'king-prawns',
  pepper: 'peppers', peppers: 'peppers', onion: 'onions', onions: 'onions', 'red onion': 'red-onion',
  'spring onion': 'spring-onions', 'spring onions': 'spring-onions', lime: 'limes', lemon: 'lemons', avocado: 'avocados',
  tomatoes: 'cherry-tomatoes', 'cherry tomatoes': 'cherry-tomatoes', 'green beans': 'green-beans', carrot: 'carrots',
  potato: 'potatoes', 'new potatoes': 'new-potatoes', 'sweet potato': 'sweet-potatoes', 'sweet potatoes': 'sweet-potatoes',
  courgette: 'courgettes', lettuce: 'little-gem', 'pak choi': 'pak-choi', 'bok choy': 'pak-choi', noodles: 'egg-noodles',
  yoghurt: 'greek-yoghurt', yogurt: 'greek-yoghurt', cheese: 'cheese-slices', 'coconut milk': 'coconut-milk',
  'black beans': 'black-beans', 'kidney beans': 'kidney-beans', 'sour cream': 'sour-cream', 'soured cream': 'sour-cream', 'taco kit': 'taco-kit', 'fajita kit': 'fajita-kit', 'dough balls': 'garlic-dough-balls', mangetout: 'mangetout', 'wok noodles': 'wok-noodles', 'cannellini beans': 'cannellini', peas: 'frozen-peas', wraps: 'tortillas',
  pitta: 'pittas', 'peanut butter': 'peanut-butter', 'stir fry veg': 'stir-fry-veg', 'stir-fry veg': 'stir-fry-veg',
  tenderstem: 'tenderstem', spinach: 'spinach', broccoli: 'broccoli', asparagus: 'asparagus', chorizo: 'chorizo',
  cucumber: 'cucumber', garlic: 'lazy-garlic', ginger: 'lazy-ginger', 'lazy garlic': 'lazy-garlic', 'lazy ginger': 'lazy-ginger', rice: 'rice', 'microwave rice': 'rice', 'rice pouch': 'rice', pasta: 'pasta', feta: 'feta',
}

export function ingredient(id) {
  return INGREDIENTS[id] || { name: id, cat: 'other', unit: 'each' }
}
