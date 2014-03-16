module.exports = function(grunt) {
  var webpack = require("webpack"),
      sh = require("execSync");
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
    exec([
      "git add ./build",
      "git commit -m 'Updating build files'"
    ]);
  });
  grunt.registerTask("tag", "Tag a new release on master", function(type) {
    type = type || "patch";
    exec([
      "git remote update",
      "git checkout master",
      "git pull --ff-only",
      "npm version "+type+" -m 'Upgrading to %s'",
      "git checkout develop",
      "git pull --ff-only",
      "git merge master"
    ]);
  });
  grunt.registerTask("release", "Make a release", function(type) {
    grunt.task.run("build", "update-build", "tag"+(type?":"+type:""));
  });
  grunt.registerTask("publish", "Publish to npm and bower", function() {
    exec([
      "git push origin develop:develop",
      "git push origin master:master",
      "git push --tags",
      "npm publish ."
    ]);
  });

  function exec(commands) {
    commands.forEach(function(cmd) {
      var result = sh.exec(cmd);
      grunt.log.write(result.stdout || "");
      grunt.log.write(result.stderr || "");
      if (result.code) {
        throw new Error("exit "+result.code);
      }
    });
  }
};
