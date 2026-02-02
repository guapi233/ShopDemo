const Koa = require("koa");
const path = require("path");
const { sep } = path;
const env = require("./env");

const configLoader = require("./loader/config");
const controllerLoader = require("./loader/controller");
const extendLoader = require("./loader/extend");
const middlewareLoader = require("./loader/middleware");
const routerSchemaLoader = require("./loader/router-schema");
const routerLoader = require("./loader/router");
const serviceLoader = require("./loader/service");

module.exports = {
    start(options = {}) {
        // koa实例
        const app = new Koa();

        // 应用配置
        app.options = options;

        // 基础路径
        app.baseDir = process.cwd();

        // 业务文件路径
        app.businessPath = path.resolve(app.baseDir, `.${sep}app`);

        // 初始化环境配置
        app.env = env();

        // 加载中间件
        middlewareLoader(app);
        console.log("middleware done...");

        // 加载路由规则
        routerSchemaLoader(app);
        console.log("router schema done...");

        // 加载控制器
        controllerLoader(app);
        console.log("controller done...");

        // 加载服务
        serviceLoader(app);
        console.log("service done...");

        // 加载配置
        configLoader(app);
        console.log("config done...");

        // 加载拓展
        extendLoader(app);
        console.log("extend done...");

        // 注册全局中间件
        try {
            require(`${app.businessPath}${sep}middleware.js`)(app);
        } catch(e) {
            console.log("[exception] there is no middleware file.");
        }

        // 注册路由
        routerLoader(app);
        console.log("router done...");

        // 启动服务
        try {
            const port = process.env.port || 8080;
            const host = process.env.host || "0.0.0.0";
            app.listen(port, host);

            console.log(`Server running on port: ${port}...`);
        } catch (e) {
            console.log(e); 
        }
    }
}
