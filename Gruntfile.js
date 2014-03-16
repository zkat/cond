module.exports = function(grunt) {
  var webpack = require("webpack"),
      shell = require("exec-sync");
  grunt.loadNpmTasks("grunt-webpack");
  grunt.initConfig({
    webpack: {
      options: {
        output: {
          library: "cond",
          libraryTarget: "umd",
          path: __dirname + "/build/",
          filename: "[name].js"
        },
        devtool: "#sourcemap"
      },
      "build-regular": {
        entry: {
          "cond": "./src/index.js"
        }
      },
      "build-min": {
        entry: {
          "cond.min": "./src/index.js"
        },
        plugins: [
          new webpack.DefinePlugin({
            "process.env": {
              "NODE_ENV": JSON.stringify("production")
            }
          }),
          new webpack.optimize.UglifyJsPlugin()
        ]
      }
    }
  });

  grunt.registerTask("build", ["webpack:build-regular", "webpack:build-min"]);
  grunt.registerTask("default", ["build"]);
  grunt.registerTask("update-build", "Commits the built version", function() {
    [
      "git add ./build",
      "git commit -m 'Updating build files'"
    ].forEach(function(cmd) {
      grunt.log.writeln(shell(cmd));
    });
  });
  grunt.registerTask("tag", "Tag a new release on master", function(type) {
    type = type || "patch";
    [
      "git remote update",
      "git checkout master",
      "git pull --ff-only",
      "npm version "+type+" -m 'Upgrading to %s'",
      "git checkout develop",
      "git pull --ff-only",
      "git merge master"
    ].forEach(function(cmd) {
      grunt.log.writeln(shell(cmd));
    });
  });
  grunt.registerTask("release", "Make a release", function(type) {
    grunt.task.run("build", "update-build", "tag"+(type?":"+type:""));
  });
  grunt.registerTask("publish", "Publish to npm and bower", function() {
    [
      "git push origin develop:develop",
      "git push origin master:master",
      "git push --tags",
      "npm publish ."
    ].forEach(function(cmd) {
      grunt.log.writeln(shell(cmd));
    });
  });
};
