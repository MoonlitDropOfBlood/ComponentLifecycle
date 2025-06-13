import { Lifecycle, LifecycleOwner } from "component-lifecycle";

@ComponentV2
export struct Custom1Component{
  @LifecycleOwner lifecycle = new Lifecycle()

  aboutToAppear(): void {

  }

  build() {
    Column(){}
    .width(10)
    .height(10)
  }
}