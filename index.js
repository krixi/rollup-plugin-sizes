/* eslint one-var: "off", vars-on-top: "off" */

"use strict";

var path     = require("path"),
    filesize = require("filesize");

function defaultReport(details) {
    var args = Object.assign({}, details);

    // Sort
    args.totals.sort((a, b) => b.size - a.size);
    console.log("%s:", args.input, filesize(args.total));

    if(args.options.details) {
        args.totals.forEach((item) => {
            var name = path.isAbsolute(item.name) ? path.basename(item.name) : item.name;

            console.log(
                "\t%s (%s%%) - %s",
                filesize(item.size),
                ((item.size / args.total) * 100).toFixed(2),
                name
            );
        });
    }
}

module.exports = (options) => {
    var input, report;

    if(!options) {
        options = false;
    }

    report = (options && options.report) || defaultReport;

    return {
        name : "rollup-plugin-sizes",

        // Grab some needed bits out of the options
        options : (config) => {
            input = config.input;
        },

        // Spit out stats during bundle generation
        ongenerate : (details) => {
            var data   = {},
                totals = [],
                total = 0,
                module,
                size = 0;


            for(var moduleName in details.bundle.modules) {
                module = details.bundle.modules[moduleName];
                size = module.renderedLength;

                if(!size) {
                    continue;
                }

                total += size;
                totals.push({
                    name : moduleName,
                    size : size
                });
            }

            report({
                input,
                data,
                totals,
                total,
                options
            });
        }
    };
};
