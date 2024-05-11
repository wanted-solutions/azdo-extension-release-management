const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Webpack entry points. Mapping from resulting bundle name to the source file entry.
const entries = {};

// Loop through subfolders in the "Components" folder and add an entry for each one
const samplesDir = path.join(__dirname, "src/Modules");
fs.readdirSync(samplesDir).filter(dir => {
    if (fs.statSync(path.join(samplesDir, dir)).isDirectory()) {
        entries[dir] = "./" + path.relative(process.cwd(), path.join(samplesDir, dir, dir));
    }
});

module.exports = [{
    devServer: {
        server: 'spdy',
        static: {
            serveIndex: false,
            directory: 'static',
            publicPath: '/static'
        },
        hot: true,
        port: 8000,
        onBeforeSetupMiddleware: function (devServer) {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            devServer.app.get('/dist/:module/:module.html', function(req, res) {
                res.sendFile(path.join(__dirname, '/dist/' + req.params.module + '/' + req.params.module + '.html'));
            });

            devServer.app.get('/dist/:module/:module.js', function(req, res) {
                res.sendFile(path.join(__dirname, '/dist/' + req.params.module + '/' + req.params.module + '.js'));
            });
        },
    },
    name: "extension",
    entry: entries,
    output: {
        filename: "[name]/[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
        },
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: [
                    path.join(__dirname, "dev")
                ]
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.woff$/,
                type: 'asset/inline'
            },
            {
                test: /\.html$/,
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
           patterns: [
               { from: "**/*.html", context: "src/Modules" }
           ]
        })
    ]
}];
