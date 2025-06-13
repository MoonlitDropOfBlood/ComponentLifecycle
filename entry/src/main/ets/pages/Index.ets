import { ZRouter } from '@hzw/zrouter';
import { AppRouter } from '@zhongrui/app_router';
import { Lifecycle, LifecycleOwner } from '@duke/component-lifecycle';
import { Custom1Component } from './CustomComponent';
import { router, Router } from '@kit.ArkUI';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @LifecycleOwner lifecycle: Lifecycle = new Lifecycle()

  @Builder
  getBuilder(path: string) {
    //此处写法固定，不会随着组件数量增加而增加额外逻辑
    AppRouter.getBuilderByPath(path)?.builder(path as Object)
  }

  aboutToAppear(): void {
    this.lifecycle.addObserver((owner, state) => {
      console.log('lifecycle', state, owner)
    })
  }

  aboutToDisappear(): void {

  }

  build() {
    // Navigation(AppRouter.getRootStack()) {
    Navigation(ZRouter.getNavStack()){
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
            // AppRouter.push("entry/TestNav1Child")
            ZRouter.getInstance().push("entry/TestNav1Child")
          })

        Button('跳转')
          .onClick(() => {
            router.pushUrl({url:'pages/TestPage'})
          })
      }
      .height('100%')
      .width('100%')
    }
    // .navDestination(this.getBuilder)
  }

  onDidBuild(): void {
    console.log('111')
  }
}