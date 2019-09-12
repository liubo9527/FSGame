import Cat from './Cat/Cat'
import VirtualJoy from './VirtualJoy/VirtualJoy'
import {GameConst} from './VirtualJoy/GameConst'
const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property(cc.Prefab)
    prefabCat:cc.Node = null;
    @property(cc.Prefab)
    virtualJoy:cc.Node = null;

    private hero = null;
    private vj_start = false;;
    private angle:cc.Vec2 = null;
    start () {
        this.hero = cc.instantiate(this.prefabCat);
        this.hero.x = 0;
        this.hero.y = 0;
        this.node.addChild(this.hero);

        // this.node.on('touchend', (event:cc.Touch) => {
        //     var pos = this.node.convertToNodeSpaceAR(event.getLocation());
        //     var catScript:Cat = cat.getComponent("Cat");
        //     catScript.param.inputParameter.targetPos = pos;
        // });

        var enemy = cc.instantiate(this.prefabCat);
        enemy.x = 100;
        enemy.y = 100;
        var enemyScript:Cat = enemy.getComponent("Cat");
        enemyScript.setSkinColor(new cc.Color(0,255,1,255));
        this.node.addChild(enemy);
        GameConst.touchNode = this.node;
        
        var virtualJoy = cc.instantiate(this.virtualJoy);
        var virtualJoyScript:VirtualJoy = virtualJoy.getComponent("VirtualJoy");
        virtualJoyScript.startJoy();

        this.node.on("vj_move",(event)=>{
            this.angle = event.getUserData();
        });
        this.node.on("vj_start",(event)=>{
            this.vj_start = true;
            
        });
        this.node.on("vj_end",(event)=>{
            this.vj_start = false;
            this.angle = null;
        });

        setInterval(()=>{
            var posx = 500 - Math.random() * 1000;
            var posy = 500 -Math.random() * 1000;
            enemyScript.param.inputParameter.targetPos = new cc.Vec2(posx, posy);
        }, 5000);
    }

    update(dt) {
        if(this.angle && this.vj_start){
            var catScript:Cat = this.hero.getComponent("Cat");
            var pos = new cc.Vec2(10 * this.angle.x, 10 * this.angle.y).add(new cc.Vec2(this.hero.x, this.hero.y));
            catScript.param.inputParameter.targetPos = pos;
        } 
    }

    skillClick(e, index){
        var catScript:Cat = this.hero.getComponent("Cat");
        catScript.param.inputParameter.skillData.push(index);
    }
}