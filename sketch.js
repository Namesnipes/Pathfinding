const COLS = 64;
const ROWS = 64;
const windowRatio = window.innerHeight / window.innerWidth;
const maxPossibleWidth = Math.floor((window.innerWidth * windowRatio) * 0.95);
const maxPossibleHeight = Math.floor((window.innerHeight ) * 0.95);
const stepSizeX = Math.floor(maxPossibleWidth / COLS);
const stepSizeY = Math.floor(maxPossibleHeight / ROWS);
const width = stepSizeX * COLS
const height = stepSizeY * ROWS
const DEBUG = false

let nodes = [];
let teleporters = [];
let priorityQueue = new PriorityQueue(function(){return this.val.f})
let path = [];
let pathChanged = true;
let startNode = null
let endNode = null;


function setup() {
    let cnv = createCanvas(width, height);
    cnv.parent('sketch-holder');

    //create nodes
    for(let node = 0; node < (ROWS * COLS); node++) {
        let coords = Node.getXYCoordFromNode(node);
        let newNode = new Node(node,coords[0], coords[1])
        nodes.push(newNode);
    }

    //create teleporters, set heuristic function
    Node.connectTeleporters(nodes[(COLS*ROWS)/2+30],nodes[(COLS*ROWS)/2+40]);
    Node.setHeuristicFunction(function(goal){
        function closestTeleporterTo(node){
            let closestDistance = Infinity;
            let closestNode = null;
            for(let teleporter = 0; teleporter < Node.teleporters.length; teleporter++) {
                let distance = Node.getEuclideanDistance(node,Node.teleporters[teleporter]);
                if(distance < closestDistance){
                    closestDistance = distance;
                    closestNode = Node.teleporters[teleporter];
                }
            }
            return closestNode;
        }
        
        let teleporterDist = Node.getManhattanDistance(this,closestTeleporterTo(this)) + Node.getManhattanDistance(goal,closestTeleporterTo(goal))
        let normalDist = Node.getManhattanDistance(this,goal)
        this.h = Math.min(teleporterDist,normalDist)
    });

    //add neighbours to nodes, calculate heuristic for nodes
    for(let node = 0; node < (ROWS * COLS); node++) {
        let possible_neighbors = []
        // add neighbors around node
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
        nodes[node].addNeighbors(possible_neighbors);
        nodes[node].calculateHeuristic(nodes[nodes.length-1]);
    }

    //set start and end nodes
    startNode = nodes[0]
    endNode = nodes[nodes.length-1]
    Node.displayAll(nodes)
  }
  
  function draw() {
    //if optimal path possibly changed, recalculate path
    if(pathChanged){
        Node.resetSets(nodes)
        Node.resetColors(path)
        path = AStarPriorityQueue(startNode,endNode,priorityQueue)
        if(path){
            for (let i = 0; i < path.length; i++) {
                const node = path[i];
                if(node.isTeleporter) continue
                node.setColor(color(0,255,0))
            }
        }
    }
    pathChanged = false;
    startNode.setColor(color(0,100,0))
    endNode.setColor(color(255,0,0))
  }


/* ------- User Input functions ---------*/
let currentClickedNode = null;
function getNodeFromScreenCoords(sx,sy){
    let x = sx;
    let y = sy;
    let pixelX = floor(x / stepSizeX);
    let pixelY = floor(y / stepSizeY);
    if(pixelX < 0 || pixelX >= COLS || pixelY < 0 || pixelY >= ROWS){
        return null;
    }
    let clickedNode = nodes[Node.getNodeFromXYCoord(pixelX, pixelY)];
    return clickedNode
}
function mouseClicked(){
    let clickedNode = getNodeFromScreenCoords(mouseX,mouseY)
    if(clickedNode != undefined) {
        console.log(clickedNode)
    }
}

let teleporter1 = null
let teleporter2 = null;
function doubleClicked(){
    let clickedNode = getNodeFromScreenCoords(mouseX,mouseY)
    if(clickedNode != undefined){
        if(!teleporter1){
            teleporter1 = clickedNode
            teleporter1.setColor(color(0,0,255))
        } else if(!teleporter2) {
            teleporter2 = clickedNode
            let success = Node.connectTeleporters(teleporter1,teleporter2)
            if(success){
                pathChanged = true
            } else {
                Node.resetColors([teleporter1,teleporter2])
            }
            teleporter1 = null;
            teleporter2 = null;
        }
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
                    pathChanged = true;
                }
                clickedNode.display()
            }
        }
    }
}
/* ---------------------------*/

/* -------- A* algorithms ------------*/
function aStarBasic(startNode, endNode){
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

function AStarPriorityQueue(startNode, endNode, priorityQueue=new PriorityQueue(function(){return this.val.f})){ //todo fix this g function
    if(DEBUG) Node.resetColors(nodes)

    priorityQueue.clear()
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
                    searchingNode.calculateHeuristic(endNode)
                    searchingNode.f = searchingNode.g + searchingNode.h
                    searchingNode.parent = currentNode //todo bubble up node after it changes
                    openSet.bubbleUpOrDown(searchingNode.priorityQueueNode.pos)
                    if(DEBUG) searchingNode.setColor(color(128,0,(searchingNode.h/126)*255))
                }
            } else { // never seen before node
                searchingNode.openSet = true;
                searchingNode.g = Node.g(searchingNode,currentNode)
                searchingNode.calculateHeuristic(endNode)
                searchingNode.f = searchingNode.g + searchingNode.h
                searchingNode.parent = currentNode
                searchingNode.priorityQueueNode = openSet.createNode(searchingNode)
                if(DEBUG) searchingNode.setColor(color(128,0,(searchingNode.h/126)*255))
            }

        }
    }
}