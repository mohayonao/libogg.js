"use strict";

var fs = require("fs");

/*global stdin:true,fread:true,printf:true,exit:true */
require("./stdio.h");

var fp = fs.readFileSync(__dirname + "/sample01.ogg");

// decoder_example.js //////////////////////////////////////////////////////////

var libogg = require("../libogg.dev.js");
var ogg = libogg.ogg;

function main() {
  stdin.fp = new Uint8Array(fp);
  
  var oy = new ogg.SyncState();
  var os = new ogg.StreamState();
  var og = new ogg.Page();
  var op = new ogg.Packet();
  var buffer, bytes;
  var eos, result, initialized;
  
  oy.init();
  
  while (!eos) {
    
    buffer = oy.buffer(4096);
    bytes = fread(buffer, 1, 4096, stdin);
    oy.wrote(bytes);
    
    if (bytes === 0) eos = 1;
    
    result = oy.pageout(og);
    if(result === 0) continue;
    
    printf("serialno=%d, pageno=%d, packets=%d\n",
           og.serialno(), og.pageno(), og.packets());
    
    if (!initialized) {
      os.init(og.serialno());
      initialized = 1;
    }
    
    os.pagein(og);
    while (1) {
      result = os.packetout(op);
      if (result === 0)break;
      if (result < 0)continue;
      printf("  granulepos=%d, packetno=%d, size=%d\n",
             op.granulepos, op.packetno, op.bytes);
    }
    
    if (os.eos()) eos = 1;
  }
  os.clear();
  oy.clear();
  
  printf("Done.\n");
  return(0);
}

main();
