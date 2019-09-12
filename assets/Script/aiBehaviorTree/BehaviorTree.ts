export  class BehaviorTree {
	public constructor() {
	}
}

export  const maxChildNumber = 16;

//并行结束条件
export enum E_ParallelFinishCondition{
	k_PFC_OR = 1,
	k_PFC_AND
}

export enum BehaviorRunningStatus{
	k_BRS_ERROR_Transition = -1,
	k_BRS_Executing = 0,
	k_BRS_Finish = 1
}

export enum E_TerminalNodeStates{
	K_TNS_Ready = 1,
	K_TNS_Running = 2,
	K_TNS_Finish  = 3
}


export abstract class BehaviorNode{
	protected _childBehaviorNodeList:Array<BehaviorNode> = [];//节点树
	private _behaviorNodePrecondition:BehaviorNodePrecondition;
	private _debugName:any;
	private _lastActiveNode:BehaviorNode;
	private _activeNode:BehaviorNode;
	private _parentBehaviorNode:BehaviorNode;


	//set property
	public set behaviorNodePrecondition(behaviorNodePrecondition:BehaviorNodePrecondition){
		this._behaviorNodePrecondition = behaviorNodePrecondition;
	}
	public get behaviorNodePrecondition(){
		return this._behaviorNodePrecondition;
	}
	public set debugName(debugName:any){
		this._debugName = debugName;
	}
	public get debugName(){
		return this._debugName;
	}
	public set lastActiveNode(lastActiveNode:BehaviorNode){
		this._lastActiveNode = lastActiveNode;
	}
	public get lastActiveNode(){
		return this._lastActiveNode;
	}
	public set activeNode(activeNode:BehaviorNode){
		this._activeNode = activeNode;
	}
	public get activeNode(){
		return this._activeNode;
	}
	public set parentBehaviorNode(parentBehaviorNode:BehaviorNode){
		this._parentBehaviorNode = parentBehaviorNode;
	}
	public get parentBehaviorNode(){
		return this._parentBehaviorNode;
	}

	//constructor
	constructor(behaviorParentNode, behaviorPrecondition = null){
		this._parentBehaviorNode = behaviorParentNode;
		this._behaviorNodePrecondition = behaviorPrecondition;
	}

	//评估命令行为 包括先决条件
	public evaluate(behaviorInputParam):boolean{
		return (this._behaviorNodePrecondition == null
		|| this._behaviorNodePrecondition.externalCondition(behaviorInputParam)) 
		&& this._doEvaluate(behaviorInputParam);
	}

	//add childBehaviorNode
	addChilBehaviordNode(childBehaviorNode:BehaviorNode){
		//var findIndx = this._childBehaviorNodeList.indexOf(childBehaviorNode);
		this._childBehaviorNodeList.push(childBehaviorNode);
		console.log("The number of child nodes is ", this._childBehaviorNodeList.length);
	}

	//执行任务
	public tick(behaviorInputParam):BehaviorRunningStatus{
		return this._doTick(behaviorInputParam);
	}

	//转换
	public transition(behaviorInputParam){

	}

	/**
	 * protected 子类必须实现
	 */
	//转换
	protected abstract _doTransition(behaviorInputParam):void;
	//评估自身能否执行命令
	protected abstract _doEvaluate(behaviorInputParam):boolean;
	//查看状态
	protected abstract _doTick(behaviorInputParam):any;

	protected checkIndex(index){
		return index >= 0 &&  index < this._childBehaviorNodeList.length;
	}			
}	


//前提
export abstract class BehaviorNodePrecondition{
	abstract externalCondition(behaviorInputParam):boolean;
}
//逻辑判断
export class BehaviorNodePreconditionTRUE extends BehaviorNodePrecondition{
	externalCondition(behaviorInputParam){
		return true;
	}
}
export class BehaviorNodePreconditionFALSE extends BehaviorNodePrecondition{
	externalCondition(behaviorInputParam){

		return false;
	}
}
export class BehaviorNodePreconditionNOT extends BehaviorNodePrecondition{
	constructor(lhs:BehaviorNodePrecondition){
		super();
		this._lhs = lhs;
	}

	externalCondition(behaviorInputParam){
		return !this._lhs.externalCondition(behaviorInputParam);
	}

	private _lhs:BehaviorNodePrecondition;
}
export class behaviorNodePreconditionAND extends BehaviorNodePrecondition{
	constructor(behaviorNodePreconditionOne:BehaviorNodePrecondition, behaviorNodePreconditionTwo:BehaviorNodePrecondition){
		super();
		this._behaviorNodePreconditionOne = behaviorNodePreconditionOne;
		this._behaviorNodePreconditionTwo = behaviorNodePreconditionTwo;
	}

	externalCondition(behaviorInputParam){
		return this._behaviorNodePreconditionOne.externalCondition(behaviorInputParam)
		&& this._behaviorNodePreconditionTwo.externalCondition(behaviorInputParam);
	}

	private _behaviorNodePreconditionOne:BehaviorNodePrecondition;
	private _behaviorNodePreconditionTwo:BehaviorNodePrecondition;
}
export class behaviorNodePreconditionOR extends BehaviorNodePrecondition{
	constructor(behaviorNodePreconditionOne:BehaviorNodePrecondition, behaviorNodePreconditionTwo:BehaviorNodePrecondition){
		super();
		this._behaviorNodePreconditionOne = behaviorNodePreconditionOne;
		this._behaviorNodePreconditionTwo = behaviorNodePreconditionTwo;
	}

	externalCondition(behaviorInputParam){
		return this._behaviorNodePreconditionOne.externalCondition(behaviorInputParam)
		|| this._behaviorNodePreconditionTwo.externalCondition(behaviorInputParam);
	}

	private _behaviorNodePreconditionOne:BehaviorNodePrecondition;
	private _behaviorNodePreconditionTwo:BehaviorNodePrecondition;
}
export class behaviorNodePreconditionXOR extends BehaviorNodePrecondition{
	constructor(behaviorNodePreconditionOne:BehaviorNodePrecondition, behaviorNodePreconditionTwo:BehaviorNodePrecondition){
		super();
		this._behaviorNodePreconditionOne = behaviorNodePreconditionOne;
		this._behaviorNodePreconditionTwo = behaviorNodePreconditionTwo;
	}

	externalCondition(behaviorInputParam){
		return this._behaviorNodePreconditionOne.externalCondition(behaviorInputParam)
		!== this._behaviorNodePreconditionTwo.externalCondition(behaviorInputParam);
	}

	private _behaviorNodePreconditionOne:BehaviorNodePrecondition;
	private _behaviorNodePreconditionTwo:BehaviorNodePrecondition;
} 

export class BehaviorNodePrioritySelector extends BehaviorNode{
	protected _currentSelectIndex = maxChildNumber;
	protected _lastSelectIndex = maxChildNumber;
	_doEvaluate(behaviorInputParam):boolean{
		this._currentSelectIndex = maxChildNumber;
		for(var i = 0; i < this._childBehaviorNodeList.length; i++){
			var behaviorNode:BehaviorNode = this._childBehaviorNodeList[i];
			if(behaviorNode.evaluate(behaviorInputParam)){
				this._currentSelectIndex = i;
				return true;
			}
		}
		return false;
	}
	_doTransition(behaviorInputParam){
		if(this.checkIndex(this._lastSelectIndex)){
			(this._childBehaviorNodeList[this._lastSelectIndex] as BehaviorNode).transition(behaviorInputParam);
		}
		this._lastSelectIndex = maxChildNumber;
	}

	_doTick(behaviorInputParam):BehaviorRunningStatus{
		var bIsFinished:BehaviorRunningStatus =  BehaviorRunningStatus.k_BRS_Finish;
		if(this.checkIndex(this._currentSelectIndex)){
			if(this._lastSelectIndex != this._currentSelectIndex){
				if(this.checkIndex(this._lastSelectIndex)){
					(this._childBehaviorNodeList[this._lastSelectIndex] as BehaviorNode).transition(behaviorInputParam);
				}
				this._lastSelectIndex = this._currentSelectIndex;
			}
		}
		if(this.checkIndex(this._lastSelectIndex)){
			var behaviorNode:BehaviorNode = this._childBehaviorNodeList[this._lastSelectIndex];
			bIsFinished = behaviorNode.tick(behaviorInputParam); 
			if(bIsFinished){
				this._lastSelectIndex = maxChildNumber;
			}
		}
		return bIsFinished;
	}
}
//没有优先级的选择权
export class BehaviorNodeNonePrioritySelector extends BehaviorNodePrioritySelector{
	_doEvaluate(behaviorInputParam):boolean{
		if(this.checkIndex(this._currentSelectIndex)){
			if(this._childBehaviorNodeList[this._currentSelectIndex].evaluate(behaviorInputParam)){
				return true;
			}
		}
		return super._doEvaluate(behaviorInputParam);//调用父类的方法
	}
}
//序列
export class BehaviorNodeSequence extends BehaviorNode{
	private _currentBehaviorNodeIndex = maxChildNumber;
	_doEvaluate(behaviorInputParam):boolean{
		var index;
		if(this._currentBehaviorNodeIndex == maxChildNumber){//循环
			index = 0;
		}else{
			index = this._currentBehaviorNodeIndex;
		}
		if(this.checkIndex(index)){
			var behaviorNode:BehaviorNode = this._childBehaviorNodeList[index];
			if(behaviorNode.evaluate(behaviorInputParam)){
				return true;
			}
		}
		return false;
	}

	_doTransition(behaviorInputParam){
		if(this.checkIndex(this._currentBehaviorNodeIndex)){
			var behaviorNode:BehaviorNode = this._childBehaviorNodeList[this._currentBehaviorNodeIndex];
			behaviorNode.transition(behaviorNode);
		}
		this._currentBehaviorNodeIndex = maxChildNumber;
	}

	_doTick(behaviorInputParam):BehaviorRunningStatus{
		var bIsFinished:BehaviorRunningStatus = BehaviorRunningStatus.k_BRS_Finish;
		if(this._currentBehaviorNodeIndex == maxChildNumber){
			this._currentBehaviorNodeIndex = 0;
		}
		var behaviorNode:BehaviorNode = this._childBehaviorNodeList[this._currentBehaviorNodeIndex];
		bIsFinished = behaviorNode.tick(behaviorInputParam);
		if(bIsFinished == BehaviorRunningStatus.k_BRS_Finish){
			++this._currentBehaviorNodeIndex;
			if(this._currentBehaviorNodeIndex == this._childBehaviorNodeList.length){
				this._currentBehaviorNodeIndex = maxChildNumber;
			}else{
				bIsFinished = BehaviorRunningStatus.k_BRS_Executing;
			}
		}
		if(bIsFinished == BehaviorRunningStatus.k_BRS_ERROR_Transition){
			this._currentBehaviorNodeIndex = maxChildNumber;
		}
		return bIsFinished;
	}
}

//控制节点
/**
 * BehaviorTerminalNode !!
 */	
export abstract class BehaviorTerminalNode extends BehaviorNode{
	private _states:E_TerminalNodeStates = E_TerminalNodeStates.K_TNS_Ready;
	private _needExit:boolean = false;

	protected _doTransition(behaviorInputParam){
		if(this._needExit){ //call exit if we have called enter
			this._doExit(behaviorInputParam, BehaviorRunningStatus.k_BRS_ERROR_Transition);
		}
		this.activeNode = null;
		this._states = E_TerminalNodeStates.K_TNS_Ready;
	}

	protected _doEvaluate(behaviorInputParam):boolean{
		return true;
	}

	protected _doTick(behaviorInputParam):BehaviorRunningStatus{
		var  bIsFinish:BehaviorRunningStatus = BehaviorRunningStatus.k_BRS_Finish;
		if(this._states == E_TerminalNodeStates.K_TNS_Ready){
			this._doEnter(behaviorInputParam);
			this._needExit = true;
			this._states = E_TerminalNodeStates.K_TNS_Running;
			this.activeNode = this;
		}
		if(this._states == E_TerminalNodeStates.K_TNS_Running){
			var bIsFinish = this._doExecute(behaviorInputParam);
			this.activeNode = this;
			if(bIsFinish == BehaviorRunningStatus.k_BRS_Finish || bIsFinish < 0){
				this._states = E_TerminalNodeStates.K_TNS_Finish;
			}
		}
		if(this._states == E_TerminalNodeStates.K_TNS_Finish){
			if(this._needExit){
				this._doExit(behaviorInputParam, bIsFinish);
			}
			this._states = E_TerminalNodeStates.K_TNS_Ready;
			this._needExit = false;
			this.activeNode = null;
		}
		return bIsFinish;
	}
	protected  _doEnter(behaviorInputParam){};
	protected abstract _doExecute(behaviorInputParam):BehaviorRunningStatus;
	protected  _doExit(behaviorInputParam, behaviorRunningState){};
}

//并行节点
export class BehaviorParallelNode extends BehaviorNode{
	private _childNodeStatesList:Array<BehaviorRunningStatus> = [];
	private _finishCondition:E_ParallelFinishCondition;
	constructor(behaviorParentNode, behaviorNodePrecondition = null){
		super(behaviorParentNode, behaviorNodePrecondition);
		for(var i = 0; i < maxChildNumber; i++){
			this._childNodeStatesList.push(BehaviorRunningStatus.k_BRS_Executing);
		}
	}

	protected _doEvaluate(behaviorInputParam):boolean{
		this._childBehaviorNodeList.forEach(element => {
			if(!(element as BehaviorNode).evaluate(behaviorInputParam)){
				return false;
			}
		});

		return false;
	}

	setFinishCondition(finishCondition:E_ParallelFinishCondition){
		this._finishCondition = finishCondition;
	}

	_doTransition(behaviorInputParam){
		this._childNodeStatesList.forEach(element => {
			element = BehaviorRunningStatus.k_BRS_Executing;
		});

		this._childBehaviorNodeList.forEach(element => {
			element.transition(behaviorInputParam);
		});
	}

	_doTick(behaviorInputParam){
		var finishedChildCount = 0;
		var i = 0;
		this._childBehaviorNodeList.forEach(element => {
			var behaviorNode:BehaviorNode = element;
			if(this._finishCondition == E_ParallelFinishCondition.k_PFC_OR){
				if(this._childNodeStatesList[i] == BehaviorRunningStatus.k_BRS_Executing){
					this._childNodeStatesList[i] = behaviorNode.tick(behaviorInputParam);
				}
				if(this._childNodeStatesList[i] != BehaviorRunningStatus.k_BRS_Executing){
					this._childNodeStatesList.forEach(element => {
						element  = BehaviorRunningStatus.k_BRS_Executing;
					});
					return BehaviorRunningStatus.k_BRS_Finish;
				}
			}else if(this._finishCondition == E_ParallelFinishCondition.k_PFC_AND){
				if(this._childNodeStatesList[i] == BehaviorRunningStatus.k_BRS_Executing){
					this._childNodeStatesList[i] = behaviorNode.tick(behaviorInputParam);
				}
				if(this._childNodeStatesList[i] != BehaviorRunningStatus.k_BRS_Executing){
					finishedChildCount++;
				}
			}
			i++;
		});
		if(finishedChildCount == this._childBehaviorNodeList.length){
			this._childNodeStatesList.forEach(element => {
				element = BehaviorRunningStatus.k_BRS_Executing;
			});
			return BehaviorRunningStatus.k_BRS_Finish;
		}

		return BehaviorRunningStatus.k_BRS_Executing;
	}
}


module LoopConst{
	export const kFiniteLoop = -1;
}
export class BehaviorLoopNode extends BehaviorNode{
	 private _loopCount = LoopConst.kFiniteLoop;
	 private _currentCount = 0;
	 constructor(behaviorParentNode, behaviorNodePrecondition = null, loopCount = LoopConst.kFiniteLoop){
		 super(behaviorParentNode, behaviorNodePrecondition);
		 this._loopCount = loopCount;
	 }
	 protected _doEvaluate(behaviorInputParam){
		 var cheackFlg = (this._loopCount == LoopConst.kFiniteLoop)|| (this._currentCount < this._loopCount);
		 if(!cheackFlg){
			 return false;
		 }

		 if(this.checkIndex(0)){
			 if((this._childBehaviorNodeList[0] as BehaviorNode).evaluate(behaviorInputParam)){
				 return true;
			 }
		 }
		 return false;
	 }

	 protected _doTransition(behaviorInputParam){
		 if(this.checkIndex(0)){
			(this._childBehaviorNodeList[0] as BehaviorNode).transition(behaviorInputParam);
		 }
		 this._currentCount =0;
	 }

	 protected _doTick(behaviorInputParam){
		 var bIsFinish =  BehaviorRunningStatus.k_BRS_Finish;
		 if(this.checkIndex(0)){
			 var behaviorNode:BehaviorNode = this._childBehaviorNodeList[0];
			 bIsFinish = behaviorNode.tick(behaviorInputParam);
			 if(bIsFinish == BehaviorRunningStatus.k_BRS_Finish){
				 if(this._loopCount == LoopConst.kFiniteLoop){
					 this._currentCount++;
					 if(this._currentCount == this._loopCount){
						 bIsFinish = BehaviorRunningStatus.k_BRS_Executing;
					 }
				 }else{
					 bIsFinish = BehaviorRunningStatus.k_BRS_Executing;
				 }
			 }
		 }
		 if(bIsFinish){
			 this._currentCount = 0;
		 }
		 return bIsFinish;
	 }
}

export class BehaviorNodeFactory{
	//工厂模式 创建并行node
	static createParallelBehaviorNode(parentBehaviorNode:BehaviorNode, parallelFinishCondition:E_ParallelFinishCondition, debugName:string){
		var parallelBehaviorNode:BehaviorParallelNode = new BehaviorParallelNode(parentBehaviorNode);
		parallelBehaviorNode.setFinishCondition(parallelFinishCondition);
		this.behaviorNodeCommonSet(parallelBehaviorNode, parentBehaviorNode, debugName);
		return parallelBehaviorNode;
	}
	
	//有优先级的选择器
	static createPriorityBehaviorNode(parentBehaviorNode:BehaviorNode, debugName:string):BehaviorNodePrioritySelector{
		var priorityBehaviorNode:BehaviorNodePrioritySelector = new BehaviorNodePrioritySelector(parent);
		this.behaviorNodeCommonSet(priorityBehaviorNode, parentBehaviorNode, debugName);
		return priorityBehaviorNode;
	}
	//没有优先级的选择器
	static createNonePriorityBehaviorNode(parentBehaviorNode:BehaviorNode, debugName:string):BehaviorNodeNonePrioritySelector{
		var nonePriorityBehaviorNode:BehaviorNodePrioritySelector = new BehaviorNodeNonePrioritySelector(parentBehaviorNode);
		this.behaviorNodeCommonSet(nonePriorityBehaviorNode, parentBehaviorNode, debugName);
		return nonePriorityBehaviorNode;
	}
	//序列选择器
	static createSquenceBehaviorNode(parentBehaviorNode:BehaviorNode, debugName:string):BehaviorNodeSequence{
		var sequenceBehaviorNode:BehaviorNodeSequence = new BehaviorNodeSequence(parentBehaviorNode);
		this.behaviorNodeCommonSet(sequenceBehaviorNode, parentBehaviorNode, debugName);
		return sequenceBehaviorNode;
	}
	//循环选择器
	static createLoopBehaviorNode(parentBehaviorNode:BehaviorNode, debugName, loopCount):BehaviorLoopNode{
		var behaviorLoopNode:BehaviorLoopNode = new BehaviorLoopNode(parentBehaviorNode, loopCount);
		this.behaviorNodeCommonSet(behaviorLoopNode, parentBehaviorNode, debugName);
		return behaviorLoopNode;
	}
	//末端节点
	static createTerminalBehaviorNode(className:any, parentBehaviorNode:BehaviorNode, debugName){
		var TerminalClass = className;
		var terminnalBehaviorNode:BehaviorTerminalNode = new TerminalClass(parentBehaviorNode);
		this.behaviorNodeCommonSet(terminnalBehaviorNode, parentBehaviorNode, debugName);
		return terminnalBehaviorNode;
	}

	private static behaviorNodeCommonSet(behaviorNode:BehaviorNode, parentBehaviorNode:BehaviorNode, debugName){
		if(parentBehaviorNode!= null){
			parentBehaviorNode.addChilBehaviordNode(behaviorNode);
			behaviorNode.debugName = debugName;
		}
	}		
}


