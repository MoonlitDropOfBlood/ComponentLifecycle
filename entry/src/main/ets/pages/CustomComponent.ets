import { Lifecycle, LifecycleOwner } from "@duke/component-lifecycle";
import { LifecycleState } from "@duke/component-lifecycle";

@ComponentV2
export struct Custom1Component{
  @LifecycleOwner lifecycle = new Lifecycle()

  aboutToAppear(): void {
    this.lifecycle.addObserver((owner:Custom1Component, state:LifecycleState) => {
      console.log('lifecycle', state, owner)
    })
  }

  build() {
    Column(){}
    .width(10)
    .height(10)
  }
}