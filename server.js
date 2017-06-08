var express 	= require('express'),
	http 		= require('http'),
	Stopwatch 	= require('./models/stopwatch');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var bug = {livetext: "Live", locationtext: ''};
var score = {};
var grid = {headingcolor:"#BC204B", leftcolor: "#1f1a34"};
var seats = {};
var recentgrid = {};
var announce = {};
var constituency = {euleave:"50", euremain:"50"};

	io.on('connection', function(socket) {
	console.log("Client Socket Connected");

	/*
	 * 		Clock functions
	 */
	
	var stopwatch = new Stopwatch();

	stopwatch.on('tick:stopwatch', function(time) {
		io.sockets.emit("clock:tick", time);
	});
	 
	socket.on("clock:pause", function() {
		stopwatch.pause();
	});

	socket.on("clock:reset", function() {
		stopwatch.reset();
	});

	socket.on("clock:up", function() {
		stopwatch.countUp();
	});

	socket.on("clock:down", function() {
		stopwatch.countDown();
	});

	socket.on("clock:set", function(msg) {
		stopwatch.setValue(msg);
	});

    socket.on("clock:get", function() {
        io.sockets.emit("clock:tick", stopwatch.getTime());
    });

	/*
	 * 		General Functions
	 */
	socket.on("bug", function(msg) {
        bug = msg;
		io.sockets.emit("bug", msg);
	});

    socket.on("bug:get", function(msg) {
		io.sockets.emit("bug", bug);
	});
	
	/*
	 * 		Announcement Functions
	 */
	socket.on("announce", function(msg) {
        announce = msg;
		io.sockets.emit("announce", msg);
	});

    socket.on("announce:get", function(msg) {
		io.sockets.emit("announce", announce);
	});
    
    /*
	 * 		Grid functions
	 */
	
	socket.on("grid", function(payload) {
        grid = payload;
        io.sockets.emit("grid", payload);
        console.log("Updating: grid");
    });
    
    socket.on("recentgrid", function(payload) {
        recentgrid = payload;
        io.sockets.emit("recentgrid", payload);
        console.log("Updating recent results grid");
    });

	/*
	 * 		Lower Thirds
	 */
	socket.on("lowerthird:left", function(msg) {
		io.sockets.emit("lowerthird:left", msg);
	});

	socket.on("lowerthird:right", function(msg) {
		io.sockets.emit("lowerthird:right", msg);
	});
	
	socket.on("lowerthird:full", function(msg) {
		io.sockets.emit("lowerthird:full", msg);
	});

	socket.on("lowerthird:hidefull", function() {
		io.sockets.emit("lowerthird:hidefull");
	});
	
	socket.on("lowerthird:hideleft", function() {
		io.sockets.emit("lowerthird:hideleft");
	});
	
	socket.on("lowerthird:hideright", function() {
		io.sockets.emit("lowerthird:hideright");
	});

	socket.on("lowerthird:hideall", function() {
		io.sockets.emit("lowerthird:hideall");
	});

	/*
	 * 		Roses Score
	 */
	socket.on("score", function(msg) {
        score = msg;
		io.sockets.emit("score", msg);
	});
	socket.on("lancScore", function(msg){
		io.sockets.emit("lancScore", msg);
	});
	socket.on("yorkScore", function(msg){
		io.sockets.emit("yorkScore", msg);
	});

    socket.on("score:get", function(msg) {
		io.sockets.emit("score", score);
	});
	
	
	/*
	 * 		Live Seats
	 */
	socket.on("seats", function(msg) {
        seats = msg;
		io.sockets.emit("seats", msg);
	});

    socket.on("seats:get", function(msg) {
		io.sockets.emit("seats", seats);
	});

	/*
	 * 		Constituency
	 */
    socket.on("constituency", function(payload) {
        recentgrid = payload;
        io.sockets.emit("constituency", payload);
        console.log("Updating constituency info");
    });

});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

server.listen(3000);
console.log("Now listening on port 3000. Go to http://127.0.0.1:3000/admin to control")
console.log("run 'play 1-1 [html] http://127.0.0.1:3000' in CasparCG to start the graphics")
