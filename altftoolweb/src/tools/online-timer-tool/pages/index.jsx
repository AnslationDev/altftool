import { useState, useEffect } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Play, Pause, RotateCcw, Flag, Trash2 } from "lucide-react";
const useCountdownTimer = () => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [remainingAtPause, setRemainingAtPause] = useState(0);
  useEffect(() => {
    let intervalId;
    if (isRunning && totalSeconds > 0) {
      intervalId = setInterval(() => {
        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1e3);
          const remaining = remainingAtPause - elapsed;
          if (remaining <= 0) {
            setTotalSeconds(0);
            setIsRunning(false);
            try {
              const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Dzvzghi4HHGm98+qfTQ0P");
              audio.play();
            } catch (e) {
              if (true) {
                console.log("Audio play failed:", e);
              }
            }
          } else {
            setTotalSeconds(Math.floor(remaining));
          }
        }
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, startTime, remainingAtPause, totalSeconds]);
  const start = () => {
    if (totalSeconds > 0 && !isRunning) {
      const currentRemaining = remainingAtPause > 0 ? remainingAtPause : totalSeconds;
      setStartTime(Date.now());
      setRemainingAtPause(currentRemaining);
      setIsRunning(true);
    }
  };
  const stop = () => {
    if (isRunning) {
      setIsRunning(false);
      setRemainingAtPause(totalSeconds);
    }
  };
  const reset = () => {
    setIsRunning(false);
    setTotalSeconds(0);
    setRemainingAtPause(0);
  };
  const setTime = (hours, minutes, seconds) => {
    const total = hours * 3600 + minutes * 60 + seconds;
    setTotalSeconds(total);
    setRemainingAtPause(total);
    setIsRunning(false);
  };
  return {
    totalSeconds,
    isRunning,
    start,
    stop,
    reset,
    setTime
  };
};
const useStopwatch = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        if (startTime) {
          const currentTime = Date.now() - startTime + pausedTime;
          setElapsedTime(currentTime);
        }
      }, 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, startTime, pausedTime]);
  const start = () => {
    setIsRunning(true);
    setStartTime(Date.now());
  };
  const pause = () => {
    setIsRunning(false);
    setPausedTime(elapsedTime);
  };
  const reset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setPausedTime(0);
    setLaps([]);
  };
  const recordLap = () => {
    const currentLapId = laps.length + 1;
    const previousTotal = laps.length > 0 ? laps[0].total : 0;
    const split = elapsedTime - previousTotal;
    const newLap = {
      id: currentLapId,
      split,
      total: elapsedTime
    };
    setLaps([newLap, ...laps]);
  };
  const clearLaps = () => {
    setLaps([]);
  };
  const formatTime = (time) => {
    const totalSeconds = Math.floor(time / 1e3);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(time % 1e3 / 10);
    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
      milliseconds: String(milliseconds).padStart(2, "0")
    };
  };
  return {
    elapsedTime,
    isRunning,
    laps,
    start,
    pause,
    reset,
    recordLap,
    clearLaps,
    formatTime
  };
};
const TimeInput = ({ onSetTime }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (hours === 0 && minutes === 0 && seconds === 0) {
      return;
    }
    onSetTime(hours, minutes, seconds);
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hours">Hours</Label>
          <Input
    id="hours"
    type="number"
    min="0"
    max="23"
    value={hours}
    onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
  />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minutes">Minutes</Label>
          <Input
    id="minutes"
    type="number"
    min="0"
    max="59"
    value={minutes}
    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
  />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seconds">Seconds</Label>
          <Input
    id="seconds"
    type="number"
    min="0"
    max="59"
    value={seconds}
    onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
  />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Set Time
      </Button>
    </form>;
};
const TimerDisplay = ({ hours, minutes, seconds }) => {
  return <div className="flex justify-center items-center flex-wrap gap-2">
      {hours !== "00" && <>
          <div className="text-4xl font-mono font-bold tabular-nums">{hours}</div>
          <div className="text-4xl font-mono font-bold">:</div>
        </>}
      <div className="text-4xl font-mono font-bold tabular-nums">{minutes}</div>
      <div className="text-4xl font-mono font-bold">:</div>
      <div className="text-4xl font-mono font-bold tabular-nums">{seconds}</div>
    </div>;
};
const StopwatchDisplay = ({
  hours,
  minutes,
  seconds,
  milliseconds
}) => {
  return <div className="flex justify-center items-center flex-wrap gap-2">
      {hours !== "00" && <>
          <div className="text-4xl font-mono font-bold tabular-nums">{hours}</div>
          <div className="text-4xl font-mono font-bold">:</div>
        </>}
      <div className="text-4xl font-mono font-bold tabular-nums">{minutes}</div>
      <div className="text-4xl font-mono font-bold">:</div>
      <div className="text-4xl font-mono font-bold tabular-nums">{seconds}</div>
      <div className="text-4xl font-mono font-bold">:</div>
      <div className="text-2xl font-mono font-bold tabular-nums">{milliseconds}</div>
    </div>;
};
const LapItem = ({
  lap,
  formatTime,
  isFastest,
  isSlowest
}) => {
  const splitColor = isFastest ? "text-green-500" : isSlowest ? "text-red-500" : "text-(--foreground)";
  const formattedSplit = formatTime(lap.split);
  const formattedTotal = formatTime(lap.total);
  return <div className={`flex justify-between items-center p-2 ${isFastest || isSlowest ? "bg-(--muted) rounded" : ""}`}>
      <div className="text-(--muted-foreground)">#{lap.id}</div>
      <div className={`${splitColor} font-mono`}>
        {formattedSplit.hours !== "00" && `${formattedSplit.hours}:`}
        {formattedSplit.minutes}:{formattedSplit.seconds}.
        <span className="text-sm">{formattedSplit.milliseconds}</span>
      </div>
      <div className="font-mono text-(--muted-foreground)">
        {formattedTotal.hours !== "00" && `${formattedTotal.hours}:`}
        {formattedTotal.minutes}:{formattedTotal.seconds}.
        <span className="text-sm">{formattedTotal.milliseconds}</span>
      </div>
    </div>;
};
const OnlineTimer = () => {
  const {
    totalSeconds: countdownSeconds,
    isRunning: isCountdownRunning,
    start: startCountdown,
    stop: stopCountdown,
    reset: resetCountdown,
    setTime: setCountdownTime
  } = useCountdownTimer();
  const {
    elapsedTime: stopwatchTime,
    isRunning: isStopwatchRunning,
    laps,
    start: startStopwatch,
    pause: pauseStopwatch,
    reset: resetStopwatch,
    recordLap,
    clearLaps,
    formatTime: formatStopwatchTime
  } = useStopwatch();
  const countdownHours = Math.floor(countdownSeconds / 3600);
  const countdownMinutes = Math.floor(countdownSeconds % 3600 / 60);
  const countdownSecondsRemainder = countdownSeconds % 60;
  const { hours, minutes, seconds, milliseconds } = formatStopwatchTime(stopwatchTime);
  const lapSplits = laps.map((l) => l.split);
  const fastestSplit = lapSplits.length > 1 ? Math.min(...lapSplits) : null;
  const slowestSplit = lapSplits.length > 1 ? Math.max(...lapSplits) : null;
  return <div className="space-y-8">
      {
    /* How to Use */
  }
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <h2 className="text-xl font-semibold text-(--foreground) mb-2">How to Use</h2>
        <p className="text-(--muted-foreground)">
          Switch between Countdown Timer and Stopwatch modes. Set a time for countdown or start the stopwatch to track elapsed time.
        </p>
      </Card>

      <Tabs defaultValue="countdown" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="countdown">Countdown Timer</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
        </TabsList>

        <TabsContent value="countdown" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-(--foreground) mb-4">Countdown Timer</h3>

            <div className="space-y-6">
              <div className="p-4 bg-(--muted) rounded-lg">
                <TimerDisplay
    hours={String(countdownHours).padStart(2, "0")}
    minutes={String(countdownMinutes).padStart(2, "0")}
    seconds={String(countdownSecondsRemainder).padStart(2, "0")}
  />
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <TimeInput onSetTime={setCountdownTime} />
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {countdownSeconds > 0 && <Button
    onClick={isCountdownRunning ? stopCountdown : startCountdown}
    className={isCountdownRunning ? "bg-yellow-500 hover:bg-yellow-600" : ""}
  >
                    {isCountdownRunning ? <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </> : <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>}
                  </Button>}

                {countdownSeconds > 0 && <Button variant="outline" onClick={resetCountdown}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stopwatch" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-(--foreground) mb-4">Stopwatch</h3>

            <div className="space-y-6">
              <div className="p-4 bg-(--muted) rounded-lg">
                <StopwatchDisplay
    hours={hours}
    minutes={minutes}
    seconds={seconds}
    milliseconds={milliseconds}
  />
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
    onClick={isStopwatchRunning ? pauseStopwatch : startStopwatch}
    className={isStopwatchRunning ? "bg-red-500 hover:bg-red-600" : ""}
  >
                  {isStopwatchRunning ? <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </> : <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>}
                </Button>

                {stopwatchTime > 0 && <Button variant="outline" onClick={resetStopwatch}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>}

                <Button
    variant="outline"
    onClick={recordLap}
    disabled={!isStopwatchRunning}
  >
                  <Flag className="w-4 h-4 mr-2" />
                  Lap
                </Button>

                {laps.length > 0 && <Button variant="outline" onClick={clearLaps}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Laps
                  </Button>}
              </div>

              {laps.length > 0 && <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="flex justify-between text-sm text-(--muted-foreground) mb-2">
                    <span>#</span>
                    <span>Split</span>
                    <span>Total</span>
                  </div>
                  <div className="space-y-1">
                    {laps.map((lap) => <LapItem
    key={lap.id}
    lap={lap}
    formatTime={formatStopwatchTime}
    isFastest={lap.split === fastestSplit}
    isSlowest={lap.split === slowestSplit}
  />)}
                  </div>
                </div>}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {
    /* Features */
  }
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-(--foreground) mb-4">Features</h3>
        <ul className="space-y-2 text-(--muted-foreground)">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Countdown timer with customizable hours, minutes, and seconds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Professional stopwatch with millisecond precision</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Lap tracking with fastest/slowest lap highlighting</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Visual and audible alerts when countdown timer completes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Fully responsive design that works on all devices</span>
          </li>
        </ul>
      </Card>
    </div>;
};
export default OnlineTimer;
