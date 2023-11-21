var cron = require('node-cron');
let {BookingService} = require('../../services')
function scheduleCrons() {
    cron.schedule('*/30 * * * *', async () => {
        await BookingService.cancelOldBookings();
    });
}

module.exports = scheduleCrons;
