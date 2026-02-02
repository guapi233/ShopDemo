const path = require("path");
const glob = require("glob"); // 用户读取指定路径下的所有文件，返回一个文件列表
const { sep } = path;


// 将app/service/下的所有中间件加载到app上，并可通过app.service.${目录}.${文件}来访问
module.exports = (app) => {
    // 读取app/service/**/**.js 所有符合的文件
    const servicePath = path.resolve(app.businessPath, `.${sep}service`);
    const fileList = glob.sync(path.resolve(servicePath, `.${sep}**${sep}**.js`));

    // 遍历所有文件目录，把内容加载到 app.service 下
    const services = {};
    fileList.forEach(file => {
        // 提取文件名称
        let name = path.resolve(file);

        // 截取路径 app/service/custom-module/custom-service.js => custom-module/custom-service
        name = name.substring(name.lastIndexOf(`service${sep}`) + `service${sep}`.length, name.lastIndexOf("."));

        // 把 -_ 替换为驼峰命名，匹配 "-c" => "C"
        name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

        let tempService = services;
        const names = name.split(sep);  // 拆分每个文件层级
        for (let i = 0, len = names.length; i < len; ++i) {
            // 最后一层，是文件
            if (i === len - 1) {
                tempService[name[i]] = require(path.resolve(file))(app);
            } else {
                // 中间层文件夹，需要挂载为key值
                if (!tempService[name[i]]) {
                    tempService[name[i]] = {};
                }
                tempService = tempService[name[i]];
            }
        }
    })

    // 挂载到app上
    app.services = services;
};