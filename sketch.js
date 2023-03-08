const COLS = 64;
const ROWS = 64;
const windowRatio = window.innerHeight / window.innerWidth; //TODO: make the canvas exactly fit each pixel TODOTODO: canvas doesnt fit each pixel because stepsizes are floored
const maxPossibleWidth = Math.floor((window.innerWidth * windowRatio) * 0.95);
const maxPossibleHeight = Math.floor((window.innerHeight ) * 0.95);
const stepSizeX = Math.floor(maxPossibleWidth / COLS);
const stepSizeY = Math.floor(maxPossibleHeight / ROWS);
const width = stepSizeX * COLS
const height = stepSizeY * ROWS

let nodes = [];
let priorityQueue = new PriorityQueue(function(){return this.val.f})
let path = [];
let pathChanged = true;
let startNode = null
let endNode = null;

function setup() {
    createCanvas(width, height);
    //create nodes
    for(let node = 0; node < (ROWS * COLS); node++) {
        let coords = Node.getXYCoordFromNode(node);
        let newNode = new Node(node,coords[0], coords[1])
        nodes.push(newNode);
    }
    //run calculations on nodes
    for(let node = 0; node < (ROWS * COLS); node++) {
        // add neighbors around node
        let possible_neighbors = []
        for(let x = -1; x < 2; x++){
            for(let y = -1; y < 2; y++){
                let nodeX = Node.getXYCoordFromNode(node)[0] + x;
                let nodeY = Node.getXYCoordFromNode(node)[1] + y;
                if(Math.abs(x) + Math.abs(y) > 1) {continue}
                if(nodeX >= 0 && nodeX < COLS && nodeY >= 0 && nodeY < ROWS && nodes[Node.getNodeFromXYCoord(nodeX, nodeY)] != nodes[node]){
                    possible_neighbors.push(nodes[Node.getNodeFromXYCoord(nodeX, nodeY)]);
                }
            }
        }
        nodes[node].setNeighbors(possible_neighbors);
        nodes[node].calculateHeuristic(nodes[nodes.length-1]);
    }

    startNode = nodes[0]
    endNode = nodes[nodes.length-1]
    Node.displayAll(nodes)
  }
  
  function draw() {
    if(pathChanged){
        Node.resetSets(nodes)
        path2 = aStar(startNode,endNode)
        Node.resetSets(nodes)
        path = aTestStar2(startNode,endNode,priorityQueue)
        console.log(getPathLength(path) === getPathLength(path2), getPathLength(path), getPathLength(path2))
        if(getPathLength(path) !== getPathLength(path2)){
            debugger
            aTestStar2(startNode,endNode,priorityQueue)
        }
        if(path){
            for (let i = 0; i < path.length; i++) {
                const node = path[i];
                node.setColor(color(0,255,0))
            }
        }
    }
    pathChanged = false;
    startNode.setColor(color(0,100,0))
    endNode.setColor(color(255,0,0))
  }

  function getPathLength(path){
    var sum = 0;
    for(let i = 0; i < path.length - 1; i++){
        const node = path[i];
        const node2 = path[i+1];
        const x1 = node.x;
        const y1 = node.y;
        const x2 = node2.x;
        const y2 = node2.y;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        sum += distance;
  }
  return Math.round(sum * 100) / 100;
}

let currentClickedNode = null;
function getNodeFromScreenCoords(sx,sy){
    let x = sx;
    let y = sy;
    let pixelX = floor(x / stepSizeX);
    let pixelY = floor(y / stepSizeY);
    let clickedNode = nodes[Node.getNodeFromXYCoord(pixelX, pixelY)];
    return clickedNode
}
function mouseClicked(){
    let clickedNode = getNodeFromScreenCoords(mouseX,mouseY)
    if(clickedNode != undefined) {
        console.log(clickedNode)
    }
}
function doubleClicked(){
    let clickedNode = getNodeFromScreenCoords(mouseX,mouseY)
    if(clickedNode != undefined) {
        console.log("tmiing start")
        var iterations = 1;

        console.time('base');
        for(var i = 0; i < iterations; i++ ){
            Node.resetSets(nodes)
            aStar(startNode,endNode)
        };
        console.timeEnd('base')

        console.time('new');
        for(var i = 0; i < iterations; i++ ){
            Node.resetSets(nodes)
            aTestStar(startNode,endNode)
        };
        console.timeEnd('new')

        console.time('newer');
        for(var i = 0; i < iterations; i++ ){
            Node.resetSets(nodes)
            aTestStar2(startNode,endNode,priorityQueue)
        };
        console.timeEnd('newer')
    }
}

function mouseDragged(){
    let clickedNode = getNodeFromScreenCoords(mouseX,mouseY)
    if(clickedNode != undefined) {
        if(mouseIsPressed){
            if(clickedNode.walkable){
                clickedNode.walkable = false
                clickedNode.setColor(color(0,0,0))
                if(path && path.includes(clickedNode)){
                    Node.resetAllColors(path)
                    pathChanged = true;
                }
                attemptedSolveOnThisMaze = false
                clickedNode.display()
            }
        }
    }
}



function aStar(startNode, endNode){
    //init open sets with startNode
    let openSet = [startNode];
    openSet[0].f = openSet[0].g = 0;
    let closedSet = [];

    //loop until openset is empty
    while(openSet.length > 0){

        //get node with lowest f value
        let lowest = Infinity
        let currentNode = null;
        let currentIndex = -1;
        for(let i = 0; i < openSet.length; i++){
            if(openSet[i].f < lowest){
                lowest = openSet[i].f
                currentNode = openSet[i]
                currentIndex = i
            }
        }
        //move node to closedSet
        closedSet.push(currentNode)
        openSet.splice(currentIndex,1);

        //we found the goal
        if(currentNode === endNode){
            let ancestorNode = currentNode
            let path = [ancestorNode]
            while(ancestorNode.parent != null){
                path.push(ancestorNode.parent)
                ancestorNode = ancestorNode.parent
            }
            return path;
        }


        let adjacents = currentNode.neighbors
        //loop through adjacent nodes
        for(let i = 0; i < adjacents.length; i++){
            let searchingNode = adjacents[i]
            if(closedSet.includes(searchingNode) || !searchingNode.walkable) continue
            //if adjacent node is in the openset, see if the path to it is better
            if(openSet.includes(searchingNode)){
                let distToA = searchingNode.g
                let distToAFromB = Node.g(searchingNode,currentNode)

                if(distToAFromB < distToA){
                    searchingNode.g = distToAFromB
                    searchingNode.calculateHeuristic(endNode)
                    searchingNode.f = searchingNode.g + searchingNode.h
                    searchingNode.parent = currentNode
                }
            } else { // never seen before node
                openSet.push(searchingNode)
                searchingNode.g = Node.g(searchingNode,currentNode)
                searchingNode.calculateHeuristic(endNode)
                searchingNode.f = searchingNode.g + searchingNode.h
                //searchingNode.setColor(color(0,0,searchingNode.f/16 * 255))
                searchingNode.parent = currentNode
            }

        }
    }
}

function g(to,from){
    return from.g + (10 || (((Math.abs(from.x-to.x) + Math.abs(from.y-to.y)) == 2) && 14));
}

function calculateHeuristic2(from,goal){
    if(!from.h){
        from.h = Math.abs(goal.x-from.x) + Math.abs(goal.y-from.y);
    }
}

function aTestStar(startNode, endNode){
    //init open sets with startNode
    let openSet = [startNode];
    openSet[0].f = openSet[0].g = 0;
    let closedSet = [];

    //loop until openset is empty
    while(openSet.length > 0){

        //get node with lowest f value
        let lowest = openSet[0].f
        let currentNode = openSet[0];
        let currentIndex = 0;
        for(let i = 1; i < openSet.length; i++){ //708ms //todo priority queue
            if(openSet[i].f < lowest){           //3878ms
                lowest = openSet[i].f
                currentNode = openSet[i]
                currentIndex = i
            }
        }
        //move node to closedSet
        currentNode.closedSet = true
        currentNode.openSet = false;
        closedSet.push(currentNode)
        openSet.splice(currentIndex,1);             //648ms

        //we found the goal
        if(currentNode === endNode){
            let ancestorNode = currentNode
            let path = [ancestorNode]
            while(ancestorNode.parent != null){
                path.push(ancestorNode.parent)
                ancestorNode = ancestorNode.parent
            }
            return path;
        }


        let adjacents = currentNode.neighbors
        //loop through adjacent nodes
        for(let i = 0; i < adjacents.length; i++){
            let searchingNode = adjacents[i]
            if(searchingNode.closedSet || !searchingNode.walkable) continue //747ms
            //if adjacent node is in the openset, see if the path to it is better
            if(searchingNode.openSet){
                let distToA = searchingNode.g
                let distToAFromB = Node.g(searchingNode,currentNode)

                if(distToAFromB < distToA){
                    searchingNode.g = distToAFromB
                    calculateHeuristic2(searchingNode,endNode)
                    searchingNode.f = searchingNode.g + searchingNode.h
                    searchingNode.parent = currentNode
                }
            } else { // never seen before node
                searchingNode.openSet = true;
                openSet.push(searchingNode)
                searchingNode.g = Node.g(searchingNode,currentNode)
                calculateHeuristic2(searchingNode,endNode)
                searchingNode.f = searchingNode.g + searchingNode.h
                searchingNode.parent = currentNode
            }

        }
    }
}


function aTestStar2(startNode, endNode, priorityQueue=new PriorityQueue(function(){return this.val.f})){ //todo fix this g function
    priorityQueue.clear()
    Node.resetAllColors(nodes)
    //init open sets with startNode
    let openSet = priorityQueue
    let pnode = openSet.createNode(startNode)
    startNode.priorityQueueNode = pnode
    startNode.f = startNode.g = 0;
    let closedSet = [];

    //loop until openset is empty
    while(!openSet.isEmpty()){

        //get node with lowest f value
        let currentNode = (openSet.getMin()).getFullValue()
        //move node to closedSet
        currentNode.closedSet = true
        currentNode.openSet = false;
        closedSet.push(currentNode)
        openSet.popSmallest()

        //we found the goal
        if(currentNode === endNode){
            let ancestorNode = currentNode
            let path = [ancestorNode]
            while(ancestorNode.parent != null){
                path.push(ancestorNode.parent)
                ancestorNode = ancestorNode.parent
            }
            return path;
        }


        let adjacents = currentNode.neighbors
        //loop through adjacent nodes
        for(let i = 0; i < adjacents.length; i++){
            let searchingNode = adjacents[i]
            if(searchingNode.closedSet || !searchingNode.walkable) continue //747ms
            //if adjacent node is in the openset, see if the path to it is better
            if(searchingNode.openSet){
                let distToA = searchingNode.g
                let distToAFromB = Node.g(searchingNode,currentNode)

                if(distToAFromB < distToA){
                    searchingNode.g = distToAFromB
                    calculateHeuristic2(searchingNode,endNode)
                    searchingNode.f = searchingNode.g + searchingNode.h
                    searchingNode.parent = currentNode //todo bubble up node after it changes
                    openSet.bubbleUpOrDown(searchingNode.priorityQueueNode.pos)
                    searchingNode.setColor(color(128,0,(searchingNode.h/126)*255))
                }
            } else { // never seen before node
                searchingNode.openSet = true;
                searchingNode.g = Node.g(searchingNode,currentNode)
                calculateHeuristic2(searchingNode,endNode)
                searchingNode.f = searchingNode.g + searchingNode.h
                searchingNode.parent = currentNode
                searchingNode.priorityQueueNode = openSet.createNode(searchingNode)
                searchingNode.setColor(color(128,0,(searchingNode.h/126)*255))
            }

        }
    }
}