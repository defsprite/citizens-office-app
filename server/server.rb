# require File.expand_path('../../lib/em-websocket', __FILE__)

require 'em-websocket'

websockets = []
sniffer = nil





EM.run {

  EM.add_periodic_timer(10) do
    websockets.each do |ws|
      ws.send "Ping #{count += 1}"
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
      puts "Got message: #{msg}"
      websockets.each do |ws|
        ws.send "#{msg}"
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


