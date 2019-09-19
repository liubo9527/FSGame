import VMParent  from "../modelView/VMParent";
import { BehaviorTerminalNode, BehaviorRunningStatus ,BehaviorNodePrecondition, BehaviorNode, BehaviorNodeFactory, BehaviorNodeSequence, BehaviorNodePreconditionNOT, BehaviorNodePreconditionTRUE
       } from "../aiBehaviorTree/BehaviorTree";
import { PlayerData } from "./CatUserData";
import { VM } from "../modelView/ViewModel";
//import "../aiBehaviorTree/BehaviorTree.ts"
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
export default class Cat extends VMParent {

    data = {
        word:"喵...",
        hp:99,
        maxHp:100
    };
    private _animationName = null;
    set animationName(animationName: string){ if(this._animationName!=animationName){this._animationName = animationName,this.display.playAnimation(this._animationName, 0)}};
    get animationName(){return this._animationName};
    private _behaviorRootNode = null;
    set behaviorRootNode (behaviorRootNode:BehaviorNode){this._behaviorRootNode = behaviorRootNode};
    get behaviorRootNode(){return this._behaviorRootNode};
    private _param:Cat_Parameter = null;
    set param (param:Cat_Parameter){this._param = param};
    get param(){return this._param};
    private _face = 1;
    set face(face){this._face = face, this.display.node.scaleX = this._face};
    get face(){return this._face};
    private _player:PlayerData = null;
    set player(player:PlayerData){
        this._player = player
        this.data.hp = this._player.hp;
        this.data.maxHp = this._player.maxHp;
    };
    get player(){
        this.data.hp = this._player.hp;
        this.data.maxHp = this._player.maxHp;
        return this._player
    };
    setSkinColor(color){
        this.display.node.color = color;
    }

    @property(dragonBones.ArmatureDisplay)
    // LIFE-CYCLE CALLBACKS:
    display:dragonBones.ArmatureDisplay = null;

    @property(dragonBones.ArmatureDisplay)
    // LIFE-CYCLE CALLBACKS:
    head:dragonBones.ArmatureDisplay = null;

    @property([cc.Node])
    skill1Arry:cc.Node[] = [];

    onLoad () {
        super.onLoad();
        this.player = new PlayerData();
    }

    start () {
        var root = BehaviorNodeFactory.createPriorityBehaviorNode(null, "root");
        var dead = BehaviorNodeFactory.createTerminalBehaviorNode(Cat_dead, root, "dead");
        dead.behaviorNodePrecondition = new BehaviorNodePreconditionNOT(new CON_isAlive());
        var attack = BehaviorNodeFactory.createTerminalBehaviorNode(Cat_attack, root, "attack");
        attack.behaviorNodePrecondition = new CON_skillPrecondition();


        var priority = BehaviorNodeFactory.createPriorityBehaviorNode(root, "sequence");
        priority.behaviorNodePrecondition = new BehaviorNodePreconditionNOT(new CON_hasReachTarget);
        var turnFace = BehaviorNodeFactory.createTerminalBehaviorNode(Cat_turnFace, priority, "turnFace");
        turnFace.behaviorNodePrecondition = new BehaviorNodePreconditionNOT(new CON_hsaSameDirection());
        var move = BehaviorNodeFactory.createTerminalBehaviorNode(Cat_move, priority,"move");
        move.behaviorNodePrecondition = new BehaviorNodePreconditionTRUE(); 

        var pursue  = BehaviorNodeFactory.createTerminalBehaviorNode(Cat_PursueTarget, root, "pursue");
        pursue.behaviorNodePrecondition = new CON_findTarget();

        var hitPriority = BehaviorNodeFactory.createPriorityBehaviorNode(root, "sequence");
        var turnFace = BehaviorNodeFactory.createTerminalBehaviorNode(Cat_turnFace, hitPriority, "turnFace");
        turnFace.behaviorNodePrecondition = new CON_FaceToEnemy();
        var hit = BehaviorNodeFactory.createTerminalBehaviorNode(Cat_normalHit, hitPriority, "hit");
        hit.behaviorNodePrecondition = new CON_canHit();

        var idle = BehaviorNodeFactory.createTerminalBehaviorNode(Cat_idle, root, "idle");
        idle.behaviorNodePrecondition = new BehaviorNodePreconditionTRUE();
        this.behaviorRootNode = root;

        this.param = new Cat_Parameter();
        this.param.inputParameter = new Cat_InputParameter();
        this.param.inputParameter.owner = this;
        this.param.inputParameter.targetPos = new  cc.Vec2(this.node.x, this.node.y);
        //this.param.inputParameter.owner.moveSpeed = 1;
        this.param.inputParameter.timeStep = 1;

        //this.changeHead();
    } 

    update (dt) {
        if(this.behaviorRootNode.evaluate(this.param.inputParameter)){
            this.behaviorRootNode.tick(this.param.inputParameter);
        }
    }

    catSkill1(index){
        var skillDisPlay = this.skill1Arry[index]
        if(index < 3){
            skillDisPlay.x = this.face * (parseInt(index)+1) * 100;
            var skillScript = skillDisPlay.getComponent("NormalSkill");
            skillScript.fire();
        }else if(index == 3){
            this.animationName = "uniqueSkill"
        }else{

        }
    }
    changeHead(){
        let needChangeSlot = this.display.armature().getSlot("head");
        let factory = dragonBones.CCFactory.getInstance();
        let key = (this.head.getArmatureKey() as any);
        factory.replaceSlotDisplay(
            key,
            "Armature",
            "laowu",
            "laowu",
            needChangeSlot
        )
    }

    onCollisionEnter(other, self){
        var world = self.world;
        var aabb = world.aabb;
        var preAabb = world.preAabb;
        var t = world.transform;
        var r = world.radius;
        var p = world.position;
        if(self.tag == 1 && other.tag == 10){//技能
            this.player.hp -= other.node.parent.getComponent("Cat").player.skillDumage;
        }else if(self.tag == 0 && other.tag == 1){//敌人进入攻击范围
            this.player.enemyS.push(other);
            cc.js.array.remove(this.player.seeEnemyS, other);
        }else if(self.tag == 0 && other.tag == 2){//发现敌人
            this.player.seeEnemyS.push(other);
        }
    }
    onCollisionStay(other, self){

    }
    onCollisionExit(other, self){
        if(self.tag == 0 && other.tag == 1){//敌人死亡或者离开攻击范围
            cc.js.array.remove(this.player.enemyS, other);
        }else if(self.tag == 0 && other.tag == 2){//进入攻击范围或者敌人离开视线
            cc.js.array.remove(this.player.seeEnemyS, other);
        }
    }

    randMove(){
        setInterval(()=>{
            var posx = Math.round(Math.random() * 960);
            var posy = Math.round(Math.random() * 640);
            this.param.inputParameter.targetPos = new cc.Vec2(posx, posy);
        }, 8000);
    }

    randomUseSkill(){
        setInterval(()=>{
            var skillID = Math.round(Math.random()*2);
            this.param.inputParameter.skillData.push(skillID);
        }, 2000);
    }
}

class Cat_InputParameter{
    //目的地址
    private _targetPos = null;
    set targetPos (pos: cc.Vec2) {this._targetPos = pos;}
    get targetPos () {return this._targetPos;}
    //owner
    private _owner = null;
    get owner () { return this._owner; }
    set owner (owner: Cat) { this._owner = owner; }
    //speed
    private _timeStep = null;
    get timeStep () { return this._timeStep; }
    set timeStep (timeStep:number){ this._timeStep = timeStep;}
    //skill
    private _skillData = [];
    get skillData () { return this._skillData};
    set skillData (skillData:any){ this._skillData = skillData};

}

class Cat_OutputParameter {
    private _animationName = null;
    set animationName(animationName: string){ this._animationName = animationName};
    get animationName(){ return this._animationName};

}

class Cat_Parameter{
    private _inputParameter = null;
    set inputParameter (inputParameter:Cat_InputParameter){this._inputParameter = inputParameter};
    get inputParameter(){return this._inputParameter;}
    private _outputParameter = null;
    set outputparameter (outputParameter:Cat_OutputParameter){this._outputParameter = outputParameter};
    get outputparameter(){return this._outputParameter;}
}

class Cat_idle extends BehaviorTerminalNode{
    _doExecute(input:Cat_InputParameter):BehaviorRunningStatus{
        input.owner.animationName = "steady";
        input.owner.data.word = "你来搞老子撒";
        return BehaviorRunningStatus.k_BRS_Finish;
    }
}

class Cat_move extends BehaviorTerminalNode{
    _doExecute(input:Cat_InputParameter):BehaviorRunningStatus{
        input.owner.animationName = "run";
        var targetPos = input.targetPos;
        var currentPos = new cc.Vec2(input.owner.node.x, input.owner.node.y);
        var subPos = targetPos.sub(currentPos);
        var unitVec2 = subPos.normalize();
        input.owner.node.x += unitVec2.x * input.owner.player.moveSpeed;
        input.owner.node.y += unitVec2.y * input.owner.player.moveSpeed;
        if(subPos.mag() < input.owner.player.moveSpeed){
            input.owner.data.word = "移动完毕";
            return BehaviorRunningStatus.k_BRS_Finish;
        }else{
            input.owner.data.word = "移动中";
            return BehaviorRunningStatus.k_BRS_Executing;
        }
    }
}

class CON_hasReachTarget extends BehaviorNodePrecondition{
    externalCondition(input:Cat_InputParameter):boolean{
        var targetPos = input.targetPos;
        var currentPos = new cc.Vec2(input.owner.node.x, input.owner.node.y);
        if(currentPos.sub(targetPos).mag() < input.owner.player.moveSpeed){
            return true;
        }else{
            return false;
        }
    }
}

class Cat_turnFace extends BehaviorTerminalNode{
    private _timecount = 20;
    _doEnter(behaviorInputParam){
        this._timecount = 20;
    }
    _doExecute(input:Cat_InputParameter):BehaviorRunningStatus{
       this._timecount -= input.timeStep;
       input.owner.animationName = "steady"
       if(this._timecount <= 0){
            input.owner.face *=  -1;
            input.owner.data.word = "转身完毕";
            return BehaviorRunningStatus.k_BRS_Finish;
       }else{
            input.owner.data.word = "转身中";
            return BehaviorRunningStatus.k_BRS_Executing;
       }
    }
}

class CON_hsaSameDirection extends BehaviorNodePrecondition{
    externalCondition(input:Cat_InputParameter):boolean{
        var sub = input.targetPos.x - input.owner.node.x;
        if(sub * input.owner.face> 0){
            return true;
        }else{ 
            return false;
        }
    }
}

class CON_FaceToEnemy extends BehaviorNodePrecondition{
    externalCondition(input:Cat_InputParameter):boolean{
        if(input.owner.player.enemyS[0]){
            var enemyPos = input.owner.player.enemyS[0].node.position;
            var sub = enemyPos.x - input.owner.node.x;
            if(sub * input.owner.face> 0){
                return false;
            }else{
                return true;
            }
        }else{
            return false;
        }
    }
}

class Cat_attack extends BehaviorTerminalNode{
    private _timecount = 40;//抬手动作时间
    _doExecute(input:Cat_InputParameter):BehaviorRunningStatus{
        this._timecount -= input.timeStep;
        if(this._timecount <= 0){
            input.owner.data.word = "";
            let element = input.skillData.shift();
            input.owner.catSkill1(element)
            return BehaviorRunningStatus.k_BRS_Finish;
       }else{
            input.owner.data.word = "放技能";
            let element = input.skillData[0];
            if(element == 3){
                input.owner.animationName = "uniqueAttack"
            }else{
                input.owner.animationName = "skillAttack1"
            }
            return BehaviorRunningStatus.k_BRS_Executing;
       }
    }
    _doEnter(input:Cat_InputParameter){
        var skillIndedx = input.skillData[0];
        if(skillIndedx == 3){
            this._timecount = 150;
        }else{
            this._timecount = 30;
        }
    }
}

class CON_skillPrecondition extends BehaviorNodePrecondition{
    externalCondition(input:Cat_InputParameter):boolean{
        if(input.skillData && input.skillData.length > 0){
            return true;
        }else{
            return false;
        }
    }
}

class Cat_dead extends BehaviorTerminalNode{
    private _timecount = 70;//dead动作时间
    _doExecute(input:Cat_InputParameter):BehaviorRunningStatus{
        this._timecount -= input.timeStep;
        if(this._timecount <= 0){
            //死亡
            VM.setValue("laowu.count", parseInt(VM.getValue("laowu.count")) + 1);
            input.owner.node.removeFromParent();
            return BehaviorRunningStatus.k_BRS_Finish;
        }else{
            input.owner.animationName = "dead";
            return BehaviorRunningStatus.k_BRS_Executing;
        }
    }
}

class CON_isAlive extends BehaviorNodePrecondition{
    externalCondition(input:Cat_InputParameter):boolean{
        if(input.owner && input.owner.player.hp > 0){
            return true;
        }else{
            return false;
        }
    }
}

class Cat_normalHit extends BehaviorTerminalNode{
    private _timecount = 70;//dead动作时间
    _doExecute(input:Cat_InputParameter):BehaviorRunningStatus{
        this._timecount -= input.timeStep;
        if(this._timecount <= 0){
            if(input.owner.player.enemyS[0]){
                var enemy = input.owner.player.enemyS[0].node.getComponent("Cat");
                enemy.player.hp -= input.owner.player.attack;
            }
            return BehaviorRunningStatus.k_BRS_Finish;
        }else{
            input.owner.animationName = "normalAttack";
            return BehaviorRunningStatus.k_BRS_Executing;
        }
    }
    _doEnter(behaviorInputParam){
        this._timecount = 70;
    }
}

class CON_canHit extends BehaviorNodePrecondition{
    externalCondition(input:Cat_InputParameter):boolean{
        if(input.owner.player.enemyS.length > 0){
            return true;
        }else{
            return false;
        }
        
    }
}

class Cat_PursueTarget extends BehaviorTerminalNode{
    //private _timecount = 10;//dead动作时间
    _doExecute(input:Cat_InputParameter):BehaviorRunningStatus{
        var targetPos = input.owner.player.seeEnemyS[0].node.position;
        var currentPos = input.owner.node.position;
        var angle = targetPos.sub(currentPos).normalize();
        var pos = new cc.Vec2(10 * angle.x, 10 * angle.y).add(new cc.Vec2(currentPos.x, currentPos.y));
        input.targetPos = pos;
        return BehaviorRunningStatus.k_BRS_Finish;
    }
    _doEnter(behaviorInputParam){

    }
}

class CON_findTarget extends BehaviorNodePrecondition{
    externalCondition(input:Cat_InputParameter):boolean{
        if(input.owner.player.seeEnemyS.length > 0 && input.owner.player.enemyS.length == 0){
            return true;
        }else{
            return false;
        }
        
    }
}