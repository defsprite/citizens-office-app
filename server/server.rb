# require File.expand_path('../../lib/em-websocket', __FILE__)

require 'em-websocket'

websockets = []
count      = 0

EM.run {

  EM.add_periodic_timer(1) do
    websockets.each do |ws|
      ws.send "Ping #{count += 1}"
    end
  end

  EM::WebSocket.run(:host => "0.0.0.0", :port => 1984, :debug => true) do |ws|
    ws.onopen { |handshake|
      puts "WebSocket opened #{{
        :path   => handshake.path,
        :query  => handshake.query,
        :origin => handshake.origin
      }}"

      ws.send "Hello Client!"
      websockets << ws
    }


    ws.onmessage { |msg|
      ws.send "Pong: #{msg}"
    }
    ws.onclose {
      puts "WebSocket closed"
    }
    ws.onerror { |e|
      puts "Error: #{e.message}"
    }
  end

}


