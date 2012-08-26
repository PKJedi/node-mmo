
exports.sendClientMessage = function(client, mType, mData) {

  var result = {
    sessionId: client.sessionId,
    type: mType,
    data: mData
  };

  client.send(result);

};

exports.sendClientBroadcast = function(client, mType, mData) {

  var result = {
    sessionId: client.sessionId,
    type: mType,
    data: mData
  };

  client.broadcast(result);

};