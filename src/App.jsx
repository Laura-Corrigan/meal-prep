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
  const assignRecipe = (day, recipeId) => { setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: { ...prev[currentWeekOffset], [day]: recipeId } })); setSelectedDay(null); setSavedPlan(false) }
  const clearDay = (day) => { setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: { ...prev[currentWeekOffset], [day]: null } })); setSavedPlan(false) }
  const moveMeal = (fromDay, toDay) => { const fromRecipe = weekPlan[fromDay]; const toRecipe = weekPlan[toDay]; setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: { ...prev[currentWeekOffset], [fromDay]: toRecipe || null, [toDay]: fromRecipe } })); setMovingFromDay(null); setSavedPlan(false) }
  const updateDefaultSchedule = (person, day, workout) => { if (person === 'laura') setLauraSchedule(prev => ({ ...prev, [day]: workout })); else setAshSchedule(prev => ({ ...prev, [day]: workout })); setEditingWorkout(null); setSavedPlan(false) }

  const generatePlan = () => {
    const newPlan = {}; const used = new Set()
    days.forEach(day => {
      const highCarbNeeded = needsHighCarb(day); const isWeekend = day === 'saturday' || day === 'sunday'
      const redMeatCount = Object.values(newPlan).filter(id => { const r = recipes.find(rec => rec.id === id); return r && (r.protein === 'beef' || r.protein === 'pork') }).length
      let pool = recipes.filter(r => !used.has(r.id) && !r.isEatingOut)
      if (redMeatCount >= 1) pool = pool.filter(r => r.protein !== 'beef' && r.protein !== 'pork')
      const healthyPool = pool.filter(r => r.protein === 'chicken' || r.protein === 'fish')
      if (healthyPool.length > 0 && Math.random() < 0.7) pool = healthyPool
      if (!isWeekend) pool = pool.filter(r => r.isQuick)
      if (highCarbNeeded) { const hc = pool.filter(r => r.highCarb); if (hc.length > 0) pool = hc }
      if (pool.length > 0) { const recipe = pool[Math.floor(Math.random() * pool.length)]; newPlan[day] = recipe.id; used.add(recipe.id) }
    })
    setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: newPlan })); setSavedPlan(false)
  }

  const savePlan = async () => {
    try {
      await supabase.from('week_plans').upsert({ week_offset: currentWeekOffset, plan: weekPlan, updated_at: new Date().toISOString() }, { onConflict: 'week_offset' })
      await supabase.from('training').upsert({ week_offset: 0, laura_default: lauraSchedule, ash_default: ashSchedule, updated_at: new Date().toISOString() }, { onConflict: 'week_offset' })
      setSavedPlan(true)
    } catch (e) { alert('Failed to save') }
  }

  const getShoppingList = () => {
    const items = {}
    Object.values(weekPlan).forEach(id => { const recipe = recipes.find(r => r.id === id); if (recipe && !recipe.isEatingOut) { recipe.ingredients.forEach(ing => { items[ing] = (items[ing] || 0) + 1 }) } })
    return Object.entries(items).map(([name, count]) => count > 1 ? `${name} (×${count})` : name)
  }

  const copyShoppingList = () => {
    const items = getShoppingList()
    const { start, end } = getWeekDates(currentWeekOffset)
    const meals = days.map(d => weekPlan[d] ? `${dayLabelsFull[d]}: ${recipes.find(r => r.id === weekPlan[d])?.name}` : null).filter(Boolean)
    navigator.clipboard.writeText(`Shopping List — ${formatDate(start)} to ${formatDate(end)}\n\n${items.map(i => `☐ ${i}`).join('\n')}\n\nMeals:\n${meals.join('\n')}`)
    setCopiedList(true); setTimeout(() => setCopiedList(false), 2000)
  }

  const addRecipe = async () => {
    const recipe = { id: Date.now(), ...newRecipe, ingredients: newRecipe.ingredients.split('\n').filter(i => i.trim()) }
    try { await supabase.from('recipes').insert(recipe); setRecipes(prev => [...prev, recipe]) } catch (e) { setRecipes(prev => [...prev, recipe]) }
    setShowAddRecipe(false); setNewRecipe({ name: '', protein: 'chicken', prepTime: '', isQuick: true, isSlowCooker: false, highCarb: false, tiktokUrl: '', ingredients: '', method: '', notes: '' })
  }

  const deleteRecipe = async (id) => { try { await supabase.from('recipes').delete().eq('id', id) } catch (e) {}; setRecipes(prev => prev.filter(r => r.id !== id)); setViewingRecipe(null) }
  const updateRecipe = async (updatedRecipe) => { try { await supabase.from('recipes').upsert(updatedRecipe, { onConflict: 'id' }) } catch (e) {}; setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r)); setEditingRecipe(null); setViewingRecipe(null) }

  const filteredRecipes = (filterProtein === 'all' ? recipes : recipes.filter(r => r.protein === filterProtein)).filter(r => !r.isEatingOut)
  const shoppingItems = getShoppingList()
  const today = getTodayKey()
  const todayDinner = weekPlan[today] ? recipes.find(r => r.id === weekPlan[today]) : null
  const todayLunch = getPreviousDinner(today)

  const theme = {
    bg: '#FFFBF7',
    card: '#FFFFFF',
    cardAlt: '#FFF8F3',
    border: '#F0E6DC',
    text: '#2D2A26',
    textSecondary: '#6B645B',
    textMuted: '#9E9689',
    accent: '#E85D40',
    accentLight: '#FFF0EB',
    success: '#4A9B7F',
    successLight: '#E8F5EF',
    warning: '#D4920A',
    warningLight: '#FEF7E6',
  }

  const inputStyle = { width: '100%', padding: '14px 16px', border: `1px solid ${theme.border}`, borderRadius: 12, fontSize: 15, background: theme.card, color: theme.text, boxSizing: 'border-box' }
  const btnPrimary = { padding: '14px 24px', background: theme.accent, color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 15, width: '100%' }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ color: theme.textMuted }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: theme.text, letterSpacing: '-0.5px' }}>What's for tea?</h1>
          {!savedPlan && <button onClick={savePlan} style={{ padding: '10px 18px', background: theme.accent, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Save</button>}
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ background: theme.card, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex' }}>
          {[{ id: 'meals', label: 'This Week' }, { id: 'training', label: 'Training' }, { id: 'recipes', label: 'Recipes' }, { id: 'list', label: 'Shopping' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '16px 12px', border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: activeTab === tab.id ? theme.accent : theme.textMuted, borderBottom: `3px solid ${activeTab === tab.id ? theme.accent : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        {/* MEALS TAB */}
        {activeTab === 'meals' && (
          <>
            {/* Tonight */}
            <section style={{ marginBottom: 32 }}>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tonight</p>
              <h2 style={{ margin: '0 0 16px', fontSize: 32, fontWeight: 800, color: theme.text, letterSpacing: '-1px', lineHeight: 1.1 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long' })}
              </h2>

              {/* Training chips */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ padding: '8px 14px', background: theme.cardAlt, borderRadius: 20, fontSize: 13, color: theme.textSecondary }}>
                  <strong>Laura</strong> · {lauraSchedule[today]}
                </span>
                <span style={{ padding: '8px 14px', background: theme.cardAlt, borderRadius: 20, fontSize: 13, color: theme.textSecondary }}>
                  <strong>Ash</strong> · {ashSchedule[today]}
                </span>
              </div>

              {/* Tonight's dinner card */}
              <div 
                onClick={() => todayDinner && !todayDinner.isEatingOut ? setViewingRecipe(todayDinner) : setSelectedDay(today)}
                style={{ 
                  background: todayDinner ? theme.card : theme.card,
                  borderRadius: 20, 
                  padding: 24,
                  cursor: 'pointer',
                  border: todayDinner ? `2px solid ${theme.accent}` : `2px dashed ${theme.border}`,
                  boxShadow: todayDinner ? '0 4px 20px rgba(232, 93, 64, 0.12)' : 'none'
                }}
              >
                {todayDinner ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dinner</p>
                        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: theme.text, letterSpacing: '-0.5px' }}>{todayDinner.name}</h3>
                      </div>
                      <ChevronRight size={24} color={theme.accent} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: theme.textSecondary, fontSize: 14, marginTop: 16 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> {todayDinner.prepTime}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={16} /> Serves 4</span>
                    </div>
                    {needsHighCarb(today) && (
                      <div style={{ marginTop: 16, padding: '10px 14px', background: theme.warningLight, borderRadius: 10, fontSize: 13, color: theme.warning, fontWeight: 500 }}>
                        Carb loading — big session tomorrow
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Plus size={28} color={theme.textMuted} style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, color: theme.textSecondary, fontSize: 16 }}>Add tonight's meal</p>
                  </div>
                )}
              </div>

              {/* Lunch */}
              {todayLunch && (
                <div onClick={() => setViewingRecipe(todayLunch)} style={{ marginTop: 12, padding: '16px 20px', background: theme.successLight, borderRadius: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: theme.success, textTransform: 'uppercase' }}>Lunch</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: theme.text }}>{todayLunch.name} <span style={{ fontWeight: 400, color: theme.textMuted }}>(leftover)</span></p>
                  </div>
                  <ChevronRight size={18} color={theme.success} />
                </div>
              )}
            </section>

            {/* Week */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.text }}>
                  {currentWeekOffset === 0 ? 'This week' : currentWeekOffset === 1 ? 'Next week' : currentWeekOffset === -1 ? 'Last week' : `Week ${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset}`}
                </h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={generatePlan} style={{ padding: '10px 14px', background: theme.accent, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Generate</button>
                  <button onClick={() => setCurrentWeekOffset(o => o - 1)} style={{ width: 36, height: 36, border: `1px solid ${theme.border}`, borderRadius: 10, background: theme.card, cursor: 'pointer' }}><ChevronLeft size={18} color={theme.textSecondary} /></button>
                  <button onClick={() => setCurrentWeekOffset(o => o + 1)} style={{ width: 36, height: 36, border: `1px solid ${theme.border}`, borderRadius: 10, background: theme.card, cursor: 'pointer' }}><ChevronRight size={18} color={theme.textSecondary} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {days.map(day => {
                  const recipeId = weekPlan[day]; const dinner = recipeId ? recipes.find(r => r.id === recipeId) : null
                  const isToday = day === today && currentWeekOffset === 0; const highCarb = needsHighCarb(day)
                  return (
                    <div key={day} style={{ background: isToday ? theme.accentLight : theme.card, borderRadius: 14, padding: '14px 16px', border: `1px solid ${isToday ? theme.accent : theme.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{dayLabels[day]}</p>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: isToday ? theme.accent : theme.text }}>{getDayDate(day, currentWeekOffset)}</p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {dinner ? (
                          <div onClick={() => setViewingRecipe(dinner)} style={{ cursor: 'pointer' }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dinner.name}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 13, color: theme.textMuted }}>{dinner.prepTime}</p>
                          </div>
                        ) : (
                          <button onClick={() => setSelectedDay(day)} style={{ background: 'none', border: 'none', padding: 0, color: theme.textMuted, fontSize: 14, cursor: 'pointer' }}>+ Add meal</button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {highCarb && <span style={{ padding: '4px 8px', background: theme.warningLight, borderRadius: 6, fontSize: 11, color: theme.warning, fontWeight: 600 }}>Carbs</span>}
                        {dinner && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); setMovingFromDay(day) }} style={{ width: 28, height: 28, border: `1px solid ${theme.border}`, borderRadius: 6, background: theme.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeftRight size={14} color={theme.textMuted} /></button>
                            <button onClick={(e) => { e.stopPropagation(); clearDay(day) }} style={{ width: 28, height: 28, border: `1px solid ${theme.border}`, borderRadius: 6, background: theme.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color={theme.textMuted} /></button>
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
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: theme.text }}>Training</h2>
              <p style={{ margin: 0, fontSize: 14, color: theme.textSecondary }}>Tap to edit. Big sessions trigger carb-loading the night before.</p>
            </div>
            {['laura', 'ash'].map(person => (
              <div key={person} style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: theme.text, textTransform: 'capitalize' }}>{person}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {days.map(day => {
                    const schedule = person === 'laura' ? lauraSchedule : ashSchedule
                    return (
                      <button key={day} onClick={() => setEditingWorkout({ person, day })} style={{ padding: 10, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, color: theme.textMuted, textTransform: 'uppercase' }}>{dayLabels[day]}</p>
                        <p style={{ margin: 0, fontSize: 11, color: theme.text, fontWeight: 500 }}>{schedule[day].split(' ')[0]}</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: theme.text }}>Recipes</h2>
              <button onClick={() => setShowAddRecipe(true)} style={{ padding: '10px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={18} /> Add</button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
              {['all', 'chicken', 'fish', 'beef', 'pork'].map(p => (
                <button key={p} onClick={() => setFilterProtein(p)} style={{ padding: '10px 16px', background: filterProtein === p ? theme.text : theme.card, color: filterProtein === p ? 'white' : theme.textSecondary, border: filterProtein === p ? 'none' : `1px solid ${theme.border}`, borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{p}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredRecipes.map(recipe => (
                <div key={recipe.id} onClick={() => setViewingRecipe(recipe)} style={{ background: theme.card, borderRadius: 14, padding: 16, border: `1px solid ${theme.border}`, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: theme.text }}>{recipe.name}</h4>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: theme.cardAlt, color: theme.textSecondary, textTransform: 'capitalize' }}>{recipe.protein}</span>
                        <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: theme.cardAlt, color: theme.textSecondary }}>{recipe.prepTime}</span>
                        {recipe.isSlowCooker && <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: theme.warningLight, color: theme.warning }}>Slow cooker</span>}
                      </div>
                    </div>
                    {recipe.tiktokUrl && <Play size={18} color={theme.textMuted} />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SHOPPING TAB */}
        {activeTab === 'list' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: theme.text }}>Shopping List</h2>
                <p style={{ margin: 0, fontSize: 14, color: theme.textSecondary }}>{shoppingItems.length} items</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setCheckedItems({})} style={{ padding: '10px 14px', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, color: theme.textSecondary }}>Reset</button>
                <button onClick={copyShoppingList} style={{ padding: '10px 14px', background: copiedList ? theme.success : theme.text, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {copiedList ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
            {shoppingItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: theme.textMuted }}>
                <ShoppingBag size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: 15 }}>Add meals to generate your list</p>
              </div>
            ) : (
              <div style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}` }}>
                {shoppingItems.map((item, i) => (
                  <div key={i} onClick={() => setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < shoppingItems.length - 1 ? `1px solid ${theme.border}` : 'none', cursor: 'pointer', opacity: checkedItems[item] ? 0.4 : 1 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checkedItems[item] ? theme.success : theme.border}`, background: checkedItems[item] ? theme.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {checkedItems[item] && <Check size={14} color="white" />}
                    </div>
                    <span style={{ fontSize: 15, color: theme.text, textDecoration: checkedItems[item] ? 'line-through' : 'none' }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* MODALS */}
      {selectedDay && (
        <div onClick={() => setSelectedDay(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.card, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, maxHeight: '80vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: theme.text }}>{dayLabelsFull[selectedDay]}</h2>
            <button onClick={() => assignRecipe(selectedDay, 'eating-out')} style={{ width: '100%', padding: 18, background: theme.warningLight, border: 'none', borderRadius: 14, marginBottom: 16, cursor: 'pointer', textAlign: 'left' }}>
              <p style={{ margin: 0, fontWeight: 600, color: theme.text }}>Eating Out</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textMuted }}>No cooking tonight</p>
            </button>
            {recipes.filter(r => !r.isEatingOut).map(recipe => (
              <button key={recipe.id} onClick={() => assignRecipe(selectedDay, recipe.id)} style={{ width: '100%', padding: 16, background: theme.cardAlt, border: 'none', borderRadius: 12, marginBottom: 8, cursor: 'pointer', textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 600, color: theme.text }}>{recipe.name}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textMuted }}>{recipe.protein} · {recipe.prepTime}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewingRecipe && (
        <div onClick={() => setViewingRecipe(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.card, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
            {viewingRecipe.tiktokUrl && (
              <a href={viewingRecipe.tiktokUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, background: theme.text, borderRadius: 14, marginBottom: 20, color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
                <Play size={18} /> Watch on TikTok <ExternalLink size={14} />
              </a>
            )}
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: theme.text }}>{viewingRecipe.name}</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8, background: theme.cardAlt, color: theme.textSecondary, textTransform: 'capitalize' }}>{viewingRecipe.protein}</span>
              <span style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8, background: theme.cardAlt, color: theme.textSecondary }}>{viewingRecipe.prepTime}</span>
              <span style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8, background: theme.cardAlt, color: theme.textSecondary }}>Serves 4</span>
            </div>
            {viewingRecipe.ingredients?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ingredients</h4>
                <ul style={{ margin: 0, paddingLeft: 20, color: theme.text }}>
                  {viewingRecipe.ingredients.map((ing, i) => <li key={i} style={{ marginBottom: 8, fontSize: 15 }}>{ing}</li>)}
                </ul>
              </div>
            )}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Method</h4>
              <p style={{ margin: 0, color: theme.text, fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{viewingRecipe.method}</p>
            </div>
            {viewingRecipe.notes && <div style={{ padding: 16, background: theme.warningLight, borderRadius: 12, marginBottom: 24, fontSize: 14, color: theme.warning }}><strong>Note:</strong> {viewingRecipe.notes}</div>}
            {!viewingRecipe.isEatingOut && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditingRecipe({...viewingRecipe, ingredients: Array.isArray(viewingRecipe.ingredients) ? viewingRecipe.ingredients.join('\n') : viewingRecipe.ingredients})} style={{ flex: 1, padding: 14, background: theme.cardAlt, border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Edit3 size={16} /> Edit</button>
                <button onClick={() => { if (window.confirm('Delete this recipe?')) deleteRecipe(viewingRecipe.id) }} style={{ padding: 14, background: theme.accentLight, border: 'none', borderRadius: 12, cursor: 'pointer', color: theme.accent }}><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {editingRecipe && (
        <div onClick={() => setEditingRecipe(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.card, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: theme.text }}>Edit Recipe</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Recipe name" value={editingRecipe.name} onChange={e => setEditingRecipe({ ...editingRecipe, name: e.target.value })} style={inputStyle} />
              <input placeholder="TikTok URL" value={editingRecipe.tiktokUrl || ''} onChange={e => setEditingRecipe({ ...editingRecipe, tiktokUrl: e.target.value })} style={inputStyle} />
              <div style={{ display: 'flex', gap: 10 }}>
                <select value={editingRecipe.protein} onChange={e => setEditingRecipe({ ...editingRecipe, protein: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                  <option value="chicken">Chicken</option><option value="fish">Fish</option><option value="beef">Beef</option><option value="pork">Pork</option>
                </select>
                <input placeholder="Prep time" value={editingRecipe.prepTime} onChange={e => setEditingRecipe({ ...editingRecipe, prepTime: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              </div>
              <textarea placeholder="Ingredients (one per line)" rows={6} value={editingRecipe.ingredients} onChange={e => setEditingRecipe({ ...editingRecipe, ingredients: e.target.value })} style={{ ...inputStyle, resize: 'none' }} />
              <textarea placeholder="Method" rows={5} value={editingRecipe.method} onChange={e => setEditingRecipe({ ...editingRecipe, method: e.target.value })} style={{ ...inputStyle, resize: 'none' }} />
              <input placeholder="Notes" value={editingRecipe.notes || ''} onChange={e => setEditingRecipe({ ...editingRecipe, notes: e.target.value })} style={inputStyle} />
              <button onClick={() => updateRecipe({ ...editingRecipe, ingredients: typeof editingRecipe.ingredients === 'string' ? editingRecipe.ingredients.split('\n').filter(i => i.trim()) : editingRecipe.ingredients })} style={btnPrimary}>Save changes</button>
            </div>
          </div>
        </div>
      )}

      {showAddRecipe && (
        <div onClick={() => setShowAddRecipe(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.card, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: theme.text }}>Add Recipe</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Recipe name" value={newRecipe.name} onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })} style={inputStyle} />
              <input placeholder="TikTok URL (optional)" value={newRecipe.tiktokUrl} onChange={e => setNewRecipe({ ...newRecipe, tiktokUrl: e.target.value })} style={inputStyle} />
              <div style={{ display: 'flex', gap: 10 }}>
                <select value={newRecipe.protein} onChange={e => setNewRecipe({ ...newRecipe, protein: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                  <option value="chicken">Chicken</option><option value="fish">Fish</option><option value="beef">Beef</option><option value="pork">Pork</option>
                </select>
                <input placeholder="Prep time" value={newRecipe.prepTime} onChange={e => setNewRecipe({ ...newRecipe, prepTime: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: theme.textSecondary, padding: '8px 12px', background: newRecipe.isQuick ? theme.successLight : theme.cardAlt, borderRadius: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newRecipe.isQuick} onChange={e => setNewRecipe({ ...newRecipe, isQuick: e.target.checked })} /> Quick
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: theme.textSecondary, padding: '8px 12px', background: newRecipe.isSlowCooker ? theme.warningLight : theme.cardAlt, borderRadius: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newRecipe.isSlowCooker} onChange={e => setNewRecipe({ ...newRecipe, isSlowCooker: e.target.checked })} /> Slow cooker
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: theme.textSecondary, padding: '8px 12px', background: newRecipe.highCarb ? theme.warningLight : theme.cardAlt, borderRadius: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newRecipe.highCarb} onChange={e => setNewRecipe({ ...newRecipe, highCarb: e.target.checked })} /> High carb
                </label>
              </div>
              <textarea placeholder="Ingredients (one per line)" rows={6} value={newRecipe.ingredients} onChange={e => setNewRecipe({ ...newRecipe, ingredients: e.target.value })} style={{ ...inputStyle, resize: 'none' }} />
              <textarea placeholder="Method" rows={5} value={newRecipe.method} onChange={e => setNewRecipe({ ...newRecipe, method: e.target.value })} style={{ ...inputStyle, resize: 'none' }} />
              <input placeholder="Notes" value={newRecipe.notes} onChange={e => setNewRecipe({ ...newRecipe, notes: e.target.value })} style={inputStyle} />
              <button onClick={addRecipe} disabled={!newRecipe.name || !newRecipe.ingredients} style={{ ...btnPrimary, opacity: (!newRecipe.name || !newRecipe.ingredients) ? 0.5 : 1 }}>Add recipe</button>
            </div>
          </div>
        </div>
      )}

      {editingWorkout && (
        <div onClick={() => setEditingWorkout(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.card, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 400, maxHeight: '70vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: theme.text }}>{editingWorkout.person === 'laura' ? 'Laura' : 'Ash'} · {dayLabelsFull[editingWorkout.day]}</h2>
            {workoutOptions.map(w => {
              const current = editingWorkout.person === 'laura' ? lauraSchedule[editingWorkout.day] : ashSchedule[editingWorkout.day]
              const isSelected = current === w.label
              return (
                <button key={w.label} onClick={() => updateDefaultSchedule(editingWorkout.person, editingWorkout.day, w.label)} style={{ width: '100%', padding: 14, background: isSelected ? theme.accentLight : theme.cardAlt, border: isSelected ? `2px solid ${theme.accent}` : 'none', borderRadius: 12, marginBottom: 8, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: isSelected ? 600 : 400, color: theme.text }}>{w.label}</span>
                  {w.intense && <span style={{ fontSize: 11, padding: '2px 8px', background: theme.warningLight, color: theme.warning, borderRadius: 4 }}>Carb loading</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {movingFromDay && (
        <div onClick={() => setMovingFromDay(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.card, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 400, padding: 24 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: theme.text }}>Move meal</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: theme.textSecondary }}>Moving <strong>{recipes.find(r => r.id === weekPlan[movingFromDay])?.name}</strong></p>
            {days.filter(d => d !== movingFromDay).map(day => {
              const targetMeal = weekPlan[day] ? recipes.find(r => r.id === weekPlan[day]) : null
              return (
                <button key={day} onClick={() => moveMeal(movingFromDay, day)} style={{ width: '100%', padding: 14, background: theme.cardAlt, border: 'none', borderRadius: 12, marginBottom: 8, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: theme.text }}>{dayLabelsFull[day]}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: theme.textMuted }}>{targetMeal ? `Swap with ${targetMeal.name}` : 'Empty'}</p>
                  </div>
                  <ChevronRight size={18} color={theme.textMuted} />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
