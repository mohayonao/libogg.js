"use strict";

/*global stderr:true,exit:true,fprintf:true */
require("./stdio.h.js");

// SELFTEST ////////////////////////////////////////////////////////////////////
var libogg = require("../libogg.dev.js");
var ogg = libogg.ogg;

var mask = new Uint32Array([
  0x00000000,0x00000001,0x00000003,0x00000007,0x0000000f,
  0x0000001f,0x0000003f,0x0000007f,0x000000ff,0x000001ff,
  0x000003ff,0x000007ff,0x00000fff,0x00001fff,0x00003fff,
  0x00007fff,0x0000ffff,0x0001ffff,0x0003ffff,0x0007ffff,
  0x000fffff,0x001fffff,0x003fffff,0x007fffff,0x00ffffff,
  0x01ffffff,0x03ffffff,0x07ffffff,0x0fffffff,0x1fffffff,
  0x3fffffff,0x7fffffff,0xffffffff
]);

function ilog(v) {
  var ret = 0;
  while (v) {
    ret++;
    v >>= 1;
  }
  return ret;
}

var o = new ogg.PackBuffer();
var r = new ogg.PackBuffer();

function report(str) {
  fprintf(stderr, "%s", str);
  exit(1);
}

function cliptest(b, vals, bits, comp, compsize) {
  var bytes, i, buffer;
  
  o.reset();
  for (i = 0;i < vals; i++) {
    o.write(b[i], bits ? bits : ilog(b[i]));
  }
  buffer = o.get_buffer();
  bytes  = o.bytes();
  if (bytes !== compsize) {
    report("wrong number of bytes!\n");
  }
  for (i = 0; i < bytes; i++) {
    if (buffer[i] !== comp[i]) {
      for (i = 0;i < bytes; i++) {
        fprintf(stderr,"%x %x\n",buffer[i],comp[i]);
      }
      report("wrote incorrect value!\n");
    }
  }
  r.readinit(buffer, bytes);
  for (i = 0; i < vals; i++) {
    var tbit = bits ? bits : ilog(b[i]);
    
    if (r.look(tbit) === -1) {
      report("out of data!\n");
    }
    if (r.look(tbit) !== (b[i] & mask[tbit])) {
      report("looked at incorrect value!\n");
    }
    if (tbit === 1) {
      if (r.look1() !== (b[i] & mask[tbit])) {
        report("looked at single bit incorrect value!\n");
      }
    }
    if (tbit === 1) {
      if (r.read1() !== (b[i] & mask[tbit])) {
        report("read incorrect single bit value!\n");
      }
    } else {
      if (r.read(tbit) !== (b[i] & mask[tbit])) {
        report("read incorrect value!\n");
      }
    }
  }
  if (r.bytes() !== bytes) {
    report("leftover bytes after read!\n");
  }
}

function main() {
  var buffer, bytes, i;
  
  var testbuffer1 = new Uint32Array([
    18,12,103948,4325,543,76,432,52,3,65,4,56,32,42,34,21,1,23,32,546,456,7,
    567,56,8,8,55,3,52,342,341,4,265,7,67,86,2199,21,7,1,5,1,4
  ]);
  var test1size = 43;
  
  var testbuffer2 = new Uint32Array([
    216531625,1237861823,56732452,131,3212421,12325343,34547562,12313212,
    1233432,534,5,346435231,14436467,7869299,76326614,167548585,
    85525151,0,12321,1,349528352
  ]);
  var test2size = 21;
  
  var testbuffer3 = new Uint32Array([
    1,0,14,0,1,0,12,0,1,0,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,1,1,1,1,0,0,1,
    0,1,30,1,1,1,0,0,1,0,0,0,12,0,11,0,1,0,0,1
  ]);
  var test3size = 56;
  
  var large = new Uint32Array([
    2136531625,2137861823,56732452,131,3212421,12325343,34547562,12313212,
    1233432,534,5,2146435231,14436467,7869299,76326614,167548585,
    85525151,0,12321,1,2146528352
  ]);
  
  var onesize = 33;
  var one = new Uint16Array([
    146,25,44,151,195,15,153,176,233,131,196,65,85,172,47,40,
    34,242,223,136,35,222,211,86,171,50,225,135,214,75,172,
    223,4
  ]);
  
  var twosize = 6;
  var two = new Uint16Array([
    61,255,255,251,231,29
  ]);
  
  var threesize = 54;
  var three = new Uint16Array([
    169,2,232,252,91,132,156,36,89,13,123,176,144,32,254,
    142,224,85,59,121,144,79,124,23,67,90,90,216,79,23,83,
    58,135,196,61,55,129,183,54,101,100,170,37,127,126,10,
    100,52,4,14,18,86,77,1
  ]);
  
  var foursize = 38;
  var four = new Uint16Array([
    18,6,163,252,97,194,104,131,32,1,7,82,137,42,129,11,72,
    132,60,220,112,8,196,109,64,179,86,9,137,195,208,122,169,
    28,2,133,0,1
  ]);
  
  var fivesize = 45;
  var five = new Uint16Array([
    169,2,126,139,144,172,30,4,80,72,240,59,130,218,73,62,
    241,24,210,44,4,20,0,248,116,49,135,100,110,130,181,169,
    84,75,159,2,1,0,132,192,8,0,0,18,22
  ]);
  
  var sixsize = 7;
  var six = new Uint16Array([
    17,177,170,242,169,19,148
  ]);
  
  /* Test read/write together */
  /* Later we test against pregenerated bitstreams */
  o.writeinit();
  
  fprintf(stderr,"\nSmall preclipped packing (LSb): ");
  cliptest(testbuffer1,test1size,0,one,onesize);
  fprintf(stderr,"ok.");
  
  fprintf(stderr,"\nNull bit call (LSb): ");
  cliptest(testbuffer3,test3size,0,two,twosize);
  fprintf(stderr,"ok.");

  fprintf(stderr,"\nLarge preclipped packing (LSb): ");
  cliptest(testbuffer2,test2size,0,three,threesize);
  fprintf(stderr,"ok.");

  fprintf(stderr,"\n32 bit preclipped packing (LSb): ");
  o.reset();
  for (i = 0; i < test2size; i++) {
    o.write(large[i], 32);
  }
  buffer = o.get_buffer();
  bytes = o.bytes();
  r.readinit(buffer, bytes);
  for (i = 0; i < test2size; i++) {
    if (r.look(32) ===- 1) {
      report("out of data. failed!");
    }
    if (r.look(32) !== large[i]) {
      fprintf(stderr,"%ld != %ld (%lx!=%lx):",r.look(32),large[i],
              r.look(32),large[i]);
      report("read incorrect value!\n");
    }
    r.adv(32);
  }
  if (r.bytes() !== bytes) {
    report("leftover bytes after read!\n");
  }
  fprintf(stderr,"ok.");
  
  fprintf(stderr,"\nSmall unclipped packing (LSb): ");
  cliptest(testbuffer1,test1size,7,four,foursize);
  fprintf(stderr,"ok.");

  fprintf(stderr,"\nLarge unclipped packing (LSb): ");
  cliptest(testbuffer2,test2size,17,five,fivesize);
  fprintf(stderr,"ok.");

  fprintf(stderr,"\nSingle bit unclipped packing (LSb): ");
  cliptest(testbuffer3,test3size,1,six,sixsize);
  fprintf(stderr,"ok.");
  
  fprintf(stderr,"\nTesting read past end (LSb): ");
  
  r.readinit(new Uint8Array(8), 8);
  for (i = 0; i < 64; i++) {
    if (r.read(1) !== 0) {
      fprintf(stderr,"failed; got -1 prematurely.\n");
      exit(1);
    }
  }
  if (r.look(1) !== -1 || r.read(1) !== -1) {
    fprintf(stderr,"failed; read past end without -1.\n");
    exit(1);
  }
  r.readinit(new Uint8Array(8), 8);
  if (r.read(30) !== 0 || r.read(16) !== 0){
    fprintf(stderr,"failed 2; got -1 prematurely.\n");
    exit(1);
  }
  
  if (r.look(18) !== 0 || r.look(18) !== 0) {
    fprintf(stderr,"failed 3; got -1 prematurely.\n");
    exit(1);
  }
  if (r.look(19) !== -1 || r.look(19) !== -1) {
    fprintf(stderr,"failed; read past end without -1.\n");
    exit(1);
  }
  if (r.look(32) !== -1 || r.look(32) !== -1) {
    fprintf(stderr,"failed; read past end without -1.\n");
    exit(1);
  }
  o.writeclear();
  fprintf(stderr,"ok.\n");

  return 0;
}

main();
