#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
require 'websocket-eventmachine-client'

FIELDS = %w(ip.src udp.src wlan.sa dns.qry.name http.request.full_uri http.user_agent).map { |field| "-e #{field}" }

TSHARK = <<-BASH
  tshark -2 -R 'dns.qry.type == ANY || http.request.full_uri' -T fields #{FIELDS.join(" ")} -i en1 -l -N mntC
BASH

ws = nil

module PipeHandler

  def receive_data data
    puts "Sending #{data}"
    @@ws.send(data)
  end

  def unbind
    puts "exited with status: #{get_status.exitstatus}"
  end

  def self.webservice service
    @@ws = service
  end

end


EventMachine.run do

  ws = WebSocket::EventMachine::Client.connect(:uri => 'ws://localhost:1984/sniffer')
  PipeHandler.webservice(ws)

  ws.onopen do
    puts "Connected to Server!"
  end

  ws.onmessage do |msg, type|
    puts "Received message: #{msg}"
  end

  ws.onclose do
    puts "Disconnected from Server"
  end

  EventMachine.popen("#{TSHARK}", PipeHandler)

end











