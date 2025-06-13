import { RouterPath } from "@zhongrui/app_router"
import { Lifecycle, LifecycleOwner } from "component-lifecycle"

@RouterPath({path:"entry/TestNav1Child"})
@ComponentV2
export struct TestNav1Child{
  @LifecycleOwner lifecycle = new Lifecycle()

  aboutToAppear(): void {
    this.lifecycle.addObserver((owner,state)=>{
      console.log("TestNav1Child =>state:",state)
    })
  }

  build() {
    NavDestination(){
     Text('测试')
    }
  }
}