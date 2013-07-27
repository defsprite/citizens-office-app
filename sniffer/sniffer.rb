#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
require 'websocket-eventmachine-client'

FIELDS = %w(ip.src udp.src wlan.sa dns.qry.name http.request.full_uri http.user_agent).map { |field| "-e #{field}" }

TSHARK = <<-BASH
  tshark -2 -R 'dns.qry.type == ANY || http.request.full_uri' -T fields #{FIELDS.join(" ")} -i #{ARGV[0]} -I -l -N mntNC
BASH

ws = nil

module PipeHandler

  def receive_data data
    message = process_line_data(data)
    puts "Sending: #{message}"
    message.force_encoding("UTF-8")
    if message.valid_encoding?
      @@ws.send(message)
    end
  end

  def unbind
    puts "exited with status: #{get_status.exitstatus}"
  end

  def self.webservice service
    @@ws = service
  end


  def process_line_data(data)
    fields = data.split("\t")

    ip_src = fields[0]
    udp_src = fields[1]
    wlan_sa = fields[2]
    dns_name = fields[3]
    http_uri = fields[4]
    http_ua = fields[5]

    if dns_name == "" || dns_name.nil?
      "HTTP|#{wlan_sa}|#{ip_src}|#{http_uri}|#{http_ua}"
    else
      "MDNS|#{wlan_sa}|#{ip_src}|#{dns_name.split(',').last.gsub(".local", "")}"
    end

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













