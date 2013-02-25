function OggPackBuffer() {
  oggpack_buffer(this);
  
  this.writeinit  = oggpack_writeinit.bind(null, this);
  this.writecheck = oggpack_writecheck.bind(null, this);
  this.writetrunc = oggpack_writetrunc.bind(null, this);
  this.writealign = oggpack_writealign.bind(null, this);
  this.writecopy  = oggpack_writecopy .bind(null, this);
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
  this.packetout  = ogg_stream_packetout.bind(null, this);
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
