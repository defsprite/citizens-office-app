#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
require 'websocket-eventmachine-client'
require_relative 'fake_data'

EventMachine.run do

  ws  = WebSocket::EventMachine::Client.connect(:uri => "ws://#{ARGV[0]}/sniffer")
  @ws = ws

  ws.onopen do
    puts "Connected to Server!"
  end

  ws.onmessage do |msg, type|
    puts "Received message: #{msg}"
  end

  ws.onclose do
    puts "Disconnected from Server"
  end

  EventMachine.tick_loop do

    ip_src   = SITES.sample(1).first
    wlan_sa  = MACS.sample(1).first
    dns_name = NAMES.sample(1).first+EXTS.sample(1).first

    http_uri = SITES.sample(1).first
    http_ua  = "Mozilla 5.0 (Fake)"


    message = "MDNS|#{wlan_sa}|192.168.1.1|#{dns_name}"
    puts message
    @ws.send(message)
    sleep(0.5)
    message = "HTTP|#{wlan_sa}|192.168.1.1|http://#{http_uri}|#{http_ua}"
    puts message
    @ws.send(message)

    sleep(rand(500)/100.0)

  end


end
