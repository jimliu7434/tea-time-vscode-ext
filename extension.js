const vscode = require('vscode');
const { StatusBarAlignment, window } = vscode;
const Timer = require('./model/timer');
const moment = require('moment');
const Enum = require('./model/enum');
const DEF_SEC = 60;

function activate(context) {
    const status = window.createStatusBarItem(StatusBarAlignment.Right, 200);

    status.command = 'extension.toggleTeaTimer'

    let timer;

    updateTimerStatus(status, Number(new Date()));
    status.show();

    let start = vscode.commands.registerCommand('extension.startTeaTimer',async function () {
        const prompt = 'How long will you need a Tea Time in seconds?';
        const value = timer ? timer.timerSec : DEF_SEC ;

        const secStr = await window.showInputBox({ prompt, value, });
        let newSec;
        if(secStr && Number.isSafeInteger(Number(secStr))) {
            newSec = Number(secStr);
        }

        if (!timer) {
            timer = new Timer(newSec || DEF_SEC);
            timer.onTimeChanged(function ({ datetime, leftSec }) {
                updateTimerStatus(status, datetime, leftSec);
            });

            timer.onTimerEnd(function () {
                vscode.window.showInformationMessage('Tea Timer is UP!');
                timer.reset();
                timer.start();
            });
        }

        Start(timer, newSec);
    });

    let stop = vscode.commands.registerCommand('extension.stopTeaTimer', function () {
        const state = timer.state;
        if (state === Enum.TimerState.Running) {
            vscode.window.showInformationMessage('Tea Timer Stopped!');
            timer.stop();
        }
    });

    let pause = vscode.commands.registerCommand('extension.pauseTeaTimer', function () {
        const state = timer.state;
        if (state === Enum.TimerState.Running) {
            vscode.window.showInformationMessage('Tea Timer Paused!');
            timer.pause();
        }
    });

    let toggle = vscode.commands.registerCommand('extension.toggleTeaTimer', function () {
        const state = timer.state;
        if (state === Enum.TimerState.Stopped) {
            vscode.window.showInformationMessage('Tea Timer Started!');
            timer.reset();
            timer.start();
        }
        else if (state === Enum.TimerState.Paused) {
            vscode.window.showInformationMessage('Tea Timer Started!');
            timer.start();
        }
        else if (state === Enum.TimerState.Running) {
            vscode.window.showInformationMessage('Tea Timer Paused!');
            timer.pause();
        }
    });

    context.subscriptions.push(start, stop, pause, toggle);
    context.subscriptions.push(status);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function updateTimerStatus(status, sec, leftSec) {
    let YMD, left;
    if (sec) {
        YMD = moment(sec).format('MM-DD HH:mm');
    }
    if (leftSec !== undefined) {
        const sec = leftSec % 60;
        const min = Math.floor(leftSec / 60);
        if (min > 0)
            left = `${min} min ${sec} sec`;
        else
            left = `${sec} sec`;
    }
    else {
        left = '-';
    }

    status.text = `${left} to tea time [${YMD}]`;
}

function Start(timer, sec) {
    const state = timer.state;
    const timerSec = timer.timerSec;
    const needUpdate = (sec !== undefined && sec !== timerSec);

    if (state === Enum.TimerState.Stopped ||
        state === Enum.TimerState.Running) {
        timer.reset(needUpdate === true ? sec : undefined);
        timer.start();
        vscode.window.showInformationMessage('Tea Timer Started!');
    }

    if (state === Enum.TimerState.Paused) {
        timer.start();
        vscode.window.showInformationMessage('Tea Timer Started!');
    }
}