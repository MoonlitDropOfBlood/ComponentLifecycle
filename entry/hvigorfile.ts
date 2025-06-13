import { hapTasks } from '@ohos/hvigor-ohos-plugin';

//1：导入插件包和配置类(直接复制该行代码)
import { AppRouterPlugin } from "app_router_hvigor_plugin"

export default {
    system: hapTasks,  /* Built-in plugin of Hvigor. It cannot be modified. */
    plugins:[
        AppRouterPlugin({
            //3:(重点注意)entry类型的模块传true，非entry类型传false
            "isEntry": true,
            "routerDependencyName":"@zhongrui/app_router",
            //扫描配置@RouterPath装饰器的组件所在的具体路径，可以加快编译速度,不配置scanPackagePath参数，默认路径为："src/main/ets"
            "scanPackagePath": ["src/main/ets"]
        })
    ]         /* Custom plugin to extend the functionality of Hvigor. */
}
