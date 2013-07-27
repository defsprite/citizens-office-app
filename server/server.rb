# require File.expand_path('../../lib/em-websocket', __FILE__)

require 'em-websocket'
require 'json'

websockets = []
sniffer    = nil

macs = {}
ips  = {}

EM.run {

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
          parts = result[1].split(".")
          puts parts
          accessed_host = parts.size > 2 ? parts[-2..-1].join(".") : parts.join(".")
          puts accessed_host
          name = macs[mac]
          {type: "http", ip: ip, mac: mac, name: name, host: accessed_host, time:time}
        end
      when 'MDNS'
        macs[mac] = ips[ip] = fields[3]
        {type: "mdns", ip: ip, mac: mac, name: fields[3]}
      else
        {}
      end

      if !info.nil? && !info.empty?
        res = JSON.generate(info)
        puts res
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


