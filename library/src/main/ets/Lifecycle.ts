import hilog from "@ohos.hilog";
import { LifecycleEventObserver } from "./LifecycleEventObserver";
import { LifecycleState } from "./LifecycleState";
import { FrameNode, UIContext, uiObserver } from "@kit.ArkUI";
import { LIFECYCLE_DEFAULT, LIFECYCLE_INIT, LIFECYCLE_INIT_CALLBACK } from "./Constants";

function init(target:any){
  //将来可以在这里进行注入，方便其他库中进行注入
  let lifecycle = target[LIFECYCLE_DEFAULT] as Lifecycle
  target[LIFECYCLE_INIT_CALLBACK]?.()
  createAppear(lifecycle, target)
  let uiContext: UIContext = target.getUIContext()
  let uniqueId: number = target.getUniqueId();
  //没有父节点，说明是Router首页
  if (target['parent_'] == undefined) {
    lifecycle.isPage = true
    lifecycle.isRouterPage = true
    createRouterPage(lifecycle, uiContext, uniqueId)
  } else if (target['parent_']['navDestinationId']) { //父节点是NavDestination
    lifecycle.isPage = true
    lifecycle.isNavigation = true
    createNavChange(target['parent_']['navDestinationId'], lifecycle, uiContext)
    lifecycle['handler'](LifecycleState.ON_WILL_SHOW)
  }
}

function lifecycleRegister(){
  let lifecycle = this[LIFECYCLE_DEFAULT] as Lifecycle
  let uiContext: UIContext = this.getUIContext()
  let uniqueId: number = this.getUniqueId();
  let frameNode: FrameNode = uiContext.getFrameNodeByUniqueId(uniqueId)
  frameNode.commonEvent.setOnDisappear(() => {
    lifecycle['handler'](LifecycleState.ON_DISAPPEAR)
    lifecycle.release()
    delete this[LIFECYCLE_DEFAULT]
  })
  let parentNode = frameNode?.getParent()
  if (parentNode == null || parentNode == undefined && lifecycle.isPage == false) { //这个是Router首页
    lifecycle.isNavigation = frameNode.getNodeType() == "NavDestination"
    lifecycle.isPage = lifecycle.isNavigation
    if (lifecycle.isNavigation) {
      let currentPageInfo =
        uiContext.getPageInfoByUniqueId(frameNode.getFirstChild().getUniqueId()).navDestinationInfo
      createNavChange(currentPageInfo?.navDestinationId, lifecycle, uiContext)
    }
  } else {
    frameNode.commonEvent.setOnVisibleAreaApproximateChange({ ratios: [0] }, (isVisible: boolean) => {
      lifecycle['handler'](isVisible ? LifecycleState.ON_SHOWED : LifecycleState.ON_HIDDEN)
    })
  }
}

export const LifecycleOwner:PropertyDecorator = (target: any, name: string) => {
  if (!target.rerender) {
    hilog.warn(0x0000, 'Lifecycle', '%{public}s', 'LifecycleOwn current target is not a component')
    return
  }
  if(target[LIFECYCLE_INIT]){
    return
  }
  target[LIFECYCLE_INIT] = function () {
   init(this)
  }
  if (target.aboutToAppear) {
    const oldFunction = target.aboutToAppear;
    target.aboutToAppear = function () {
      if(this[name]){
        this[LIFECYCLE_DEFAULT] = this[name]
      }
      oldFunction.call(this);
      this[LIFECYCLE_INIT].call(this)
    };
  } else {
    target.aboutToAppear = function () {
      if(this[name]){
        this[LIFECYCLE_DEFAULT] = this[name]
      }
      this[LIFECYCLE_INIT].call(this)
    }
  }
  target.lifecycleRegister = lifecycleRegister
  if (target.onDidBuild) {
    const oldFunction = target.onDidBuild;
    target.onDidBuild = function () {
      this.lifecycleRegister()
      oldFunction.call(this)
    }
  } else {
    target.onDidBuild = target.lifecycleRegister
  }
}

function createAppear(lifecycle: Lifecycle, target: any) {
  lifecycle.owner = new WeakRef(target)
  lifecycle['state'] = LifecycleState.INITIALIZED
  lifecycle['handler'] = function (nextState: LifecycleState) {
    this['state'] = nextState;
    this['mObservers'].forEach((it: LifecycleEventObserver) => {
      it(lifecycle.owner.deref(), nextState)
    })
  }
  lifecycle['handler'](LifecycleState.ON_APPEAR)
}

function createRouterPage(lifecycle: Lifecycle, uiContext: UIContext, uniqueId: number) {
  let currentPageInfo = uiContext.getPageInfoByUniqueId(uniqueId).routerPageInfo
  let pageChange = function (pageInfo: uiObserver.RouterPageInfo) {
    if (currentPageInfo?.pageId != pageInfo.pageId) { //其他页面不需处理
      return
    }
    if (pageInfo.state == uiObserver.RouterPageState.ON_PAGE_SHOW) {
      lifecycle['handler'](LifecycleState.ON_SHOWED)
    } else if (pageInfo.state == uiObserver.RouterPageState.ON_PAGE_HIDE) {
      lifecycle['handler'](LifecycleState.ON_HIDDEN)
    } else if (pageInfo.state == uiObserver.RouterPageState.ABOUT_TO_DISAPPEAR) {
      uiContext.getUIObserver().off('routerPageUpdate', pageChange)
    }
  }
  uiContext.getUIObserver().on('routerPageUpdate', pageChange)
}

function createNavChange(currentPageId: string, lifecycle: Lifecycle,
  uiContext: UIContext) {
  let pageChange = function (pageInfo: uiObserver.NavDestinationInfo) {
    if (currentPageId != pageInfo.navDestinationId) { //其他页面不需处理
      return
    }
    if (pageInfo.state == uiObserver.NavDestinationState.ON_SHOWN) {
      lifecycle['handler'](LifecycleState.ON_SHOWED)
    } else if (pageInfo.state == uiObserver.NavDestinationState.ON_HIDDEN) {
      lifecycle['handler'](LifecycleState.ON_HIDDEN)
    } else if (pageInfo.state == uiObserver.NavDestinationState.ON_WILL_SHOW) {
      lifecycle['handler'](LifecycleState.ON_WILL_SHOW)
    } else if (pageInfo.state == uiObserver.NavDestinationState.ON_WILL_HIDE) {
      lifecycle['handler'](LifecycleState.ON_WILL_HIDE)
    } else if (pageInfo.state == uiObserver.NavDestinationState.ON_ACTIVE) {
      lifecycle['handler'](LifecycleState.ON_ACTIVE)
    } else if (pageInfo.state == uiObserver.NavDestinationState.ON_INACTIVE) {
      lifecycle['handler'](LifecycleState.ON_INACTIVE)
    } else if (pageInfo.state == uiObserver.NavDestinationState.ON_DISAPPEAR) {
      uiContext.getUIObserver().off('navDestinationUpdate', pageChange)
    }
  }
  uiContext.getUIObserver().on('navDestinationUpdate', pageChange)
}

export function getCurrentLifecycle(component:any):Lifecycle|undefined{
  if (!component.rerender) {
    hilog.warn(0x0000, 'EventPost', '%{public}s', 'component is not a component')
    return undefined
  }
  if(component[LIFECYCLE_DEFAULT]){//已经注入过了
    return component[LIFECYCLE_DEFAULT] as Lifecycle
  }else{//没有注入
    let lifecycle = new Lifecycle()
    component[LIFECYCLE_DEFAULT] = lifecycle
    component[LIFECYCLE_INIT] = function(){
      init(this)
    }
    component[LIFECYCLE_INIT].call(component)
    let uiContext: UIContext = component.getUIContext()
    let uniqueId: number = component.getUniqueId();
    if(uiContext.getFrameNodeByUniqueId(uniqueId)){
      lifecycleRegister.call(component)
    }else {
      if(component['onDidBuild']) {
        const oldFunction = component['onDidBuild']
        component['onDidBuild'] = function () {
          lifecycleRegister.call(this)
          oldFunction.call(this)
        }
      }else{
        uiContext.postFrameCallback({
          onFrame:()=>{
            lifecycleRegister.call(this)
          },
          onIdle:()=>{}
        })
      }
    }
    return lifecycle
  }
}


export class Lifecycle {
  owner: WeakRef<object>
  private mObservers: Set<LifecycleEventObserver> = new Set();

  isRouterPage: boolean = false

  isNavigation: boolean = false

  isPage: boolean = false

  get currentState(): LifecycleState {
    return this['state']
  }

  addObserver(observer: LifecycleEventObserver) {
    this.mObservers.add(observer);
  }

  removeObserver(observer: LifecycleEventObserver) {
    this.mObservers.delete(observer)
  }

  release() {
    this.mObservers.clear()
  }
}

