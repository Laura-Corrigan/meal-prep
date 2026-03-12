import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function App() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }

  const lauraWorkoutOptions = [
    { label: 'Rest', icon: '😴' },
    { label: 'Reformer Pilates', icon: '🧘‍♀️' },
    { label: 'Tempo Run', icon: '🏃‍♀️' },
    { label: 'Easy Run', icon: '🏃‍♀️' },
    { label: 'Long Run', icon: '🏃‍♀️💪' },
    { label: 'Pilates + Run', icon: '🧘‍♀️🏃‍♀️' },
    { label: 'Strength', icon: '💪' },
    { label: 'HIIT', icon: '🔥' },
    { label: 'Swimming', icon: '🏊‍♀️' },
    { label: 'Yoga', icon: '🧘' }
  ]

  const ashWorkoutOptions = [
    { label: 'Rest', icon: '😴' },
    { label: 'Swim', icon: '🏊‍♂️' },
    { label: 'Open Water', icon: '🌊' },
    { label: 'Cycle', icon: '🚴‍♂️' },
    { label: 'Long Ride', icon: '🚴‍♂️💪' },
    { label: 'Run', icon: '🏃‍♂️' },
    { label: 'Long Run', icon: '🏃‍♂️💪' },
    { label: 'Brick', icon: '🚴‍♂️🏃‍♂️' },
    { label: 'Strength', icon: '💪' },
    { label: 'Recovery', icon: '🧘‍♂️' }
  ]

  const defaultLauraSchedule = {
    monday: 'Rest', tuesday: 'Reformer Pilates', wednesday: 'Tempo Run',
    thursday: 'Rest', friday: 'Pilates + Run', saturday: 'Long Run', sunday: 'Rest'
  }

  const defaultAshSchedule = {
    monday: 'Rest', tuesday: 'Swim', wednesday: 'Cycle',
    thursday: 'Run', friday: 'Swim', saturday: 'Long Ride', sunday: 'Long Run'
  }

  const bigSessions = ['Long Run', 'Long Ride', 'Brick', 'Open Water']

  // All measurements are for 4 portions (2 dinner + 2 lunch next day)
  const initialRecipes = [
    { id: 'eating-out', name: 'Eating Out 🍽️', protein: 'none', prepTime: '0 min', isQuick: true, isSlowCooker: false, highCarb: false, ingredients: [], method: 'Enjoy your meal out!', notes: 'No cooking tonight', isEatingOut: true },
    { id: 1, name: 'Mexican Pulled Beef Tacos', protein: 'beef', prepTime: '15 min', isQuick: false, isSlowCooker: true, highCarb: true, source: 'tiktok', tiktokUrl: '', ingredients: ['1kg beef brisket', '4 tbsp chipotle paste', '2 tsp cumin', '2 tsp smoked paprika', '6 cloves garlic, minced', '500ml beef stock', '2 limes, juiced', '16 corn tortillas', '2 red onions, diced'], method: '1. Season beef with spices\n2. Place in slow cooker with stock\n3. Cook on low 6-8 hrs\n4. Shred with forks\n5. Serve in tortillas with onion', notes: 'Add cheese separately for Laura' },
    { id: 2, name: 'Chicken & Pepper Fajitas', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: false, source: 'homemade', tiktokUrl: '', ingredients: ['1kg chicken breast, sliced', '4 mixed peppers, sliced', '2 large onions, sliced', '4 tbsp fajita seasoning', '2 limes, juiced', '500g rice', '2 avocados, sliced'], method: '1. Cook rice according to packet\n2. Fry chicken 5-6 mins until golden\n3. Add peppers and onion, cook 4 mins\n4. Add seasoning and lime\n5. Serve over rice with avocado', notes: 'Add cheese on the side for Laura' },
    { id: 3, name: 'Shepherds Pie', protein: 'beef', prepTime: '20 min', isQuick: false, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['1kg lamb mince', '2 onions, diced', '4 carrots, diced', '300g frozen peas', '600ml beef stock', '4 tbsp tomato puree', '1.6kg potatoes, peeled and cubed', '6 tbsp olive oil', 'Salt and pepper'], method: '1. Boil potatoes 15 mins, drain and mash with olive oil\n2. Brown mince, add onion and carrots\n3. Add stock and puree, simmer 15 mins\n4. Add peas, transfer to dish\n5. Top with mash, bake 200°C 25 mins', notes: 'Use olive oil in mash for dairy-free' },
    { id: 4, name: 'Thai Red Curry', protein: 'chicken', prepTime: '10 min', isQuick: false, isSlowCooker: true, highCarb: true, source: 'tiktok', tiktokUrl: '', ingredients: ['1.2kg chicken thighs, cubed', '6 tbsp red curry paste', '800ml coconut milk', '400g bamboo shoots, drained', '2 red peppers, sliced', '4 tbsp fish sauce', '2 limes, juiced', '600g jasmine rice'], method: '1. Add chicken and curry paste to slow cooker\n2. Pour in coconut milk, add bamboo shoots and pepper\n3. Cook on low 4-6 hrs\n4. Stir in fish sauce and lime\n5. Serve with jasmine rice', notes: 'Naturally dairy-free' },
    { id: 5, name: 'Crispy Cod Risotto', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'tiktok', tiktokUrl: '', ingredients: ['4 cod fillets (150g each)', '600g arborio rice', '400g asparagus, trimmed and chopped', '8 cloves garlic, minced', '200ml white wine', '1.6L veg stock, warm', '4 tbsp olive oil', 'Salt and pepper'], method: '1. Heat oil, toast rice 2 mins\n2. Add wine, stir until absorbed\n3. Add stock gradually, stirring 18 mins\n4. Season cod, pan fry 4 mins each side\n5. Add asparagus and garlic to risotto last 3 mins\n6. Serve cod on risotto', notes: 'Skip parmesan or add separately for Laura' },
    { id: 6, name: 'Beef Ragu Pasta', protein: 'beef', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['1kg beef mince', '2 onions, diced', '6 cloves garlic, minced', '800g tinned tomatoes', '200ml red wine', '2 tsp italian herbs', '800g pasta', 'Salt and pepper'], method: '1. Brown mince in large pan, drain fat\n2. Add onion and garlic, cook 3 mins\n3. Add tomatoes, wine and herbs\n4. Simmer 15 mins\n5. Cook pasta, drain and combine', notes: 'Add parmesan separately for Laura' },
    { id: 7, name: 'Garlic Herb Roast Chicken', protein: 'chicken', prepTime: '10 min', isQuick: false, isSlowCooker: false, highCarb: false, source: 'homemade', tiktokUrl: '', ingredients: ['12 chicken thighs', '12 cloves garlic, minced', '4 sprigs rosemary, chopped', '8 sprigs thyme', '400g broccoli florets', '400g green beans, trimmed', '1kg new potatoes, halved', '6 tbsp olive oil', 'Salt and pepper'], method: '1. Mix garlic, herbs and oil, coat chicken\n2. Arrange chicken and potatoes on tray\n3. Roast 200°C 35 mins\n4. Add broccoli and beans, roast 10 more mins\n5. Serve together', notes: 'Great weekend meal' },
    { id: 8, name: 'Korean Beef Noodles', protein: 'beef', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'tiktok', tiktokUrl: '', ingredients: ['1kg beef mince', '6 tbsp gochujang', '6 tbsp soy sauce', '2 tbsp sesame oil', '8 cloves garlic, minced', '4cm ginger, grated', '8 spring onions, sliced', '600g egg noodles', '2 cucumbers, sliced'], method: '1. Brown beef mince, drain fat\n2. Add gochujang, soy, sesame oil, garlic, ginger\n3. Cook 3 mins until sticky\n4. Cook noodles according to packet\n5. Serve beef over noodles with cucumber and spring onions', notes: 'Naturally dairy-free' },
    { id: 9, name: 'Tuna Jacket Potatoes', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['8 large baking potatoes', '4 tins tuna, drained (145g each)', '2 tins sweetcorn, drained (200g each)', '8 tbsp dairy-free mayo', '8 spring onions, sliced', 'Salt and pepper'], method: '1. Pierce potatoes, microwave 10 mins each (or bake 200°C 1 hr)\n2. Mix tuna, sweetcorn, mayo and spring onions\n3. Season with salt and pepper\n4. Split potatoes and fill with tuna mix', notes: 'Use dairy-free mayo' },
    { id: 10, name: 'Peanut Thai Chicken Udon', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'tiktok', tiktokUrl: '', ingredients: ['800g chicken breast, sliced', '600g udon noodles', '6 tbsp peanut butter', '4 tbsp soy sauce', '2 limes, juiced', '2 tsp chilli flakes', '6 cloves garlic, minced', '4 pak choi, quartered', '8 spring onions, sliced'], method: '1. Fry chicken 5-6 mins until cooked\n2. Mix peanut butter, soy, lime, chilli and 6 tbsp water\n3. Cook noodles and pak choi according to packet\n4. Add sauce to chicken, warm through\n5. Serve over noodles, top with spring onions', notes: 'Naturally dairy-free' },
    { id: 11, name: 'Honey Garlic Salmon', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['4 salmon fillets (150g each)', '6 tbsp honey', '4 tbsp soy sauce', '6 cloves garlic, minced', '2cm ginger, grated', '600g jasmine rice', '400g broccoli florets'], method: '1. Cook rice according to packet\n2. Mix honey, soy, garlic and ginger\n3. Pan fry salmon skin-down 3 mins\n4. Flip, add sauce, cook 3 mins basting\n5. Steam broccoli 4 mins\n6. Serve salmon on rice with broccoli', notes: 'Naturally dairy-free' },
    { id: 12, name: 'Prawn Stir Fry', protein: 'fish', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['800g king prawns', '600g stir fry veg (2 bags)', '6 cloves garlic, minced', '4cm ginger, grated', '6 tbsp soy sauce', '4 tbsp oyster sauce', '600g egg noodles', '2 tbsp vegetable oil'], method: '1. Cook noodles according to packet\n2. Heat oil, fry prawns 2 mins each side\n3. Add garlic, ginger, veg, cook 3 mins\n4. Add sauces and noodles, toss together\n5. Serve immediately', notes: 'Super quick midweek meal' },
    { id: 13, name: 'Chicken Gyros Bowl', protein: 'chicken', prepTime: '15 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['1kg chicken thighs, sliced', '2 tsp oregano', '2 tsp paprika', '2 tsp cumin', '6 cloves garlic, minced', '8 pitta breads', '2 cucumbers, diced', '400g cherry tomatoes, halved', '400g hummus'], method: '1. Mix chicken with oregano, paprika, cumin, garlic\n2. Fry chicken 6-8 mins until cooked\n3. Warm pitta breads\n4. Serve chicken with pitta, cucumber, tomatoes and hummus', notes: 'Hummus instead of tzatziki for dairy-free' },
    { id: 14, name: 'Teriyaki Chicken Bowls', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['1kg chicken thighs, cubed', '8 tbsp teriyaki sauce', '600g jasmine rice', '300g edamame beans', '2 cucumbers, sliced', '8 spring onions, sliced', '2 tbsp sesame seeds'], method: '1. Cook rice according to packet\n2. Fry chicken 6-8 mins until golden\n3. Add teriyaki sauce, cook 2 mins until sticky\n4. Cook edamame 3 mins in boiling water\n5. Assemble bowls: rice, chicken, edamame, cucumber\n6. Top with spring onions and sesame seeds', notes: 'Great for meal prep' },
    { id: 16, name: 'Sausage & Bean Casserole', protein: 'pork', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['16 pork sausages', '800g tinned cannellini beans, drained', '800g tinned tomatoes', '2 onions, sliced', '6 cloves garlic, minced', '2 tsp smoked paprika', '8 slices crusty bread', '2 tbsp olive oil'], method: '1. Brown sausages in oil 5 mins, set aside\n2. Fry onion and garlic 3 mins\n3. Add beans, tomatoes, paprika\n4. Return sausages, simmer 15 mins\n5. Serve with crusty bread', notes: 'Check sausages are dairy-free' },
    { id: 17, name: 'Chicken Burrito Bowls', protein: 'chicken', prepTime: '15 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['1kg chicken breast, sliced', '2 tsp cumin', '2 tsp paprika', '600g rice', '800g tinned black beans, drained', '400g sweetcorn', '4 avocados, sliced', '2 limes, juiced', '8 tbsp salsa'], method: '1. Season chicken with cumin and paprika\n2. Cook rice according to packet\n3. Fry chicken 6-8 mins\n4. Warm beans and sweetcorn\n5. Assemble bowls: rice, chicken, beans, corn, avocado\n6. Top with lime juice and salsa', notes: 'Add cheese on yours separately for Laura' },
    { id: 20, name: 'Ginger Soy Salmon Noodles', protein: 'fish', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', tiktokUrl: '', ingredients: ['4 salmon fillets (150g each)', '6 tbsp soy sauce', '4cm ginger, grated', '4 tbsp honey', '600g rice noodles', '4 pak choi, quartered', '8 spring onions, sliced', '2 limes, to serve'], method: '1. Mix soy, ginger and honey for glaze\n2. Cook noodles according to packet, add pak choi last 2 mins\n3. Pan fry salmon 3 mins each side\n4. Add glaze, cook 1 min until sticky\n5. Serve salmon on noodles\n6. Top with spring onions', notes: 'Naturally dairy-free' }
  ]

  const [activeTab, setActiveTab] = useState('meals')
  const [recipes, setRecipes] = useState(initialRecipes)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [weekPlans, setWeekPlans] = useState({ 0: {} })
  const [lauraSchedule, setLauraSchedule] = useState(defaultLauraSchedule)
  const [ashSchedule, setAshSchedule] = useState(defaultAshSchedule)
  const [checkedItems, setCheckedItems] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [viewingRecipe, setViewingRecipe] = useState(null)
  const [movingFromDay, setMovingFromDay] = useState(null)
  const [showAddRecipe, setShowAddRecipe] = useState(false)
  const [copiedList, setCopiedList] = useState(false)
  const [filterProtein, setFilterProtein] = useState('all')
  const [savedPlan, setSavedPlan] = useState(true)
  const [loading, setLoading] = useState(true)
  const [newRecipe, setNewRecipe] = useState({ name: '', protein: 'chicken', prepTime: '', isQuick: true, isSlowCooker: false, highCarb: false, source: 'tiktok', tiktokUrl: '', ingredients: '', method: '', notes: '' })

  const weekPlan = weekPlans[currentWeekOffset] || {}

  const needsHighCarb = (day) => {
    const dayIndex = days.indexOf(day)
    const nextDay = days[(dayIndex + 1) % 7]
    return bigSessions.includes(lauraSchedule[nextDay]) || bigSessions.includes(ashSchedule[nextDay])
  }

  const getPreviousDinner = (day) => {
    const dayIndex = days.indexOf(day)
    
    // Monday is special - leftovers come from PREVIOUS week's Sunday
    if (day === 'monday') {
      const prevWeekPlan = weekPlans[currentWeekOffset - 1] || {}
      const recipeId = prevWeekPlan['sunday']
      if (recipeId && recipeId !== 'eating-out') {
        return recipes.find(r => r.id === recipeId)
      }
      return null
    }
    
    // All other days - leftovers from previous day of same week
    const prevDay = days[dayIndex - 1]
    const recipeId = weekPlan[prevDay]
    if (recipeId && recipeId !== 'eating-out') {
      return recipes.find(r => r.id === recipeId)
    }
    return null
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: recipesData } = await supabase.from('recipes').select('*')
        if (recipesData && recipesData.length > 0) {
          // Merge: keep all initial recipes, add any new ones from database
          const dbIds = new Set(recipesData.map(r => r.id))
          const merged = [
            ...initialRecipes, // Always include defaults
            ...recipesData.filter(r => !initialRecipes.some(ir => ir.id === r.id)) // Add user-created recipes
          ]
          setRecipes(merged)
        }
        const { data: plansData } = await supabase.from('week_plans').select('*')
        if (plansData && plansData.length > 0) {
          const plans = {}
          plansData.forEach(p => { plans[p.week_offset] = p.plan })
          setWeekPlans(plans)
        }
        const { data: trainingData } = await supabase.from('training').select('*')
        if (trainingData && trainingData.length > 0) {
          trainingData.forEach(tr => {
            if (tr.laura_default) setLauraSchedule(tr.laura_default)
            if (tr.ash_default) setAshSchedule(tr.ash_default)
          })
        }
      } catch (e) {
        console.log('Load error, using defaults', e)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const getWeekDates = (offset) => {
    const today = new Date()
    const day = today.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff + offset * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const formatDate = (d) => `${d.toLocaleString('en-GB', { month: 'short' })} ${d.getDate()}`
    return { start: monday, end: sunday, label: `${formatDate(monday)} - ${formatDate(sunday)}, ${monday.getFullYear()}` }
  }

  const getDayDate = (day, offset) => {
    const { start } = getWeekDates(offset)
    const dayIndex = days.indexOf(day)
    const date = new Date(start)
    date.setDate(start.getDate() + dayIndex)
    return date.getDate()
  }

  const assignRecipe = (day, recipeId) => {
    setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: { ...prev[currentWeekOffset], [day]: recipeId } }))
    setSelectedDay(null)
    setSavedPlan(false)
  }

  const clearDay = (day) => {
    setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: { ...prev[currentWeekOffset], [day]: null } }))
    setSavedPlan(false)
  }

  const moveMeal = (fromDay, toDay) => {
    const fromRecipe = weekPlan[fromDay]
    const toRecipe = weekPlan[toDay]
    // Swap the meals
    setWeekPlans(prev => ({
      ...prev,
      [currentWeekOffset]: {
        ...prev[currentWeekOffset],
        [fromDay]: toRecipe || null,
        [toDay]: fromRecipe
      }
    }))
    setMovingFromDay(null)
    setSavedPlan(false)
  }

  const updateDefaultSchedule = (person, day, workout) => {
    if (person === 'laura') {
      setLauraSchedule(prev => ({ ...prev, [day]: workout }))
    } else {
      setAshSchedule(prev => ({ ...prev, [day]: workout }))
    }
    setEditingWorkout(null)
    setSavedPlan(false)
  }

  const generatePlan = () => {
    const newPlan = {}
    const used = new Set()
    days.forEach(day => {
      const highCarbNeeded = needsHighCarb(day)
      const isWeekend = day === 'saturday' || day === 'sunday'
      const redMeatCount = Object.values(newPlan).filter(id => {
        const r = recipes.find(rec => rec.id === id)
        return r && (r.protein === 'beef' || r.protein === 'pork')
      }).length
      let pool = recipes.filter(r => !used.has(r.id) && !r.isEatingOut)
      if (redMeatCount >= 1) pool = pool.filter(r => r.protein !== 'beef' && r.protein !== 'pork')
      const healthyPool = pool.filter(r => r.protein === 'chicken' || r.protein === 'fish')
      if (healthyPool.length > 0 && Math.random() < 0.7) pool = healthyPool
      if (!isWeekend) pool = pool.filter(r => r.isQuick)
      if (highCarbNeeded) {
        const hc = pool.filter(r => r.highCarb)
        if (hc.length > 0) pool = hc
      }
      if (pool.length > 0) {
        const recipe = pool[Math.floor(Math.random() * pool.length)]
        newPlan[day] = recipe.id
        used.add(recipe.id)
      }
    })
    setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: newPlan }))
    setSavedPlan(false)
  }

  const savePlan = async () => {
    try {
      await supabase.from('week_plans').upsert({ week_offset: currentWeekOffset, plan: weekPlan, updated_at: new Date().toISOString() }, { onConflict: 'week_offset' })
      await supabase.from('training').upsert({ week_offset: 0, laura_default: lauraSchedule, ash_default: ashSchedule, updated_at: new Date().toISOString() }, { onConflict: 'week_offset' })
      setSavedPlan(true)
    } catch (e) {
      alert('Failed to save - check your connection')
    }
  }

  const getShoppingList = () => {
    const items = {}
    Object.values(weekPlan).forEach(id => {
      const recipe = recipes.find(r => r.id === id)
      if (recipe && !recipe.isEatingOut) {
        recipe.ingredients.forEach(ing => { items[ing] = (items[ing] || 0) + 1 })
      }
    })
    return Object.entries(items).map(([name, count]) => count > 1 ? `${name} (x${count})` : name)
  }

  const copyShoppingList = () => {
    const items = getShoppingList()
    const meals = days.map(d => weekPlan[d] ? `${d}: ${recipes.find(r => r.id === weekPlan[d])?.name}` : null).filter(Boolean)
    const text = `🛒 Shopping List - ${getWeekDates(currentWeekOffset).label}\n\n${items.map(i => `☐ ${i}`).join('\n')}\n\n📅 Meals:\n${meals.join('\n')}`
    navigator.clipboard.writeText(text)
    setCopiedList(true)
    setTimeout(() => setCopiedList(false), 2000)
  }

  const addRecipe = async () => {
    const recipe = { id: Date.now(), ...newRecipe, ingredients: newRecipe.ingredients.split('\n').filter(i => i.trim()) }
    try {
      await supabase.from('recipes').insert(recipe)
      setRecipes(prev => [...prev, recipe])
    } catch (e) {
      setRecipes(prev => [...prev, recipe])
    }
    setShowAddRecipe(false)
    setNewRecipe({ name: '', protein: 'chicken', prepTime: '', isQuick: true, isSlowCooker: false, highCarb: false, source: 'tiktok', tiktokUrl: '', ingredients: '', method: '', notes: '' })
  }

  const deleteRecipe = async (id) => {
    try { await supabase.from('recipes').delete().eq('id', id) } catch (e) {}
    setRecipes(prev => prev.filter(r => r.id !== id))
    setViewingRecipe(null)
  }

  const filteredRecipes = (filterProtein === 'all' ? recipes : recipes.filter(r => r.protein === filterProtein)).filter(r => !r.isEatingOut)
  const shoppingItems = getShoppingList()
  const weekDates = getWeekDates(currentWeekOffset)

  const getWorkoutIcon = (label) => {
    const all = [...lauraWorkoutOptions, ...ashWorkoutOptions]
    return all.find(w => w.label === label)?.icon || '📋'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🥗</div>
          <div style={{ color: '#7c3aed' }}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f5f3ff 0%, #faf5ff 50%, #fff 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e9d5ff', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#7c3aed' }}>🥗 Meal Plan</h1>
            <p style={{ margin: '2px 0 0', color: '#a78bfa', fontSize: 13 }}>Laura & Ash • £100/week</p>
          </div>
          <button onClick={savePlan} style={{ padding: '10px 20px', background: savedPlan ? '#22c55e' : '#7c3aed', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
            {savedPlan ? '✓ Saved' : '💾 Save'}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e9d5ff', padding: '0 20px', position: 'sticky', top: 73, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 0 }}>
          {[{ id: 'meals', label: '🍽️ Meals' }, { id: 'training', label: '💪 Training' }, { id: 'recipes', label: '📖 Recipes' }, { id: 'list', label: '🛒 List' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 16px',
                border: 'none',
                background: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: activeTab === tab.id ? '#7c3aed' : '#9ca3af',
                borderBottom: activeTab === tab.id ? '3px solid #7c3aed' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
        {/* MEALS TAB */}
        {activeTab === 'meals' && (
          <>
            {/* Week Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={() => setCurrentWeekOffset(o => o - 1)} style={{ width: 44, height: 44, border: '1px solid #e9d5ff', borderRadius: 12, background: 'white', cursor: 'pointer', fontSize: 18 }}>‹</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#1f2937' }}>{weekDates.label}</div>
              </div>
              <button onClick={() => setCurrentWeekOffset(o => o + 1)} style={{ width: 44, height: 44, border: '1px solid #e9d5ff', borderRadius: 12, background: 'white', cursor: 'pointer', fontSize: 18 }}>›</button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <button onClick={generatePlan} style={{ padding: '12px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
                📅 Build from Workouts
              </button>
              <button onClick={copyShoppingList} style={{ padding: '12px 20px', background: 'white', color: '#7c3aed', border: '1px solid #e9d5ff', borderRadius: 10, cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>
                {copiedList ? '✓ Copied!' : '📋 Copy to Notes'}
              </button>
            </div>

            {/* Day Selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
              {days.map(day => {
                const isToday = getDayDate(day, currentWeekOffset) === new Date().getDate() && currentWeekOffset === 0
                const hasRecipe = weekPlan[day]
                return (
                  <div 
                    key={day} 
                    onClick={() => document.getElementById(`day-${day}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    style={{ textAlign: 'center', minWidth: 44, cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{dayLabels[day]}</div>
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 10, 
                      background: isToday ? '#7c3aed' : hasRecipe ? '#f5f3ff' : 'white', 
                      color: isToday ? 'white' : '#1f2937', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 600, 
                      fontSize: 14, 
                      border: isToday ? 'none' : hasRecipe ? '2px solid #7c3aed' : '1px solid #e9d5ff', 
                      margin: '0 auto' 
                    }}>
                      {getDayDate(day, currentWeekOffset)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Day Cards */}
            {days.map(day => {
              const recipeId = weekPlan[day]
              const dinner = recipeId ? recipes.find(r => r.id === recipeId) : null
              const lunch = getPreviousDinner(day)
              const highCarb = needsHighCarb(day)
              const lauraWorkout = lauraSchedule[day]
              const ashWorkout = ashSchedule[day]

              return (
                <div key={day} id={`day-${day}`} style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(124,58,237,0.08)', border: '1px solid #f3e8ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 18, textTransform: 'capitalize', color: '#1f2937' }}>{day}</span>
                      <span style={{ color: '#9ca3af', marginLeft: 8, fontSize: 14 }}>
                        ({lauraWorkout}, {ashWorkout})
                      </span>
                    </div>
                    <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: highCarb ? '#fef3c7' : '#dcfce7', color: highCarb ? '#92400e' : '#166534', fontWeight: 500 }}>
                      {highCarb ? '🍝 High Carbs' : '🥗 Low Carbs'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {/* Lunch (Leftovers) */}
                    <div style={{ background: lunch ? '#f0fdf4' : '#f9fafb', borderRadius: 12, padding: 16, border: lunch ? '1px solid #bbf7d0' : '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        ☀️ LUNCH
                      </div>
                      {lunch ? (
                        <>
                          <div style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>{lunch.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>(leftover)</div>
                        </>
                      ) : (
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>No leftovers</div>
                      )}
                    </div>

                    {/* Dinner */}
                    <div style={{ background: dinner ? '#f5f3ff' : '#fafafa', borderRadius: 12, padding: 16, border: dinner ? '1px solid #ddd6fe' : '2px dashed #d1d5db' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🌙 DINNER</span>
                        {dinner && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setMovingFromDay(day)} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed', fontSize: 11, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, fontWeight: 500 }}>↔ Move</button>
                            <button onClick={() => clearDay(day)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', fontSize: 11, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, fontWeight: 500 }}>✕</button>
                          </div>
                        )}
                      </div>
                      {dinner ? (
                        <div onClick={() => setViewingRecipe(dinner)} style={{ cursor: 'pointer' }}>
                          <div style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>{dinner.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Makes 4 portions • Tap for recipe</div>
                        </div>
                      ) : (
                        <div onClick={() => setSelectedDay(day)} style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '8px 0', cursor: 'pointer' }}>+ Add meal</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* TRAINING TAB */}
        {activeTab === 'training' && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(124,58,237,0.08)', border: '1px solid #f3e8ff' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#1f2937' }}>Default Weekly Schedule</h2>
              <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>Set your typical training week. This auto-adjusts your meal carbs.</p>

              {/* Laura's Schedule */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#be185d', display: 'flex', alignItems: 'center', gap: 8 }}>👩 Laura's Training</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                  {days.map(day => (
                    <div
                      key={day}
                      onClick={() => setEditingWorkout({ person: 'laura', day })}
                      style={{ background: '#fdf2f8', borderRadius: 12, padding: 12, textAlign: 'center', cursor: 'pointer', border: '1px solid #fbcfe8' }}
                    >
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{dayLabels[day]}</div>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{getWorkoutIcon(lauraSchedule[day])}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.2 }}>{lauraSchedule[day]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ash's Schedule */}
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 8 }}>👨 Ash's Training</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                  {days.map(day => (
                    <div
                      key={day}
                      onClick={() => setEditingWorkout({ person: 'ash', day })}
                      style={{ background: '#eff6ff', borderRadius: 12, padding: 12, textAlign: 'center', cursor: 'pointer', border: '1px solid #bfdbfe' }}
                    >
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{dayLabels[day]}</div>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{getWorkoutIcon(ashSchedule[day])}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.2 }}>{ashSchedule[day]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: '#fef3c7', borderRadius: 12, padding: 16, border: '1px solid #fde68a' }}>
              <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>💡 How it works</div>
              <div style={{ fontSize: 13, color: '#a16207', lineHeight: 1.5 }}>
                When you or Ash have a big session (Long Run, Long Ride, Brick, Open Water) the next day, 
                the meal planner will automatically suggest high-carb meals the night before.
              </div>
            </div>
          </>
        )}

        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['all', 'chicken', 'fish', 'beef', 'pork'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterProtein(p)}
                    style={{
                      padding: '8px 14px',
                      background: filterProtein === p ? '#7c3aed' : 'white',
                      color: filterProtein === p ? 'white' : '#6b7280',
                      border: filterProtein === p ? 'none' : '1px solid #e9d5ff',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddRecipe(true)} style={{ padding: '10px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>+ Add Recipe</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {filteredRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => setViewingRecipe(recipe)}
                  style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid #f3e8ff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.05)' }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: '#1f2937' }}>{recipe.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#f5f3ff', color: '#7c3aed', fontWeight: 500 }}>{recipe.protein}</span>
                    {recipe.isQuick && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#dcfce7', color: '#166534' }}>⚡ Quick</span>}
                    {recipe.isSlowCooker && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#ffedd5', color: '#9a3412' }}>🍲 Slow</span>}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>⏱ {recipe.prepTime} • Serves 4</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SHOPPING LIST TAB */}
        {activeTab === 'list' && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(124,58,237,0.08)', border: '1px solid #f3e8ff' }}>
              <span style={{ fontSize: 14, color: '#6b7280' }}><strong style={{ color: '#1f2937' }}>{Object.values(weekPlan).filter(Boolean).length}</strong> meals • <strong style={{ color: '#1f2937' }}>{shoppingItems.length}</strong> items</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setCheckedItems({})} style={{ padding: '8px 16px', background: '#f5f3ff', color: '#7c3aed', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Reset</button>
                <button onClick={copyShoppingList} style={{ padding: '8px 16px', background: copiedList ? '#22c55e' : '#7c3aed', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
                  {copiedList ? '✓ Copied!' : '📋 Copy List'}
                </button>
              </div>
            </div>

            {shoppingItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <div style={{ fontSize: 15 }}>Add meals to generate your shopping list</div>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(124,58,237,0.08)', border: '1px solid #f3e8ff' }}>
                {shoppingItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 0',
                      borderBottom: i < shoppingItems.length - 1 ? '1px solid #f3e8ff' : 'none',
                      cursor: 'pointer',
                      opacity: checkedItems[item] ? 0.4 : 1
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: checkedItems[item] ? 'none' : '2px solid #d8b4fe',
                      background: checkedItems[item] ? '#7c3aed' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 14,
                      flexShrink: 0
                    }}>
                      {checkedItems[item] && '✓'}
                    </div>
                    <span style={{ fontSize: 15, color: '#1f2937', textDecoration: checkedItems[item] ? 'line-through' : 'none' }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* SELECT RECIPE MODAL */}
      {selectedDay && (
        <div onClick={() => setSelectedDay(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500, maxHeight: '80vh', overflow: 'auto', padding: '24px 20px' }}>
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 16px', fontSize: 18, textTransform: 'capitalize', color: '#1f2937' }}>Choose dinner for {selectedDay}</h2>
            
            <div onClick={() => assignRecipe(selectedDay, 'eating-out')} style={{ padding: 16, background: '#fef3c7', borderRadius: 12, marginBottom: 16, cursor: 'pointer', border: '1px solid #fde68a' }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#92400e' }}>🍽️ Eating Out</div>
              <div style={{ fontSize: 13, color: '#a16207' }}>No cooking tonight</div>
            </div>
            
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12, fontWeight: 600 }}>RECIPES</div>
            {recipes.filter(r => !r.isEatingOut).map(recipe => (
              <div key={recipe.id} onClick={() => assignRecipe(selectedDay, recipe.id)} style={{ padding: 16, background: '#faf5ff', borderRadius: 12, marginBottom: 10, cursor: 'pointer', border: '1px solid #f3e8ff' }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>{recipe.name}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{recipe.protein} • {recipe.prepTime}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOVE MEAL MODAL */}
      {movingFromDay && (
        <div onClick={() => setMovingFromDay(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 400, padding: '24px 20px' }}>
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#1f2937' }}>Move meal</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280' }}>
              Moving <strong>{recipes.find(r => r.id === weekPlan[movingFromDay])?.name}</strong> from <strong style={{ textTransform: 'capitalize' }}>{movingFromDay}</strong>
            </p>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12, fontWeight: 600 }}>SWAP WITH OR MOVE TO:</div>
            {days.filter(d => d !== movingFromDay).map(day => {
              const targetMeal = weekPlan[day] ? recipes.find(r => r.id === weekPlan[day]) : null
              return (
                <div 
                  key={day} 
                  onClick={() => moveMeal(movingFromDay, day)} 
                  style={{ padding: 16, background: '#faf5ff', borderRadius: 12, marginBottom: 10, cursor: 'pointer', border: '1px solid #f3e8ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1f2937', textTransform: 'capitalize' }}>{day}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{targetMeal ? targetMeal.name : 'Empty'}</div>
                  </div>
                  <span style={{ color: '#7c3aed', fontSize: 18 }}>→</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* EDIT WORKOUT MODAL */}
      {editingWorkout && (
        <div onClick={() => setEditingWorkout(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 400, maxHeight: '70vh', overflow: 'auto', padding: '24px 20px' }}>
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 16px', fontSize: 18, textTransform: 'capitalize', color: '#1f2937' }}>
              {editingWorkout.person === 'laura' ? '👩 Laura' : '👨 Ash'} - {editingWorkout.day}
            </h2>
            {(editingWorkout.person === 'laura' ? lauraWorkoutOptions : ashWorkoutOptions).map(w => {
              const current = editingWorkout.person === 'laura' ? lauraSchedule[editingWorkout.day] : ashSchedule[editingWorkout.day]
              const isSelected = current === w.label
              return (
                <div
                  key={w.label}
                  onClick={() => updateDefaultSchedule(editingWorkout.person, editingWorkout.day, w.label)}
                  style={{ 
                    padding: 14, 
                    background: isSelected ? (editingWorkout.person === 'laura' ? '#fdf2f8' : '#eff6ff') : '#fafafa', 
                    borderRadius: 12, 
                    marginBottom: 10, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    border: isSelected ? `2px solid ${editingWorkout.person === 'laura' ? '#ec4899' : '#3b82f6'}` : '1px solid #e5e7eb'
                  }}
                >
                  <span style={{ fontSize: 22 }}>{w.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: isSelected ? 600 : 400, color: '#1f2937' }}>{w.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* VIEW RECIPE MODAL */}
      {viewingRecipe && (
        <div onClick={() => setViewingRecipe(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500, maxHeight: '85vh', overflow: 'auto', padding: '24px 20px' }}>
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 20px' }} />
            
            {/* TikTok Button - Prominent at top */}
            {viewingRecipe.tiktokUrl && (
              <a 
                href={viewingRecipe.tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 10,
                  padding: 16, 
                  background: 'linear-gradient(135deg, #00f2ea 0%, #ff0050 100%)', 
                  borderRadius: 14, 
                  marginBottom: 20, 
                  color: 'white', 
                  textDecoration: 'none', 
                  fontSize: 16,
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(255,0,80,0.3)'
                }}
              >
                <span style={{ fontSize: 24 }}>📱</span>
                Watch on TikTok
              </a>
            )}
            
            <h2 style={{ margin: '0 0 12px', fontSize: 22, color: '#1f2937', fontWeight: 700 }}>{viewingRecipe.name}</h2>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: '#f5f3ff', color: '#7c3aed', fontWeight: 500 }}>{viewingRecipe.protein}</span>
              <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: '#f5f3ff', color: '#7c3aed' }}>⏱ {viewingRecipe.prepTime}</span>
              <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: '#dcfce7', color: '#166534' }}>👥 Serves 4</span>
              {viewingRecipe.isSlowCooker && <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: '#ffedd5', color: '#9a3412' }}>🍲 Slow Cooker</span>}
              {viewingRecipe.highCarb && <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: '#fef3c7', color: '#92400e' }}>🍝 High Carb</span>}
            </div>
            
            {viewingRecipe.ingredients && viewingRecipe.ingredients.length > 0 && (
              <div style={{ background: '#faf5ff', borderRadius: 14, padding: 18, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 14px', fontSize: 14, color: '#7c3aed', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>🛒 Ingredients</h4>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#374151' }}>
                  {viewingRecipe.ingredients.map((ing, i) => (
                    <li key={i} style={{ marginBottom: 10, fontSize: 16, lineHeight: 1.4 }}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 14px', fontSize: 14, color: '#16a34a', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>👩‍🍳 Method</h4>
              <div style={{ color: '#374151', fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{viewingRecipe.method}</div>
            </div>
            
            {viewingRecipe.notes && (
              <div style={{ background: '#fef3c7', padding: 16, borderRadius: 14, fontSize: 15, marginBottom: 20, color: '#92400e', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <span>{viewingRecipe.notes}</span>
              </div>
            )}
            
            {!viewingRecipe.isEatingOut && (
              <button onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete "${viewingRecipe.name}"? This cannot be undone.`)) {
                  deleteRecipe(viewingRecipe.id)
                }
              }} style={{ padding: '14px 24px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, width: '100%' }}>🗑 Delete Recipe Forever</button>
            )}
          </div>
        </div>
      )}

      {/* ADD RECIPE MODAL */}
      {showAddRecipe && (
        <div onClick={() => setShowAddRecipe(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', padding: '24px 20px' }}>
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#1f2937', fontWeight: 700 }}>Add New Recipe</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280' }}>Add recipes from TikTok or your own favourites</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Recipe name" value={newRecipe.name} onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })} style={{ padding: 14, border: '1px solid #e9d5ff', borderRadius: 10, fontSize: 16 }} />
              
              {/* TikTok URL with styling */}
              <div style={{ background: 'linear-gradient(135deg, #00f2ea20 0%, #ff005020 100%)', borderRadius: 12, padding: 14, border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>📱 TikTok Link (optional)</div>
                <input 
                  placeholder="https://www.tiktok.com/..." 
                  value={newRecipe.tiktokUrl} 
                  onChange={e => setNewRecipe({ ...newRecipe, tiktokUrl: e.target.value })} 
                  style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 15, width: '100%', boxSizing: 'border-box' }} 
                />
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Paste the TikTok URL to easily watch while cooking</div>
              </div>
              
              <div style={{ display: 'flex', gap: 10 }}>
                <select value={newRecipe.protein} onChange={e => setNewRecipe({ ...newRecipe, protein: e.target.value })} style={{ flex: 1, padding: 14, border: '1px solid #e9d5ff', borderRadius: 10, fontSize: 15, background: 'white' }}>
                  <option value="chicken">🐔 Chicken</option>
                  <option value="fish">🐟 Fish</option>
                  <option value="beef">🥩 Beef</option>
                  <option value="pork">🐷 Pork</option>
                </select>
                <input placeholder="e.g. 15 min" value={newRecipe.prepTime} onChange={e => setNewRecipe({ ...newRecipe, prepTime: e.target.value })} style={{ flex: 1, padding: 14, border: '1px solid #e9d5ff', borderRadius: 10, fontSize: 15 }} />
              </div>
              
              <div style={{ display: 'flex', gap: 12, fontSize: 14, color: '#374151', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, background: newRecipe.isQuick ? '#dcfce7' : '#f5f5f5', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newRecipe.isQuick} onChange={e => setNewRecipe({ ...newRecipe, isQuick: e.target.checked })} /> ⚡ Quick
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, background: newRecipe.isSlowCooker ? '#ffedd5' : '#f5f5f5', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newRecipe.isSlowCooker} onChange={e => setNewRecipe({ ...newRecipe, isSlowCooker: e.target.checked })} /> 🍲 Slow cooker
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, background: newRecipe.highCarb ? '#fef3c7' : '#f5f5f5', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newRecipe.highCarb} onChange={e => setNewRecipe({ ...newRecipe, highCarb: e.target.checked })} /> 🍝 High carb
                </label>
              </div>
              
              <div>
                <div style={{ fontSize: 13, color: '#7c3aed', marginBottom: 8, fontWeight: 600 }}>🛒 Ingredients (with measurements)</div>
                <textarea 
                  placeholder="One ingredient per line, e.g:&#10;1kg chicken breast&#10;4 tbsp soy sauce&#10;2 cloves garlic, minced&#10;&#10;💡 Double quantities - serves 4 (dinner + lunch)" 
                  rows={7} 
                  value={newRecipe.ingredients} 
                  onChange={e => setNewRecipe({ ...newRecipe, ingredients: e.target.value })} 
                  style={{ padding: 14, border: '1px solid #e9d5ff', borderRadius: 10, fontSize: 15, width: '100%', boxSizing: 'border-box' }} 
                />
              </div>
              
              <div>
                <div style={{ fontSize: 13, color: '#16a34a', marginBottom: 8, fontWeight: 600 }}>👩‍🍳 Method</div>
                <textarea 
                  placeholder="Step by step instructions, e.g:&#10;1. Cook rice according to packet&#10;2. Slice chicken into strips&#10;3. Fry chicken for 5-6 mins" 
                  rows={5} 
                  value={newRecipe.method} 
                  onChange={e => setNewRecipe({ ...newRecipe, method: e.target.value })} 
                  style={{ padding: 14, border: '1px solid #e9d5ff', borderRadius: 10, fontSize: 15, width: '100%', boxSizing: 'border-box' }} 
                />
              </div>
              
              <input placeholder="💡 Notes (e.g. add cheese separately for Laura)" value={newRecipe.notes} onChange={e => setNewRecipe({ ...newRecipe, notes: e.target.value })} style={{ padding: 14, border: '1px solid #e9d5ff', borderRadius: 10, fontSize: 15 }} />
              
              <button onClick={addRecipe} disabled={!newRecipe.name || !newRecipe.ingredients} style={{ padding: 16, background: '#7c3aed', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 16, boxShadow: '0 4px 12px rgba(124,58,237,0.3)', opacity: (!newRecipe.name || !newRecipe.ingredients) ? 0.5 : 1 }}>✨ Add Recipe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
