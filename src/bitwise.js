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
  zeroclear(b);
  b.ptr=b.buffer = new Uint8Array(BUFFER_INCREMENT);
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
  if(bits<0 || bits>32) return _oggpack_write_err(b);
  if(b.endbyte>=b.storage-4){
    var ret;
    if(!b.ptr)return;
    if(b.storage>LONG_MAX-BUFFER_INCREMENT) return _oggpack_write_err(b);
    ret=realloc(b.buffer,b.storage+BUFFER_INCREMENT);
    if(!ret) return _oggpack_write_err(b);
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
  
  var shift=_int(bits/8);
  b.endbyte+=shift;
  b.ptr=pointer(b.ptr,shift);
  b.endbit=bits&7;
}
function _oggpack_write_err(b) {
  oggpack_writeclear(b);
}

function oggpack_writealign(b) {
  var bits=8-b.endbit;
  if (bits<8)
    oggpack_write(b,0,bits);
}

function oggpack_writecopy(b, source, bits) {
  var ptr=source;
  
  var bytes=_int(bits/8);
  bits-=bytes*8;
  
  if(b.endbit){
    var i;
    /* unaligned copy.  Do it the hard way. */
    for(i=0;i<bytes;i++)
      oggpack_write(b,ptr[i],8);
  }else{
    /* aligned block copy */
    if(b.endbyte+bytes+1>=b.storage){
      var ret;
      if(!b.ptr) return _oggpack_writecopy_err(b);
      if(b.endbyte+bytes+BUFFER_INCREMENT>b.storage) return _oggpack_writecopy_err(b);
      b.storage=b.endbyte+bytes+BUFFER_INCREMENT;
      ret=realloc(b.buffer,b.storage);
      if(!ret) return _oggpack_writecopy_err(b);
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
}
function _oggpack_writecopy_err(b) {
  oggpack_writeclear(b);
}

function oggpack_reset(b) {
  if(!b.ptr)return;
  b.ptr=b.buffer;
  b.buffer[0]=0;
  b.endbit=b.endbyte=0;
}

function oggpack_writeclear(b) {
  zeroclear(b);
}

function oggpack_readinit(b, buf, bytes) {
  zeroclear(b);
  b.buffer=b.ptr=new Uint8Array(buf.buffer);
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
  
  if(b.endbyte > b.storage-((bits+7)>>3)) return _oggpack_adv_overflow(b);
  
  var shift=_int(bits/8);
  b.ptr=pointer(b.ptr,shift);
  b.endbyte+=shift;
  b.endbit=bits&7;
}
function _oggpack_adv_overflow(b) {
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
  
  if (bits<0 || bits>32) return _oggpack_read_err(b);
  m=mask[bits];
  bits+=b.endbit;
  
  if(b.endbyte>=b.storage-4){
    /* not the main path */
    if(b.endbyte > b.storage-((bits+7)>>3)) return _oggpack_read_err(b);
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
  
  var shift=_int(bits/8);
  b.ptr=pointer(b.ptr,shift);
  b.endbyte+=shift;
  b.endbit=bits&7;
  
  return ret;
}
function _oggpack_read_err(b) {
  b.ptr=NULL;
  b.endbyte=b.storage;
  b.endbit=1;
  return -1;
}

function oggpack_read1(b) {
  var ret;
  
  if(b.endbyte>=b.storage) return _oggpack_read1_err(b);
  ret=(b.ptr[0]>>b.endbit)&1;
  
  b.endbit++;
  if(b.endbit>7){
    b.endbit=0;
    b.ptr=pointer(b.ptr,1);
    b.endbyte++;
  }
  return ret;
}
function _oggpack_read1_err(b) {
  b.ptr=NULL;
  b.endbyte=b.storage;
  b.endbit=1;
  return -1;
}

function oggpack_bytes(b) {
  return(b.endbyte+_int((b.endbit+7)/8));
}

function oggpack_bits(b) {
  return(b.endbyte*8+b.endbit);
}

function oggpack_get_buffer(b) {
  return(b.buffer);
}
