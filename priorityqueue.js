class PriorityNode {
    constructor(val, pos){
        this.val = val;
        this.pos = pos
     }

     getFullValue(){
        return this.val;
     }
}

class PriorityQueue {
    constructor(valueFunction){
        this.nodes = [];
        PriorityNode.prototype.getValue = valueFunction || function(){return this.val};
    }

    clear(){
        this.nodes = []
    }

    isValid(n){
        if(n < this.nodes.length && n >= 0) return true
    }
    //returns node with smaller value
    getPriority(n1,n2,returnOnEqual){
        if(this.isValid(n1) && this.isValid(n2))
        {
            let diff = this.nodes[n1].getValue() - this.nodes[n2].getValue();
            if(diff < 0){
                return n1;
            } else if(diff > 0){
                return n2;
            } else{
                let diff2 = this.nodes[n1].getFullValue().h - this.nodes[n2].getFullValue().h;
                if(diff2 < 0){
                    return n1;
                } else if(diff2 > 0){
                    return n2;
                } else{
                    return returnOnEqual && n1 || -1;
                }
            }
        } else if(this.isValid(n1)){
            return n1
        } else if(this.isValid(n2)){
            return n2
        }
    }
    isEmpty(){
        return this.nodes.length === 0;
    }

    getMin(){
        return this.nodes[0];
    }

    createNode(val){
        let node = new PriorityNode(val,this.nodes.length);
        this.insert(node)
        return node;
    }

    popSmallest(){
        this.swap(0,this.nodes.length - 1)
        this.nodes.pop();
        this.bubbleDown(0);
    }

    insert(node){
        this.nodes.push(node);
        this.bubbleUp(node.pos);
    }

    bubbleUpOrDown(nodePos){
        if(!this.bubbleUp(nodePos)){
            this.bubbleDown(nodePos)
        }
    }

    bubbleUp(nodePos){
        if(nodePos != 0){
            let parentPos = this.parent(nodePos);
            let priority = this.getPriority(nodePos,parentPos);
            if(priority === nodePos){
                this.swap(nodePos, parentPos);
                this.bubbleUp(parentPos);
                return true
            }
        }
    }

    bubbleDown(nodePos){
        if(nodePos < this.nodes.length-1){
            let leftChild = this.leftChild(nodePos)
            let rightChild = this.rightChild(nodePos)
            let canBubbleDown = this.getPriority(nodePos,this.getPriority(leftChild,rightChild, true)) !== nodePos
            if(!canBubbleDown){
                return
            }
            if(leftChild < this.nodes.length && rightChild < this.nodes.length){
                let toSwap = this.getPriority(leftChild,rightChild, true)
                this.swap(toSwap, nodePos);
                this.bubbleDown(toSwap);
            } else if(leftChild < this.nodes.length){
                this.swap(leftChild, nodePos);
                this.bubbleDown(leftChild);
            } else if(rightChild < this.nodes.length){
                this.swap(rightChild, nodePos);
                this.bubbleDown(rightChild);
            }
        }
    }

    swap(n1,n2){
        let temp = this.nodes[n1];

        this.nodes[n1].pos = n2
        this.nodes[n2].pos = n1

        this.nodes[n1] = this.nodes[n2];
        this.nodes[n2] = temp;
    }

    leftChild(nodePos){
        return (2 * nodePos) + 1;
    }
    rightChild(nodePos){
        return (2 * nodePos) + 2;
    }
    parent(nodePos){
        return Math.floor((nodePos - 1) / 2);
    }
}