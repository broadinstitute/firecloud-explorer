const constants = require('./environment').constants;
// -3 = destroyed, -2 = stopped, -1 = error, 0 = not started, 1 = started (downloading), 2 = error, retrying, 3 = finished

const downloadStats = function (dl, item, win) {
    item = item || 1;

    let timer = setInterval(function () {
        if (dl.status === 0) {
            // possibly creating disk space
        } else if (dl.status === 1) {
            let stats = dl.getStats();
            item.progress = stats.total.completed;
            item.transferred = stats.total.downloaded;
            // console.log('-------- reporting progress ------- ' + item.displayName + ' - ' + item.transferred);
            win.webContents.send(constants.IPC_DOWNLOAD_STATUS, item);
        } else if (dl.status === 3) {
            item.progress = 100;
            item.transferred = item.size;
            if (win !== undefined) {
                clearInterval(timer);
            }
            timer = null;
            console.log('-------- reporting complete ------- ' + item.displayName + ' - ' + item.transferred);
            win.webContents.send(constants.IPC_DOWNLOAD_COMPLETED, item);
        } else if (dl.status === -1 || dl.status === 3 || dl.status === -3) {
            clearInterval(timer);
            timer = null;
        }
    }, 700);
};

module.exports = { downloadStats };
