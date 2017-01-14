document.addEventListener( 'keypress', onDocumentKeyPress, false );
document.addEventListener( 'keydown',  onDocumentKeyDown, false );

document.getElementById("switchsidebar").addEventListener("click", switchsidebar);
document.getElementById("generate").addEventListener("click", generateSolves);
document.getElementById("neuralscramble").addEventListener("click", neuralScramble);
document.getElementById("neuralsolve").addEventListener("click", neuralSolve);
document.getElementById("scramble").addEventListener("click", scramble);
document.getElementById("solve").addEventListener("click", solve);
document.getElementById("fold").addEventListener("click", fold);
document.getElementById("execute").addEventListener("click", execute);
document.getElementById("speed").addEventListener("change", onChangeSpeed);
//document.getElementById("command").addEventListener( 'keypress', onDocumentKeyPress);
document.getElementById("getposition").addEventListener("click", getPosition);
document.getElementById("setposition").addEventListener("click", setPosition);

let command = document.getElementById("command");
let position = document.getElementById("position");
let cubeElement = document.getElementById("cube");
let cubeConsole = new CubeConsole(SINGMASTER_SOLVED_STATE, cubeElement);
let sideBarIsOpen = false;
cubeConsole.render();
//cubeConsole.cube.enableAnimation = false;
//cubeConsole.inputChar('O');
cubeConsole.renderer.domElement.addEventListener('mousedown', onMouseDown, false);
cubeConsole.renderer.domElement.addEventListener('mousemove', onMouseMove, false);
cubeConsole.renderer.domElement.addEventListener('mouseup', onMouseUp, false);
cubeConsole.renderer.domElement.addEventListener('touchstart', onTouchStart, false);
cubeConsole.renderer.domElement.addEventListener('touchmove', onTouchMove, false);
cubeConsole.renderer.domElement.addEventListener('touchend', onTouchEnd, false);

var net = new brain.NeuralNetwork();

function numberify(op) {
	var num = 9999;
	switch (op) {
		case "U":
			num = 0;
			break;
		case "D":
			num = 1;
			break;
		case "R":
			num = 2;
			break;
		case "L":
			num = 3;
			break;
		case "F":
			num = 4;
			break;
		case "B":
			num = 5;
			break;
		case "U'":
			num = 6;
			break;
		case "D'":
			num = 7;
			break;
		case "R'":
			num = 8;
			break;
		case "L'":
			num = 9;
			break;
		case "F'":
			num = 10;
			break;
		case "B'":
			num = 11;
			break;
		case "UU":
			num = 12;
			break;
		case "DD":
			num = 13;
			break;
		case "RR":
			num = 14;
			break;
		case "LL":
			num = 15;
			break;
		case "FF":
			num = 16;
			break;
		case "BB":
			num = 17;
			break;
	}
	return num/20;
}
function deNumberify(op) {
	var num = "S";

	op = op*20;
	op = Math.round(op);
	switch (op) {
		case 0:
			num = "U";
			break;
		case 1:
			num = "D";
			break;
		case 2:
			num = "R";
			break;
		case 3:
			num = "L";
			break;
		case 4:
			num = "F";
			break;
		case 5:
			num = "B";
			break;
		case 6:
			num = "U'";
			break;
		case 7:
			num = "D'";
			break;
		case 8:
			num = "R'";
			break;
		case 9:
			num = "L'";
			break;
		case 10:
			num = "F'";
			break;
		case 11:
			num = "B'";
			break;
		case 12:
			num = "UU";
			break;
		case 13:
			num = "DD";
			break;
		case 14:
			num = "RR";
			break;
		case 15:
			num = "LL";
			break;
		case 16:
			num = "FF";
			break;
		case 17:
			num = "BB";
			break;
	}
	return num;
}

function scramble() { cmd ('S');}
function solve() { cmd ('V');}
function fold() {
  if (cubeConsole.cube.isFolded){
    screen.lockOrientation('landscape');
  }else{
    screen.unlockOrientation();
  }
  cmd ('O');
}
function execute(){
  command.value.split('').forEach(x=>cubeConsole.inputChar(x));
  command.value = "";
}
function getPosition(){
  position.value = cubeConsole.cube.getState();
}

function setPosition(){
  let state = position.value;
  if(isValidCubeState(state)){
    cubeConsole.cube.setState(state);
  }
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
		let windowHalfX = window.innerWidth / 2;
		let windowHalfY = window.innerHeight / 2;
		cubeConsole.camera.aspect = window.innerWidth / window.innerHeight;
		cubeConsole.camera.updateProjectionMatrix();
		cubeConsole.renderer.setSize( window.innerWidth, window.innerHeight );
}

function onChangeSpeed(e){
  cubeConsole.cube.timePerAnimationMove = 5000/e.target.value;
}

function onMouseUp(event){
	cubeConsole.interactive.onMouseUp(event);
}

function onMouseMove(event){
	cubeConsole.interactive.onMouseMove(event);
}

function onMouseDown(event){
	cubeConsole.interactive.onMouseDown(event);
}
function onTouchStart(event){
	cubeConsole.interactive.onTouchStart(event);
}

function onTouchMove(event){
	cubeConsole.interactive.onTouchMove(event);
}

function onTouchEnd(event){
	cubeConsole.interactive.onTouchEnd(event);
}

function onDocumentKeyDown( event ) {
  if(sideBarIsOpen) return;
	var keyCode = event.keyCode;
	if ( keyCode == 8 ) {
		//event.preventDefault();
		cubeConsole.deleteChar();
		//console.log("deleting");
		//return false;
	}
}

function onDocumentKeyPress ( event ) {
  if(sideBarIsOpen) return;
	var keyCode = event.which;
	if ( keyCode == 8 ) {

		//event.preventDefault();
	} else if (document.activeElement.nodeName == "BODY"||
            document.activeElement.id == "command"){
		var ch = String.fromCharCode( keyCode );
    console.log("press: ", ch, document.activeElement.id);
    cmd(ch);
	}
}

function cmd(op){
  if(op.toUpperCase()=="V"){
    onBottomUpSolver();
  }else{
    cubeConsole.inputChar(op);
  }
}

function onCommand(op){
	cubeConsole.cube.command(op);
}

function onChangeTransparent(value){
	var opacity = (100-value)/100;
	cubeConsole.cube.setOpacity(opacity);
}

function onBottomUpSolver(){
		cubeConsole.cube.setIsInSolverMode(true);
		var solver = new BottomupSolver(cubeConsole.cube.getState());
		solver.solve().forEach(op=>cubeConsole.cube.command(op));
}

function generateSolves(){
	/*var net = new brain.NeuralNetwork();

	//[[0.2,0.5],[0.3,0],[0,0.3],[0.35,0.05],[0.5,0.2],[0.2,0.5],[0,0.3],[0.2,0.5],[0.4,0.1],[0.05,0.35]]
	var data1 = [{input: [0], output: [0.3]},
           {input: [0.05], output: [0.35]},
           {input: [0.1], output: [0.4]},
           {input: [0.15], output: [0.45]},
           {input: [0.2], output: [0.5]},
           {input: [0.25], output: [0.55]},
           {input: [0.3], output: [0]},
           {input: [0.35], output: [0.05]},
           {input: [0.4], output: [0.1]},
           {input: [0.45], output: [0.15]},
           {input: [0.5], output: [0.2]},
           {input: [0.55], output: [0.25]}];
    console.log(data1);
	net.train(data1);

	var output = net.run([0.2]);
	console.log(output);*/

	var n = 10000;
	var data = []
	var datasubsetScramble = [];
	var datasubsetSolve = [];
	console.log("Generating ", n, "random states");
	while(n>0) {
		console.log("iteration number:")
		var ops = cubeConsole.cube.randomize();
		//console.log("Random State: ", cubeConsole.cube.getState());
		ops.forEach(op=>datasubsetScramble.push(numberify(op)));
		//console.log(ops);

		/*var solver = new BottomupSolver(cubeConsole.cube.getState());
		var solveArray = solver.solve();
		//console.log("SolveArray: ", solveArray);
		solveArray.forEach(op=>datasubsetSolve.push(numberify(op)));
    cubeConsole.cube.setState(SINGMASTER_SOLVED_STATE);*/

		var temp = datasubsetScramble;
		for (var i = temp.length; i > 0; i--) {
			  var op = temp[i-1];
			  if (op < 0.3) {
					  datasubsetSolve.push(op + 0.3);
				} else {
					  datasubsetSolve.push(op - 0.3);
				}
		}

    var object = {};
    object["input"] = datasubsetScramble;
    object["output"] = datasubsetSolve;
    data.push(object);
    datasubsetScramble = [];
    datasubsetSolve = [];
		n = n-1;
	}




	console.log(data);

	net.train(data, {log: true, errorThresh: 0.0001, iterations: 20000});
	var output = net.run([0.3, 0.3]);
	console.log(output);

	cubeConsole.cube.setState(SINGMASTER_SOLVED_STATE);

}

var neuralInput;

function neuralScramble() {
	neuralInput = cubeConsole.cube.randomize();
}

function neuralSolve() {
	var inputArray = [];
	neuralInput.forEach(op=>inputArray.push(numberify(op)));
	console.log(inputArray);
	var neuralOutput = net.run(inputArray);
	console.log(neuralOutput);
	var outputOps = [];
	neuralOutput.forEach(op=>outputOps.push(deNumberify(op)));
  outputOps.forEach(op=>cubeConsole.cube.command(op));
}

function setInitialPosition(){
	var initState = document.getElementById("initPosition").value;
	if (!isValidCubeState(initState)){
		document.getElementById("initPosition").select();
		document.getElementById("message").innerText = "invalid state !";
		return;
	}else{
		document.getElementById("message").innerText = "";
		cubeConsole.cube.setCubeState(initState);
	}
}

function switchsidebar() {
    if (document.getElementById("cubeSidenav").style.width != "150px"){
      document.getElementById("cubeSidenav").style.width = "150px";
      sideBarIsOpen = true;
    }
    else {
      document.getElementById("cubeSidenav").style.width = "0px";
      sideBarIsOpen = false;
    }
}
