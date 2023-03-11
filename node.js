class Node{

    static teleporters = []

    static g(to,from){
        let x1 = to.x;
        let y1 = to.y;
        let x2 = from.x;
        let y2 = from.y;
        return from.g + 1; //edge cost is always 1 in a grid with no diagonals, consider this only with diagonals (Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
    }

    static getNodeFromXYCoord(x,y){
        return y * COLS + x;
    }

    static getXYCoordFromNode(num) {
        let x = (num % COLS)
        let y = Math.floor(num / COLS)
        return [x, y];
    }

    static displayAll(nodes){
        for (let node = 0; node < nodes.length; node += 1) {
            nodes[node].display()
        }
    }

    static resetColors(nodes){
        for (let node = 0; node < nodes.length; node += 1) {
            if(nodes[node].walkable){
                if(nodes[node].isTeleporter) continue
                nodes[node].setColor(color(255,255,255))
            } else{
                nodes[node].setColor(color(0,0,0))
            }
        }
    }

    static resetSets(nodes){
        for (let node = 0; node < nodes.length; node += 1) {
            nodes[node].openSet = false;
            nodes[node].closedSet = false;
        }
    }

    static setHeuristicFunction(h){
        function calculateHeuristic(goal){
            if(!this.h){
                let x1 = this.x;
                let y1 = this.y;
                let x2 = goal.x;
                let y2 = goal.y;
                let distance = Math.abs(x1-x2) + Math.abs(y1-y2); //todo: remove sqrt when done
                this.h = distance;
            }
        }
        Node.prototype.calculateHeuristic = h || calculateHeuristic
    }

    static getEuclideanDistance(n1,n2){
        let x1 = n1.x;
        let y1 = n1.y;
        let x2 = n2.x;
        let y2 = n2.y;
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    static getManhattanDistance(n1,n2){
        let x1 = n1.x;
        let y1 = n1.y;
        let x2 = n2.x;
        let y2 = n2.y;
        return Math.abs(x1-x2) + Math.abs(y1-y2);
    }

    static connectTeleporters(node1, node2){
        if(Node.getManhattanDistance(node1,node2) <= 2){
            console.log("teleporters too close")
            return false
        }
        node1.isTeleporter = true
        node2.isTeleporter = true

        node1.setColor(color(0,0,255))
        node2.setColor(color(255,160,0))

        node1.neighbors.push(node2);
        node2.neighbors.push(node1);
        Node.teleporters.push(node1)
        Node.teleporters.push(node2)
        return true
    }

    constructor(num,x,y){
        if(!this.calculateHeuristic) Node.setHeuristicFunction()
        this.isTeleporter = false
        this.num = num;
        this.x = x;
        this.y = y;
        this.screenX = x * stepSizeX;
        this.screenY = y * stepSizeY;
        this.neighbors = [];
        this.walkable = true;
        this.f = 0;
        if(this.walkable){
            this.color = color(255,255,255);
        } else{
            this.color = color(0,0,0)
        }
    }

    setColor(colorIn){
        if(this.isTeleporter && (colorIn.levels[0] !== 0 && colorIn.levels[1] !== 160)) return
        if(this.color.levels[0] !== colorIn.levels[0] || this.color.levels[1] !== colorIn.levels[1] || this.color.levels[2] !== colorIn.levels[2]){
            this.color = colorIn
            this.display()
        }
    }

    getNeighbors(){
        return this.neighbors;
    }

    addNeighbors(neighbors){
        this.neighbors = this.neighbors.concat(neighbors);
    }

    calculateNeighbors(nodes){
        for(let node2 = 0; node2 < (ROWS * COLS); node2++) {
            let coords2 = Node.getXYCoordFromNode(node2);
            let x2 = coords2[0];
            let y2 = coords2[1];
            if(Math.abs(this.x - x2) <= 1 && Math.abs(this.y - y2) <= 1) {
                if(nodes[node2] != this){
                    this.neighbors.push(nodes[node2]);
                }
            }
        }
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
        noStroke();
        fill(this.color);
        //rect(this.screenX, this.screenY, stepSizeX, stepSizeY);

        square(this.screenX, this.screenY, stepSizeX);
        //fill(0);
        //stroke(0);
        //line(this.screenX, this.screenY, this.screenX + stepSizeX, this.screenY);// top line
        //line(this.screenX, this.screenY + stepSizeY, this.screenX + stepSizeX, this.screenY + stepSizeY);// bottom line
        //line(this.screenX, this.screenY, this.screenX, this.screenY + stepSizeY);// left line
        //line(this.screenX + stepSizeX, this.screenY, this.screenX + stepSizeX, this.screenY + stepSizeY);// right line
        //text(this.num,this.screenX + stepSizeX/2,this.screenY + stepSizeY/2)
    }
}