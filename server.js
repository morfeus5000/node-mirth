var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs'),
  mysql = require('mysql'),
  connectionsArray = [],
  connection = mysql.createConnection({
    host: '10.150.106.62',
    user: 'root',
    password: '@@Passw0rd@@',
    database: 'hl7',
    port: 3306
  }),
  POLLING_INTERVAL = 3000,
  pollingTimer;

connection.connect(function(err) {
  if (err) {
    console.log(err);
  }
});

app.listen(8000);

function handler(req, res) {
  fs.readFile(__dirname + '/client.html', function(err, data) {
    if (err) {
      console.log(err);
      res.writeHead(500);
      return res.end('Error loading client.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}


var pollingLoop = function() {

  var query = connection.query('SELECT * FROM data'),
    users = []; 

  query
    .on('error', function(err) {

      console.log(err);
      updateSockets(err);
    })
    .on('result', function(user) {

      users.push(user);
    })
    .on('end', function() {

      if (connectionsArray.length) {

        pollingTimer = setTimeout(pollingLoop, POLLING_INTERVAL);

        updateSockets({
          users: users
        });
      } else {

        console.log('The server timer was stopped because there are no more socket connections on the app')

      }
    });
};


io.sockets.on('connection', function(socket) {

  console.log('Number of connections:' + connectionsArray.length);
  if (!connectionsArray.length) {
    pollingLoop();
  }

  socket.on('disconnect', function() {
    var socketIndex = connectionsArray.indexOf(socket);
    console.log('socketID = %s got disconnected', socketIndex);
    if (~socketIndex) {
      connectionsArray.splice(socketIndex, 1);
    }
  });

  console.log('A new socket is connected!');
  connectionsArray.push(socket);

});

var updateSockets = function(data) {

  data.time = new Date();
  console.log('Pushing new data to the clients connected ( connections amount = %s ) - %s', connectionsArray.length , data.time);
  connectionsArray.forEach(function(tmpSocket) {
    tmpSocket.volatile.emit('notification', data);
  });
};

console.log('Please use your browser to navigate to http://localhost:8000');
