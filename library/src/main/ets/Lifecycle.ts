import hilog from "@ohos.hilog";
import { LifecycleEventObserver } from "./LifecycleEventObserver";
import { LifecycleState } from "./LifecycleState";
import { FrameNode, UIContext, uiObserver } from "@kit.ArkUI";

export function LifecycleOwner(target: any, name: string) {
  if (!target.rerender) {
    hilog.warn(0x0000, 'Lifecycle', '%{public}s', 'LifecycleOwn current target is not a component')
    return
  }
  if (target.aboutToAppear) {
    const oldFunction = target.aboutToAppear;
    target.aboutToAppear = function () {
      oldFunction.call(this);
      let lifecycle = this[name]
      lifecycle.owner = new WeakRef(this)
      lifecycle['state'] = LifecycleState.INITIALIZED
      lifecycle['handler'] = function (nextState: LifecycleState) {
        this['state'] = nextState;
        this['mObservers'].forEach((it: LifecycleEventObserver) => {
          it(lifecycle.owner.deref(), nextState)
        })
      }
      lifecycle['handler'](LifecycleState.ON_APPEAR)
    };
  } else {
    target.aboutToAppear = function () {
      let lifecycle = this[name]
      lifecycle.owner = new WeakRef(this)
      lifecycle['state'] = LifecycleState.INITIALIZED
      lifecycle['handler'] = function (nextState: LifecycleState) {
        this['state'] = nextState;
        this['mObservers'].forEach((it: LifecycleEventObserver) => {
          it(lifecycle.owner.deref(), nextState)
        })
      }
      lifecycle['handler'](LifecycleState.ON_APPEAR)
    }
  }
  target.lifecycleRegister = function () {
    let lifecycle = this[name] as Lifecycle
    let uiContext: UIContext = this.getUIContext()
    let uniqueId: number = this.getUniqueId();
    let frameNode: FrameNode = uiContext.getFrameNodeByUniqueId(uniqueId)
    frameNode.commonEvent.setOnDisappear(() => {
      lifecycle['handler'](LifecycleState.ON_DISAPPEAR)
      lifecycle.release()
      delete this[name]
    })
    let parentNode = frameNode?.getParent()
    if (parentNode == null || parentNode == undefined) { //这个是Router首页
      lifecycle.isPage = true
      lifecycle.isRouterPage = true
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
    } else {
      let child = parentNode.getFirstChild()
      let currentPageInfo: uiObserver.NavDestinationInfo
      let pageChange = function (pageInfo: uiObserver.NavDestinationInfo) {
        if (currentPageInfo?.uniqueId != pageInfo.uniqueId) { //其他页面不需处理
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
      if (child?.getNodeType() == "NavDestination") {
        lifecycle.isPage = true
        lifecycle.isNavigation = true
        currentPageInfo = uiContext.getPageInfoByUniqueId(child.getFirstChild().getUniqueId()).navDestinationInfo
        uiContext.getUIObserver().on('navDestinationUpdate', pageChange)
      } else if (parentNode.getNodeType() == "NavDestination") {
        lifecycle.isPage = true
        lifecycle.isNavigation = true
        currentPageInfo = uiContext.getPageInfoByUniqueId(uniqueId).navDestinationInfo
        uiContext.getUIObserver().on('navDestinationUpdate', pageChange)
      }
    }
  }
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