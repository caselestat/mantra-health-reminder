import React, { useState, useEffect, useRef } from 'react'
import './styles/popup.css'

const App: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [solved, setSolved] = useState(false)
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [answer, setAnswer] = useState('')
  const [wakeLock, setWakeLock] = useState<any>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentTime, setCurrentTime] = useState('')
  const [nextReminder, setNextReminder] = useState('')
  const welcomeTimer = useRef<number | null>(null)
  
  // Hide welcome message after 5 seconds
  useEffect(() => {
    welcomeTimer.current = window.setTimeout(() => {
      setShowWelcome(false)
    }, 5000)
    
    return () => {
      if (welcomeTimer.current) {
        window.clearTimeout(welcomeTimer.current)
      }
    }
  }, [])

  // Set font based on day of week
  useEffect(() => {
    const dayFonts = [
      'Nerko One',
      'Amarante',
      'L极狐ugrasimo',
      'Jim Nightshade',
      'Metamorphous',
      'Londrina Sketch',
      'Fredericka the Great'
    ]
    
    const today = new Date().getDay()
    document.documentElement.style.setProperty('--day-font', dayFonts[today])
  }, [])

  // Update current time and calculate next reminder
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const catTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      
      const hours = catTime.getHours()
      const minutes = catTime.getMinutes()
      
      setCurrentTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
      
      let nextHours, nextMinutes, nextDay
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      if (hours < 14 || (hours === 14 && minutes < 22)) {
        nextHours = 14
        nextMinutes = 22
        nextDay = daysOfWeek[catTime.getDay()]
      } else if (hours < 18 || (hours === 18 && minutes < 44)) {
        nextHours = 18
        nextMinutes = 44
        nextDay = daysOfWeek[catTime.getDay()]
      } else {
        nextHours = 14
        nextMinutes = 22
        const tomorrow = new Date(catTime.getTime() + 24 * 60 * 60 * 1000)
        nextDay = daysOfWeek[tomorrow.getDay()]
      }
      setNextReminder(`${nextDay} ${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`)
    }
    
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  // Acquire screen wake lock
  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen')
        setWakeLock(lock)
      }
    } catch (err) {
      console.error('Screen Wake Lock error:', err)
    }
  }

  // Release screen wake lock
  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release().then(() => {
        setWakeLock(null)
      })
    }
  }

  // Check time and trigger popup
  const checkTime = () => {
    
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    const catHours = (hours + 2) % 24
    
    if ((catHours === 14 && minutes === 22) || 
        (catHours === 18 && minutes === 44)) {
      if (!showPopup) {
        setShowPopup(true)
        setSolved(false)
        setNum1(Math.floor(Math.random() * 90) + 10)
        setNum2(Math.floor(Math.random() * 90) + 10)
        setAnswer('')
        acquireWakeLock()
      }
    } else {
      if (showPopup) {
        setShowPopup(false)
        releaseWakeLock()
      }
    }
  }

  useEffect(() => {
    const timer = setInterval(checkTime, 60000)
    checkTime()
    return () => {
      clearInterval(timer)
      releaseWakeLock()
    }
  }, [showPopup])


  // Handle math challenge submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (parseInt(answer) === num1 * num2) {
      setSolved(true)
      setTimeout(() => {
        setShowPopup(false)
      }, 4000)
    } else {
      setAnswer('')
    }
  }

  return (
    <div className="app-container">
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-message">
            Thanks for activating your mantra reminders. I love you!!
          </div>
        </div>
      )}
      
      <div className="status-bar">
        <div>Current Time in Avondale: {currentTime}</div>
        <div>Next Reminder: {nextReminder}</div>
      </div>
      
      {showPopup && (
        <div className={`popup ${solved ? 'solved' : ''}`}>
          {!solved ? (
            <>
              <div className="mantra-text">
                <p className="large-text">PLEASE DO YOUR MANTRA NOW</p>
                <p>You are the light of my world</p>
                <p>I want you to live as long as possible</p>
                <p>Thank you so very much</p>
              </div>
              
              <form onSubmit={handleSubmit} className="math-challenge">
                <label>
                  Solve: {num1} × {num2} = 
                  <input 
                    type="number" 
                    value={answer} 
                    onChange={(e) => setAnswer(e.target.value)}
                    autoFocus
                  />
                </label>
                <button type="submit">Submit</button>
              </form>
            </>
          ) : (
            <div className="thank-you-message">
              <p>Thank you so very much for actively taking control of your health.</p>
              <p>As your health improves, you will appreciate the results of your efforts.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App