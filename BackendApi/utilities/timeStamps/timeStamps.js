// helpers/timeHelper.js
const { DateTime } = require('luxon');

function getKenyaTimeISO() {
  return DateTime.now()
    .setZone('Africa/Nairobi')
    .toFormat('yyyy-LL-dd HH:mm:ss'); // SQL DATETIME format
}

function getKenyaTimeFormatted(format = 'dd-LLL-yyyy HH:mm:ss') {
  return DateTime.now().setZone('Africa/Nairobi').toFormat(format);
}

module.exports = { getKenyaTimeISO, getKenyaTimeFormatted };
