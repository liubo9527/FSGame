import {GameConst} from "./GameConst";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class VirtualJoy extends cc.Component {
    @property(cc.Node)
    ball: cc.Node = null;
    @property(cc.Node)
    circle: cc.Node = null;
    private circleRadius:number = 0; 
    private touchID = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.circleRadius = this.circle.height / 2;
        this.ball.x = this.ball.y = 0;
    }

    // start () {

    // }

    startJoy() {
        GameConst.touchNode.on('touchstart', this.onTouchStart, this);
        GameConst.touchNode.on('touchmove', this.onTouchMove, this);
        GameConst.touchNode.on('touchend', this.onTouchEnd, this);
    }

    stoptJoy() {
        GameConst.touchNode.off('touchstart', this.onTouchStart, this);
        GameConst.touchNode.off('touchmove', this.onTouchMove, this);
        GameConst.touchNode.off('touchend', this.onTouchEnd, this);
    }

    onTouchStart(event: cc.Touch){
        var touchPos = GameConst.touchNode.convertToNodeSpaceAR(event.getLocation());
        if(this.node.parent){
            return ;
        }
        this.touchID = event.getID();
        this.node.x = touchPos.x;
        this.node.y = touchPos.y;
        this.ball.x = this.ball.y = 0;
        GameConst.touchNode.addChild(this.node);
        //this.node.emit("vj_start");
        this.node.dispatchEvent(new cc.Event.EventCustom("vj_start", true,));
    }
    onTouchEnd(event: cc.Touch){
        if(this.touchID != event.getID()){
            return;
        }
        //this.node.emit("vj_end");
        this.node.dispatchEvent(new cc.Event.EventCustom("vj_end", true,));
        this.hide();
    }
    hide(){
        this.node.parent && this.node.removeFromParent();
    }
    private p1: cc.Vec2 = new cc.Vec2();
    private p2: cc.Vec2 = new cc.Vec2();
    onTouchMove(event: cc.Touch){
        var touchPos = GameConst.touchNode.convertToNodeSpaceAR(event.getLocation());
        if(this.touchID != event.getID()){
            return;
        }
        this.p1.x = this.node.x;
        this.p1.y = this.node.y;
        this.p2.x = touchPos.x;
        this.p2.y = touchPos.y;
        var subPos = this.p2.sub(this.p1);
        var angle = subPos.normalize();
        if(subPos.mag() < this.circleRadius){
            this.ball.x = subPos.x;
            this.ball.y = subPos.y;
        }else{
            this.ball.x = this.circleRadius * subPos.normalize().x;
            this.ball.y = this.circleRadius * subPos.normalize().y;
        }
        //this.node.emit("vj_move", false, angle);
        var customEvent:cc.Event.EventCustom = new cc.Event.EventCustom("vj_move", true,);
        customEvent.setUserData(angle);
        this.node.dispatchEvent(customEvent);
    }
   
    

    // update (dt) {}
}
