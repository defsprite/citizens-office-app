# require File.expand_path('../../lib/em-websocket', __FILE__)

require 'em-websocket'
require 'json'
require_relative 'mac_list.rb'

websockets = []
sniffer    = nil

ips     = {}
macs    = MacList.get_addresses
pages   = MacList.get_pages
lastmsg = nil

EM.run {

  trap("INT") do
    puts "Storing mac addresses and quitting."
    MacList.store_addresses(macs)
    MacList.store_pages(pages)
    exit!
  end

  EM.add_periodic_timer(10) do
    mac = nil
    while(!macs.has_key?(mac)) do
      mac = pages.keys.sample(1)[0]
    end

    sites = pages[mac].sort{|a,b| a[1] <=> b[1]}
    info = {type: "citizen", mac: mac, name: macs[mac], pages: sites}

    websockets.each do |ws|
      ws.send JSON.generate(info)
    end
  end

  EM::WebSocket.run(:host => "0.0.0.0", :port => 1984, :debug => false) do |ws|

    ws.onopen { |handshake|
      puts "WebSocket opened #{{
        :path   => handshake.path,
        :query  => handshake.query,
        :origin => handshake.origin
      }}"

      if handshake.path == "/sniffer"
        ws.send "Hello Big Brother!"
        sniffer = ws
      else
        websockets << ws
      end

    }

    ws.onmessage { |msg|

      fields = msg.split("|")
      time   = Time.now.strftime("%H:%M")
      type   = fields[0]
      mac    = fields[1]
      ip     = fields[2]

      info = case type
      when 'HTTP'
        fields[3].match(/http:\/\/([A-Za-z\-0-9\.]+)\//) do |result|
          parts         = result[1].split(".")
          accessed_host = parts.size > 2 ? parts[-2..-1].join(".") : parts.join(".")
          name          = macs[mac]
          pages.has_key?(mac) ? pages[mac][accessed_host] = time : pages[mac] = {"#{accessed_host}" => time}
          {type: "http", ip: ip, mac: mac, name: name, host: accessed_host, time: time}
        end
      when 'MDNS'
        macs[mac] = ips[ip] = fields[3]
        {type: "mdns", ip: ip, mac: mac, name: fields[3]}
      else
        {}
      end

      if !info.nil? && !info.empty? && info != lastmsg
        res = JSON.generate(info)
        puts res

        lastmsg = info
        websockets.each do |ws|
          ws.send res
        end

      end

    }

    ws.onclose {
      puts "WebSocket closed"
    }

    ws.onerror { |e|
      puts "Error: #{e.message}"
    }
  end
}



