"use strict";

/*global stderr:true,exit:true,fprintf:true,memcmp:true,pointer:true */
require("./stdio.h.js");

// SELFTEST ////////////////////////////////////////////////////////////////////
var libogg = require("../libogg.dev.js");
var ogg = libogg.ogg;

var syncState = new ogg.SyncState();
var streamStateEnc = new ogg.StreamState();
var streamStateDec = new ogg.StreamState();

var sequence = 0;
var lastno = 0;

function checkpacket(op, len, no, pos) {
  var j;

  if (op.bytes !== len) {
    fprintf(stderr,"incorrect packet length (%ld != %ld)!\n",op.bytes,len);
    exit(1);
  }
  if (op.granulepos !== pos){
    fprintf(stderr,"incorrect packet granpos (%ld != %ld)!\n",op.granulepos,pos);
    exit(1);
  }
  
  /* packet number just follows sequence/gap; adjust the input number
     for that */
  if (no === 0) {
    sequence = 0;
  } else {
    sequence++;
    if (no > lastno+1) {
      sequence++;
    }
  }
  lastno = no;
  if (op.packetno !== sequence) {
    fprintf(stderr,"incorrect packet sequence %ld != %d\n",
            op.packetno,sequence);
    exit(1);
  }
  
  /* Test data */
  for (j = 0; j <op.bytes; j++) {
    if (op.packet[j] !== ((j+no) & 0xff)) {
      fprintf(stderr,"body data mismatch (1) at pos %ld: %x!=%lx!\n\n",
              j,op.packet[j], (j+no)&0xff);
      exit(1);
    }
  }
}

function check_page(data, header, og) {
  var j;
  /* Test data */
  for (j = 0; j < og.body_len; j++) {
    if (og.body[j] !== data[j]) {
      fprintf(stderr, "body data mismatch (2) at pos %ld: %x!=%x!\n\n",
              j,data[j],og.body[j]);
      exit(1);
    }
  }
  
  /* Test header */
  for (j = 0; j < og.header_len; j++) {
    if (og.header[j] !== header[j]) {
      fprintf(stderr,"header content mismatch at pos %ld:\n",j);
      for (j = 0; j < header[26] + 27; j++) {
        fprintf(stderr," (%ld)%02x:%02x",j,header[j],og.header[j]);
      }
      fprintf(stderr,"\n");
      exit(1);
    }
  }
  if (og.header_len !== header[26] + 27) {
    fprintf(stderr,"header length incorrect! (%ld!=%d)\n",
            og.header_len,header[26]+27);
    exit(1);
  }
}

function print_header(og) {
  var j;
  fprintf(stderr,"\nHEADER:\n");
  fprintf(stderr,"  capture: %c %c %c %c  version: %d  flags: %x\n",
          og.header[0],og.header[1],og.header[2],og.header[3],
          og.header[4],og.header[5]);
  
  fprintf(stderr,"  granulepos: %d  serialno: %d  pageno: %ld\n",
          (og.header[9]<<24)|(og.header[8]<<16)|
          (og.header[7]<<8)|og.header[6],
          (og.header[17]<<24)|(og.header[16]<<16)|
          (og.header[15]<<8)|og.header[14],
          ((og.header[21])<<24)|(og.header[20]<<16)|
          (og.header[19]<<8)|og.header[18]);

  fprintf(stderr,"  checksum: %02x:%02x:%02x:%02x\n  segments: %d (",
          og.header[22],og.header[23],
          og.header[24],og.header[25],
          og.header[26]);

  for (j = 27; j < og.header_len; j++) {
    fprintf(stderr,"%d ",og.header[j]);
  }
  fprintf(stderr,")\n\n");
}

function copy_page(og) {
  var temp;
  temp = new Uint8Array(og.header_len);
  temp.set(og.header.subarray(0, og.header_len));
  og.header = temp;

  temp = new Uint8Array(og.body_len);
  temp.set(og.body.subarray(0, og.body_len));
  og.body = temp;
}

function free_page(og) {
  
}

function error() {
  fprintf(stderr,"error!\n");
  exit(1);
}

/* 17 only */
var head1_0 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x06,
                              0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,0,0,0,0,
                              0x15,0xed,0xec,0x91,
                              1,
                              17]);

/* 17, 254, 255, 256, 500, 510, 600 byte, pad */
var head1_1 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x02,
                              0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,0,0,0,0,
                              0x59,0x10,0x6c,0x2c,
                              1,
                              17]);
var head2_1 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x04,
                              0x07,0x18,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,1,0,0,0,
                              0x89,0x33,0x85,0xce,
                              13,
                              254,255,0,255,1,255,245,255,255,0,
                              255,255,90]);

/* nil packets; beginning,middle,end */
var head1_2 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x02,
                              0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,0,0,0,0,
                              0xff,0x7b,0x23,0x17,
                              1,
                              0]);
var head2_2 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x04,
                              0x07,0x28,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,1,0,0,0,
                              0x5c,0x3f,0x66,0xcb,
                              17,
                              17,254,255,0,0,255,1,0,255,245,255,255,0,
                              255,255,90,0]);

/* large initial packet */
var head1_3 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x02,
                              0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,0,0,0,0,
                              0x01,0x27,0x31,0xaa,
                              18,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,255,10]);

var head2_3 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x04,
                              0x07,0x08,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,1,0,0,0,
                              0x7f,0x4e,0x8a,0xd2,
                              4,
                              255,4,255,0]);


/* continuing packet test */
var head1_4 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x02,
                              0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,0,0,0,0,
                              0xff,0x7b,0x23,0x17,
                              1,
                              0]);

var head2_4 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x00,
                              0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
                              0x01,0x02,0x03,0x04,1,0,0,0,
                              0xf8,0x3c,0x19,0x79,
                              255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255]);

var head3_4 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x05,
                              0x07,0x0c,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,2,0,0,0,
                              0x38,0xe6,0xb6,0x28,
                              6,
                              255,220,255,4,255,0]);


/* spill expansion test */
var head1_4b = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x02,
                               0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                               0x01,0x02,0x03,0x04,0,0,0,0,
                               0xff,0x7b,0x23,0x17,
                               1,
                               0]);

var head2_4b = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x00,
                               0x07,0x10,0x00,0x00,0x00,0x00,0x00,0x00,
                               0x01,0x02,0x03,0x04,1,0,0,0,
                               0xce,0x8f,0x17,0x1a,
                               23,
                               255,255,255,255,255,255,255,255,
                               255,255,255,255,255,255,255,255,255,10,255,4,255,0,0]);


var head3_4b = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x04,
                               0x07,0x14,0x00,0x00,0x00,0x00,0x00,0x00,
                               0x01,0x02,0x03,0x04,2,0,0,0,
                               0x9b,0xb2,0x50,0xa1,
                               1,
                               0]);

/* page with the 255 segment limit */
var head1_5 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x02,
                              0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,0,0,0,0,
                              0xff,0x7b,0x23,0x17,
                              1,
                              0]);

var head2_5 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x00,
                              0x07,0xfc,0x03,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,1,0,0,0,
                              0xed,0x2a,0x2e,0xa7,
                              255,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10,10,
                              10,10,10,10,10,10,10]);

var head3_5 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x04,
                              0x07,0x00,0x04,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,2,0,0,0,
                              0x6c,0x3b,0x82,0x3d,
                              1,
                              50]);


/* packet that overspans over an entire page */
var head1_6 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x02,
                              0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,0,0,0,0,
                              0xff,0x7b,0x23,0x17,
                              1,
                              0]);

var head2_6 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x00,
                              0x07,0x04,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,1,0,0,0,
                              0x68,0x22,0x7c,0x3d,
                              255,
                              100,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255]);

var head3_6 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x01,
                              0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
                              0x01,0x02,0x03,0x04,2,0,0,0,
                              0xf4,0x87,0xba,0xf3,
                              255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255]);

var head4_6 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x05,
                              0x07,0x10,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,3,0,0,0,
                              0xf7,0x2f,0x6c,0x60,
                              5,
                              254,255,4,255,0]);

/* packet that overspans over an entire page */
var head1_7 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x02,
                              0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,0,0,0,0,
                              0xff,0x7b,0x23,0x17,
                              1,
                              0]);

var head2_7 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x00,
                              0x07,0x04,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,1,0,0,0,
                              0x68,0x22,0x7c,0x3d,
                              255,
                              100,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255,255,255,
                              255,255,255,255,255,255]);

var head3_7 = new Uint8Array([0x4f,0x67,0x67,0x53,0,0x05,
                              0x07,0x08,0x00,0x00,0x00,0x00,0x00,0x00,
                              0x01,0x02,0x03,0x04,2,0,0,0,
                              0xd4,0xe0,0x60,0xe5,
                              1,
                              0]);

function test_pack(pl, headers, byteskip, pageskip, packetskip) {
  var data = new Uint8Array(1024 * 1024); /* for scripted test cases only */
  var inptr    = 0;
  var outptr   = 0;
  var deptr    = 0;
  var depacket = 0;
  var granule_pos = 7, pageno = 0;
  var i, j, packets, pageout = pageskip;
  var eosflag = 0;
  var bosflag = 0;
  var byteskipcount = 0;
  
  streamStateEnc.reset();
  streamStateDec.reset();
  syncState.reset();
  
  for (packets = 0; packets < packetskip; packets++) {
    depacket += pl[packets];
  }
  for (packets = 0;; packets++) {
    if (pl[packets] === -1) {
      break;
    }
  }
  
  for (i = 0; i < packets; i++) {
    /* construct a test packet */
    var packet = new ogg.Packet();
    var len = pl[i];
    
    packet.packet = new Uint8Array(data.buffer, data.byteOffset + inptr, len);
    packet.bytes  = len;
    packet.e_o_s = (pl[i+1] < 0 ? 1 : 0);
    packet.granulepos = granule_pos;
    
    granule_pos += 1024;
    
    for (j = 0; j < len; j++) {
      data[inptr++] = i+j;
    }
    
    /* submit the test packet */
    streamStateEnc.packetin(packet);
    
    /* retrieve any finished pages */
    {
      var page = new ogg.Page();
      
      while (streamStateEnc.pageout(page)) {
        /* We have a page.  Check it carefully */
        
        fprintf(stderr,"%ld, ",pageno);
        
        if (headers[pageno] === null) {
          fprintf(stderr,"coded too many pages!\n");
          exit(1);
        }
        
        check_page(
          new Uint8Array(data.buffer, data.byteOffset + outptr, page.body_len),
          headers[pageno],
          page
        );
        
        outptr += page.body_len;
        pageno++;
        if (pageskip) {
          bosflag = 1;
          pageskip--;
          deptr += page.body_len;
        }

        /* have a complete page; submit it to sync/decode */

        {
          var pageDec = new ogg.Page();
          var packetDec = new ogg.Packet(), packetDec2 = new ogg.Packet();
          var buf = syncState.buffer(page.header_len + page.body_len);
          var next = buf;
          byteskipcount += page.header_len;
          if (byteskipcount > byteskip) {
            next.set(page.header.subarray(0, byteskipcount - byteskip), 0);
            next = new Uint8Array(next.buffer, next.byteOffset + byteskipcount - byteskip);
            byteskipcount = byteskip;
          }

          byteskipcount += page.body_len;
          if (byteskipcount > byteskip) {
            next.set(page.body.subarray(0, byteskipcount - byteskip), 0);
            next = new Uint8Array(next.buffer, next.byteOffset + byteskipcount - byteskip);
            byteskipcount = byteskip;
          }

          syncState.wrote(next.byteOffset);
          
          while (1) {
            var ret = syncState.pageout(pageDec);
            if (ret === 0) { break; }
            if (ret < 0) { continue; }
            /* got a page.  Happy happy.  Verify that it's good. */
            
            fprintf(stderr,"(%d), ",pageout);
            
            check_page(
              new Uint8Array(data.buffer, data.byteOffset + deptr, pageDec.body_len),
              headers[pageout],
              pageDec
            );
            deptr += pageDec.body_len;
            pageout++;
            
            /* submit it to deconstitution */
            streamStateDec.pagein(pageDec);
            
            /* packets out? */
            while (streamStateDec.packetpeek(packetDec2) > 0) {
              streamStateDec.packetout(packetDec); /* just catching them all */
              
              /* verify peek and out match */
              if (memcmp(packetDec, packetDec2)) {
                fprintf(stderr,"packetout != packetpeek! pos=%ld\n",
                        depacket);
                exit(1);
              }
              
              /* verify the packet! */
              /* check data */
              if (memcmp(pointer(data,depacket),packetDec.packet,packetDec.bytes)) {
                fprintf(stderr,"packet data mismatch in decode! pos=%ld\n",
                        depacket);
                exit(1);
              }
              
              /* check bos flag */
              if (bosflag === 0 && packetDec.b_o_s === 0) {
                fprintf(stderr,"b_o_s flag not set on packet!\n");
                exit(1);
              }
              if (bosflag && packetDec.b_o_s) {
                fprintf(stderr,"b_o_s flag incorrectly set on packet!\n");
                exit(1);
              }
              bosflag = 1;
              depacket += packetDec.bytes;
              
              /* check eos flag */
              if (eosflag) {
                fprintf(stderr,"Multiple decoded packets with eos flag!\n");
                exit(1);
              }

              if (packetDec.e_o_s) {
                eosflag = 1;
              }
              
              /* check granulepos flag */
              if (packetDec.granulepos !== -1) {
                fprintf(stderr," granule:%ld ",packetDec.granulepos);
              }
            }
          }
        }
      }
    }
  }
  
  // _ogg_free(data);
  if (headers[pageno] !== null) {
    fprintf(stderr,"did not write last page!\n");
    exit(1);
  }
  if (headers[pageout] !== null) {
    fprintf(stderr,"did not decode last page!\n");
    exit(1);
  }
  if (inptr !== outptr) {
    fprintf(stderr,"encoded page data incomplete!\n");
    exit(1);
  }
  if (inptr !== deptr) {
    fprintf(stderr,"decoded page data incomplete!\n");
    exit(1);
  }
  if (inptr !== depacket) {
    fprintf(stderr,"decoded packet data incomplete!\n");
    exit(1);
  }
  if (!eosflag) {
    fprintf(stderr,"Never got a packet with EOS set!\n");
    exit(1);
  }
  fprintf(stderr,"ok.\n");
}

function main() {
  streamStateEnc.init(0x04030201);
  streamStateDec.init(0x04030201);
  syncState.init();
  
  var packets, headret;

  /* Exercise each code path in the framing code.  Also verify that
     the checksums are working.  */
  if (1) {
    /* 17 only */
    packets = [17, -1];
    headret = [head1_0, null];
    
    fprintf(stderr,"testing single page encoding... ");
    test_pack(packets, headret, 0, 0, 0);
  }

  if (1) {
    /* 17, 254, 255, 256, 500, 510, 600 byte, pad */
    packets = [17, 254, 255, 256, 500, 510, 600, -1];
    headret = [head1_1, head2_1, null];
    
    fprintf(stderr,"testing basic page encoding... ");
    test_pack(packets, headret, 0, 0, 0);
  }

  if (1) {
    /* nil packets; beginning,middle,end */
    packets = [0,17, 254, 255, 0, 256, 0, 500, 510, 600, 0, -1];
    headret = [head1_2, head2_2, null];

    fprintf(stderr,"testing basic nil packets... ");
    test_pack(packets, headret, 0, 0, 0);
  }

  if (1) {
    /* large initial packet */
    packets = [4345,259,255,-1];
    headret = [head1_3, head2_3, null];
    
    fprintf(stderr,"testing initial-packet lacing > 4k... ");
    test_pack(packets, headret, 0, 0, 0);
  }

  if (1) {
    /* continuing packet test; with page spill expansion, we have to
       overflow the lacing table. */
    packets = [0,65500,259,255,-1];
    headret = [head1_4, head2_4, head3_4, null];
    
    fprintf(stderr,"testing single packet page span... ");
    test_pack(packets, headret, 0, 0, 0);
  }

  if (1) {
    /* spill expand packet test */
    packets = [0,4345,259,255,0,0,-1];
    headret = [head1_4b,head2_4b,head3_4b,null];
    
    fprintf(stderr,"testing page spill expansion... ");
    test_pack(packets, headret, 0, 0, 0);
  }
  /* page with the 255 segment limit */
  if (1) {
    packets = [0,10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,10,
               10,10,10,10,10,10,10,50,-1];
    headret = [head1_5,head2_5,head3_5,null];
    
    fprintf(stderr,"testing max packet segments... ");
    test_pack(packets, headret, 0, 0, 0);
  }

  if (1) {
    /* packet that overspans over an entire page */
    packets = [0,100,130049,259,255,-1];
    headret = [head1_6,head2_6,head3_6,head4_6,null];
    
    fprintf(stderr,"testing very large packets... ");
    test_pack(packets, headret, 0, 0, 0);
  }

  if (1) {
    /* test for the libogg 1.1.1 resync in large continuation bug
       found by Josh Coalson)  */
    packets = [0,100,130049,259,255,-1];
    headret = [head1_6,head2_6,head3_6,head4_6,null];
    
    fprintf(stderr,"testing continuation resync in very large packets... ");
    test_pack(packets,headret, 100, 2, 3);
  }

  if (1) {
    /* term only page.  why not? */
    packets = [0,100,64770,-1];
    headret = [head1_7,head2_7,head3_7,null];
    
    fprintf(stderr,"testing zero data page (1 nil packet)... ");
    test_pack(packets, headret, 0, 0, 0);
  }

  if (1) {
    /* build a bunch of pages for testing */
    var data = new Uint8Array(1024*1024);
    var pl = [0, 1,1,98,4079, 1,1,2954,2057, 76,34,912,0,234,1000,1000, 1000,300,-1];
    var inptr = 0, i ,j;
    var og = [new ogg.Page(), new ogg.Page(), new ogg.Page(),
              new ogg.Page(), new ogg.Page()];
    
    streamStateEnc.reset();
    
    for (i = 0; pl[i] !== -1 ; i++) {
      var op = new ogg.Packet();
      var len = pl[i];

      op.packet = new Uint8Array(data.buffer, data.byteOffset + inptr, len);
      op.bytes = len;
      op.e_o_s = (pl[i+1] < 0 ? 1 : 0);
      op.granulepos = (i+1) * 1000;
      
      for (j = 0; j < len; j++) {
        data[inptr++] = i+j;
      }
      streamStateEnc.packetin(op);
    }
    
    data = null;
    
    /* retrieve finished pages */
    for (i = 0; i < 5; i++) {
      if (streamStateEnc.pageout(og[i]) === 0) {
        fprintf(stderr,"Too few pages output building sync tests!\n");
        exit(1);
      }
      copy_page(og[i]);
    }

    var buffer, temp, test;
    
    /* Test lost pages on pagein/packetout: no rollback */
    {
      temp = new ogg.Page();
      test = new ogg.Packet();
      
      fprintf(stderr,"Testing loss of pages... ");
      
      syncState.reset();
      streamStateDec.reset();
      for (i = 0; i < 5; i++) {
        buffer = syncState.buffer(og[i].header_len);
        buffer.set(og[i].header);
        syncState.wrote(og[i].header_len);
        buffer = syncState.buffer(og[i].body_len);
        buffer.set(og[i].body);
        syncState.wrote(og[i].body_len);
      }
      
      syncState.pageout(temp);
      streamStateDec.pagein(temp);
      syncState.pageout(temp);
      streamStateDec.pagein(temp);
      syncState.pageout(temp);
      /* skip */
      syncState.pageout(temp);
      streamStateDec.pagein(temp);
      
      /* do we get the expected results/packets? */

      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,0,0,0);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,1,1,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,1,2,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,98,3,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,4079,4,5000);
      if (streamStateDec.packetout(test) !== -1){
        fprintf(stderr,"Error: loss of page did not return error\n");
        exit(1);
      }
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,76,9,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,34,10,-1);
      fprintf(stderr,"ok.\n");
    }
    
    /* Test lost pages on pagein/packetout: rollback with continuation */
    {
      temp = new ogg.Page();
      test = new ogg.Packet();
      
      fprintf(stderr,"Testing loss of pages (rollback required)... ");
      
      syncState.reset();
      streamStateDec.reset();
      for (i = 0;i < 5; i++) {
        buffer = syncState.buffer(og[i].header_len);
        buffer.set(og[i].header);
        syncState.wrote(og[i].header_len);
        
        buffer = syncState.buffer(og[i].body_len);
        buffer.set(og[i].body);
        syncState.wrote(og[i].body_len);
      }
      
      syncState.pageout(temp);
      streamStateDec.pagein(temp);
      syncState.pageout(temp);
      streamStateDec.pagein(temp);
      syncState.pageout(temp);
      streamStateDec.pagein(temp);
      syncState.pageout(temp);
      /* skip */
      syncState.pageout(temp);
      streamStateDec.pagein(temp);
      
      /* do we get the expected results/packets? */
      
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,0,0,0);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,1,1,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,1,2,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,98,3,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,4079,4,5000);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,1,5,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,1,6,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,2954,7,-1);
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,2057,8,9000);
      if (streamStateDec.packetout(test) !== -1){
        fprintf(stderr,"Error: loss of page did not return error\n");
        exit(1);
      }
      if (streamStateDec.packetout(test) !== 1) { error(); }
      checkpacket(test,300,17,18000);
      fprintf(stderr,"ok.\n");
    }
    
    var pageDec;
    /* the rest only test sync */
    {
      pageDec = new ogg.Page();
      /* Test fractional page inputs: incomplete capture */
      fprintf(stderr,"Testing sync on partial inputs... ");
      syncState.reset();
      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header.subarray(0, 0+3));
      
      syncState.wrote(3);
      if (syncState.pageout(pageDec) > 0) { error(); }
      
      /* Test fractional page inputs: incomplete fixed header */
      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header.subarray(3, 3+20));
      syncState.wrote(20);
      if (syncState.pageout(pageDec) > 0) { error(); }
      
      /* Test fractional page inputs: incomplete header */
      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header.subarray(23, 23+5));
      syncState.wrote(5);
      if (syncState.pageout(pageDec) > 0) { error(); }
      
      /* Test fractional page inputs: incomplete body */
      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header.subarray(28));
      syncState.wrote(og[1].header_len-28);
      if (syncState.pageout(pageDec) > 0) { error(); }
      
      buffer = syncState.buffer(og[1].body_len);
      buffer.set(og[1].body.subarray(0, 1000));
      syncState.wrote(1000);
      if (syncState.pageout(pageDec) > 0) { error(); }

      buffer = syncState.buffer(og[1].body_len);
      buffer.set(og[1].body.subarray(1000));
      syncState.wrote(og[1].body_len-1000);
      if (syncState.pageout(pageDec) <= 0) { error(); }
      
      fprintf(stderr,"ok.\n");
    }
    
    /* Test fractional page inputs: page + incomplete capture */
    {
      pageDec = new ogg.Page();
      fprintf(stderr,"Testing sync on 1+partial inputs... ");
      syncState.reset();

      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header);
      syncState.wrote(og[1].header_len);

      buffer = syncState.buffer(og[1].body_len);
      buffer.set(og[1].body);
      syncState.wrote(og[1].body_len);

      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header.subarray(0, 20));
      syncState.wrote(20);
      if (syncState.pageout(pageDec) <= 0) { error(); }
      if (syncState.pageout(pageDec) >  0) { error(); }

      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header.subarray(20));
      syncState.wrote(og[1].header_len-20);

      buffer = syncState.buffer(og[1].body_len);
      buffer.set(og[1].body);
      syncState.wrote(og[1].body_len);
      if (syncState.pageout(pageDec) <= 0) { error(); }
      
      fprintf(stderr,"ok.\n");
    }
    
    /* Test recapture: garbage + page */
    {
      pageDec = new ogg.Page();
      fprintf(stderr,"Testing search for capture... ");
      syncState.reset();
      
      /* 'garbage' */
      buffer = syncState.buffer(og[1].body_len);
      buffer.set(og[1].body);
      syncState.wrote(og[1].body_len);
      
      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header);
      syncState.wrote(og[1].header_len);

      buffer = syncState.buffer(og[1].body_len);
      buffer.set(og[1].body);
      syncState.wrote(og[1].body_len);

      buffer = syncState.buffer(og[2].header_len);
      buffer.set(og[2].header.subarray(0, 20));
      syncState.wrote(20);
      if (syncState.pageout(pageDec) >  0) { error(); }
      if (syncState.pageout(pageDec) <= 0) { error(); }
      if (syncState.pageout(pageDec) >  0) { error(); }

      buffer = syncState.buffer(og[2].header_len);
      buffer.set(og[2].header.subarray(20));
      syncState.wrote(og[2].header_len-20);

      buffer = syncState.buffer(og[2].body_len);
      buffer.set(og[2].body);
      syncState.wrote(og[2].body_len);
      if (syncState.pageout(pageDec) <= 0) { error(); }
      
      fprintf(stderr,"ok.\n");
    }
    
    /* Test recapture: page + garbage + page */
    {
      pageDec = new ogg.Page();
      fprintf(stderr,"Testing recapture... ");
      syncState.reset();

      buffer = syncState.buffer(og[1].header_len);
      buffer.set(og[1].header);
      syncState.wrote(og[1].header_len);

      buffer = syncState.buffer(og[1].body_len);
      buffer.set(og[1].body);
      syncState.wrote(og[1].body_len);

      buffer = syncState.buffer(og[2].header_len);
      buffer.set(og[2].header);
      syncState.wrote(og[2].header_len);

      buffer = syncState.buffer(og[2].header_len);
      buffer.set(og[2].header);
      syncState.wrote(og[2].header_len);
      
      if (syncState.pageout(pageDec) <= 0) { error(); }

      buffer = syncState.buffer(og[2].body_len);
      buffer.set(og[2].body.subarray(0, og[2].body_len-5));
      syncState.wrote(og[2].body_len-5);

      buffer = syncState.buffer(og[3].header_len);
      buffer.set(og[3].header);
      syncState.wrote(og[3].header_len);

      buffer = syncState.buffer(og[3].body_len);
      buffer.set(og[3].body);
      syncState.wrote(og[3].body_len);
      
      if (syncState.pageout(pageDec) >  0) { error(); }
      if (syncState.pageout(pageDec) <= 0) { error(); }
      
      fprintf(stderr,"ok.\n");
    }
    
    /* Free page data that was previously copied */
    {
      for (i = 0; i < 5; i++) {
        free_page(og[i]);
      }
    }
  }
  
  return 0;
}

main();
