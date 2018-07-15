const vscode = require('vscode');
const Enum = require('./enum');


class Timer {
    constructor(timerSec) {
        this.TimerEndEventEmitter = new vscode.EventEmitter();
        this.TimeChangedEventEmitter = new vscode.EventEmitter();

        this._elapsedSeconds = 0;
        this._timerSeconds = timerSec;
        this._interval = undefined;
        this._state = Enum.TimerState.Stopped;
    }

    start() {
        const that = this;
        that._state = Enum.TimerState.Running;
        that._interval = setInterval(() => {
            that._tick();
        }, 1000);
    }

    _tick() {
        this._elapsedSeconds += 1;

        const remainingSec = Math.max(this._timerSeconds - this._elapsedSeconds, 0);
        if (remainingSec <= 0) {
            // reset to init state
            this._elapsedSeconds = this._timerSeconds;
            this.TimerEndEventEmitter.fire();
        }
        else {
            try {
                this.TimeChangedEventEmitter.fire({
                    datetime: Number(new Date()),
                    leftSec: remainingSec,
                });
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    get onTimeChanged() {
        return this.TimeChangedEventEmitter.event;
    }

    get onTimerEnd() {
        return this.TimerEndEventEmitter.event;
    }

    get state() {
        return this._state;
    }

    get timerSec() {
        return this._timerSeconds;
    }

    pause() {
        this._state = Enum.TimerState.Paused;
        this._clearTimerLoop();
    }

    stop() {
        this._state = Enum.TimerState.Stopped;
        this._clearTimerLoop();
        this._elapsedSeconds = 0;
    }

    reset(timerSecs) {
        this._state = Enum.TimerState.Stopped;
        this._clearTimerLoop();
        this._elapsedSeconds = 0;
        if (timerSecs !== undefined) {
            this._timerSeconds = timerSecs;
        }
    }

    _clearTimerLoop() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }
}

module.exports = Timer;