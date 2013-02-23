function OggPackBuffer() {
  // long endbyte;
  // int  endbit;

  // unsigned char *buffer;
  // unsigned char *ptr;
  // long storage;
  
  OggPackBuffer.zeroclear(this);
  
  // exports
  this.writeinit  = oggpack_writeinit .bind(null, this);
  this.writecheck = oggpack_writecheck.bind(null, this);
  this.writetrunc = oggpack_writetrunc.bind(null, this);
  this.writealign = oggpack_writealign.bind(null, this);
  this.writecopy  = oggpack_writecopy .bind(null, this);
  this.reset      = oggpack_reset     .bind(null, this);
  this.writeclear = oggpack_writeclear.bind(null, this);
  this.readinit   = oggpack_readinit  .bind(null, this);
  this.write      = oggpack_write     .bind(null, this);
  this.look       = oggpack_look      .bind(null, this);
  this.look1      = oggpack_look1     .bind(null, this);
  this.adv        = oggpack_adv       .bind(null, this);
  this.adv1       = oggpack_adv1      .bind(null, this);
  this.read       = oggpack_read      .bind(null, this);
  this.read1      = oggpack_read1     .bind(null, this);
  this.bytes      = oggpack_bytes     .bind(null, this);
  this.bits       = oggpack_bits      .bind(null, this);
  this.get_buffer = oggpack_get_buffer.bind(null, this);
}
OggPackBuffer.zeroclear = function(b) {
  b.endbyte = 0;
  b.endbit = 0;
  b.buffer = null;
  b.ptr = null;
  b.state = 0;
};
exports.ogg.PackBuffer = OggPackBuffer;

/* ogg_page is used to encapsulate the data in one Ogg bitstream page *****/
function OggPage() {
  // unsigned char *header;
  // long header_len;
  // unsigned char *body;
  // long body_len;
  
  OggPage.zeroclear(this);
  
  // exports
  this.version    = ogg_page_version   .bind(null, this);
  this.continued  = ogg_page_continued .bind(null, this);
  this.bos        = ogg_page_bos       .bind(null, this);
  this.eos        = ogg_page_eos       .bind(null, this);
  this.granulepos = ogg_page_granulepos.bind(null, this);
  this.serialno   = ogg_page_serialno  .bind(null, this);
  this.packets    = ogg_page_packets   .bind(null, this);
}
OggPage.zeroclear = function(og) {
  og.header = null;
  og.header_len = 0;
  og.body = null;
  og.body_len = 0;
};
exports.ogg.Page = OggPage;

/* ogg_stream_state contains the current encode/decode state of a logical
   Ogg bitstream **********************************************************/
function OggStreamState() {
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
  
  OggStreamState.zeroclear(this);
  
  // exports
  this.init     = ogg_stream_init    .bind(null, this);
  this.destroy  = ogg_stream_destroy .bind(null, this);
  this.reset    = ogg_stream_reset   .bind(null, this);
  this.clear    = ogg_stream_clear   .bind(null, this);
  this.check    = ogg_stream_check   .bind(null, this);
  this.eos      = ogg_stream_eos     .bind(null, this);
  this.pagein   = ogg_stream_pagein  .bind(null, this);
  this.pageout  = ogg_stream_pageout .bind(null, this);
  this.packetin = ogg_stream_packetin.bind(null, this);
  this.packetout  = ogg_stream_packetout .bind(null, this);
  this.packetpeek = ogg_stream_packetpeek.bind(null, this);
}
OggStreamState.zeroclear = function(os) {
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
  os.header = new Uint8Array(282);
  os.header_fill = 0;
  os.e_o_s = 0;
  os.b_o_s = 0;
  os.serialno = 0;
  os.pageno = 0;
  os.packetno = 0;
  os.granulepos = 0;
};
exports.ogg.StreamState = OggStreamState;

/* ogg_packet is used to encapsulate the data and metadata belonging
   to a single raw Ogg/Vorbis packet *************************************/
function OggPacket() {
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
  
  OggPacket.zeroclear(this);
  
  // exports
  this.clear = ogg_packet_clear.bind(null, this);
}
OggPacket.zeroclear = function(op) {
  op.packet = null;
  op.bytes = 0;
  op.b_o_s = 0;
  op.e_o_s = 0;
  op.granulepos = 0;
  op.packetno = 0;
};
exports.ogg.Packet = OggPacket;

function OggSyncState() {
  // unsigned char *data;
  // int storage;
  // int fill;
  // int returned;

  // int unsynced;
  // int headerbytes;
  // int bodybytes;
  
  OggSyncState.zeroclear(this);
  
  // exports
  this.init     = ogg_sync_init    .bind(null, this);
  this.destroy  = ogg_sync_destroy .bind(null, this);
  this.reset    = ogg_sync_reset   .bind(null, this);
  this.clear    = ogg_sync_clear   .bind(null, this);
  this.check    = ogg_sync_check   .bind(null, this);
  this.buffer   = ogg_sync_buffer  .bind(null, this);
  this.wrote    = ogg_sync_wrote   .bind(null, this);
  this.pageseek = ogg_sync_pageseek.bind(null, this);
  this.pageout  = ogg_sync_pageout .bind(null, this);
}
OggSyncState.zeroclear = function(oy) {
  oy.data = null;
  oy.storage = 0;
  oy.fill = 0;
  oy.returned = 0;
  oy.unsynced = 0;
  oy.headerbytes = 0;
  oy.bodybytes = 0;
};
exports.ogg.SyncState = OggSyncState;
