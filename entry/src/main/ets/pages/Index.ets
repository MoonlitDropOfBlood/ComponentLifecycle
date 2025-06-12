import { Lifecycle, LifecycleOwner } from 'component-lifecycle';
import { Custom1Component } from './CustomComponent';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @LifecycleOwner lifecycle: Lifecycle = new Lifecycle()

  aboutToAppear(): void {
    this.lifecycle.addObserver((owner, state) => {
      console.log('lifecycle', state, owner)
    })
  }

  aboutToDisappear(): void {

  }

  build() {
    Navigation() {
      RelativeContainer() {
        Custom1Component()
        Text(this.message)
          .id('HelloWorld')
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

  onDidBuild(): void {
    console.log('111')
  }
}