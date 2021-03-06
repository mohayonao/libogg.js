(function() {
"use strict";
var exports = {ogg:{}};

var NULL = null;

function NOP() {}
function NOT_IMPLEMENTED() { throw new Error("not implemented."); }

function int(x) {
  return x|0;
}

function pointer(src, offset, length) {
  offset = src.byteOffset + offset * src.BYTES_PER_ELEMENT;
  if (typeof length === "number") {
    return new src.constructor(src.buffer, offset, length);
  } else {
    return new src.constructor(src.buffer, offset);
  }
}

var uint8 = 0;
var int32 = 1;

function calloc(n, type) {
  switch (type) {
  case uint8: return new Uint8Array(n);
  case int32: return new Int32Array(n);
  }
  throw new Error("calloc failed.");
}

function realloc(src, newSize) {
  var ret = new src.constructor(newSize);
  ret.set(src);
  return ret;
}

function copy(dst, src, offset) {
  dst.set(src, offset||0);
}

function ogg_iovec_t(p) {
  p = p||{};
  
  // void *iov_base;
  // size_t iov_len;
  
  p.iov_base = null;
  p.iov_len = 0;
  p.__name = "ogg_iovec_t";
  
  return p;
}

function oggpack_buffer(p) {
  p = p||{};
  
  // long endbyte;
  // int  endbit;

  // unsigned char *buffer;
  // unsigned char *ptr;
  // long storage;
  
  p.endbyte = 0;
  p.endbit = 0;
  p.buffer = null;
  p.ptr = null;
  p.state = 0;
  p.__name = "oggpack_buffer";
  
  return p;
}

/* ogg_page is used to encapsulate the data in one Ogg bitstream page *****/
function ogg_page(p) {
  p = p||{};
  
  // unsigned char *header;
  // long header_len;
  // unsigned char *body;
  // long body_len;
  
  p.header = null;
  p.header_len = 0;
  p.body = null;
  p.body_len = 0;
  p.__name = "ogg_page";
  
  return p;
}

/* ogg_stream_state contains the current encode/decode state of a logical
   Ogg bitstream **********************************************************/
function ogg_stream_state(p) {
  p = p||{};
  
  // unsigned char   *body_data;    /* bytes from packet bodies */
  // long    body_storage;          /* storage elements allocated */
  // long    body_fill;             /* elements stored; fill mark */
  // long    body_returned;         /* elements of fill returned */
  
  
  // int     *lacing_vals;      /* The values that will go to the segment table */
  // ogg_int64_t *granule_vals; /* granulepos values for headers. Not compact
  //                               this way, but it is simple coupled to the
  //                               lacing fifo */
  // long    lacing_storage;
  // long    lacing_fill;
  // long    lacing_packet;
  // long    lacing_returned;

  // unsigned char    header[282];      /* working space for header encode */
  // int              header_fill;

  // int     e_o_s;          /* set when we have buffered the last packet in the
  //                            logical bitstream */
  // int     b_o_s;          /* set after we've written the initial page
  //                            of a logical bitstream */
  // long    serialno;
  // long    pageno;
  // ogg_int64_t  packetno;  /* sequence number for decode; the framing
  //                            knows where there's a hole in the data,
  //                            but we need coupling so that the codec
  //                            (which is in a separate abstraction
  //                            layer) also knows about the gap */
  // ogg_int64_t   granulepos;
  
  p.body_data = null;
  p.body_storage = 0;
  p.body_fill = 0;
  p.body_returned = 0;
  p.lacing_vals  = null;
  p.granule_vals = null;
  p.lacing_storage = 0;
  p.lacing_fill = 0;
  p.lacing_packet = 0;
  p.lacing_returned = 0;
  p.header = calloc(282, uint8);
  p.header_fill = 0;
  p.e_o_s = 0;
  p.b_o_s = 0;
  p.serialno = 0;
  p.pageno = 0;
  p.packetno = 0;
  p.granulepos = 0;
  p.__name = "ogg_stream_state";
  
  return p;
}

/* ogg_packet is used to encapsulate the data and metadata belonging
   to a single raw Ogg/Vorbis packet *************************************/
function ogg_packet(p) {
  p = p||{};
  
  // unsigned char *packet;
  // long  bytes;
  // long  b_o_s;
  // long  e_o_s;
  
  // ogg_int64_t  granulepos;
  
  // ogg_int64_t  packetno;     /* sequence number for decode; the framing
  //                               knows where there's a hole in the data,
  //                               but we need coupling so that the codec
  //                               (which is in a separate abstraction
  //                               layer) also knows about the gap */
  
  p.packet = null;
  p.bytes = 0;
  p.b_o_s = 0;
  p.e_o_s = 0;
  p.granulepos = 0;
  p.packetno = 0;
  p.__name = "ogg_packet";
  
  return p;
}

function ogg_sync_state(p) {
  p = p||{};
  
  // unsigned char *data;
  // int storage;
  // int fill;
  // int returned;

  // int unsynced;
  // int headerbytes;
  // int bodybytes;

  p.data = null;
  p.storage = 0;
  p.fill = 0;
  p.returned = 0;
  p.unsynced = 0;
  p.headerbytes = 0;
  p.bodybytes = 0;
  p.__name = "ogg_sync_state";
  
  return p;
}

var BUFFER_INCREMENT = 256;
var LONG_MAX = 2147483647;

var mask=new Uint32Array([
  0x00000000,0x00000001,0x00000003,0x00000007,0x0000000f,
  0x0000001f,0x0000003f,0x0000007f,0x000000ff,0x000001ff,
  0x000003ff,0x000007ff,0x00000fff,0x00001fff,0x00003fff,
  0x00007fff,0x0000ffff,0x0001ffff,0x0003ffff,0x0007ffff,
  0x000fffff,0x001fffff,0x003fffff,0x007fffff,0x00ffffff,
  0x01ffffff,0x03ffffff,0x07ffffff,0x0fffffff,0x1fffffff,
  0x3fffffff,0x7fffffff,0xffffffff
]);

function oggpack_writeinit(b) {
  oggpack_buffer(b);
  b.ptr=b.buffer = calloc(BUFFER_INCREMENT, uint8);
  b.storage=BUFFER_INCREMENT;
}

function oggpack_writecheck(b) {
  if(!b.ptr || !b.storage)return -1;
  return 0;
}

function oggpack_writetrunc(b, bits) {
  var bytes=bits>>3;
  if(b.ptr){
    bits-=bytes*8;
    b.ptr=pointer(b.buffer,bytes);
    b.endbit=bits;
    b.endbyte=bytes;
    b.ptr[0]&=mask[bits];
  }
}

/* Takes only up to 32 bits. */
function oggpack_write(b, value, bits) {
  err:while(1){
    if(bits<0 || bits>32) break err;
    if(b.endbyte>=b.storage-4){
      var ret;
      if(!b.ptr)return;
      if(b.storage>LONG_MAX-BUFFER_INCREMENT) break err;
      ret=realloc(b.buffer,b.storage+BUFFER_INCREMENT);
      if(!ret) break err;
      b.buffer=ret;
      b.storage+=BUFFER_INCREMENT;
      b.ptr=pointer(b.buffer,b.endbyte);
    }
    
    value&=mask[bits];
    bits+=b.endbit;
    
    b.ptr[0]|=value<<b.endbit;
    
    if(bits>=8){
      b.ptr[1]=value>>(8-b.endbit);
      if(bits>=16){
        b.ptr[2]=value>>(16-b.endbit);
        if(bits>=24){
          b.ptr[3]=value>>(24-b.endbit);
          if(bits>=32){
            if(b.endbit)
              b.ptr[4]=value>>(32-b.endbit);
            else
              b.ptr[4]=0;
          }
        }
      }
    }
    
    var shift=int(bits/8);
    b.endbyte+=shift;
    b.ptr=pointer(b.ptr,shift);
    b.endbit=bits&7;
    return;
  }
  
  // err:
  oggpack_writeclear(b);
}

function oggpack_writealign(b) {
  var bits=8-b.endbit;
  if (bits<8)
    oggpack_write(b,0,bits);
}

function oggpack_writecopy(b, source, bits) {
  var ptr=source;
  
  var bytes=int(bits/8);
  bits-=bytes*8;

  err:while(1){
    if(b.endbit){
      var i;
      /* unaligned copy.  Do it the hard way. */
      for(i=0;i<bytes;i++)
        oggpack_write(b,ptr[i],8);
    }else{
      /* aligned block copy */
      if(b.endbyte+bytes+1>=b.storage){
        var ret;
        if(!b.ptr) break err;
        if(b.endbyte+bytes+BUFFER_INCREMENT>b.storage) break err;
        b.storage=b.endbyte+bytes+BUFFER_INCREMENT;
        ret=realloc(b.buffer,b.storage);
        if(!ret) break err;
        b.buffer=ret;
        b.ptr=pointer(b.buffer,b.endbyte);
      }
      
      copy(b.ptr,source.subarray(0,bytes));
      b.ptr=pointer(b.ptr, bytes);
      b.endbyte+=bytes;
      b.ptr[0]=0;
    }
    
    if (bits)
      oggpack_write(b,ptr[bytes], bits);
    return;
  }
  
  // err:
  oggpack_writeclear(b);
}

function oggpack_reset(b) {
  if(!b.ptr)return;
  b.ptr=b.buffer;
  b.buffer[0]=0;
  b.endbit=b.endbyte=0;
}

function oggpack_writeclear(b) {
  oggpack_buffer(b);
}

function oggpack_readinit(b, buf, bytes) {
  oggpack_buffer(b);
  b.buffer=b.ptr=pointer(buf, 0);
  b.storage=bytes;
}

/* Read in bits without advancing the bitptr; bits <= 32 */
function oggpack_look(b, bits) {
  var ret, m;
  
  if(bits<0 || bits>32) return -1;
  m=mask[bits];
  bits+=b.endbit;
  
  if(b.endbyte >= b.storage-4){
    /* not the main path */
    if (b.endbyte > b.storage-((bits+7)>>3)) return -1;
    /* special case to avoid reading b->ptr[0], which might be past the end of
       the buffer; also skips some useless accounting */
    else if(!bits)return(0);
  }
  
  ret=b.ptr[0]>>b.endbit;
  if (bits>8) {
    ret|=b.ptr[1]<<(8-b.endbit);
    if (bits>16) {
      ret|=b.ptr[2]<<(16-b.endbit);
      if (bits>24) {
        ret|=b.ptr[3]<<(24-b.endbit);
        if (bits>32 && b.endbit)
          ret|=b.ptr[4]<<(32-b.endbit);
      }
    }
  }
  return(m&ret);
}

function oggpack_look1(b) {
  if(b.endbyte>=b.storage)return(-1);
  return((b.ptr[0]>>b.endbit)&1);
}

function oggpack_adv(b, bits) {
  bits+=b.endbit;

  err:while(1){
    if(b.endbyte > b.storage-((bits+7)>>3)) break err;
    
    var shift=int(bits/8);
    b.ptr=pointer(b.ptr,shift);
    b.endbyte+=shift;
    b.endbit=bits&7;
    return;
  }

  // overflow:
  b.ptr=NULL;
  b.endbyte=b.storage;
  b.endbit=1;
}

function oggpack_adv1(b) {
  if(++(b.endbit)>7){
    b.endbit=0;
    b.ptr=pointer(b.ptr,1);
    b.endbyte++;
  }
}

/* bits <= 32 */
function oggpack_read(b, bits) {
  var ret, m;
  
  err:while(1){
    if (bits<0 || bits>32) break err;
    m=mask[bits];
    bits+=b.endbit;
    
    if(b.endbyte>=b.storage-4){
      /* not the main path */
      if(b.endbyte > b.storage-((bits+7)>>3)) break err; // overflow
      /* special case to avoid reading b.ptr[0], which might be past the end of
         the buffer; also skips some useless accounting */
      else if(!bits)return(0);
    }
    
    ret=b.ptr[0]>>b.endbit;
    if(bits>8){
      ret|=b.ptr[1]<<(8-b.endbit);
      if(bits>16){
        ret|=b.ptr[2]<<(16-b.endbit);
        if(bits>24){
          ret|=b.ptr[3]<<(24-b.endbit);
          if(bits>32 && b.endbit){
            ret|=b.ptr[4]<<(32-b.endbit);
          }
        }
      }
    }
    ret&=m;
    
    var shift=int(bits/8);
    b.ptr=pointer(b.ptr,shift);
    b.endbyte+=shift;
    b.endbit=bits&7;
    
    return ret;
  }
  
  // err:
  b.ptr=NULL;
  b.endbyte=b.storage;
  b.endbit=1;
  return -1;
}

function oggpack_read1(b) {
  var ret;
  
  err:while(1){
    if(b.endbyte>=b.storage) break err; // overflow
    ret=(b.ptr[0]>>b.endbit)&1;
    
    b.endbit++;
    if(b.endbit>7){
      b.endbit=0;
      b.ptr=pointer(b.ptr,1);
      b.endbyte++;
    }
    return ret;
  }

  // err:
  b.ptr=NULL;
  b.endbyte=b.storage;
  b.endbit=1;
  return -1;
}

function oggpack_bytes(b) {
  return(b.endbyte+int((b.endbit+7)/8));
}

function oggpack_bits(b) {
  return(b.endbyte*8+b.endbit);
}

function oggpack_get_buffer(b) {
  return(b.buffer);
}

function ogg_page_version(og) {
  return(og.header[4]);
}

function ogg_page_continued(og) {
  return(og.header[5]&0x01);
}

function ogg_page_bos(og) {
  return(og.header[5]&0x02);
}

function ogg_page_eos(og) {
  return(og.header[5]&0x04);
}

function ogg_page_granulepos(og) {
  var page=og.header;
  var granulepos=page[13]&(0xff);
  granulepos=(granulepos<<8)|(page[12]&0xff);
  granulepos=(granulepos<<8)|(page[11]&0xff);
  granulepos=(granulepos<<8)|(page[10]&0xff);
  granulepos=(granulepos<<8)|(page[9]&0xff);
  granulepos=(granulepos<<8)|(page[8]&0xff);
  granulepos=(granulepos<<8)|(page[7]&0xff);
  granulepos=(granulepos<<8)|(page[6]&0xff);
  return(granulepos);
}

function ogg_page_serialno(og) {
  return(og.header[14] |
         (og.header[15]<<8) |
         (og.header[16]<<16) |
         (og.header[17]<<24));
}

function ogg_page_pageno(og) {
  return(og.header[18] |
         (og.header[19]<<8) |
         (og.header[20]<<16) |
         (og.header[21]<<24));
}

/* returns the number of packets that are completed on this page (if
   the leading packet is begun on a previous page, but ends on this
   page, it's counted */

/* NOTE:
   If a page consists of a packet begun on a previous page, and a new
   packet begun (but not completed) on this page, the return will be:
   ogg_page_packets(page)   ==1,
   ogg_page_continued(page) !=0

   If a page happens to be a single packet that was begun on a
   previous page, and spans to the next page (in the case of a three or
   more page packet), the return will be:
   ogg_page_packets(page)   ==0,
   ogg_page_continued(page) !=0
*/
function ogg_page_packets(og) {
  var i,n=og.header[26],count=0;
  for (i=0;i<n;i++)
    if(og.header[27+i]<255)count++;
  return(count);
}


var crc_lookup=new Uint32Array([
  0x00000000,0x04c11db7,0x09823b6e,0x0d4326d9,
  0x130476dc,0x17c56b6b,0x1a864db2,0x1e475005,
  0x2608edb8,0x22c9f00f,0x2f8ad6d6,0x2b4bcb61,
  0x350c9b64,0x31cd86d3,0x3c8ea00a,0x384fbdbd,
  0x4c11db70,0x48d0c6c7,0x4593e01e,0x4152fda9,
  0x5f15adac,0x5bd4b01b,0x569796c2,0x52568b75,
  0x6a1936c8,0x6ed82b7f,0x639b0da6,0x675a1011,
  0x791d4014,0x7ddc5da3,0x709f7b7a,0x745e66cd,
  0x9823b6e0,0x9ce2ab57,0x91a18d8e,0x95609039,
  0x8b27c03c,0x8fe6dd8b,0x82a5fb52,0x8664e6e5,
  0xbe2b5b58,0xbaea46ef,0xb7a96036,0xb3687d81,
  0xad2f2d84,0xa9ee3033,0xa4ad16ea,0xa06c0b5d,
  0xd4326d90,0xd0f37027,0xddb056fe,0xd9714b49,
  0xc7361b4c,0xc3f706fb,0xceb42022,0xca753d95,
  0xf23a8028,0xf6fb9d9f,0xfbb8bb46,0xff79a6f1,
  0xe13ef6f4,0xe5ffeb43,0xe8bccd9a,0xec7dd02d,
  0x34867077,0x30476dc0,0x3d044b19,0x39c556ae,
  0x278206ab,0x23431b1c,0x2e003dc5,0x2ac12072,
  0x128e9dcf,0x164f8078,0x1b0ca6a1,0x1fcdbb16,
  0x018aeb13,0x054bf6a4,0x0808d07d,0x0cc9cdca,
  0x7897ab07,0x7c56b6b0,0x71159069,0x75d48dde,
  0x6b93dddb,0x6f52c06c,0x6211e6b5,0x66d0fb02,
  0x5e9f46bf,0x5a5e5b08,0x571d7dd1,0x53dc6066,
  0x4d9b3063,0x495a2dd4,0x44190b0d,0x40d816ba,
  0xaca5c697,0xa864db20,0xa527fdf9,0xa1e6e04e,
  0xbfa1b04b,0xbb60adfc,0xb6238b25,0xb2e29692,
  0x8aad2b2f,0x8e6c3698,0x832f1041,0x87ee0df6,
  0x99a95df3,0x9d684044,0x902b669d,0x94ea7b2a,
  0xe0b41de7,0xe4750050,0xe9362689,0xedf73b3e,
  0xf3b06b3b,0xf771768c,0xfa325055,0xfef34de2,
  0xc6bcf05f,0xc27dede8,0xcf3ecb31,0xcbffd686,
  0xd5b88683,0xd1799b34,0xdc3abded,0xd8fba05a,
  0x690ce0ee,0x6dcdfd59,0x608edb80,0x644fc637,
  0x7a089632,0x7ec98b85,0x738aad5c,0x774bb0eb,
  0x4f040d56,0x4bc510e1,0x46863638,0x42472b8f,
  0x5c007b8a,0x58c1663d,0x558240e4,0x51435d53,
  0x251d3b9e,0x21dc2629,0x2c9f00f0,0x285e1d47,
  0x36194d42,0x32d850f5,0x3f9b762c,0x3b5a6b9b,
  0x0315d626,0x07d4cb91,0x0a97ed48,0x0e56f0ff,
  0x1011a0fa,0x14d0bd4d,0x19939b94,0x1d528623,
  0xf12f560e,0xf5ee4bb9,0xf8ad6d60,0xfc6c70d7,
  0xe22b20d2,0xe6ea3d65,0xeba91bbc,0xef68060b,
  0xd727bbb6,0xd3e6a601,0xdea580d8,0xda649d6f,
  0xc423cd6a,0xc0e2d0dd,0xcda1f604,0xc960ebb3,
  0xbd3e8d7e,0xb9ff90c9,0xb4bcb610,0xb07daba7,
  0xae3afba2,0xaafbe615,0xa7b8c0cc,0xa379dd7b,
  0x9b3660c6,0x9ff77d71,0x92b45ba8,0x9675461f,
  0x8832161a,0x8cf30bad,0x81b02d74,0x857130c3,
  0x5d8a9099,0x594b8d2e,0x5408abf7,0x50c9b640,
  0x4e8ee645,0x4a4ffbf2,0x470cdd2b,0x43cdc09c,
  0x7b827d21,0x7f436096,0x7200464f,0x76c15bf8,
  0x68860bfd,0x6c47164a,0x61043093,0x65c52d24,
  0x119b4be9,0x155a565e,0x18197087,0x1cd86d30,
  0x029f3d35,0x065e2082,0x0b1d065b,0x0fdc1bec,
  0x3793a651,0x3352bbe6,0x3e119d3f,0x3ad08088,
  0x2497d08d,0x2056cd3a,0x2d15ebe3,0x29d4f654,
  0xc5a92679,0xc1683bce,0xcc2b1d17,0xc8ea00a0,
  0xd6ad50a5,0xd26c4d12,0xdf2f6bcb,0xdbee767c,
  0xe3a1cbc1,0xe760d676,0xea23f0af,0xeee2ed18,
  0xf0a5bd1d,0xf464a0aa,0xf9278673,0xfde69bc4,
  0x89b8fd09,0x8d79e0be,0x803ac667,0x84fbdbd0,
  0x9abc8bd5,0x9e7d9662,0x933eb0bb,0x97ffad0c,
  0xafb010b1,0xab710d06,0xa6322bdf,0xa2f33668,
  0xbcb4666d,0xb8757bda,0xb5365d03,0xb1f740b4
]);

/* init the encode/decode logical stream state */
function ogg_stream_init(os, serialno) {
  if(os){
    ogg_stream_state(os);
    os.body_storage=16*1024;
    os.lacing_storage=1024;
    
    os.body_data=calloc(os.body_storage, uint8);
    os.lacing_vals=calloc(os.lacing_storage, int32);
    os.granule_vals=calloc(os.lacing_storage, int32); // int64??
    
    if (!os.body_data || !os.lacing_vals || !os.granule_vals) {
      ogg_stream_clear(os);
      return -1;
    }
    
    os.serialno = serialno;
    
    return(0);
  }
  return(-1);
}

/* async/delayed error detection for the ogg_stream_state */
function ogg_stream_check(os) {
  if(!os || !os.body_data) return -1;
  return 0;
}

/* _clear does not free os, only the non-flat storage within */
function ogg_stream_clear(os) {
  if(os){
    ogg_stream_state(os);
  }
  return(0);
}

function ogg_stream_destroy(os) {
  if(os){
    ogg_stream_state(os);
  }
  return(0);
}

/* Helpers for ogg_stream_encode; this keeps the structure and
   what's happening fairly clear */
function _os_body_expand(os, needed) {
  if(os.body_storage<=os.body_fill+needed){
    var ret;
    ret=realloc(os.body_data,os.body_storage+needed+1024);
    if(!ret){
      ogg_stream_clear(os);
      return -1;
    }
    os.body_storage+=(needed+1024);
    os.body_data=ret;
  }
  return 0;
}

function _os_lacing_expand(os, needed) {
  if(os.lacing_storage <= os.lacing_fill+needed){
    var ret;
    ret=realloc(os.lacing_vals,os.lacing_storage+needed+32);
    if(!ret){
      ogg_stream_clear(os);
      return -1;
    }
    os.lacing_vals=ret;
    ret=realloc(os.granule_vals,os.lacing_storage+needed+32);
    if(!ret){
      ogg_stream_clear(os);
      return -1;
    }
    os.granule_vals=ret;
    os.lacing_storage+=(needed+32);
  }
  return 0;
}

/* checksum the page */
/* Direct table CRC; note that this will be faster in the future if we
   perform the checksum simultaneously with other copies */
function ogg_page_checksum_set(og) {
  if(og){
    var crc_reg=0;
    var i;
    
    /* safety; needed for API behavior, but not framing code */
    og.header[22]=0;
    og.header[23]=0;
    og.header[24]=0;
    og.header[25]=0;
    
    for(i=0;i<og.header_len;i++)
      crc_reg=(crc_reg<<8)^crc_lookup[((crc_reg >> 24)&0xff)^og.header[i]];
    for (i=0;i<og.body_len;i++)
      crc_reg=(crc_reg<<8)^crc_lookup[((crc_reg >> 24)&0xff)^og.body[i]];
    
    og.header[22]=(crc_reg&0xff);
    og.header[23]=((crc_reg>>8)&0xff);
    og.header[24]=((crc_reg>>16)&0xff);
    og.header[25]=((crc_reg>>24)&0xff);
  }
}

/* submit data to the internal buffer of the framing engine */
function ogg_stream_iovecin(os, iov, count, e_o_s, granulepos) {
  var bytes = 0, lacing_vals, i;

  if(ogg_stream_check(os)) return -1;
  if(!iov) return 0;
  
  for (i = 0; i < count; ++i) bytes += iov[i].iov_len;
  lacing_vals=int(bytes/255)+1;
  
  if(os.body_returned){
    /* advance packet data according to the body_returned pointer. We
       had to keep it around to return a pointer into the buffer last
       call */
    
    os.body_fill-=os.body_returned;
    if(os.body_fill)
      copy(os.body_data,os.body_data.subarray(os.body_returned,os.body_returned+os.body_fill));
    os.body_returned=0;
  }
  
  /* make sure we have the buffer storage */
  if(_os_body_expand(os,bytes) || _os_lacing_expand(os,lacing_vals))
    return -1;
  
  /* Copy in the submitted packet.  Yes, the copy is a waste; os is
     the liability of overly clean abstraction for the time being.  It
     will actually be fairly easy to eliminate the extra copy in the
     future */
  for (i = 0; i < count; ++i) {
    copy(os.body_data,iov[i].iov_base, os.body_fill);
    os.body_fill += iov[i].iov_len;
  }
  
  /* Store lacing vals for os packet */
  for(i=0;i<lacing_vals-1;i++){
    os.lacing_vals[os.lacing_fill+i]=255;
    os.granule_vals[os.lacing_fill+i]=os.granulepos;
  }
  os.lacing_vals[os.lacing_fill + i]=bytes%255;
  os.granulepos=os.granule_vals[os.lacing_fill+i]=granulepos;
  
  /* flag the first segment as the beginning of the packet */
  os.lacing_vals[os.lacing_fill]|=0x100;
  os.lacing_fill+=lacing_vals;
  
  /* for the sake of completeness */
  os.packetno++;
  
  if(e_o_s)os.e_o_s = 1;
  
  return(0);
}

function ogg_stream_packetin(os, op) {
  var iov = ogg_iovec_t();
  iov.iov_base = op.packet;
  iov.iov_len = op.bytes;
  return ogg_stream_iovecin(os, [iov], 1, op.e_o_s, op.granulepos);
}

/* Conditionally flush a page; force==0 will only flush nominal-size
   pages, force==1 forces us to flush a page regardless of page size
   so long as there's any data available at all. */
function ogg_stream_flush_i(os, og, force, nfill) {
  var i;
  var vals=0;
  var maxvals=(os.lacing_fill>255?255:os.lacing_fill);
  var bytes=0;
  var acc=0;
  var granule_pos=-1;
  
  if(ogg_stream_check(os)) return(0);
  if(maxvals===0) return(0);
  
  /* construct a page */
  /* decide how many segments to include */

  /* If os is the initial header case, the first page must only include
     the initial header packet */
  if(os.b_o_s===0) {  /* 'initial header page' case */
    granule_pos=0;
    for(vals=0;vals<maxvals;vals++) {
      if((os.lacing_vals[vals]&0x0ff)<255){
        vals++;
        break;
      }
    }
  }else{
    /* The extra packets_done, packet_just_done logic here attempts to do two things:
       1) Don't unneccessarily span pages.
       2) Unless necessary, don't flush pages if there are less than four packets on
       them; os expands page size to reduce unneccessary overhead if incoming packets
       are large.
       These are not necessary behaviors, just 'always better than naive flushing'
       without requiring an application to explicitly request a specific optimized
       behavior. We'll want an explicit behavior setup pathway eventually as well. */
    var packets_done=0;
    var packet_just_done=0;
    for(vals=0;vals<maxvals;vals++){
      if(acc>nfill && packet_just_done>=4){
        force=1;
        break;
      }
      acc+=os.lacing_vals[vals]&0x0ff;
      if((os.lacing_vals[vals]&0xff)<255){
        granule_pos=os.granule_vals[vals];
        packet_just_done=++packets_done;
      }else
        packet_just_done=0;
    }
    if(vals===255)force=1;
  }
  
  if(!force) return(0);
  
  /* construct the header in temp storage */
  os.header[0]=0x4f; // 'O'
  os.header[1]=0x67; // 'g'
  os.header[2]=0x67; // 'g'
  os.header[3]=0x53; // 'S'
  
  /* stream structure version */
  os.header[4]=0x00;
  
  /* continued packet flag? */
  os.header[5]=0x00;
  if((os.lacing_vals[0]&0x100)===0)os.header[5]|=0x01;
  /* first page flag? */
  if(os.b_o_s===0)os.header[5]|=0x02;
  /* last page flag? */
  if(os.e_o_s && os.lacing_fill===vals)os.header[5]|=0x04;
  os.b_o_s=1;
  
  /* 64 bits of PCM position */
  for(i=6;i<14;i++){
    os.header[i]=(granule_pos&0xff);
    granule_pos>>=8;
  }
  
  /* 32 bits of stream serial number */
  {
    var serialno=os.serialno;
    for(i=14;i<18;i++){
      os.header[i]=serialno&0xff;
      serialno>>=8;
    }
  }
  
  /* 32 bits of page counter (we have both counter and page header
     because os val can roll over) */
  if(os.pageno===-1)os.pageno=0; /* because someone called
                                   stream_reset; os would be a
                                   strange thing to do in an
                                   encode stream, but it has
                                   plausible uses */
  {
    var pageno=os.pageno++;
    for(i=18;i<22;i++){
      os.header[i]=pageno&0xff;
      pageno>>=8;
    }
  }
  
  /* zero for computation; filled in later */
  os.header[22]=0;
  os.header[23]=0;
  os.header[24]=0;
  os.header[25]=0;
  
  /* segment table */
  os.header[26]=vals&0xff;
  for(i=0;i<vals;i++)
    bytes+=os.header[i+27]=(os.lacing_vals[i]&0xff);
  
  /* set pointers in the ogg_page struct */
  og.header=pointer(os.header,0,vals+27);
  og.header_len=os.header_fill=vals+27;
  og.body=pointer(os.body_data,os.body_returned,bytes);
  og.body_len=bytes;
  
  /* advance the lacing data and set the body_returned pointer */
  os.lacing_fill-=vals;
  copy(os.lacing_vals,os.lacing_vals.subarray(vals,vals+os.lacing_fill));
  copy(os.granule_vals,os.granule_vals.subarray(vals,vals+os.lacing_fill));
  os.body_returned += bytes;
  
  /* calculate the checksum */
  
  ogg_page_checksum_set(og);
  
  /* done */
  return(1);
}

/* This will flush remaining packets into a page (returning nonzero),
   even if there is not enough data to trigger a flush normally
   (undersized page). If there are no packets or partial packets to
   flush, ogg_stream_flush returns 0.  Note that ogg_stream_flush will
   try to flush a normal sized page like ogg_stream_pageout; a call to
   ogg_stream_flush does not guarantee that all packets have flushed.
   Only a return value of 0 from ogg_stream_flush indicates all packet
   data is flushed into pages.

   since ogg_stream_flush will flush the last page in a stream even if
   it's undersized, you almost certainly want to use ogg_stream_pageout
   (and *not* ogg_stream_flush) unless you specifically need to flush
   a page regardless of size in the middle of a stream. */
function ogg_stream_flush(os, og) {
  return ogg_stream_flush_i(os,og,1,4096);
}

/* Like the above, but an argument is provided to adjust the nominal
   page size for applications which are smart enough to provide their
   own delay based flushing */
function ogg_stream_flush_fill(os, og, nfill) {
  return ogg_stream_flush_i(os,og,1,nfill);
}

/* This constructs pages from buffered packet segments.  The pointers
   returned are to static buffers; do not free. The returned buffers are
   good only until the next call (using the same ogg_stream_state) */
function ogg_stream_pageout(os, og) {
  var force=0;
  if(ogg_stream_check(os)) return 0;
  
  if((os.e_o_s&&os.lacing_fill) ||          /* 'were done, now flush' case */
     (os.lacing_fill&&!os.b_o_s))           /* 'initial header page' case */
    force=1;

  return(ogg_stream_flush_i(os,og,force,4096));
}

/* Like the above, but an argument is provided to adjust the nominal
   page size for applications which are smart enough to provide their
   own delay based flushing */
function ogg_stream_pageout_fill(os, og, nfill) {
  var force=0;
  if(ogg_stream_check(os)) return 0;
  
  if ((os.e_o_s&&os.lacing_fill) ||          /* 'were done, now flush' case */
      (os.lacing_fill&&!os.b_o_s))           /* 'initial header page' case */
    force=1;
  
  return(ogg_stream_flush_i(os,og,force,nfill));
}

function ogg_stream_eos(os) {
  if(ogg_stream_check(os)) return 1;
  return os.e_o_s;
}

/* DECODING PRIMITIVES: packet streaming layer **********************/

/* This has two layers to place more of the multi-serialno and paging
   control in the application's hands.  First, we expose a data buffer
   using ogg_sync_buffer().  The app either copies into the
   buffer, or passes it directly to read(), etc.  We then call
   ogg_sync_wrote() to tell how many bytes we just added.

   Pages are returned (pointers into the buffer in ogg_sync_state)
   by ogg_sync_pageout().  The page is then submitted to
   ogg_stream_pagein() along with the appropriate
   ogg_stream_state* (ie, matching serialno).  We then get raw
   packets out calling ogg_stream_packetout() with a
   ogg_stream_state. */

/* initialize the struct to a known state */
function ogg_sync_init(oy) {
  if(oy){
    oy.storage = -1; /* used as a readiness flag */
    ogg_sync_state(oy);
  }
  return(0);
}

/* clear non-flat storage within */
function ogg_sync_clear(oy) {
  if(oy){
    ogg_sync_state(oy);
  }
  return(0);
}

function ogg_sync_destroy(oy) {
  if(oy){
    ogg_sync_clear(oy);
  }
  return(0);
}

function ogg_sync_check(oy) {
  if(oy.storage<0) return -1;
  return 0;
}

function ogg_sync_buffer(oy, size) {
  if(ogg_sync_check(oy)) return NULL;
  
  /* first, clear out any space that has been previously returned */
  if(oy.returned){
    oy.fill-=oy.returned;
    if(oy.fill>0)
      copy(oy.data,oy.data.subarray(oy.returned,oy.returned+oy.fill));
    oy.returned=0;
  }
  
  if (size>oy.storage-oy.fill){
    /* We need to extend the internal buffer */
    var newsize=size+oy.fill+4096; /* an extra page to be nice */
    var ret;
    
    if(oy.data)
      ret=realloc(oy.data, newsize);
    else
      ret=calloc(newsize, uint8);
    if(!ret){
      ogg_sync_clear(oy);
      return NULL;
    }
    oy.data=ret;
    oy.storage=newsize;
  }

  /* expose a segment at least as large as requested at the fill mark */
  return pointer(oy.data,oy.fill);
}

function ogg_sync_wrote(oy, bytes) {
  if(ogg_sync_check(oy))return -1;
  if (oy.fill+bytes>oy.storage)return -1;
  oy.fill+=bytes;
  return(0);
}

/* sync the stream.  This is meant to be useful for finding page
   boundaries.

   return values for this:
   -n) skipped n bytes
   0) page not ready; more data (no bytes skipped)
   n) page synced at current location; page length n bytes

*/
function ogg_sync_pageseek(oy, og) {
  var page=pointer(oy.data, oy.returned, oy.fill-oy.returned);
  var next;
  var bytes=oy.fill - oy.returned;
  var i,imax;
  
  if(ogg_sync_check(oy))return 0;

  err:while(1){
    if(oy.headerbytes===0){
      var headerbytes;
      if(bytes<27)return(0); /* not enough for a header */
      
      /* verify capture pattern */
      if(String.fromCharCode(page[0],page[1],page[2],page[3])!=="OggS")break err; // sync_fail
      
      headerbytes=page[26]+27;
      if (bytes<headerbytes)return(0); /* not enough for header + seg table */
      
      /* count up body length in the segment table */
      
      for(i=0;i<page[26];i++)
        oy.bodybytes+=page[27+i];
      oy.headerbytes=headerbytes;
    }
    
    if(oy.bodybytes+oy.headerbytes>bytes)return(0);
    
    /* The whole test page is buffered.  Verify the checksum */
    {
      /* Grab the checksum bytes, set the header field to zero */
      var chksum = [page[22],page[23],page[24],page[25]];
      var log = ogg_page();
      
      page[22]=page[23]=page[24]=page[25]=0;
      
      /* set up a temp page struct and recompute the checksum */
      log.header=pointer(page,0,oy.headerbytes);
      log.header_len=oy.headerbytes;
      log.body=pointer(page, oy.headerbytes,oy.bodybytes);
      log.body_len=oy.bodybytes;
      ogg_page_checksum_set(log);
      
      /* Compare */
      // if (memcmp(chksum,page+22,4)){
      if (chksum[0]!==page[22]||chksum[1]!==page[23]||chksum[2]!==page[24]||chksum[3]!==page[25]){
        /* D'oh.  Mismatch! Corrupt page (or miscapture and not a page
           at all) */
        /* replace the computed checksum with the one actually read in */
        
        page[22]=chksum[0];
        page[23]=chksum[1];
        page[24]=chksum[2];
        page[25]=chksum[3];
        
        /* Bad checksum. Lose sync */
        break err; // sync_fail
      }
    }
    
    /* yes, have a whole page all ready to go */
    {
      if(og){
        og.header=pointer(page,0,oy.headerbytes);
        og.header_len=oy.headerbytes;
        og.body=pointer(page,oy.headerbytes,oy.bodybytes);
        og.body_len=oy.bodybytes;
      }
      
      oy.unsynced=0;
      oy.returned+=(bytes=oy.headerbytes+oy.bodybytes);
      oy.headerbytes=0;
      oy.bodybytes=0;
      return(bytes);
    }
  }
  
  //err:
  
  oy.headerbytes=0;
  oy.bodybytes=0;
  
  /* search for possible capture */
  for(i=1,imax= page.length;i<imax;i++)
    if(page[i]===0x4f){next=i;break;}
  
  if (!next)
    next = i;
  
  oy.returned+=next;
  
  return(-next);
}

/* sync the stream and get a page.  Keep trying until we find a page.
   Suppress 'sync errors' after reporting the first.

   return values:
   -1) recapture (hole in data)
   0) need more data
   1) page returned

   Returns pointers into buffered data; invalidated by next call to
   _stream, _clear, _init, or _buffer */

function ogg_sync_pageout(oy, og) {
  
  if(ogg_sync_check(oy))return 0;
  
  /* all we need to do is verify a page at the head of the stream
     buffer.  If it doesn't verify, we look for the next potential
     frame */

  for(;;){
    var ret=ogg_sync_pageseek(oy,og);
    if(ret>0){
      /* have a page */
      return(1);
    }
    if(ret===0){
      /* need more data */
      return(0);
    }
    
    /* head did not start a synced page... skipped some bytes */
    if(!oy.unsynced){
      oy.unsynced=1;
      return(-1);
    }
    
    /* loop. keep looking */
    
  }
}

/* add the incoming page to the stream state; we decompose the page
   into packet segments here as well. */
function ogg_stream_pagein(os, og) {
  var header=og.header;
  var body=og.body;
  var bodysize=og.body_len;
  var segptr=0;

  var version=ogg_page_version(og);
  var continued=ogg_page_continued(og);
  var bos=ogg_page_bos(og);
  var eos=ogg_page_eos(og);
  var granulepos=ogg_page_granulepos(og);
  var serialno=ogg_page_serialno(og);
  var pageno=ogg_page_pageno(og);
  var segments=header[26];

  if(ogg_stream_check(os)) return -1;
  
  /* clean up 'returned data' */
  {
    var lr=os.lacing_returned;
    var br=os.body_returned;
    
    /* body data */
    if(br){
      os.body_fill-=br;
      if(os.body_fill)
        copy(os.body_data,os.body_data.subarray(br,br+os.body_fill));
      os.body_returned=0;
    }
    
    if (lr) {
      /* segment table */
      if(os.lacing_fill-lr){
        copy(os.lacing_vals,os.lacing_vals.subarray(lr,os.lacing_fill));
        copy(os.granule_vals,os.granule_vals.subarray(lr,os.lacing_fill));
      }
      os.lacing_fill-=lr;
      os.lacing_packet-=lr;
      os.lacing_returned=0;
    }
  }
  
  /* check the serial number */
  if(serialno!==os.serialno)return(-1);
  if(version>0)return(-1);
  
  if (_os_lacing_expand(os,segments+1)) return -1;
  
  /* are we in sequence? */
  if(pageno!==os.pageno){
    var i;
    
    /* unroll previous partial packet (if any) */
    for(i=os.lacing_packet;i<os.lacing_fill;i++)
      os.body_fill-=os.lacing_vals[i]&0xff;
    os.lacing_fill=os.lacing_packet;
    
    /* make a note of dropped data in segment table */
    if(os.pageno!==-1){
      os.lacing_vals[os.lacing_fill++]=0x400;
      os.lacing_packet++;
    }
  }
  
  var val;
  /* are we a 'continued packet' page?  If so, we may need to skip
     some segments */
  if(continued){
    if (os.lacing_fill<1 ||
        os.lacing_vals[os.lacing_fill-1]===0x400){
      bos=0;
      for(;segptr<segments;segptr++){
        val=header[27+segptr];
        body=pointer(body,val,bodysize-val);
        bodysize-=val;
        if (val<255) {
          segptr++;
          break;
        }
      }
    }
  }
  
  if(bodysize){
    if(_os_body_expand(os, bodysize)) return -1;
    copy(os.body_data,body,os.body_fill);
    os.body_fill+=bodysize;
  }
  
  {
    var saved=-1;
    while(segptr<segments){
      val=header[27+segptr];
      os.lacing_vals[os.lacing_fill]=val;
      os.granule_vals[os.lacing_fill]=-1;
      
      if(bos){
        os.lacing_vals[os.lacing_fill]|=0x100;
        bos=0;
      }
      
      if(val<255)saved = os.lacing_fill;
      
      os.lacing_fill++;
      segptr++;
      
      if(val<255)os.lacing_packet=os.lacing_fill;
    }
    
    /* set the granulepos on the last granuleval of the last full packet */
    if(saved!==-1){
      os.granule_vals[saved]=granulepos;
    }
  }

  if(eos){
    os.e_o_s=1;
    if(os.lacing_fill>0)
      os.lacing_vals[os.lacing_fill-1]|=0x200;
  }
  
  os.pageno=pageno+1;
  
  return(0);
}

/* clear things to an initial state.  Good to call, eg, before seeking */
function ogg_sync_reset(oy) {
  if(ogg_sync_check(oy))return -1;
  
  oy.fill=0;
  oy.returned=0;
  oy.unsynced=0;
  oy.headerbytes=0;
  oy.bodybytes=0;
  return(0);
}

function ogg_stream_reset(os) {
  if(ogg_stream_check(os)) return -1;
  
  os.body_fill=0;
  os.body_returned=0;

  os.lacing_fill=0;
  os.lacing_packet=0;
  os.lacing_returned=0;
  
  os.header_fill=0;
  
  os.e_o_s=0;
  os.b_o_s=0;
  os.pageno=-1;
  os.packetno=0;
  os.granulepos=0;

  return(0);
}

function ogg_stream_reset_serialno(os, serialno) {
  if(ogg_stream_check(os)) return -1;
  ogg_stream_reset(os);
  os.serialno=serialno;
  return(0);
}

function _packetout(os, op, adv) {
  
  /* The last part of decode. We have the stream broken into packet
     segments.  Now we need to group them into packets (or return the
     out of sync markers) */

  var ptr=os.lacing_returned;
  
  if(os.lacing_packet <= ptr)return(0);
  
  if(os.lacing_vals[ptr]&0x400){
    /* we need to tell the codec there's a gap; it might need to
       handle previous packet dependencies. */
    os.lacing_returned++;
    os.packetno++;
    return(-1);
  }
  
  if(!op && !adv)return(1); /* just using peek as an inexpensive way
                               to ask if there's a whole packet
                               waiting */
  
  /* Gather the whole packet. We'll have no holes or a partial packet */
  {
    var size=os.lacing_vals[ptr]&0xff;
    var bytes=size;
    var eos=os.lacing_vals[ptr]&0x200; /* last packet of the stream? */
    var bos=os.lacing_vals[ptr]&0x100; /* first packet of the stream? */
    
    while(size===255){
      var val=os.lacing_vals[++ptr];
      size=val&0xff;
      if(val&0x200)eos=0x200;
      bytes+=size;
    }
    
    if(op){
      op.e_o_s=eos;
      op.b_o_s=bos;
      op.packet=pointer(os.body_data,os.body_returned,bytes);
      op.packetno=os.packetno;
      op.granulepos=os.granule_vals[ptr];
      op.bytes=bytes;
    }

    if(adv){
      os.body_returned+=bytes;
      os.lacing_returned=ptr+1;
      os.packetno++;
    }
  }
  return (1);
}

function ogg_stream_packetout(os, op) {
  if(ogg_stream_check(os)) return 0;
  return _packetout(os,op,1);
}

function ogg_stream_packetpeek(os, op) {
  if(ogg_stream_check(os)) return 0;
  return _packetout(os,op,0);
}

function ogg_packet_clear(op) {
  ogg_packet(op);
}

function OggPackBuffer() {
  oggpack_buffer(this);
  
  this.writeinit = oggpack_writeinit.bind(null, this);
  this.writecheck = oggpack_writecheck.bind(null, this);
  this.writetrunc = oggpack_writetrunc.bind(null, this);
  this.writealign = oggpack_writealign.bind(null, this);
  this.writecopy = oggpack_writecopy.bind(null, this);
  this.reset = oggpack_reset.bind(null, this);
  this.writeclear = oggpack_writeclear.bind(null, this);
  this.readinit = oggpack_readinit.bind(null, this);
  this.write = oggpack_write.bind(null, this);
  this.look = oggpack_look.bind(null, this);
  this.look1 = oggpack_look1.bind(null, this);
  this.adv = oggpack_adv.bind(null, this);
  this.adv1 = oggpack_adv1.bind(null, this);
  this.read = oggpack_read.bind(null, this);
  this.read1 = oggpack_read1.bind(null, this);
  this.bytes = oggpack_bytes.bind(null, this);
  this.bits = oggpack_bits.bind(null, this);
  this.get_buffer = oggpack_get_buffer.bind(null, this);
}
exports.ogg.PackBuffer = OggPackBuffer;


function OggPage() {
  ogg_page(this);

  this.checksum_set = ogg_page_checksum_set.bind(null, this);
  this.version = ogg_page_version.bind(null, this);
  this.continued = ogg_page_continued.bind(null, this);
  this.bos = ogg_page_bos.bind(null, this);
  this.eos = ogg_page_eos.bind(null, this);
  this.granulepos = ogg_page_granulepos.bind(null, this);
  this.serialno = ogg_page_serialno.bind(null, this);
  this.pageno = ogg_page_pageno.bind(null, this);
  this.packets = ogg_page_packets.bind(null, this);
}
exports.ogg.Page = OggPage;


function OggStreamState() {
  ogg_stream_state(this);

  this.packetin = ogg_stream_packetin.bind(null, this);
  this.iovecin = ogg_stream_iovecin.bind(null, this);
  this.pageout = ogg_stream_pageout.bind(null, this);
  this.pageout_fill = ogg_stream_pageout_fill.bind(null, this);
  this.flush = ogg_stream_flush.bind(null, this);
  this.flush_fill = ogg_stream_flush_fill.bind(null, this);
  this.pagein = ogg_stream_pagein.bind(null, this);
  this.packetout = ogg_stream_packetout.bind(null, this);
  this.packetpeek = ogg_stream_packetpeek.bind(null, this);
  this.init = ogg_stream_init.bind(null, this);
  this.clear = ogg_stream_clear.bind(null, this);
  this.reset = ogg_stream_reset.bind(null, this);
  this.reset_serialno = ogg_stream_reset_serialno.bind(null, this);
  this.destroy = ogg_stream_destroy.bind(null, this);
  this.check = ogg_stream_check.bind(null, this);
  this.eos = ogg_stream_eos.bind(null, this);
}
exports.ogg.StreamState = OggStreamState;


function OggPacket() {
  ogg_packet(this);
  
  this.clear = ogg_packet_clear.bind(null, this);
}
exports.ogg.Packet = OggPacket;


function OggSyncState() {
  ogg_sync_state(this);
  
  this.init = ogg_sync_init.bind(null, this);
  this.clear = ogg_sync_clear.bind(null, this);
  this.reset = ogg_sync_reset.bind(null, this);
  this.destroy = ogg_sync_destroy.bind(null, this);
  this.check = ogg_sync_check.bind(null, this);
  this.buffer = ogg_sync_buffer.bind(null, this);
  this.wrote = ogg_sync_wrote.bind(null, this);
  this.pageseek = ogg_sync_pageseek.bind(null, this);
  this.pageout = ogg_sync_pageout.bind(null, this);
}
exports.ogg.SyncState = OggSyncState;

if (typeof module !== "undefined" && module.exports) {
    module.exports = exports;
} else if (typeof window !== "undefined") {
    window.ogg = exports.ogg;
}
})();
