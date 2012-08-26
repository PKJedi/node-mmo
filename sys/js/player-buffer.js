var buffer = {};

exports.set = function(id, data) {
  // not in buffer; set
  if (!buffer[id]) {
    buffer[id] = data;
    return;
  }

  // in buffer, merge
  for (var attr in data) {
    buffer[id][attr] = data[attr];
  }
};

exports.remove = function(id) {
  delete buffer[id];
};

exports.send = function(client) {
  for (var id in buffer) {
    client.send({
      type: 'joined',
      sessionId: id,
      data: buffer[id]
    });
  }
};
