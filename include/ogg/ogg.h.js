function ogg_iovec_t(iov) {
  iov = iov || {};
  
  // void *iov_base;
  // size_t iov_len;
  
  iov.iov_base = null;
  iov.iov_len = 0;
  
  return iov;
}

function oggpack_buffer(b) {
  b = b || {};
  
  // long endbyte;
  // int  endbit;

  // unsigned char *buffer;
  // unsigned char *ptr;
  // long storage;
  
  b.endbyte = 0;
  b.endbit = 0;
  b.buffer = null;
  b.ptr = null;
  b.state = 0;
  
  return b;
}

/* ogg_page is used to encapsulate the data in one Ogg bitstream page *****/
function ogg_page(og) {
  og = og || {};
  
  // unsigned char *header;
  // long header_len;
  // unsigned char *body;
  // long body_len;
  
  og.header = null;
  og.header_len = 0;
  og.body = null;
  og.body_len = 0;
  
  return og;
}

/* ogg_stream_state contains the current encode/decode state of a logical
   Ogg bitstream **********************************************************/
function ogg_stream_state(os) {
  os = os || {};
  
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
  
  os.body_data = null;
  os.body_storage = 0;
  os.body_fill = 0;
  os.body_returned = 0;
  os.lacing_vals  = null;
  os.granule_vals = null;
  os.lacing_storage = 0;
  os.lacing_fill = 0;
  os.lacing_packet = 0;
  os.lacing_returned = 0;
  os.header = calloc(282, uint8);
  os.header_fill = 0;
  os.e_o_s = 0;
  os.b_o_s = 0;
  os.serialno = 0;
  os.pageno = 0;
  os.packetno = 0;
  os.granulepos = 0;
  
  return os;
}

/* ogg_packet is used to encapsulate the data and metadata belonging
   to a single raw Ogg/Vorbis packet *************************************/
function ogg_packet(op) {
  op = op || {};
  
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
  
  op.packet = null;
  op.bytes = 0;
  op.b_o_s = 0;
  op.e_o_s = 0;
  op.granulepos = 0;
  op.packetno = 0;
  
  return op;
}

function ogg_sync_state(oy) {
  oy = oy || {};
  
  // unsigned char *data;
  // int storage;
  // int fill;
  // int returned;

  // int unsynced;
  // int headerbytes;
  // int bodybytes;

  oy.data = null;
  oy.storage = 0;
  oy.fill = 0;
  oy.returned = 0;
  oy.unsynced = 0;
  oy.headerbytes = 0;
  oy.bodybytes = 0;
  
  return oy;
}
