import { Lifecycle, LifecycleOwner } from 'component-lifecycle';

@Entry
@ComponentV2
struct TestPage {
  @Local message: string = 'Hello World';

  @LifecycleOwner lifecycle:Lifecycle = new Lifecycle()

  aboutToAppear(): void {
    this.lifecycle.addObserver((owner, state) => {
      console.log("TestPage =>state:", state)
    })
  }

  build() {
    RelativeContainer() {
      Text(this.message)
        .id('TestPageHelloWorld')
        .fontSize($r('app.float.page_text_font_size'))
        .fontWeight(FontWeight.Bold)
        .alignRules({
          center: { anchor: '__container__', align: VerticalAlign.Center },
          middle: { anchor: '__container__', align: HorizontalAlign.Center }
        })
        .onClick(() => {
          this.message = 'Welcome';
        })
    }
    .height('100%')
    .width('100%')
  }
}