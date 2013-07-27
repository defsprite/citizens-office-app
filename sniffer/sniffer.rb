#!/usr/bin/env ruby
require 'rubygems'
require 'pcaplet'

include Pcap

httpdump = Pcaplet.new('-s 1500 -i en1 -L 802.11')

HTTP_REQUEST  = Pcap::Filter.new('tcp and dst port 80', httpdump.capture)
HTTP_RESPONSE = Pcap::Filter.new('tcp and src port 80', httpdump.capture)


class Time
  # tcpdump style format
  def to_s
    sprintf "%0.2d:%0.2d:%0.2d.%0.6d", hour, min, sec, tv_usec
  end
end

pcaplet = Pcaplet.new
pcaplet.each_packet { |pkt|
  print "#{pkt.time} #{pkt}"
  if pkt.tcp?
    print " (#{pkt.tcp_data_len})"
    print " ack #{pkt.tcp_ack}" if pkt.tcp_ack?
    print " win #{pkt.tcp_win}"
  end
  if pkt.ip?
    print " (DF)" if pkt.ip_df?
  end
  print "\n"
}
pcaplet.close
