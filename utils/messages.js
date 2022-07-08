const moment = require('moment');

function formatMessage(username, text){
    return {
        username,
        text,
        time: moment().format('H:m')
    };
}

module.exports = formatMessage;