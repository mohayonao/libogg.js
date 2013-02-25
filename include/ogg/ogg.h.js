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
