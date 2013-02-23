var NULL = null;

function NOP() {}
function NOT_IMPLEMENTED() { throw new Error("not implemented."); }

function _int(x) {
  return x|0;
}

function pointer(src, offset, length) {
  offset = (src.byteOffset + offset) * src.constructor.BYTES_PER_ELEMENT;
  if (length) {
    return new src.constructor(src.buffer, offset, length);
  } else {
    return new src.constructor(src.buffer, offset);
  }
}

function realloc(src, newSize) {
  var ret = new src.constructor(newSize);
  ret.set(src);
  return ret;
}

function copy(dst, src, offset) {
  dst.set(src, offset||0);
}

function zeroclear(buf) {
  buf.constructor.zeroclear(buf);
}
