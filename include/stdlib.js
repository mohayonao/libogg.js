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
