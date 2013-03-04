"use strict";

var util = require("util");

var stdin  = global.stdin  = {fp:null};
var stdout = global.stdout = {fp:null};
var stderr = global.stderr = {fp:null};

global.NULL = null;

function exit(id) {
  process.exit(id);
}
global.exit = exit;

function fprintf(stream, format) {
  var argv = Array.prototype.slice.call(arguments, 2);
  var str = format.replace(/%(\d+)?([ldxcs]+)/g, function(m, num, chr) {
    var val = argv.shift();
    switch (chr) {
    case "c":
      val = String.fromCharCode(val);
      break;
    case "x":
      val = "0x" + val.toString(16);
      break;
    }
    return val;
  });
  if (stream === stdout) {
    if (!stdout.fp) {
      util.print(str);
    }
  } else {
    if (!stderr.fp) {
      util.print(str);
    }
  }
}
global.fprintf = fprintf;

function printf() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(stdout);
  fprintf.apply(null, args);
}
global.printf = printf;

function fread(buf, size, n, fp) {
  if (fp.fp) {
    n = Math.min(n, fp.fp.length);
    buf.set(fp.fp.subarray(0, n));
    fp.fp = new Uint8Array(fp.fp.buffer, fp.fp.byteOffset + n);
    return n;
  }
  throw new Error("cannot fread.");
}
global.fread = fread;

function memcmp(obj1, obj2, n) {
  var i;
  if (typeof n === "number") {
    for (i = 0; i < n; i++) {
      if (obj1[i] !== obj2[i]) {
        return -1;
      }
    }
  } else {
    for (var k in obj1) {
      if (typeof obj1[k] !== "object") {
        if (typeof obj1[k] === "function") {
          continue;
        } else if (obj1[k] !== obj2[k]) {
          return -1;
        }
      } else {
        var lis1 = obj1[k], lis2 = obj2[k];
        if (lis1.length !== lis2.length) {
          return -1;
        }
        for (i = 0; i < lis1.length; i++) {
          if (lis1[i] !== lis2[i]) {
            return -1;
          }
        }
      }
    }
  }
  return 0;
}
global.memcmp = memcmp;

function pointer(src, offset, length) {
  offset = src.byteOffset + offset * src.BYTES_PER_ELEMENT;
  if (typeof length === "number") {
    return new src.constructor(src.buffer, offset, length);
  } else {
    return new src.constructor(src.buffer, offset);
  }
}
global.pointer = pointer;
