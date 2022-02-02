const { ServicesEmitter } = require('./../../global/events')
const GLOBAL_STATE = require('./../../global/state');

function killHandler(req,res,nxt){
  ServicesEmitter.emit('DB_DISCONNECT', false)
  res.status(200).send({DB_CONNECTED: GLOBAL_STATE.DB_CONNECTED})
}

module.exports = killHandler;