const COLS = 8;
const ROWS = 8;
const width = 800;
const height = 800;
const stepSizeX = width / COLS;
const stepSizeY = height / ROWS;

let nodes = [];
let endNode = null;


function setup() {
    createCanvas(width, height);
    for(let node = 0; node < (ROWS * COLS); node++) {
        let coords = getXYCoordFromNode(node);
        nodes.push(new Node(node,coords[0], coords[1]));
    }
    endNode = nodes[nodes.length-1]
    for(let node = 0; node < (ROWS * COLS); node++) {
        nodes[node].calculateNeighbors();
        nodes[node].calculateHeuristic();
    }
    console.log(aStar(nodes[0],endNode))
  }
  
  function draw() {
    background(220);
    for (var node = 0; node < (ROWS * COLS); node += 1) {
        nodes[node].display();
    }
  }


function getXYCoordFromNode(num) {
    let x = (num % COLS)
    let y = Math.floor(num / COLS)
    return [x, y];
}

function getNodeFromXYCoord(x,y){
    return y * COLS + x;
}

let currentClickedNode = null;
function mouseClicked(){
    let x = mouseX;
    let y = mouseY;
    let pixelX = floor(x / stepSizeX);
    let pixelY = floor(y / stepSizeY);
    let clickedNode = nodes[getNodeFromXYCoord(pixelX, pixelY)];
    console.log(clickedNode.num,clickedNode.h)
    if(clickedNode != undefined) {
        if(currentClickedNode != null) {
            currentClickedNode.unColorNeighbours(255,255,255);
        }
        currentClickedNode = clickedNode;
        currentClickedNode.colorNeighbours(0,0,0);
    }
}

function g(to,from){
    let x1 = to.x;
    let y1 = to.y;
    let x2 = from.x;
    let y2 = from.y;
    return from.g + Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

class Node{
    constructor(num,x,y){
        this.num = num;
        this.x = x;
        this.y = y;
        this.screenX = x * stepSizeX;
        this.screenY = y * stepSizeY;
        this.neighbors = [];
        this.color = color(255,255,255);
        this.heuristic = 0;
    }

    getNeighbors(){
        return this.neighbors;
    }

    calculateNeighbors(){
        for(let node2 = 0; node2 < (ROWS * COLS); node2++) {
            let coords2 = getXYCoordFromNode(node2);
            let x2 = coords2[0];
            let y2 = coords2[1];
            if(Math.abs(this.x - x2) <= 1 && Math.abs(this.y - y2) <= 1) {
                if(nodes[node2] != this){
                    this.neighbors.push(nodes[node2]);
                }
            }
        }
    }

    calculateHeuristic(){
        let x1 = this.x;
        let y1 = this.y;
        let x2 = endNode.x;
        let y2 = endNode.y;
        let distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)); //todo: remove sqrt when done
        this.h = distance;
    }

    colorNeighbours(color){
        for(let i = 0; i < this.neighbors.length; i++) {
            this.neighbors[i].color = color;
        }
    }
    unColorNeighbours(color){
        for(let i = 0; i < this.neighbors.length; i++) {
            this.neighbors[i].color = color
        }
    }

    display(){
        fill(this.color);
        square(this.screenX, this.screenY, stepSizeX);
        fill(0);
        stroke(0);
        line(this.screenX, this.screenY, this.screenX + stepSizeX, this.screenY);// top line
        line(this.screenX, this.screenY + stepSizeY, this.screenX + stepSizeX, this.screenY + stepSizeY);// bottom line
        line(this.screenX, this.screenY, this.screenX, this.screenY + stepSizeY);// left line
        line(this.screenX + stepSizeX, this.screenY, this.screenX + stepSizeX, this.screenY + stepSizeY);// right line
        text(this.num,this.screenX + stepSizeX/2,this.screenY + stepSizeY/2)
    }
}


//goal node top of priority queue

function aStar(startNode, endNode){
    //init open sets with startNode
    let openSet = [startNode];
    openSet[0].f = openSet[0].g = 0;
    let closedSet = [];

    //loop until end
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
            if(closedSet.includes(searchingNode)) continue
            if(openSet.includes(searchingNode)){
                let distToA = searchingNode.g
                let distToAFromB = g(searchingNode,currentNode)

                if(distToAFromB < distToA){
                    searchingNode.g = distToAFromB
                    searchingNode.f = searchingNode.g + searchingNode.h
                    searchingNode.parent = currentNode
                }
            } else {
                openSet.push(searchingNode)
                searchingNode.g = g(searchingNode,currentNode)
                searchingNode.f = searchingNode.g + searchingNode.h
                searchingNode.parent = currentNode
            }

        }
    }
}