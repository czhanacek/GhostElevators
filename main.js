
var canX;
var canY;

var mouseMoveOld;
var mouseTimeOld;
var deltaMouse;
var deltaMouseTime;
var canvas;
var ctx;
var squeakSound;
var osc;
var d;

var MoveDirection = {
	IN: 1,
	OUT: 2,
	UP: 3,
	DOWN: 4,
};

class RightDoor {
	constructor(elevator) {
		this.width = elevator.width * 0.25;
		this.height = elevator.height;
		this.x = elevator.x + (elevator.width * 0.5);
		this.y = elevator.y;
	}
	draw() {
		ctx.fillStyle = "#f46541"
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

class LeftDoor {
	constructor(elevator) {
		this.width = elevator.width * 0.25;
		this.height = elevator.height;
		this.x = elevator.x + (elevator.width * 0.25);
		this.y = elevator.y;
	}
	draw() {
		ctx.fillStyle = "#f46541"
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}



class Elevator {
	constructor(x, y, width, height, currentFloor) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.rightDoor = new RightDoor(this);
		this.leftDoor = new LeftDoor(this);
		this.doorsOpen = false;
		this.currentFloor = currentFloor;
	}
	draw() {
		ctx.fillStyle = "#f4c842"
		ctx.fillRect(this.x, this.y, this.width, this.height);
		this.rightDoor.draw();
		this.leftDoor.draw();
	}
	moveDoors(amount, direction) {
		if(direction === MoveDirection.IN) {
			this.leftDoor.x += amount;
			this.rightDoor.x -= amount;
		}
		else if(direction === MoveDirection.OUT) {
			this.leftDoor.x -= amount;
			this.rightDoor.x += amount;
		}
		console.log("MOVED DOORS");
		this.draw();
	}
	moveVertical(amount, direction) {
		if(direction === MoveDirection.UP) {
			this.y -= amount;
			this.rightDoor.y -= amount;
			this.leftDoor.y -= amount;
		}
		else if(direction === MoveDirection.DOWN) {
			this.y += amount;
			this.rightDoor.y += amount;
			this.leftDoor.y += amount;
		}
		this.draw();
	}

	openDoors() {
		var t = this;
		if(this.doorsOpen === false) {
			var doorTimer = setInterval(function() {
				if(t.rightDoor.x + t.rightDoor.width < t.x + t.width) {
					t.moveDoors(1, MoveDirection.OUT);
				}
				else {
					t.doorsOpen = true;
					clearInterval(doorTimer)
					
				}
			}, 40);
		}
		
	}

	closeDoors() {
		var t = this;
		if(this.doorsOpen === true) {
			var doorTimer = setInterval(function() {
				if(t.rightDoor.x > (t.width * 0.5) + t.x ) {
					t.moveDoors(1, MoveDirection.IN);
				}
				else {
					t.doorsOpen = false;
					clearInterval(doorTimer)
					
				}
			}, 40);
		}
	}
	
	

}

class Person {
	constructor(currentFloor, destination) {
		this.currentFloor = currentFloor;
		this.destination = destination;
	}
}

class Floor {
	constructor(index, total, building, ylevel) {
		this.index = index;
		this.total = total;
		
		this.building = building;
		this.waiters = 0;
		this.ylevel = this.building.y + (((this.building.height / this.total))* index);
	}
	height() {
		return this.building.height / this.total;
	}
}


class Building {
	constructor(x, y, width, height, floors, elevators) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.floors = [];
		this.elevators = [];
		for(var i = floors; i > 0; i--) {
			var t = this;
			t.floors.push(new Floor(i, floors, t));
			console.log("made new floor");
		}
		for(var i = 0; i < elevators; i++) {
			this.elevators.push(new Elevator(this.x + (i * this.width * (0.9 / elevators)), this.y, this.width * (0.9 / elevators), this.height / this.floors.length, 5));
		}
		
	}

	elevatorToFloor(elevatorIndex, floorIndex, callback) {
		if(this.elevators[elevatorIndex].currentFloor == floorIndex) {
			callback();
			return;
		}
		else {
			if(floorIndex < this.elevators[elevatorIndex].currentFloor) {
				var t = this;
				t.elevators[elevatorIndex].closeDoors();
				var moveTimer = setInterval(function() {
					if(t.floors[floorIndex].ylevel > t.elevators[elevatorIndex].height + t.elevators[elevatorIndex].y ) {
						t.elevators[elevatorIndex].moveVertical(1, MoveDirection.DOWN);
					}
					else {
						clearInterval(moveTimer)
						t.elevators[elevatorIndex].openDoors();
						t.elevators[elevatorIndex].currentFloor = floorIndex;
						callback();
					}
				}, 20);
			}
			if(floorIndex > this.elevators[elevatorIndex].currentFloor) {
				var t = this;
				t.elevators[elevatorIndex].closeDoors();
				var moveTimer = setInterval(function() {
					if(t.floors[floorIndex].ylevel < t.elevators[elevatorIndex].height + t.elevators[elevatorIndex].y ) {
						t.elevators[elevatorIndex].moveVertical(1, MoveDirection.UP);
					}
					else {
						clearInterval(moveTimer);
						t.elevators[elevatorIndex].openDoors();
						t.elevators[elevatorIndex].currentFloor = floorIndex;
						callback();
					}
				}, 20);
			}
		}
	}
	
	draw() {
		// Draw the floors
		for(let i = 0; i < this.floors.length; i++) {
			ctx.fillStyle = "#ffffff";
			ctx.lineWidth = 1;
			var ycalc = this.y + ((this.height / this.floors.length) * i)
			ctx.moveTo(this.x, ycalc);
			ctx.lineTo(this.x + this.width - 30, ycalc);
			ctx.stroke();
		}
		// Draw the elevators
		for(let i = 0; i < this.elevators.length; i++) {
			this.elevators[i].draw();
			//this.elevators[i].openDoors();
			//var t = this;
			// var nothing = setTimeout(function() {
			// 	t.elevators[i].closeDoors();	
			// 	t.doorsOpen = false;
			// 	setTimeout(function() {
			// 		t.elevatorToFloor(i, 4)
			// 	}, Math.floor(Math.random() * 10000))
			// }, Math.floor(Math.random() * 20000));
		}
		
	}
}

function doMoveLoop(building, elevatorIndex) {
	setTimeout(function() {
		building.elevatorToFloor(elevatorIndex, Math.floor(Math.random() * (building.floors.length - 1) + 1), function() {
			doMoveLoop(building, elevatorIndex);
		});
	}, Math.floor(Math.random() * 10000))
}


function main() {
	canvas = document.getElementById("mycanvas");
	canvas.width = window.innerWidth * 0.75;
	canvas.height = window.innerHeight * 0.75;




	ctx = canvas.getContext("2d");
	ctx.fillStyle = "#d8fff7";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	var elevator1 = new Elevator(100,200, 200, 200, null);
	var building = new Building(50, 50, 400, 600, 6, 8);
	setInterval(function() {
		ctx.beginPath();
		ctx.clearRect(0,0,canvas.width, canvas.height);
		building.draw();
	},1000/60)
	doMoveLoop(building, 0);
	doMoveLoop(building, 1);
	doMoveLoop(building, 2);
	doMoveLoop(building, 3);
	doMoveLoop(building, 4);
	doMoveLoop(building, 5);
	doMoveLoop(building, 6);
	doMoveLoop(building, 7);
}




function drawLineAtPlace(posX, posY) {
	ctx.fillRect(0,0,640,480);
	//ctx.moveTo(200,200);
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.moveTo(posX, posY);
    //ctx.rotate();
    ctx.lineTo(posX + 10, posY + 10);
    ctx.stroke();
    //ctx.rotate(-pos);
}



function drawDoorPercentageOpen(px, heightOfDoor, widthOfDoor) {
	ctx.fillStyle = "#d8fff7";
	ctx.fillRect(0,0,600,600);
	
	var py = heightOfDoor * (Math.cos((px / 100) * (Math.PI) / 2)) / 4;
	var p2y = heightOfDoor-py;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(widthOfDoor,0);
	ctx.lineTo((px / 100) * 600, py);
	ctx.lineTo((px / 100) * 600, p2y);
	ctx.lineTo(widthOfDoor,heightOfDoor);
	ctx.fillStyle = "rgb(255, 0, 0)";
	ctx.fill();
	ctx.stroke();
	//console.log(px);
	ctx.beginPath();
	
	ctx.fillStyle = "rgb(0, 255, 0)";
	ctx.ellipse((px * 5.5) + 10 + (10 * Math.sin(((px) / 100) * (Math.PI / 2))), (5 * heightOfDoor) / 8,
				20 * (1 - Math.cos((((px - 33) / 67) * (Math.PI / 2)))),
				20, 0, Math.PI * 2, 0);
	ctx.fill();
	
}
