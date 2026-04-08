import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Clock, Users, Play, ChevronRight, ChevronLeft, Plus, Check, X, ArrowLeftRight, Trash2, Edit3, ShoppingBag, Copy, ExternalLink } from 'lucide-react'

export default function App() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }
  const dayLabelsFull = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' }

  const workoutOptions = [
    { label: 'Rest' }, { label: 'Reformer Pilates' }, { label: 'Yoga' }, { label: 'Easy Run' }, 
    { label: 'Tempo Run' }, { label: 'Long Run', intense: true }, { label: 'Pilates + Run' },
    { label: 'Swim' }, { label: 'Open Water', intense: true }, { label: 'Cycle' }, 
    { label: 'Long Ride', intense: true }, { label: 'Brick', intense: true }, 
    { label: 'Strength' }, { label: 'HIIT' }, { label: 'Recovery' }
  ]

  const defaultLauraSchedule = { monday: 'Rest', tuesday: 'Reformer Pilates', wednesday: 'Tempo Run', thursday: 'Rest', friday: 'Pilates + Run', saturday: 'Long Run', sunday: 'Rest' }
  const defaultAshSchedule = { monday: 'Rest', tuesday: 'Swim', wednesday: 'Cycle', thursday: 'Easy Run', friday: 'Swim', saturday: 'Long Ride', sunday: 'Long Run' }
  const bigSessions = ['Long Run', 'Long Ride', 'Brick', 'Open Water']

  const initialRecipes = [
    { id: 'eating-out', name: 'Eating Out', protein: 'none', prepTime: '0 min', isQuick: true, isSlowCooker: false, highCarb: false, ingredients: [], method: 'Enjoy your meal out!', notes: '', isEatingOut: true },
    { id: 1, name: 'Mexican Pulled Beef Tacos', protein: 'beef', prepTime: '15 min prep', isQuick: false, isSlowCooker: true, highCarb: true, tiktokUrl: '', ingredients: ['1kg beef brisket', '4 tbsp chipotle paste', '2 tsp cumin', '2 tsp smoked paprika', '6 cloves garlic, minced', '500ml beef stock', '2 limes, juiced', '16 corn tortillas', '2 red onions, diced'], method: '1. Season beef with spices\n2. Place in slow cooker with stock\n3. Cook on low 6-8 hrs\n4. Shred with forks\n5. Serve in tortillas with onion', notes: 'Add cheese separately for Laura' },
    { id: 2, name: 'Chicken & Pepper Fajitas', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: false, tiktokUrl: '', ingredients: ['1kg chicken breast, sliced', '4 mixed peppers, sliced', '2 large onions, sliced', '4 tbsp fajita seasoning', '2 limes, juiced', '500g rice', '2 avocados, sliced'], method: '1. Cook rice according to packet\n2. Fry chicken 5-6 mins until golden\n3. Add peppers and onion, cook 4 mins\n4. Add seasoning and lime\n5. Serve over rice with avocado', notes: '' },
    { id: 3, name: 'Shepherds Pie', protein: 'beef', prepTime: '20 min', isQuick: false, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['1kg lamb mince', '2 onions, diced', '4 carrots, diced', '300g frozen peas', '600ml beef stock', '4 tbsp tomato puree', '1.6kg potatoes', '6 tbsp olive oil'], method: '1. Boil potatoes 15 mins, mash with olive oil\n2. Brown mince, add onion and carrots\n3. Add stock and puree, simmer 15 mins\n4. Add peas, transfer to dish\n5. Top with mash, bake 200°C 25 mins', notes: '' },
    { id: 4, name: 'Thai Red Curry', protein: 'chicken', prepTime: '10 min prep', isQuick: false, isSlowCooker: true, highCarb: true, tiktokUrl: '', ingredients: ['1.2kg chicken thighs, cubed', '6 tbsp red curry paste', '800ml coconut milk', '400g bamboo shoots', '2 red peppers, sliced', '4 tbsp fish sauce', '2 limes, juiced', '600g jasmine rice'], method: '1. Add chicken and curry paste to slow cooker\n2. Pour in coconut milk, add bamboo and pepper\n3. Cook on low 4-6 hrs\n4. Stir in fish sauce and lime\n5. Serve with jasmine rice', notes: '' },
    { id: 5, name: 'Crispy Cod with Asparagus Risotto', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['4 cod fillets', '600g arborio rice', '400g asparagus', '8 cloves garlic, minced', '200ml white wine', '1.6L veg stock', '4 tbsp olive oil'], method: '1. Heat oil, toast rice 2 mins\n2. Add wine, stir until absorbed\n3. Add stock gradually, stirring 18 mins\n4. Season cod, pan fry 4 mins each side\n5. Add asparagus to risotto last 3 mins\n6. Serve cod on risotto', notes: '' },
    { id: 6, name: 'Beef Ragu Pasta', protein: 'beef', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['1kg beef mince', '2 onions, diced', '6 cloves garlic, minced', '800g tinned tomatoes', '200ml red wine', '2 tsp italian herbs', '800g pasta'], method: '1. Brown mince, drain fat\n2. Add onion and garlic, cook 3 mins\n3. Add tomatoes, wine and herbs\n4. Simmer 15 mins\n5. Cook pasta, combine', notes: '' },
    { id: 7, name: 'Garlic Herb Roast Chicken', protein: 'chicken', prepTime: '10 min', isQuick: false, isSlowCooker: false, highCarb: false, tiktokUrl: '', ingredients: ['12 chicken thighs', '12 cloves garlic, minced', '4 sprigs rosemary', '8 sprigs thyme', '400g broccoli', '400g green beans', '1kg new potatoes', '6 tbsp olive oil'], method: '1. Mix garlic, herbs and oil, coat chicken\n2. Arrange chicken and potatoes on tray\n3. Roast 200°C 35 mins\n4. Add veg, roast 10 more mins', notes: '' },
    { id: 8, name: 'Korean Beef Noodles', protein: 'beef', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['1kg beef mince', '6 tbsp gochujang', '6 tbsp soy sauce', '2 tbsp sesame oil', '8 cloves garlic', '4cm ginger', '8 spring onions', '600g egg noodles', '2 cucumbers'], method: '1. Brown beef mince, drain\n2. Add gochujang, soy, sesame, garlic, ginger\n3. Cook 3 mins until sticky\n4. Cook noodles\n5. Serve beef over noodles with cucumber', notes: '' },
    { id: 9, name: 'Tuna Jacket Potatoes', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['8 large baking potatoes', '4 tins tuna', '2 tins sweetcorn', '8 tbsp dairy-free mayo', '8 spring onions'], method: '1. Microwave potatoes 10 mins each\n2. Mix tuna, sweetcorn, mayo, spring onions\n3. Split potatoes and fill', notes: '' },
    { id: 10, name: 'Peanut Thai Chicken Udon', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['800g chicken breast, sliced', '600g udon noodles', '6 tbsp peanut butter', '4 tbsp soy sauce', '2 limes', '2 tsp chilli flakes', '6 cloves garlic', '4 pak choi', '8 spring onions'], method: '1. Fry chicken 5-6 mins\n2. Mix peanut butter, soy, lime, chilli, water\n3. Cook noodles and pak choi\n4. Add sauce to chicken\n5. Serve over noodles', notes: '' },
    { id: 11, name: 'Honey Garlic Salmon', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['4 salmon fillets', '6 tbsp honey', '4 tbsp soy sauce', '6 cloves garlic', '2cm ginger', '600g jasmine rice', '400g broccoli'], method: '1. Cook rice\n2. Mix honey, soy, garlic, ginger\n3. Pan fry salmon 3 mins each side\n4. Add sauce, baste\n5. Steam broccoli\n6. Serve together', notes: '' },
    { id: 12, name: 'Prawn Stir Fry', protein: 'fish', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['800g king prawns', '600g stir fry veg', '6 cloves garlic', '4cm ginger', '6 tbsp soy sauce', '4 tbsp oyster sauce', '600g egg noodles'], method: '1. Cook noodles\n2. Fry prawns 2 mins each side\n3. Add garlic, ginger, veg\n4. Add sauces and noodles, toss', notes: '' },
    { id: 13, name: 'Chicken Gyros Bowl', protein: 'chicken', prepTime: '15 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['1kg chicken thighs, sliced', '2 tsp oregano', '2 tsp paprika', '2 tsp cumin', '6 cloves garlic', '8 pitta breads', '2 cucumbers', '400g cherry tomatoes', '400g hummus'], method: '1. Season chicken with spices\n2. Fry 6-8 mins\n3. Warm pittas\n4. Serve with cucumber, tomatoes, hummus', notes: '' },
    { id: 14, name: 'Teriyaki Chicken Bowls', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['1kg chicken thighs, cubed', '8 tbsp teriyaki sauce', '600g jasmine rice', '300g edamame', '2 cucumbers', '8 spring onions', '2 tbsp sesame seeds'], method: '1. Cook rice\n2. Fry chicken 6-8 mins\n3. Add teriyaki, cook 2 mins\n4. Cook edamame\n5. Assemble bowls', notes: '' },
    { id: 16, name: 'Sausage & Bean Casserole', protein: 'pork', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['16 pork sausages', '800g cannellini beans', '800g tinned tomatoes', '2 onions', '6 cloves garlic', '2 tsp smoked paprika', '8 slices crusty bread'], method: '1. Brown sausages 5 mins\n2. Fry onion and garlic\n3. Add beans, tomatoes, paprika\n4. Return sausages, simmer 15 mins\n5. Serve with bread', notes: '' },
    { id: 17, name: 'Chicken Burrito Bowls', protein: 'chicken', prepTime: '15 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['1kg chicken breast, sliced', '2 tsp cumin', '2 tsp paprika', '600g rice', '800g black beans', '400g sweetcorn', '4 avocados', '2 limes', '8 tbsp salsa'], method: '1. Season chicken, fry 6-8 mins\n2. Cook rice\n3. Warm beans and corn\n4. Assemble with avocado, lime, salsa', notes: '' },
    { id: 20, name: 'Ginger Soy Salmon Noodles', protein: 'fish', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, tiktokUrl: '', ingredients: ['4 salmon fillets', '6 tbsp soy sauce', '4cm ginger', '4 tbsp honey', '600g rice noodles', '4 pak choi', '8 spring onions', '2 limes'], method: '1. Mix soy, ginger, honey\n2. Cook noodles, add pak choi\n3. Fry salmon 3 mins each side\n4. Add glaze\n5. Serve on noodles', notes: '' }
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
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [movingFromDay, setMovingFromDay] = useState(null)
  const [showAddRecipe, setShowAddRecipe] = useState(false)
  const [copiedList, setCopiedList] = useState(false)
  const [filterProtein, setFilterProtein] = useState('all')
  const [savedPlan, setSavedPlan] = useState(true)
  const [loading, setLoading] = useState(true)
  const [newRecipe, setNewRecipe] = useState({ name: '', protein: 'chicken', prepTime: '', isQuick: true, isSlowCooker: false, highCarb: false, tiktokUrl: '', ingredients: '', method: '', notes: '' })

  const weekPlan = weekPlans[currentWeekOffset] || {}
  
  const needsHighCarb = (day) => {
    const dayIndex = days.indexOf(day)
    const nextDay = days[(dayIndex + 1) % 7]
    return bigSessions.includes(lauraSchedule[nextDay]) || bigSessions.includes(ashSchedule[nextDay])
  }

  const getPreviousDinner = (day) => {
    const dayIndex = days.indexOf(day)
    if (day === 'monday') {
      const prevWeekPlan = weekPlans[currentWeekOffset - 1] || {}
      const recipeId = prevWeekPlan['sunday']
      if (recipeId && recipeId !== 'eating-out') return recipes.find(r => r.id === recipeId)
      return null
    }
    const prevDay = days[dayIndex - 1]
    const recipeId = weekPlan[prevDay]
    if (recipeId && recipeId !== 'eating-out') return recipes.find(r => r.id === recipeId)
    return null
  }

  const getTodayKey = () => days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: recipesData } = await supabase.from('recipes').select('*')
        if (recipesData?.length > 0) {
          const merged = [...initialRecipes, ...recipesData.filter(r => !initialRecipes.some(ir => ir.id === r.id))]
          setRecipes(merged)
        }
        const { data: plansData } = await supabase.from('week_plans').select('*')
        if (plansData?.length > 0) {
          const plans = {}
          plansData.forEach(p => { plans[p.week_offset] = p.plan })
          setWeekPlans(plans)
        }
        const { data: trainingData } = await supabase.from('training').select('*')
        if (trainingData?.length > 0) {
          trainingData.forEach(tr => {
            if (tr.laura_default) setLauraSchedule(tr.laura_default)
            if (tr.ash_default) setAshSchedule(tr.ash_default)
          })
        }
      } catch (e) { console.log('Load error', e) }
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
    return { start: monday, end: sunday }
  }

  const getDayDate = (day, offset) => {
    const { start } = getWeekDates(offset)
    const dayIndex = days.indexOf(day)
    const date = new Date(start)
    date.setDate(start.getDate() + dayIndex)
    return date.getDate()
  }

  const formatDate = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  
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
    setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: { ...prev[currentWeekOffset], [fromDay]: toRecipe || null, [toDay]: fromRecipe } }))
    setMovingFromDay(null)
    setSavedPlan(false)
  }
  
  const updateDefaultSchedule = (person, day, workout) => {
    if (person === 'laura') setLauraSchedule(prev => ({ ...prev, [day]: workout }))
    else setAshSchedule(prev => ({ ...prev, [day]: workout }))
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
      alert('Failed to save')
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
    return Object.entries(items).map(([name, count]) => count > 1 ? `${name} (×${count})` : name)
  }

  const copyShoppingList = () => {
    const items = getShoppingList()
    const { start, end } = getWeekDates(currentWeekOffset)
    const meals = days.map(d => weekPlan[d] ? `${dayLabelsFull[d]}: ${recipes.find(r => r.id === weekPlan[d])?.name}` : null).filter(Boolean)
    navigator.clipboard.writeText(`Shopping List — ${formatDate(start)} to ${formatDate(end)}\n\n${items.map(i => `☐ ${i}`).join('\n')}\n\nMeals:\n${meals.join('\n')}`)
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
    setNewRecipe({ name: '', protein: 'chicken', prepTime: '', isQuick: true, isSlowCooker: false, highCarb: false, tiktokUrl: '', ingredients: '', method: '', notes: '' })
  }

  const deleteRecipe = async (id) => {
    try { await supabase.from('recipes').delete().eq('id', id) } catch (e) {}
    setRecipes(prev => prev.filter(r => r.id !== id))
    setViewingRecipe(null)
  }

  const updateRecipe = async (updatedRecipe) => {
    try { await supabase.from('recipes').upsert(updatedRecipe, { onConflict: 'id' }) } catch (e) {}
    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r))
    setEditingRecipe(null)
    setViewingRecipe(null)
  }

  const filteredRecipes = (filterProtein === 'all' ? recipes : recipes.filter(r => r.protein === filterProtein)).filter(r => !r.isEatingOut)
  const shoppingItems = getShoppingList()
  const today = getTodayKey()
  const todayDinner = weekPlan[today] ? recipes.find(r => r.id === weekPlan[today]) : null
  const todayLunch = getPreviousDinner(today)

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-stone-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-5 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight">What's for tea?</h1>
          {!savedPlan && (
            <button onClick={savePlan} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition">
              Save
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-stone-200 sticky top-[57px] z-40">
        <div className="max-w-xl mx-auto flex">
          {[
            { id: 'meals', label: 'This Week' },
            { id: 'training', label: 'Training' },
            { id: 'recipes', label: 'Recipes' },
            { id: 'list', label: 'Shopping' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id 
                  ? 'text-orange-500 border-orange-500' 
                  : 'text-stone-400 border-transparent hover:text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-5 py-6">
        {/* MEALS TAB */}
        {activeTab === 'meals' && (
          <>
            {/* Tonight Section */}
            <section className="mb-8">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Tonight</p>
              <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight mb-4">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long' })}
              </h2>

              {/* Training Pills */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1.5 bg-orange-50 rounded-full text-sm text-stone-600">
                  <span className="font-semibold">Laura</span> · {lauraSchedule[today]}
                </span>
                <span className="px-3 py-1.5 bg-orange-50 rounded-full text-sm text-stone-600">
                  <span className="font-semibold">Ash</span> · {ashSchedule[today]}
                </span>
              </div>

              {/* Tonight's Dinner Card */}
              <div 
                onClick={() => todayDinner && !todayDinner.isEatingOut ? setViewingRecipe(todayDinner) : setSelectedDay(today)}
                className={`rounded-2xl p-6 cursor-pointer transition ${
                  todayDinner 
                    ? 'bg-white border-2 border-orange-500 shadow-lg shadow-orange-500/10' 
                    : 'bg-white border-2 border-dashed border-stone-300'
                }`}
              >
                {todayDinner ? (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Dinner</p>
                        <h3 className="text-xl font-bold text-stone-800">{todayDinner.name}</h3>
                      </div>
                      <ChevronRight size={24} className="text-orange-500" />
                    </div>
                    <div className="flex gap-4 text-stone-500 text-sm mt-4">
                      <span className="flex items-center gap-1.5"><Clock size={16} /> {todayDinner.prepTime}</span>
                      <span className="flex items-center gap-1.5"><Users size={16} /> Serves 4</span>
                    </div>
                    {needsHighCarb(today) && (
                      <div className="mt-4 px-3 py-2 bg-amber-100 rounded-lg text-sm text-amber-700 font-medium">
                        Carb loading — big session tomorrow
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Plus size={28} className="text-stone-400 mx-auto mb-2" />
                    <p className="text-stone-500">Add tonight's meal</p>
                  </div>
                )}
              </div>

              {/* Lunch */}
              {todayLunch && (
                <div 
                  onClick={() => setViewingRecipe(todayLunch)} 
                  className="mt-3 p-4 bg-emerald-50 rounded-xl cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Lunch</p>
                    <p className="text-sm font-semibold text-stone-800 mt-0.5">
                      {todayLunch.name} <span className="font-normal text-stone-400">(leftover)</span>
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-emerald-500" />
                </div>
              )}
            </section>

            {/* Week Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-stone-800">
                  {currentWeekOffset === 0 ? 'This week' : currentWeekOffset === 1 ? 'Next week' : currentWeekOffset === -1 ? 'Last week' : `Week ${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset}`}
                </h3>
                <div className="flex gap-2">
                  <button onClick={generatePlan} className="px-3 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition">
                    Generate
                  </button>
                  <button onClick={() => setCurrentWeekOffset(o => o - 1)} className="w-9 h-9 border border-stone-200 rounded-lg bg-white flex items-center justify-center hover:bg-stone-50 transition">
                    <ChevronLeft size={18} className="text-stone-500" />
                  </button>
                  <button onClick={() => setCurrentWeekOffset(o => o + 1)} className="w-9 h-9 border border-stone-200 rounded-lg bg-white flex items-center justify-center hover:bg-stone-50 transition">
                    <ChevronRight size={18} className="text-stone-500" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {days.map(day => {
                  const recipeId = weekPlan[day]
                  const dinner = recipeId ? recipes.find(r => r.id === recipeId) : null
                  const isToday = day === today && currentWeekOffset === 0
                  const highCarb = needsHighCarb(day)

                  return (
                    <div 
                      key={day} 
                      className={`rounded-xl p-4 flex items-center gap-4 ${
                        isToday ? 'bg-orange-50 border border-orange-500' : 'bg-white border border-stone-200'
                      }`}
                    >
                      <div className="w-12 text-center">
                        <p className="text-xs text-stone-400 uppercase font-semibold">{dayLabels[day]}</p>
                        <p className={`text-xl font-bold ${isToday ? 'text-orange-500' : 'text-stone-800'}`}>
                          {getDayDate(day, currentWeekOffset)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        {dinner ? (
                          <div onClick={() => setViewingRecipe(dinner)} className="cursor-pointer">
                            <p className="font-semibold text-stone-800 truncate">{dinner.name}</p>
                            <p className="text-sm text-stone-400">{dinner.prepTime}</p>
                          </div>
                        ) : (
                          <button onClick={() => setSelectedDay(day)} className="text-stone-400 text-sm">
                            + Add meal
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {highCarb && (
                          <span className="px-2 py-1 bg-amber-100 rounded text-xs text-amber-700 font-semibold">Carbs</span>
                        )}
                        {dinner && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setMovingFromDay(day) }} 
                              className="w-8 h-8 border border-stone-200 rounded-lg bg-white flex items-center justify-center hover:bg-stone-50"
                            >
                              <ArrowLeftRight size={14} className="text-stone-400" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); clearDay(day) }} 
                              className="w-8 h-8 border border-stone-200 rounded-lg bg-white flex items-center justify-center hover:bg-stone-50"
                            >
                              <X size={14} className="text-stone-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {/* TRAINING TAB */}
        {activeTab === 'training' && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Training</h2>
              <p className="text-sm text-stone-500">Tap to edit. Big sessions trigger carb-loading the night before.</p>
            </div>
            {['laura', 'ash'].map(person => (
              <div key={person} className="mb-6">
                <h3 className="text-base font-bold text-stone-800 capitalize mb-3">{person}</h3>
                <div className="grid grid-cols-7 gap-1.5">
                  {days.map(day => {
                    const schedule = person === 'laura' ? lauraSchedule : ashSchedule
                    return (
                      <button 
                        key={day} 
                        onClick={() => setEditingWorkout({ person, day })} 
                        className="p-2.5 bg-white border border-stone-200 rounded-lg text-center hover:bg-stone-50 transition"
                      >
                        <p className="text-[10px] text-stone-400 uppercase font-semibold">{dayLabels[day]}</p>
                        <p className="text-xs text-stone-700 font-medium mt-1 truncate">{schedule[day].split(' ')[0]}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <section>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-stone-800">Recipes</h2>
              <button 
                onClick={() => setShowAddRecipe(true)} 
                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 hover:bg-orange-600 transition"
              >
                <Plus size={18} /> Add
              </button>
            </div>
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {['all', 'chicken', 'fish', 'beef', 'pork'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterProtein(p)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition ${
                    filterProtein === p 
                      ? 'bg-stone-800 text-white' 
                      : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {filteredRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => setViewingRecipe(recipe)}
                  className="bg-white border border-stone-200 rounded-xl p-4 cursor-pointer hover:border-stone-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-stone-800 mb-1.5">{recipe.name}</h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-orange-50 text-stone-600 capitalize">{recipe.protein}</span>
                        <span className="text-xs px-2.5 py-1 rounded-md bg-orange-50 text-stone-600">{recipe.prepTime}</span>
                        {recipe.isSlowCooker && <span className="text-xs px-2.5 py-1 rounded-md bg-amber-100 text-amber-700">Slow cooker</span>}
                      </div>
                    </div>
                    {recipe.tiktokUrl && <Play size={18} className="text-stone-400" />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SHOPPING TAB */}
        {activeTab === 'list' && (
          <section>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-2xl font-bold text-stone-800 mb-1">Shopping List</h2>
                <p className="text-sm text-stone-500">{shoppingItems.length} items</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCheckedItems({})} 
                  className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-500 hover:bg-stone-50 transition"
                >
                  Reset
                </button>
                <button 
                  onClick={copyShoppingList} 
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                    copiedList ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-white hover:bg-stone-700'
                  }`}
                >
                  {copiedList ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
            {shoppingItems.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <ShoppingBag size={36} className="mx-auto mb-3 opacity-40" />
                <p>Add meals to generate your list</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                {shoppingItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))}
                    className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition ${
                      i < shoppingItems.length - 1 ? 'border-b border-stone-100' : ''
                    } ${checkedItems[item] ? 'opacity-40' : ''}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                      checkedItems[item] ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300'
                    }`}>
                      {checkedItems[item] && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`text-stone-700 ${checkedItems[item] ? 'line-through' : ''}`}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* MODALS */}
      
      {/* Select Recipe Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-stone-800 mb-5">{dayLabelsFull[selectedDay]}</h2>
            <button 
              onClick={() => assignRecipe(selectedDay, 'eating-out')} 
              className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-left hover:bg-amber-100 transition"
            >
              <p className="font-semibold text-stone-800">Eating Out</p>
              <p className="text-sm text-stone-500 mt-1">No cooking tonight</p>
            </button>
            {recipes.filter(r => !r.isEatingOut).map(recipe => (
              <button 
                key={recipe.id} 
                onClick={() => assignRecipe(selectedDay, recipe.id)} 
                className="w-full p-4 bg-orange-50 rounded-xl mb-2 text-left hover:bg-orange-100 transition"
              >
                <p className="font-semibold text-stone-800">{recipe.name}</p>
                <p className="text-sm text-stone-500 mt-1">{recipe.protein} · {recipe.prepTime}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View Recipe Modal */}
      {viewingRecipe && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setViewingRecipe(null)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            {viewingRecipe.tiktokUrl && (
              <a 
                href={viewingRecipe.tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 p-4 bg-stone-800 rounded-xl mb-5 text-white font-semibold hover:bg-stone-700 transition"
              >
                <Play size={18} /> Watch on TikTok <ExternalLink size={14} />
              </a>
            )}
            <h2 className="text-2xl font-bold text-stone-800 mb-2">{viewingRecipe.name}</h2>
            <div className="flex gap-2 mb-6 flex-wrap">
              <span className="text-sm px-3 py-1.5 rounded-lg bg-orange-50 text-stone-600 capitalize">{viewingRecipe.protein}</span>
              <span className="text-sm px-3 py-1.5 rounded-lg bg-orange-50 text-stone-600">{viewingRecipe.prepTime}</span>
              <span className="text-sm px-3 py-1.5 rounded-lg bg-orange-50 text-stone-600">Serves 4</span>
            </div>
            {viewingRecipe.ingredients?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">Ingredients</h4>
                <ul className="text-stone-700 space-y-2 pl-5 list-disc">
                  {viewingRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
            )}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">Method</h4>
              <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{viewingRecipe.method}</p>
            </div>
            {viewingRecipe.notes && (
              <div className="p-4 bg-amber-50 rounded-xl mb-6 text-sm text-amber-700">
                <span className="font-semibold">Note:</span> {viewingRecipe.notes}
              </div>
            )}
            {!viewingRecipe.isEatingOut && (
              <div className="flex gap-2.5">
                <button 
                  onClick={() => setEditingRecipe({...viewingRecipe, ingredients: Array.isArray(viewingRecipe.ingredients) ? viewingRecipe.ingredients.join('\n') : viewingRecipe.ingredients})} 
                  className="flex-1 p-3.5 bg-orange-50 rounded-xl font-semibold text-stone-800 flex items-center justify-center gap-2 hover:bg-orange-100 transition"
                >
                  <Edit3 size={16} /> Edit
                </button>
                <button 
                  onClick={() => { if (window.confirm('Delete this recipe?')) deleteRecipe(viewingRecipe.id) }} 
                  className="p-3.5 bg-red-50 rounded-xl text-red-500 hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setEditingRecipe(null)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-stone-800 mb-5">Edit Recipe</h2>
            <div className="flex flex-col gap-3.5">
              <input 
                placeholder="Recipe name" 
                value={editingRecipe.name} 
                onChange={e => setEditingRecipe({ ...editingRecipe, name: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-orange-500 transition"
              />
              <input 
                placeholder="TikTok URL" 
                value={editingRecipe.tiktokUrl || ''} 
                onChange={e => setEditingRecipe({ ...editingRecipe, tiktokUrl: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-orange-500 transition"
              />
              <div className="flex gap-2.5">
                <select 
                  value={editingRecipe.protein} 
                  onChange={e => setEditingRecipe({ ...editingRecipe, protein: e.target.value })} 
                  className="flex-1 p-3.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="chicken">Chicken</option>
                  <option value="fish">Fish</option>
                  <option value="beef">Beef</option>
                  <option value="pork">Pork</option>
                </select>
                <input 
                  placeholder="Prep time" 
                  value={editingRecipe.prepTime} 
                  onChange={e => setEditingRecipe({ ...editingRecipe, prepTime: e.target.value })} 
                  className="flex-1 p-3.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
              <textarea 
                placeholder="Ingredients (one per line)" 
                rows={6} 
                value={editingRecipe.ingredients} 
                onChange={e => setEditingRecipe({ ...editingRecipe, ingredients: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 resize-none focus:outline-none focus:border-orange-500 transition"
              />
              <textarea 
                placeholder="Method" 
                rows={5} 
                value={editingRecipe.method} 
                onChange={e => setEditingRecipe({ ...editingRecipe, method: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 resize-none focus:outline-none focus:border-orange-500 transition"
              />
              <input 
                placeholder="Notes" 
                value={editingRecipe.notes || ''} 
                onChange={e => setEditingRecipe({ ...editingRecipe, notes: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-orange-500 transition"
              />
              <button 
                onClick={() => updateRecipe({ ...editingRecipe, ingredients: typeof editingRecipe.ingredients === 'string' ? editingRecipe.ingredients.split('\n').filter(i => i.trim()) : editingRecipe.ingredients })} 
                className="w-full p-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddRecipe && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setShowAddRecipe(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-stone-800 mb-5">Add Recipe</h2>
            <div className="flex flex-col gap-3.5">
              <input 
                placeholder="Recipe name" 
                value={newRecipe.name} 
                onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-orange-500 transition"
              />
              <input 
                placeholder="TikTok URL (optional)" 
                value={newRecipe.tiktokUrl} 
                onChange={e => setNewRecipe({ ...newRecipe, tiktokUrl: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-orange-500 transition"
              />
              <div className="flex gap-2.5">
                <select 
                  value={newRecipe.protein} 
                  onChange={e => setNewRecipe({ ...newRecipe, protein: e.target.value })} 
                  className="flex-1 p-3.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="chicken">Chicken</option>
                  <option value="fish">Fish</option>
                  <option value="beef">Beef</option>
                  <option value="pork">Pork</option>
                </select>
                <input 
                  placeholder="Prep time" 
                  value={newRecipe.prepTime} 
                  onChange={e => setNewRecipe({ ...newRecipe, prepTime: e.target.value })} 
                  className="flex-1 p-3.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
              <div className="flex gap-2.5 flex-wrap">
                <label className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer transition ${newRecipe.isQuick ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                  <input type="checkbox" checked={newRecipe.isQuick} onChange={e => setNewRecipe({ ...newRecipe, isQuick: e.target.checked })} className="hidden" />
                  Quick
                </label>
                <label className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer transition ${newRecipe.isSlowCooker ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
                  <input type="checkbox" checked={newRecipe.isSlowCooker} onChange={e => setNewRecipe({ ...newRecipe, isSlowCooker: e.target.checked })} className="hidden" />
                  Slow cooker
                </label>
                <label className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer transition ${newRecipe.highCarb ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
                  <input type="checkbox" checked={newRecipe.highCarb} onChange={e => setNewRecipe({ ...newRecipe, highCarb: e.target.checked })} className="hidden" />
                  High carb
                </label>
              </div>
              <textarea 
                placeholder="Ingredients (one per line)" 
                rows={6} 
                value={newRecipe.ingredients} 
                onChange={e => setNewRecipe({ ...newRecipe, ingredients: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 resize-none focus:outline-none focus:border-orange-500 transition"
              />
              <textarea 
                placeholder="Method" 
                rows={5} 
                value={newRecipe.method} 
                onChange={e => setNewRecipe({ ...newRecipe, method: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 resize-none focus:outline-none focus:border-orange-500 transition"
              />
              <input 
                placeholder="Notes" 
                value={newRecipe.notes} 
                onChange={e => setNewRecipe({ ...newRecipe, notes: e.target.value })} 
                className="w-full p-3.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-orange-500 transition"
              />
              <button 
                onClick={addRecipe} 
                disabled={!newRecipe.name || !newRecipe.ingredients} 
                className={`w-full p-4 bg-orange-500 text-white rounded-xl font-semibold transition ${(!newRecipe.name || !newRecipe.ingredients) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}`}
              >
                Add recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workout Modal */}
      {editingWorkout && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setEditingWorkout(null)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[70vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-stone-800 mb-5">
              {editingWorkout.person === 'laura' ? 'Laura' : 'Ash'} · {dayLabelsFull[editingWorkout.day]}
            </h2>
            {workoutOptions.map(w => {
              const current = editingWorkout.person === 'laura' ? lauraSchedule[editingWorkout.day] : ashSchedule[editingWorkout.day]
              const isSelected = current === w.label
              return (
                <button
                  key={w.label}
                  onClick={() => updateDefaultSchedule(editingWorkout.person, editingWorkout.day, w.label)}
                  className={`w-full p-3.5 rounded-xl mb-2 text-left flex justify-between items-center transition ${
                    isSelected ? 'bg-orange-100 border-2 border-orange-500' : 'bg-orange-50 hover:bg-orange-100'
                  }`}
                >
                  <span className={`${isSelected ? 'font-semibold' : ''} text-stone-800`}>{w.label}</span>
                  {w.intense && <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Carb loading</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Move Meal Modal */}
      {movingFromDay && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setMovingFromDay(null)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Move meal</h2>
            <p className="text-sm text-stone-500 mb-5">
              Moving <span className="font-semibold">{recipes.find(r => r.id === weekPlan[movingFromDay])?.name}</span>
            </p>
            {days.filter(d => d !== movingFromDay).map(day => {
              const targetMeal = weekPlan[day] ? recipes.find(r => r.id === weekPlan[day]) : null
              return (
                <button 
                  key={day} 
                  onClick={() => moveMeal(movingFromDay, day)} 
                  className="w-full p-3.5 bg-orange-50 rounded-xl mb-2 text-left flex justify-between items-center hover:bg-orange-100 transition"
                >
                  <div>
                    <p className="font-semibold text-stone-800">{dayLabelsFull[day]}</p>
                    <p className="text-sm text-stone-400">{targetMeal ? `Swap with ${targetMeal.name}` : 'Empty'}</p>
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
