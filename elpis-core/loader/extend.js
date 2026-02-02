const path = require("path");
const glob = require("glob"); // 用户读取指定路径下的所有文件，返回一个文件列表
const { sep } = path;


// 将app/extend/下的所有中间件加载到app上，并可通过app.${文件}来访问
module.exports = (app) => {
    // 读取app/extend/**.js 所有符合的文件
    const extendPath = path.resolve(app.businessPath, `.${sep}extend`);
    const fileList = glob.sync(path.resolve(extendPath, `.${sep}**.js`));

    // 遍历所有文件目录，把内容加载到 app.extend 下
    const extend = {};
    fileList.forEach(file => {
        // 提取文件名称
        let name = path.resolve(file);

        // 截取路径 app/extend/custom-extend.js => custom-extend
        name = name.substring(name.lastIndexOf(`extend${sep}`) + `extend${sep}`.length, name.lastIndexOf("."));

        // 把 -_ 替换为驼峰命名，匹配 "-c" => "C"
        name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

        // 过滤 app 已经存在的 key
        for (const key in app) {
            if (key === name) {
                console.log(`[extend load error] name ${name} is already in app`);
                return;
            }
        }
        
        // 挂载到app上
        app[name] = require(path.resolve(file))(app);
    });

};