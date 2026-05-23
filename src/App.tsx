import { useEffect, useState } from 'react'
import './App.css'

type TimerFields = {
  hours: string
  minutes: string
  seconds: string
}

const initialTimerFields: TimerFields = {
  hours: '0',
  minutes: '5',
  seconds: '0',
}

const pad = (value: number) => String(value).padStart(2, '0')

const parseFieldValue = (value: string, max: number) => {
  const digits = value.replace(/\D/g, '')

  if (digits === '') {
    return ''
  }

  return String(Math.min(max, Number(digits)))
}

const durationFromFields = ({ hours, minutes, seconds }: TimerFields) => {
  const totalHours = Number(hours || 0)
  const totalMinutes = Number(minutes || 0)
  const totalSeconds = Number(seconds || 0)

  return ((totalHours * 60 + totalMinutes) * 60 + totalSeconds) * 1000
}

const formatStopwatch = (milliseconds: number) => {
  const totalCentiseconds = Math.floor(Math.max(0, milliseconds) / 10)
  const centiseconds = totalCentiseconds % 100
  const totalSeconds = Math.floor(totalCentiseconds / 100)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`
}

const formatTimer = (milliseconds: number) => {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function App() {
  const [stopwatchElapsedMs, setStopwatchElapsedMs] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchStartedAt, setStopwatchStartedAt] = useState<number | null>(
    null,
  )
  const [stopwatchNow, setStopwatchNow] = useState(() => Date.now())

  const [timerFields, setTimerFields] = useState(initialTimerFields)
  const timerConfiguredMs = durationFromFields(timerFields)
  const [timerRemainingMs, setTimerRemainingMs] = useState(timerConfiguredMs)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null)

  useEffect(() => {
    if (!stopwatchRunning) {
      return
    }

    const interval = window.setInterval(() => {
      setStopwatchNow(Date.now())
    }, 50)

    return () => window.clearInterval(interval)
  }, [stopwatchRunning])

  useEffect(() => {
    if (!timerRunning || timerEndsAt === null) {
      return
    }

    const interval = window.setInterval(() => {
      const remaining = Math.max(0, timerEndsAt - Date.now())
      setTimerRemainingMs(remaining)

      if (remaining === 0) {
        setTimerRunning(false)
        setTimerEndsAt(null)
        window.clearInterval(interval)
      }
    }, 100)

    return () => window.clearInterval(interval)
  }, [timerRunning, timerEndsAt])

  const stopwatchDisplayMs =
    stopwatchRunning && stopwatchStartedAt !== null
      ? stopwatchElapsedMs + (stopwatchNow - stopwatchStartedAt)
      : stopwatchElapsedMs

  const timerDisplayMs = timerRemainingMs

  const startStopwatch = () => {
    if (stopwatchRunning) {
      return
    }

    const now = Date.now()
    setStopwatchStartedAt(now)
    setStopwatchNow(now)
    setStopwatchRunning(true)
  }

  const pauseStopwatch = () => {
    if (!stopwatchRunning || stopwatchStartedAt === null) {
      return
    }

    const now = Date.now()
    setStopwatchElapsedMs(stopwatchElapsedMs + (now - stopwatchStartedAt))
    setStopwatchStartedAt(null)
    setStopwatchNow(now)
    setStopwatchRunning(false)
  }

  const resetStopwatch = () => {
    const now = Date.now()
    setStopwatchElapsedMs(0)
    setStopwatchStartedAt(null)
    setStopwatchNow(now)
    setStopwatchRunning(false)
  }

  const startTimer = () => {
    const baseMs = timerRemainingMs > 0 ? timerRemainingMs : timerConfiguredMs

    if (baseMs <= 0) {
      return
    }

    const now = Date.now()
    setTimerRemainingMs(baseMs)
    setTimerEndsAt(now + baseMs)
    setTimerRunning(true)
  }

  const pauseTimer = () => {
    if (!timerRunning || timerEndsAt === null) {
      return
    }

    const now = Date.now()
    const remaining = Math.max(0, timerEndsAt - now)

    setTimerRemainingMs(remaining)
    setTimerEndsAt(null)
    setTimerRunning(false)
  }

  const resetTimer = () => {
    setTimerRemainingMs(timerConfiguredMs)
    setTimerEndsAt(null)
    setTimerRunning(false)
  }

  const updateTimerField = (
    field: keyof TimerFields,
    rawValue: string,
    max: number,
  ) => {
    const sanitizedValue = parseFieldValue(rawValue, max)
    const nextFields = {
      ...timerFields,
      [field]: sanitizedValue,
    }

    setTimerFields(nextFields)

    if (!timerRunning) {
      setTimerRemainingMs(durationFromFields(nextFields))
    }
  }

  const stopwatchStatus = stopwatchRunning
    ? 'Running'
    : stopwatchElapsedMs === 0
      ? 'Ready'
      : 'Paused'

  const timerStatus = timerRunning
    ? 'Counting down'
    : timerDisplayMs === 0 && timerConfiguredMs > 0
      ? 'Finished'
      : timerDisplayMs !== timerConfiguredMs
        ? 'Paused'
        : 'Ready'

  return (
    <main className="app-shell">
      <div className="orb orb-left" aria-hidden="true" />
      <div className="orb orb-right" aria-hidden="true" />

      <section className="hero-card">
        <div className="eyebrow">Web Dev Cohort 2026</div>
        <h1>Stopwatch and Timer</h1>
        <p>
          Track elapsed time with a precise stopwatch and count down a custom
          timer in a single responsive workspace.
        </p>
      </section>

      <section className="dashboard" aria-label="Time tools">
        <article className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-label">Stopwatch</div>
              <h2>Track elapsed time</h2>
            </div>
            <span className="status-chip" data-state={stopwatchStatus.toLowerCase()}>
              {stopwatchStatus}
            </span>
          </div>

          <output className="time-display" aria-live="polite">
            {formatStopwatch(stopwatchDisplayMs)}
          </output>

          <div className="control-row">
            <button
              type="button"
              className="action-button primary"
              onClick={startStopwatch}
              disabled={stopwatchRunning}
            >
              Start
            </button>
            <button
              type="button"
              className="action-button secondary"
              onClick={pauseStopwatch}
              disabled={!stopwatchRunning}
            >
              Pause
            </button>
            <button
              type="button"
              className="action-button secondary"
              onClick={resetStopwatch}
            >
              Reset
            </button>
          </div>

          <p className="panel-copy">
            Start the stopwatch, pause it when needed, and reset to clear the
            display back to zero.
          </p>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-label">Timer</div>
              <h2>Count down a custom duration</h2>
            </div>
            <span className="status-chip" data-state={timerStatus.toLowerCase()}>
              {timerStatus}
            </span>
          </div>

          <output className="time-display" aria-live="polite">
            {formatTimer(timerDisplayMs)}
          </output>

          <div className="time-fields" aria-label="Timer input">
            <label className="field">
              <span>Hours</span>
              <input
                type="number"
                min="0"
                max="99"
                inputMode="numeric"
                value={timerFields.hours}
                onChange={(event) =>
                  updateTimerField('hours', event.target.value, 99)
                }
                disabled={timerRunning}
              />
            </label>
            <label className="field">
              <span>Minutes</span>
              <input
                type="number"
                min="0"
                max="59"
                inputMode="numeric"
                value={timerFields.minutes}
                onChange={(event) =>
                  updateTimerField('minutes', event.target.value, 59)
                }
                disabled={timerRunning}
              />
            </label>
            <label className="field">
              <span>Seconds</span>
              <input
                type="number"
                min="0"
                max="59"
                inputMode="numeric"
                value={timerFields.seconds}
                onChange={(event) =>
                  updateTimerField('seconds', event.target.value, 59)
                }
                disabled={timerRunning}
              />
            </label>
          </div>

          <div className="control-row">
            <button
              type="button"
              className="action-button primary"
              onClick={startTimer}
              disabled={timerRunning || timerConfiguredMs <= 0}
            >
              Start
            </button>
            <button
              type="button"
              className="action-button secondary"
              onClick={pauseTimer}
              disabled={!timerRunning}
            >
              Pause
            </button>
            <button
              type="button"
              className="action-button secondary"
              onClick={resetTimer}
            >
              Reset
            </button>
          </div>

          <p className="panel-copy">
            Edit the time fields, start the countdown, pause when needed, and
            reset to clear the display and return to the configured duration.
          </p>
        </article>
      </section>
    </main>
  )
}

export default App
