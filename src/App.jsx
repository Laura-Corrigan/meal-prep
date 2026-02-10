import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function App() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const defaultTraining = {
    monday: { label: 'Rest Day', icon: '😴', highCarb: false },
    tuesday: { label: 'Reformer Pilates', icon: '🧘‍♀️', highCarb: false },
    wednesday: { label: 'Tempo Run', icon: '🏃‍♀️', highCarb: false },
    thursday: { label: 'Rest Day', icon: '😴', highCarb: false },
    friday: { label: 'Pilates + Easy Run', icon: '🧘‍♀️🏃‍♀️', highCarb: true, note: 'High carb for Saturday long run' },
    saturday: { label: 'Long Run', icon: '🏃‍♀️💪', highCarb: false },
    sunday: { label: 'Rest Day', icon: '😴', highCarb: false }
  }

  const workoutOptions = [
    { label: 'Rest Day', icon: '😴' },
    { label: 'Reformer Pilates', icon: '🧘‍♀️' },
    { label: 'Tempo Run', icon: '🏃‍♀️' },
    { label: 'Easy Run', icon: '🏃‍♀️' },
    { label: 'Long Run', icon: '🏃‍♀️💪' },
    { label: 'Pilates + Easy Run', icon: '🧘‍♀️🏃‍♀️' },
    { label: 'Strength', icon: '💪' },
    { label: 'HIIT', icon: '🔥' },
    { label: 'Swimming', icon: '🏊‍♀️' }
  ]

  const initialRecipes = [
    { id: 'eating-out', name: 'Eating Out 🍽️', protein: 'none', prepTime: '0 min', isQuick: true, isSlowCooker: false, highCarb: false, ingredients: [], method: 'Enjoy your meal out!', notes: 'No cooking tonight', isEatingOut: true },
    { id: 1, name: 'Slowcooker Mexican Pulled Beef Tacos', protein: 'beef', prepTime: '15 min', isQuick: false, isSlowCooker: true, highCarb: true, source: 'tiktok', ingredients: ['beef brisket', 'chipotle paste', 'cumin', 'smoked paprika', 'garlic', 'beef stock', 'lime', 'corn tortillas', 'red onion', 'coriander'], method: '1. Season beef\n2. Slow cook 6-8 hrs\n3. Shred and serve', notes: 'Add cheese separately for Ash' },
    { id: 2, name: 'Chicken & Pepper Naked Fajitas', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: false, source: 'homemade', ingredients: ['chicken breast', 'mixed peppers', 'onion', 'fajita seasoning', 'lime', 'rice', 'avocado'], method: '1. Slice chicken and veg\n2. Cook chicken\n3. Add peppers\n4. Serve with rice', notes: 'Add cheese on the side' },
    { id: 3, name: 'Shepherds Pie', protein: 'beef', prepTime: '20 min', isQuick: false, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['lamb mince', 'onion', 'carrots', 'peas', 'beef stock', 'tomato puree', 'potatoes', 'olive oil'], method: '1. Brown mince\n2. Add veg and stock\n3. Top with mash\n4. Bake', notes: 'Use olive oil in mash for dairy-free' },
    { id: 4, name: 'Slowcooker Red Thai Curry', protein: 'chicken', prepTime: '10 min', isQuick: false, isSlowCooker: true, highCarb: true, source: 'tiktok', ingredients: ['chicken thighs', 'red curry paste', 'coconut milk', 'bamboo shoots', 'red pepper', 'fish sauce', 'lime', 'jasmine rice'], method: '1. Add chicken and paste to slow cooker\n2. Add coconut milk and veg\n3. Cook 4-6 hrs\n4. Serve with rice', notes: 'Naturally dairy-free' },
    { id: 5, name: 'Crispy Cod with Garlic Asparagus Risotto', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'tiktok', ingredients: ['cod fillets', 'arborio rice', 'asparagus', 'garlic', 'white wine', 'veg stock', 'lemon', 'olive oil'], method: '1. Start risotto\n2. Pan fry cod\n3. Add asparagus\n4. Finish with lemon', notes: 'Skip parmesan or add separately' },
    { id: 6, name: 'Quick Beef Ragu with Pasta', protein: 'beef', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['beef mince', 'onion', 'garlic', 'tinned tomatoes', 'red wine', 'italian herbs', 'pasta'], method: '1. Brown mince\n2. Add tomatoes and wine\n3. Simmer\n4. Serve with pasta', notes: 'Add parmesan separately' },
    { id: 7, name: 'Garlic Herb Roasted Chicken', protein: 'chicken', prepTime: '10 min', isQuick: false, isSlowCooker: false, highCarb: false, source: 'homemade', ingredients: ['chicken thighs', 'garlic', 'rosemary', 'thyme', 'lemon', 'broccoli', 'green beans', 'new potatoes'], method: '1. Marinate chicken\n2. Roast 45 mins\n3. Steam greens\n4. Serve', notes: 'Great weekend meal' },
    { id: 8, name: 'Korean Beef Noodles', protein: 'beef', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'tiktok', ingredients: ['beef mince', 'gochujang', 'soy sauce', 'sesame oil', 'garlic', 'ginger', 'spring onions', 'egg noodles', 'cucumber'], method: '1. Brown beef\n2. Add sauce ingredients\n3. Cook noodles\n4. Combine and top', notes: 'Naturally dairy-free' },
    { id: 9, name: 'Tuna Sweetcorn Jacket Potato', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['baking potatoes', 'tinned tuna', 'sweetcorn', 'dairy-free mayo', 'spring onions', 'lemon'], method: '1. Bake potatoes\n2. Mix tuna filling\n3. Fill and serve', notes: 'Use dairy-free mayo' },
    { id: 10, name: 'Peanut Butter Thai Chicken Udon', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'tiktok', ingredients: ['chicken breast', 'udon noodles', 'peanut butter', 'soy sauce', 'lime', 'chilli', 'garlic', 'pak choi', 'spring onions'], method: '1. Cook chicken\n2. Make peanut sauce\n3. Cook noodles and pak choi\n4. Combine', notes: 'Naturally dairy-free' },
    { id: 11, name: 'Honey Garlic Salmon with Rice', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['salmon fillets', 'honey', 'soy sauce', 'garlic', 'ginger', 'jasmine rice', 'broccoli'], method: '1. Make glaze\n2. Pan fry salmon\n3. Serve with rice and broccoli', notes: 'Naturally dairy-free' },
    { id: 12, name: 'Prawn Stir Fry', protein: 'fish', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['king prawns', 'stir fry veg', 'garlic', 'ginger', 'soy sauce', 'oyster sauce', 'egg noodles'], method: '1. Cook noodles\n2. Stir fry prawns\n3. Add veg and sauce\n4. Toss with noodles', notes: 'Super quick midweek meal' },
    { id: 13, name: 'Chicken Gyros Bowl', protein: 'chicken', prepTime: '15 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['chicken thighs', 'oregano', 'paprika', 'cumin', 'garlic', 'lemon', 'pitta', 'cucumber', 'tomatoes', 'hummus'], method: '1. Marinate and grill chicken\n2. Warm pitta\n3. Assemble bowl', notes: 'Hummus instead of tzatziki' },
    { id: 14, name: 'Teriyaki Chicken Rice Bowls', protein: 'chicken', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['chicken thighs', 'teriyaki sauce', 'jasmine rice', 'edamame', 'cucumber', 'spring onions'], method: '1. Cook rice\n2. Pan fry chicken with teriyaki\n3. Assemble bowls', notes: 'Great for meal prep' },
    { id: 15, name: 'Lemon Herb Baked Cod', protein: 'fish', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['cod fillets', 'baby potatoes', 'cherry tomatoes', 'olives', 'capers', 'lemon', 'garlic'], method: '1. Roast potatoes\n2. Add cod and veg\n3. Bake 10 more mins', notes: 'One tray meal' },
    { id: 16, name: 'Sausage & Bean Casserole', protein: 'pork', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['pork sausages', 'cannellini beans', 'tinned tomatoes', 'onion', 'garlic', 'smoked paprika', 'crusty bread'], method: '1. Brown sausages\n2. Add beans and tomatoes\n3. Simmer\n4. Serve with bread', notes: 'Check sausages are dairy-free' },
    { id: 17, name: 'Chicken Burrito Bowls', protein: 'chicken', prepTime: '15 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['chicken breast', 'cumin', 'paprika', 'rice', 'black beans', 'sweetcorn', 'avocado', 'lime', 'salsa'], method: '1. Season and cook chicken\n2. Cook rice\n3. Assemble bowls', notes: 'Add cheese on yours separately' },
    { id: 18, name: 'Mediterranean Tuna Pasta', protein: 'fish', prepTime: '5 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['pasta', 'tinned tuna', 'cherry tomatoes', 'olives', 'capers', 'garlic', 'olive oil', 'rocket'], method: '1. Cook pasta\n2. Warm oil with garlic\n3. Add tuna and veg\n4. Toss with pasta', notes: 'Quick storecupboard meal' },
    { id: 19, name: 'Slowcooker Chicken Cacciatore', protein: 'chicken', prepTime: '15 min', isQuick: false, isSlowCooker: true, highCarb: true, source: 'homemade', ingredients: ['chicken thighs', 'tinned tomatoes', 'peppers', 'onion', 'garlic', 'olives', 'white wine', 'italian herbs', 'pasta'], method: '1. Add everything to slow cooker\n2. Cook 4-6 hrs\n3. Serve with pasta', notes: 'Italian comfort food' },
    { id: 20, name: 'Ginger Soy Glazed Salmon Noodles', protein: 'fish', prepTime: '10 min', isQuick: true, isSlowCooker: false, highCarb: true, source: 'homemade', ingredients: ['salmon fillets', 'soy sauce', 'ginger', 'honey', 'rice noodles', 'pak choi', 'spring onions', 'lime'], method: '1. Make glaze\n2. Pan fry salmon\n3. Cook noodles\n4. Serve together', notes: 'Naturally dairy-free' }
  ]

  const [activeTab, setActiveTab] = useState('planner')
  const [recipes, setRecipes] = useState(initialRecipes)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [weekPlans, setWeekPlans] = useState({ 0: {} })
  const [training, setTraining] = useState({ 0: defaultTraining })
  const [checkedItems, setCheckedItems] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [viewingRecipe, setViewingRecipe] = useState(null)
  const [showAddRecipe, setShowAddRecipe] = useState(false)
  const [copiedList, setCopiedList] = useState(false)
  const [filterProtein, setFilterProtein] = useState('all')
  const [savedPlan, setSavedPlan] = useState(true)
  const [loading, setLoading] = useState(true)
  const [newRecipe, setNewRecipe] = useState({ name: '', protein: 'chicken', prepTime: '', isQuick: true, isSlowCooker: false, highCarb: false, source: 'tiktok', ingredients: '', method: '', notes: '' })

  const weekPlan = weekPlans[currentWeekOffset] || {}
  const weekTraining = training[currentWeekOffset] || defaultTraining

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recipes
        const { data: recipesData } = await supabase.from('recipes').select('*')
        if (recipesData && recipesData.length > 0) {
          setRecipes([initialRecipes[0], ...recipesData]) // Keep eating out option
        }

        // Load week plans
        const { data: plansData } = await supabase.from('week_plans').select('*')
        if (plansData && plansData.length > 0) {
          const plans = {}
          plansData.forEach(p => { plans[p.week_offset] = p.plan })
          setWeekPlans(plans)
        }

        // Load training
        const { data: trainingData } = await supabase.from('training').select('*')
        if (trainingData && trainingData.length > 0) {
          const t = {}
          trainingData.forEach(tr => { t[tr.week_offset] = tr.schedule })
          setTraining(t)
        }
      } catch (e) {
        console.log('Load error, using defaults', e)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const getWeekLabel = (offset) => {
    if (offset === 0) return 'This Week'
    if (offset === 1) return 'Next Week'
    if (offset === -1) return 'Last Week'
    return `Week ${offset > 0 ? '+' : ''}${offset}`
  }

  const getWeekDates = (offset) => {
    const today = new Date()
    const day = today.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff + offset * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return `${monday.getDate()} ${monday.toLocaleString('en-GB', { month: 'short' })} - ${sunday.getDate()} ${sunday.toLocaleString('en-GB', { month: 'short' })}`
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

  const updateWorkout = (day, workout) => {
    setTraining(prev => ({
      ...prev,
      [currentWeekOffset]: { ...prev[currentWeekOffset], [day]: { ...workout, highCarb: prev[currentWeekOffset]?.[day]?.highCarb || false } }
    }))
    setEditingWorkout(null)
    setSavedPlan(false)
  }

  const generatePlan = () => {
    const newPlan = {}
    const used = new Set()
    
    days.forEach(day => {
      const dayTraining = weekTraining[day]
      const needsHighCarb = dayTraining?.highCarb
      const isWeekend = day === 'saturday' || day === 'sunday'
      
      const redMeatCount = Object.values(newPlan).filter(id => {
        const r = recipes.find(rec => rec.id === id)
        return r && (r.protein === 'beef' || r.protein === 'pork')
      }).length
      
      let pool = recipes.filter(r => !used.has(r.id) && !r.isEatingOut)
      
      if (redMeatCount >= 1) {
        pool = pool.filter(r => r.protein !== 'beef' && r.protein !== 'pork')
      }
      
      const healthyPool = pool.filter(r => r.protein === 'chicken' || r.protein === 'fish')
      if (healthyPool.length > 0 && Math.random() < 0.7) {
        pool = healthyPool
      }
      if (!isWeekend) pool = pool.filter(r => r.isQuick)
      if (needsHighCarb) {
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

  const clearWeek = () => {
    setWeekPlans(prev => ({ ...prev, [currentWeekOffset]: {} }))
    setSavedPlan(false)
  }

  const savePlan = async () => {
    try {
      // Save week plan
      await supabase.from('week_plans').upsert({
        week_offset: currentWeekOffset,
        plan: weekPlan,
        updated_at: new Date().toISOString()
      }, { onConflict: 'week_offset' })

      // Save training
      await supabase.from('training').upsert({
        week_offset: currentWeekOffset,
        schedule: weekTraining,
        updated_at: new Date().toISOString()
      }, { onConflict: 'week_offset' })

      setSavedPlan(true)
    } catch (e) {
      console.log('Save error', e)
      alert('Failed to save - check your connection')
    }
  }

  const getShoppingList = () => {
    const items = {}
    Object.values(weekPlan).forEach(id => {
      const recipe = recipes.find(r => r.id === id)
      if (recipe && !recipe.isEatingOut) {
        recipe.ingredients.forEach(ing => {
          items[ing] = (items[ing] || 0) + 1
        })
      }
    })
    return Object.entries(items).map(([name, count]) => count > 1 ? `${name} (x${count})` : name)
  }

  const copyShoppingList = () => {
    const items = getShoppingList()
    const meals = days.map(d => weekPlan[d] ? `${d}: ${recipes.find(r => r.id === weekPlan[d])?.name}` : null).filter(Boolean)
    const text = `🛒 Shopping List - ${getWeekDates(currentWeekOffset)}\n\n${items.map(i => `☐ ${i}`).join('\n')}\n\n📅 Meals:\n${meals.join('\n')}`
    navigator.clipboard.writeText(text)
    setCopiedList(true)
    setTimeout(() => setCopiedList(false), 2000)
  }

  const addRecipe = async () => {
    const recipe = {
      id: Date.now(),
      ...newRecipe,
      ingredients: newRecipe.ingredients.split('\n').filter(i => i.trim())
    }
    
    try {
      await supabase.from('recipes').insert(recipe)
      setRecipes(prev => [...prev, recipe])
    } catch (e) {
      console.log('Add recipe error', e)
      setRecipes(prev => [...prev, recipe])
    }
    
    setShowAddRecipe(false)
    setNewRecipe({ name: '', protein: 'chicken', prepTime: '', isQuick: true, isSlowCooker: false, highCarb: false, source: 'tiktok', ingredients: '', method: '', notes: '' })
  }

  const deleteRecipe = async (id) => {
    try {
      await supabase.from('recipes').delete().eq('id', id)
    } catch (e) {
      console.log('Delete error', e)
    }
    setRecipes(prev => prev.filter(r => r.id !== id))
    setViewingRecipe(null)
  }

  const proteinCounts = { chicken: 0, fish: 0, redMeat: 0 }
  Object.values(weekPlan).forEach(id => {
    const r = recipes.find(rec => rec.id === id)
    if (r && !r.isEatingOut) {
      if (r.protein === 'chicken') proteinCounts.chicken++
      else if (r.protein === 'fish') proteinCounts.fish++
      else if (r.protein === 'beef' || r.protein === 'pork') proteinCounts.redMeat++
    }
  })

  const filteredRecipes = (filterProtein === 'all' ? recipes : recipes.filter(r => r.protein === filterProtein)).filter(r => !r.isEatingOut)
  const shoppingItems = getShoppingList()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🥗</div>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #eee', padding: '16px 24px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>🥗 Meal Prep</h1>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>Weekly planning for Laura & Ash • Budget: £100/week</p>
      </header>

      {/* Tabs */}
      <nav style={{ background: 'white', borderBottom: '1px solid #eee', padding: '0 24px', display: 'flex', gap: 8 }}>
        {['planner', 'recipes', 'shopping'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: activeTab === tab ? '#1a1a1a' : '#666',
              borderBottom: activeTab === tab ? '2px solid #e07a5f' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            {tab === 'planner' && '📅 Week Planner'}
            {tab === 'recipes' && `📖 Recipes (${recipes.length - 1})`}
            {tab === 'shopping' && '🛒 Shopping List'}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        {/* PLANNER TAB */}
        {activeTab === 'planner' && (
          <>
            {/* Week Navigation */}
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setCurrentWeekOffset(o => o - 1)} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, background: 'white', cursor: 'pointer' }}>← Prev</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600 }}>{getWeekLabel(currentWeekOffset)}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{getWeekDates(currentWeekOffset)}</div>
              </div>
              <button onClick={() => setCurrentWeekOffset(o => o + 1)} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Next →</button>
            </div>

            {/* Protein counts & actions */}
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                <span>🐔 Chicken: {proteinCounts.chicken}</span>
                <span>🐟 Fish: {proteinCounts.fish}</span>
                <span style={{ color: proteinCounts.redMeat > 1 ? '#dc2626' : 'inherit' }}>🥩 Red meat: {proteinCounts.redMeat}/1{proteinCounts.redMeat > 1 && ' ⚠️'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={generatePlan} style={{ padding: '8px 16px', background: '#e07a5f', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>✨ Generate Plan</button>
                <button onClick={savePlan} style={{ padding: '8px 16px', background: savedPlan ? '#22c55e' : '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                  {savedPlan ? '✓ Saved!' : '💾 Save Plan'}
                </button>
                <button onClick={clearWeek} style={{ padding: '8px 16px', background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Clear Week</button>
              </div>
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {days.map(day => {
                const dayTraining = weekTraining[day] || defaultTraining[day]
                const recipeId = weekPlan[day]
                const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null

                return (
                  <div key={day} style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>{day}</h3>
                        <div
                          onClick={() => setEditingWorkout(day)}
                          style={{ fontSize: 13, color: '#666', marginTop: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <span>{dayTraining.icon}</span>
                          <span>{dayTraining.label}</span>
                          <span style={{ fontSize: 10, color: '#999' }}>✎</span>
                        </div>
                      </div>
                      {dayTraining.highCarb && (
                        <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 10, height: 'fit-content' }}>🍝 High Carb</span>
                      )}
                    </div>

                    {recipe ? (
                      <div 
                        onClick={() => setViewingRecipe(recipe)}
                        style={{ background: '#faf9f7', borderRadius: 8, padding: 12, cursor: 'pointer' }}
                      >
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{recipe.name}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>⏱ {recipe.prepTime} • Click for recipe</div>
                        <button onClick={(e) => { e.stopPropagation(); clearDay(day); }} style={{ marginTop: 8, background: 'none', border: 'none', color: '#999', fontSize: 12, cursor: 'pointer' }}>✕ Remove</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedDay(day)}
                        style={{ width: '100%', padding: 20, border: '2px dashed #ddd', borderRadius: 8, background: 'transparent', color: '#999', cursor: 'pointer' }}
                      >
                        + Add meal
                      </button>
                    )}

                    {dayTraining.note && (
                      <div style={{ marginTop: 8, padding: 8, background: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }}>💡 {dayTraining.note}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {['all', 'chicken', 'fish', 'beef', 'pork'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterProtein(p)}
                    style={{
                      padding: '6px 14px',
                      background: filterProtein === p ? '#e07a5f' : '#f5f5f5',
                      color: filterProtein === p ? 'white' : '#333',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddRecipe(true)} style={{ padding: '8px 16px', background: '#e07a5f', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>+ Add Recipe</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {filteredRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => setViewingRecipe(recipe)}
                  style={{ background: 'white', borderRadius: 10, padding: 14, border: '1px solid #eee', cursor: 'pointer' }}
                >
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8 }}>{recipe.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#f5f5f5' }}>{recipe.protein}</span>
                    {recipe.isQuick && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#dcfce7', color: '#166534' }}>⚡ Quick</span>}
                    {recipe.isSlowCooker && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#ffedd5', color: '#9a3412' }}>🍲 Slow</span>}
                    {recipe.source === 'tiktok' && <span style={{ fontSize: 11 }}>📱</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>⏱ {recipe.prepTime}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SHOPPING TAB */}
        {activeTab === 'shopping' && (
          <>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>{Object.values(weekPlan).filter(Boolean).length}</strong> meals • <strong>{shoppingItems.length}</strong> items</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setCheckedItems({})} style={{ padding: '8px 16px', background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Reset</button>
                <button onClick={copyShoppingList} style={{ padding: '8px 16px', background: copiedList ? '#22c55e' : '#e07a5f', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                  {copiedList ? '✓ Copied!' : '📋 Copy List'}
                </button>
              </div>
            </div>

            {shoppingItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                <p style={{ fontSize: 40 }}>📝</p>
                <p>Add meals to generate shopping list</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 12, padding: 20 }}>
                {shoppingItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: i < shoppingItems.length - 1 ? '1px solid #f5f5f5' : 'none',
                      cursor: 'pointer',
                      opacity: checkedItems[item] ? 0.4 : 1,
                      textDecoration: checkedItems[item] ? 'line-through' : 'none'
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: '2px solid #ddd',
                      background: checkedItems[item] ? '#e07a5f' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12
                    }}>
                      {checkedItems[item] && '✓'}
                    </div>
                    <span style={{ textTransform: 'capitalize' }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* SELECT RECIPE MODAL */}
      {selectedDay && (
        <div onClick={() => setSelectedDay(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, maxWidth: 500, width: '100%', maxHeight: '80vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', textTransform: 'capitalize' }}>Choose meal for {selectedDay}</h2>
            
            {/* Eating Out option at the top */}
            <div
              onClick={() => assignRecipe(selectedDay, 'eating-out')}
              style={{ padding: 12, background: '#fef3c7', borderRadius: 8, marginBottom: 16, cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}
            >
              <div style={{ fontWeight: 500 }}>🍽️ Eating Out</div>
              <div style={{ fontSize: 12, color: '#666' }}>No cooking tonight</div>
            </div>
            
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 500 }}>OR CHOOSE A RECIPE:</div>
            
            {recipes.filter(r => !r.isEatingOut).map(recipe => (
              <div
                key={recipe.id}
                onClick={() => assignRecipe(selectedDay, recipe.id)}
                style={{ padding: 12, background: '#faf9f7', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}
              >
                <div style={{ fontWeight: 500 }}>{recipe.name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{recipe.protein} • {recipe.prepTime}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT WORKOUT MODAL */}
      {editingWorkout && (
        <div onClick={() => setEditingWorkout(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, maxWidth: 400, width: '100%', padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', textTransform: 'capitalize' }}>{editingWorkout} Workout</h2>
            {workoutOptions.map(w => (
              <div
                key={w.label}
                onClick={() => updateWorkout(editingWorkout, w)}
                style={{ padding: 14, background: weekTraining[editingWorkout]?.label === w.label ? '#fef3c7' : '#faf9f7', borderRadius: 8, marginBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <span style={{ fontSize: 20 }}>{w.icon}</span>
                <span>{w.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW RECIPE MODAL */}
      {viewingRecipe && (
        <div onClick={() => setViewingRecipe(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, maxWidth: 500, width: '100%', maxHeight: '80vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: '0 0 8px' }}>{viewingRecipe.name}</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: '#f5f5f5' }}>{viewingRecipe.protein}</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: '#f5f5f5' }}>⏱ {viewingRecipe.prepTime}</span>
            </div>
            {viewingRecipe.ingredients && viewingRecipe.ingredients.length > 0 && (
              <>
                <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>INGREDIENTS</h4>
                <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
                  {viewingRecipe.ingredients.map((ing, i) => <li key={i} style={{ marginBottom: 4 }}>{ing}</li>)}
                </ul>
              </>
            )}
            <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>METHOD</h4>
            <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 16px', lineHeight: 1.6 }}>{viewingRecipe.method}</p>
            {viewingRecipe.notes && (
              <div style={{ background: '#fef3c7', padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 16 }}>💡 {viewingRecipe.notes}</div>
            )}
            {!viewingRecipe.isEatingOut && (
              <button onClick={() => deleteRecipe(viewingRecipe.id)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}>🗑 Delete Recipe</button>
            )}
          </div>
        </div>
      )}

      {/* ADD RECIPE MODAL */}
      {showAddRecipe && (
        <div onClick={() => setShowAddRecipe(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: '0 0 16px' }}>Add New Recipe</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Recipe name" value={newRecipe.name} onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={newRecipe.protein} onChange={e => setNewRecipe({ ...newRecipe, protein: e.target.value })} style={{ flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 6 }}>
                  <option value="chicken">Chicken</option>
                  <option value="fish">Fish</option>
                  <option value="beef">Beef</option>
                  <option value="pork">Pork</option>
                </select>
                <input placeholder="Prep time" value={newRecipe.prepTime} onChange={e => setNewRecipe({ ...newRecipe, prepTime: e.target.value })} style={{ flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <label><input type="checkbox" checked={newRecipe.isQuick} onChange={e => setNewRecipe({ ...newRecipe, isQuick: e.target.checked })} /> Quick</label>
                <label><input type="checkbox" checked={newRecipe.isSlowCooker} onChange={e => setNewRecipe({ ...newRecipe, isSlowCooker: e.target.checked })} /> Slow cooker</label>
                <label><input type="checkbox" checked={newRecipe.highCarb} onChange={e => setNewRecipe({ ...newRecipe, highCarb: e.target.checked })} /> High carb</label>
              </div>
              <textarea placeholder="Ingredients (one per line)" rows={4} value={newRecipe.ingredients} onChange={e => setNewRecipe({ ...newRecipe, ingredients: e.target.value })} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
              <textarea placeholder="Method" rows={4} value={newRecipe.method} onChange={e => setNewRecipe({ ...newRecipe, method: e.target.value })} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
              <input placeholder="Notes (e.g. dairy-free tips)" value={newRecipe.notes} onChange={e => setNewRecipe({ ...newRecipe, notes: e.target.value })} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
              <button onClick={addRecipe} disabled={!newRecipe.name || !newRecipe.ingredients} style={{ padding: 12, background: '#e07a5f', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Add Recipe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
