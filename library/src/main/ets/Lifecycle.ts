import hilog from "@ohos.hilog";
import { LifecycleEventObserver } from "./LifecycleEventObserver";
import { LifecycleState } from "./LifecycleState";
import { FrameNode, PageInfo, UIContext, uiObserver } from "@kit.ArkUI";

export function LifecycleOwner(target: any, name: string) {
  if (!target.rerender) {
    hilog.warn(0x0000, 'Lifecycle', '%{public}s', 'LifecycleOwn current target is not a component')
    return
  }
  let lifecycleInit = function () {
    let lifecycle = this[name] as Lifecycle
    createAppear(lifecycle, this)
    let uiContext: UIContext = this.getUIContext()
    let uniqueId: number = this.getUniqueId();
    //没有父节点，说明是Router首页
    if (this['parent_'] == undefined) {
      lifecycle.isPage = true
      lifecycle.isRouterPage = true
      createRouterPage(lifecycle, uiContext, uniqueId)
    } else if (this['parent_']['navDestinationId']) { //父节点是NavDestination
      lifecycle.isPage = true
      lifecycle.isNavigation = true
      createNavChange(this['parent_']['navDestinationId'], lifecycle, uiContext)
      lifecycle['handler'](LifecycleState.ON_WILL_SHOW)
    }
  }
  if (target.aboutToAppear) {
    const oldFunction = target.aboutToAppear;
    target.aboutToAppear = function () {
      oldFunction.call(this);
      lifecycleInit.call(this)
    };
  } else {
    target.aboutToAppear = function () {
      lifecycleInit.call(this)
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
    if (parentNode == null || parentNode == undefined && lifecycle.isPage == false) { //这个是Router首页
      lifecycle.isNavigation = frameNode.getNodeType() == "NavDestination"
      lifecycle.isPage = lifecycle.isNavigation
      if (lifecycle.isNavigation) {
        let currentPageInfo =
          uiContext.getPageInfoByUniqueId(frameNode.getFirstChild().getUniqueId()).navDestinationInfo
        createNavChange(currentPageInfo?.navDestinationId, lifecycle, uiContext)
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