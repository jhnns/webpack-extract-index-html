var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");
var fs = require("fs");

var extractIndexHtml = new ExtractTextPlugin("index.html");
var extractMainLess = new ExtractTextPlugin("[contenthash].css");

module.exports = {
    entry: [
        path.join(__dirname, "app", "init.js"),
        path.join(__dirname, "app", "index.html")
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.[hash].js"
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, "app", "index.html"),
                loader: extractIndexHtml.extract([
                    "html?" + JSON.stringify({
                        attrs: ["img:src", "link:href"]
                    })
                ])
            },
            {
                test: path.join(__dirname, "app", "styles", "main.css"),
                loader: extractMainLess.extract([
                    "css"
                ])
            },
            {
                test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff2?$|\.ttf$|\.eot|\.wav$|\.mp3$/,
                loaders: ["file"]
            }
        ]
    },
    plugins: [
        // The order is important because the stylesheet must be extracted first
        extractMainLess,
        extractIndexHtml,
        function ReplaceBundleSrc() {
            this.plugin("done", function (stats) {
                var opts = stats.compilation.options;
                var indexHtmlPath = path.join(opts.output.path, "index.html");
                var bundleJs = opts.output.filename.replace(/\[hash]/, stats.compilation.hash);

                fs.writeFileSync(
                    indexHtmlPath,
                    fs.readFileSync(indexHtmlPath, "utf8").replace(/% BUNDLE %/, bundleJs)
                );
            });
        }
    ]
};
