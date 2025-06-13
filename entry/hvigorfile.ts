import { hapTasks } from '@ohos/hvigor-ohos-plugin';

//1：导入插件包和配置类(直接复制该行代码)
import { AppRouterPlugin } from "app_router_hvigor_plugin"

// 1、导入
import { routerRegisterPlugin, PluginConfig } from 'router-register-plugin'

// 2、初始化配置
const config: PluginConfig = {
    scanDirs: ['src/main/ets/pages', 'src/main/ets/views'], // 扫描的目录，如果不设置，默认是扫描src/main/ets目录
    logEnabled: true, // 查看日志
    viewNodeInfo: false, // 查看节点信息
    ignoredModules:[], // 忽略的参与构建的模块，根据自己项目自行设置
    enableUiPreviewBuild: false, // 启用UI预览构建，不建议启动
}

export default {
    system: hapTasks,  /* Built-in plugin of Hvigor. It cannot be modified. */
    plugins:[
        AppRouterPlugin({
            //3:(重点注意)entry类型的模块传true，非entry类型传false
            "isEntry": true,
            "routerDependencyName":"@zhongrui/app_router",
            //扫描配置@RouterPath装饰器的组件所在的具体路径，可以加快编译速度,不配置scanPackagePath参数，默认路径为："src/main/ets"
            "scanPackagePath": ["src/main/ets"]
        }),
        routerRegisterPlugin(config)
    ]         /* Custom plugin to extend the functionality of Hvigor. */
}
