module.exports = function(grunt) {
    "use strict";
    
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    
    grunt.initConfig({
        watch: {
            scripts: {
                files: [
                  "include/*.js", "include/ogg/*.js",
                  "src/*.js", "test/*.js"
                ],
                tasks: ["concat", "jshint", "uglify"],
                options: {
                    interrupt: true
                }
            }
        },
        concat: {
            dist: {
                src: [
                    "build/header.txt",
                    "include/*.js",
                    "include/**/*.js",
                    "src/*.js",
                    "build/footer.txt"
                ],
                dest: "libogg.dev.js"
            }
        },
        jshint: {
            all: ["libogg.dev.js"],
            options: {
                curly   : false,
                eqeqeq  : true,
                latedef : true,
                noarg   : true,
                noempty : true,
                quotmark: "double",
                undef   : true,
                strict  : true,
                trailing: true,
                newcap  : true,
                browser : true,
                node    : true
            }
        },
        uglify: {
            all: {
                options: {
                    sourceMap: "libogg.js.map"
                },
                files: {
                    "libogg.js": ["libogg.dev.js"]
                }
            }
        },
        clean: ["libogg.dev.js", "libogg.js", "libogg.js.map"]
    });
    
    grunt.registerTask("default", ["concat", "jshint", "uglify"]);
};
