import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LearnMode from './LearnMode'
import CreatureLab from './CreatureLab'
import { HelixIcon, FlaskIcon } from './Icons'

const TABS = [
  { id: 'learn', label: 'Learn Mode', icon: HelixIcon },
  { id: 'lab', label: 'Creature Lab', icon: FlaskIcon },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('learn')

  return (
    <div className="app">
      <div className="app-bg-grid" aria-hidden="true" />
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-dna">DNA</span> Transcription
        </h1>
        <nav className="tab-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon"><tab.icon size={16} /></span>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="tab-indicator"
                  layoutId="tab-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          {activeTab === 'learn' ? (
            <motion.div
              key="learn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="mode-container"
            >
              <LearnMode />
            </motion.div>
          ) : (
            <motion.div
              key="lab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="mode-container"
            >
              <CreatureLab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
