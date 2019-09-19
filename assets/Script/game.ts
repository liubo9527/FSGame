
import Cat from './Cat/Cat'
import VirtualJoy from './VirtualJoy/VirtualJoy'
import {GameConst} from './VirtualJoy/GameConst'
import { VM } from './modelView/ViewModel';
import { PlayerData } from './Cat/CatUserData';
const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property(cc.Prefab)
    prefabCat:cc.Node = null;
    @property(cc.Prefab)
    virtualJoy:cc.Node = null;

    @property(cc.Node)
    gameArea:cc.Node =  null;

    private hero = null;
    private vj_start = false;;
    private angle:cc.Vec2 = null;
    start () {
        this.hero = cc.instantiate(this.prefabCat);
        this.hero.x = 480;
        this.hero.y = 320;
        this.hero.scale = 1;
        this.gameArea.addChild(this.hero);

        this.hero.getComponent("Cat").player.hp = 1000;
        this.hero.getComponent("Cat").player.maxHp = 1000;
        VM.add(new PlayerData(), this.hero.uuid);

       
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

        var manger = cc.director.getCollisionManager();
        manger.enabled = true;
        //manger.enabledDebugDraw = true;
        //manger.enabledDrawBoundingBox = true;

        setInterval(()=>{
            var enemy = cc.instantiate(this.prefabCat);
            enemy.x = Math.random()*960;
            enemy.y = Math.random()*640;
            var enemyScript:Cat = enemy.getComponent("Cat");
            enemyScript.setSkinColor(new cc.Color(0,255,1,255));
            this.gameArea.addChild(enemy);
            //enemyScript.changeHead();
            enemy.scale = 1;
            enemyScript.randMove();
            enemyScript.randomUseSkill();
        }, 3000);

        var enemy = cc.instantiate(this.prefabCat);
        enemy.x = 200;
        enemy.y = 400;
        var enemyScript:Cat = enemy.getComponent("Cat");
        enemyScript.setSkinColor(new cc.Color(0,255,1,255));
        this.gameArea.addChild(enemy);
        //enemyScript.changeHead();
        enemyScript.randMove();
        enemy.scale = 1;

        VM.add({count:"0"}, "laowu");
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