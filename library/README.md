# ComponentLifecycle

[![openHarmony](https://img.shields.io/badge/openharmony-v1.0.1-brightgreen)](https://gitee.com/Duke_Bit/component-lifecycle/releases)

## 简介

ComponentLifecycle，是一个库，用于存储有关组件（如 Router 或 NavDestination）的生命周期状态的信息，并允许其他对象观测此状态。
支持目前两种路由形式Router和NavDestination。

### 事件

从框架和 Lifecycle 类分派的生命周期事件。这些事件映射到 Router 和 NavDestination 中的回调事件。

### 状态

Lifecycle 对象所跟踪的组件的当前状态。

## 下载安装

````
ohpm install @duke/component-lifecycle
````

OpenHarmony ohpm
环境配置等更多内容，请参考[如何安装 OpenHarmony ohpm 包](https://gitee.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md)

## 使用说明

```
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
```

## 接口说明

### Lifecycle

| 方法名            | 入参                     | 接口描述                   |
|:---------------|:-----------------------|:-----------------------|
| addOberver     | LifecycleEventObserver | 添加观察者                  |
| removeObserver | LifecycleEventObserver | 移除观察者                  |
| release        | 释放                     | 框架内部释放资源，请勿随意调用，容易出现问题 |        |           |

### LifecycleOwner 装饰器

给Lifecycle添加生命周期管理的能力

### LifecycleState 状态枚举（数字类型可用于计算）

| 状态           | 值 | 说明                                                       |
|:-------------|:--|:---------------------------------------------------------|
| INITIALIZED  | 0 | 初始化状态                                                    |
| ON_APPEAR    | 1 | 组件创建                                                     |
| ON_WILL_SHOW | 2 | 组件显示前,仅NavDestination下存在                                 |
| ON_SHOWED    | 3 | 显示中,组件状态下表示组件可见性以0为阈值                                    |
| ON_ACTIVE    | 4 | NavDestination处于激活态,仅NavDestination下存在                   |
| ON_WILL_HIDE | 5 | NavDestination组件触发隐藏之前执行（应用切换到后台不会触发），仅NavDestination下存在 |
| ON_INACTIVE  | 6 | NavDestination组件处于非激活态,仅NavDestination下存在                |
| ON_HIDDEN    | 7 | 页面不可见,组件状态下表示组件可见性以0为阈值                                  |
| ON_DISAPPEAR | 8 | 组件销毁                                                     |

###  LifecycleEventObserver
| 入参    | 说明       |
|:------|:---------|
| owner | 触发的自定义组件 |
| state | 当前生命周期状态 |

## 约束与限制

在下述版本验证通过：

DevEco Studio: 5.0.5.315, SDK: HarmonyOS 5.0.1 Release Ohos_sdk_public 5.0.1.115 (API Version 13 Release)

## 目录结构

````
|---- ComponentLifecycle
|     |---- AppScrope  # 示例代码文件夹
|     |---- entry  # 示例代码文件夹
|     |---- examples # 示例代码文件夹  
|     |---- library # ComponentLifecycle库文件夹  
|           |---- index.ts  # 对外接口     
|     |---- README.md  # 安装使用方法
|     |---- CHANGELOG.md  # 更新日志
````

## 贡献代码

使用过程中发现任何问题都可以提 [Issue](https://gitee.com/Duke_Bit/component-lifecycle/issues)
给我，当然，我也非常欢迎你给我发 [PR](https://gitee.com/Duke_Bit/component-lifecycle) 。

## 开源协议

本项目基于 [MIT license](https://gitee.com/Duke_Bit/component-lifecycle/blob/master/LICENSE) ，请自由地享受和参与开源。