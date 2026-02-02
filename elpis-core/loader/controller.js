const path = require("path");
const glob = require("glob"); // 用户读取指定路径下的所有文件，返回一个文件列表
const { sep } = path;


// 将app/controller/下的所有中间件加载到app上，并可通过app.controller.${目录}.${文件}来访问
module.exports = (app) => {
    // 读取app/controller/**/**.js 所有符合的文件
    const controllerPath = path.resolve(app.businessPath, `.${sep}controller`);
    const fileList = glob.sync(path.resolve(controllerPath, `.${sep}**${sep}**.js`));

    // 遍历所有文件目录，把内容加载到 app.controller 下
    const controllers = {};
    fileList.forEach(file => {
        // 提取文件名称
        let name = path.resolve(file);

        // 截取路径 app/controller/custom-module/custom-controller.js => custom-module/custom-controller
        name = name.substring(name.lastIndexOf(`controller${sep}`) + `controller${sep}`.length, name.lastIndexOf("."));

        // 把 -_ 替换为驼峰命名，匹配 "-c" => "C"
        name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

        let tempController = controllers;
        const names = name.split(sep);  // 拆分每个文件层级
        for (let i = 0, len = names.length; i < len; ++i) {
            // 最后一层，是文件
            if (i === len - 1) {
                tempController[name[i]] = require(path.resolve(file))(app);
            } else {
                // 中间层文件夹，需要挂载为key值
                if (!tempController[name[i]]) {
                    tempController[name[i]] = {};
                }
                tempController = tempController[name[i]];
            }
        }
    })

    // 挂载到app上
    app.controllers = controllers;
};