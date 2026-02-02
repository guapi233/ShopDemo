const path = require("path");
const glob = require("glob"); // 用户读取指定路径下的所有文件，返回一个文件列表
const { sep } = path;

// 通过 json-schema 和 ajv 来对API进行规则约束，配合 api-params-verify 中间件使用
// 输出：
// app.routerSchema = {
//     "${api1}": "${jsonSchema}",
//     "${api2}": "${jsonSchema}",
//     "${api3}": "${jsonSchema}"
// }
module.exports = (app) => {
    // 读取 app/router-schema/**/**.js 符合的所有文件
    const routerSchemaPath = path.resolve(app.businessPath, `.${sep}router-schema`);
    const fileList = glob.sync(path.resolve(routerSchemaPath, `.${sep}**${sep}**.js`));

    // 注册所有routerSchema，使得可以 `app.routerSchema` 这样访问
    let routerSchema = {};
    fileList.forEach(file => {
        routerSchema = {
            ...routerSchema,
            ...require(path.resolve(file))
        }
    });

    app.routerSchema = routerSchema;
};