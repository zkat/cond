module.exports = function(grunt) {
  var webpack = require("webpack");
  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.initConfig({
    webpack: {
      options: {
        entry: "./src/index.js",
        output: {
          library: "cond",
          libraryTarget: "umd",
          path: __dirname + "/build/",
          filename: "cond.js"
        }
      },
      build: {
        plugins: [
          new webpack.DefinePlugin({
            "process.env": {
              "NODE_ENV": JSON.stringify("production")
            }
          }),
          new webpack.optimize.UglifyJsPlugin()
        ]
      },
      "build-dev": {
        devtool: "#sourcemap",
        debug: true
      }
    },
    watch: {
      app: {
        files: ["src/index.js"],
        tasks: ["webpack:build-dev"],
        options: {
          spawn: false
        }
      }
    }
  });

  // Build and watch cycle (another option for development)
  // Advantage: No server required, can run app from filesystem
  // Disadvantage: Requests are not blocked until bundle is available,
  // can serve an old app on too fast refresh
  grunt.registerTask("dev", ["webpack:build-dev", "watch:app"]);

  grunt.registerTask("build-dev", ["webpack:build-dev"]);
  // Production build
  grunt.registerTask("build", ["webpack:build"]);

  grunt.registerTask("default", ["build"]);
};
