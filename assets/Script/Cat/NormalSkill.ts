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
export default class NormalSkill extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // start () {

    // }
    onCollisionEnter(other, self){
        cc.log("collision enter");
        var world = self.world;
        var aabb = world.aabb;
        var preAabb = world.preAabb;
        var t = world.transform;
        var r = world.radius;
        var p = world.position;
    }

   

    onCollisionStay(other, self){
        cc.log("stay");
    }
    onCollisionExit(other, self){
        cc.log("exit");
    }
    // update (dt) {}

    fire(){
        this.node.active = true;
    }
    

    onEnable(){
        //this.
        var ani = this.getComponent(dragonBones.ArmatureDisplay);
        ani.playAnimation("pao", 1);
        ani.on(dragonBones.EventObject.LOOP_COMPLETE, (e)=>{
            this.node.active = false;
        }, this);
    }

    onDisable(){

    }
}
