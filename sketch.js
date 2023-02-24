const COLS = 16;
const ROWS = 16;
const windowRatio = window.innerHeight / window.innerWidth;
const width = (window.innerWidth * windowRatio) * 0.9;
const height = (window.innerHeight) * 0.9;
const stepSizeX = width / COLS;
const stepSizeY = height / ROWS;

let nodes = [];
let path = [];
let pathChanged = true;
let startNode = null
let endNode = null;

function setup() {
    createCanvas(width, height);
    //create nodes
    for(let node = 0; node < (ROWS * COLS); node++) {
        let coords = Node.getXYCoordFromNode(node);
        nodes.push(new Node(node,coords[0], coords[1]));
    }
    //run calculations on nodes
    for(let node = 0; node < (ROWS * COLS); node++) {
        // add neighbors around node
        let possible_neighbors = []
        for(let x = -1; x < 2; x++){
            for(let y = -1; y < 2; y++){
                let nodeX = Node.getXYCoordFromNode(node)[0] + x;
                let nodeY = Node.getXYCoordFromNode(node)[1] + y;
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
        let startTime = performance.now()
        path = aStar(startNode,endNode)
        console.log("solving took " + (performance.now() - startTime) + " ms")
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
        //Node.resetAllColors(nodes)
        //endNode = clickedNode;
    }
}
function doubleClicked(){
    let clickedNode = getNodeFromScreenCoords(mouseX,mouseY)
    if(clickedNode != undefined) {
        //clickedNode.walkable = false
        //clickedNode.color = color(0,0,0)
        //Node.resetAllColors(nodes)
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