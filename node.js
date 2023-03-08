class Node{

    static g(to,from){
        let x1 = to.x;
        let y1 = to.y;
        let x2 = from.x;
        let y2 = from.y;
        return from.g + (Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
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

    static resetAllColors(nodes){
        for (let node = 0; node < nodes.length; node += 1) {
            if(nodes[node].walkable){
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
            nodes[node].g = 0;
            nodes[node].f = 0;
        }
    }

    constructor(num,x,y){
        this.num = num;
        this.x = x;
        this.y = y;
        this.screenX = x * stepSizeX;
        this.screenY = y * stepSizeY;
        this.neighbors = [];
        this.heuristic = 0;
        this.walkable = true;
        this.f = 0;
        if(this.walkable){
            this.color = color(255,255,255);
        } else{
            this.color = color(0,0,0)
        }
    }

    setColor(color){
        if(this.color.levels[0] !== color.levels[0] || this.color.levels[1] !== color.levels[1] || this.color.levels[2] !== color.levels[2]){
            this.color = color
            this.display()
        }
    }

    getNeighbors(){
        return this.neighbors;
    }

    setNeighbors(neighbors){
        this.neighbors = neighbors;
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

    calculateHeuristic(goal){
        if(!this.h){
            let x1 = this.x;
            let y1 = this.y;
            let x2 = goal.x;
            let y2 = goal.y;
            let distance = Math.abs(x1-x2) + Math.abs(y1-y2); //todo: remove sqrt when done
            this.h = distance;
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