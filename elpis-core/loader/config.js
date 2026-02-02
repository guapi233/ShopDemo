const path = require("path");
const { sep } = path;

// 加载配置文件

module.exports = (app) => {
    // 找到 config 目录
    const configPath = path.resolve(app.baseDir, `.${sep}config`);

    // 获取 default.config
    let defaultConfig = {};
    try {
        defaultConfig = require(path.resolve(configPath, `.${sep}config.default.js`));
    } catch (e) {
        console.log("[exception] there is no default config file");
    }

    // 获取 env.config
    let envConfig = {};
    try {
        // 本地环境
        if (app.env.isLocal()) {
            envConfig = require(path.resolve(configPath, `.${sep}config.local.js`));
        } else if (app.env.isBeta()) {
            envConfig = require(path.resolve(configPath, `.${sep}config.beta.js`));
        } else if (app.env.isProduction()) {
            envConfig = require(path.resolve(configPath, `.${sep}config.production.js`));
        }
    } catch (e) {
        console.log("[exception] there is no env.config file");
    }

    // 覆盖并加载 config 配置
    app.config = Object.assign({}, defaultConfig, envConfig);
};