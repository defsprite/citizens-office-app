# require File.expand_path('../../lib/em-websocket', __FILE__)

require 'em-websocket'
require 'json'
require_relative 'mac_list.rb'

websockets = []
sniffer    = nil

ips     = {}
macs    = MacList.get_addresses
pages   = MacList.get_pages
delinquents = {}
lastmsg = nil
tick = 0

FILTERED = %w(reddit.com amazon.com 3-beards.com fsf.org ycombinator.com)
MESSAGES = ["safety > liberty",
  "If you have nothing to hide,\nyou have nothing to fear",
  "Ignorance is strength",
  "If you want to keep a secret,\nyou must also hide it\nfrom yourself"]




def create_citizen_info(macs, pages)
  mac = nil
  while(!macs.has_key?(mac)) do
    mac = pages.keys.sample(1)[0]
  end

  sites = pages[mac].sort{|a,b| a[1] <=> b[1]}
  {type: "citizen", mac: mac, name: macs[mac], pages: sites}
end


EM.run {

  trap("INT") do
    puts "Storing mac addresses and quitting."
    MacList.store_addresses(macs)
    MacList.store_pages(pages)
    exit!
  end

  EM.add_periodic_timer(30) do
    tick += 1

    info = case tick % 3
    when 0
      create_citizen_info(macs, pages)
    when 1
      {type: "info", message: MESSAGES.sample(1).first}
    when 2
      {type: "delinquents", people: delinquents.values }
    end


    puts info

    websockets.each do |ws|
      ws.send JSON.generate(info)
    end
  end

  EM::WebSocket.run(:host => ARGV[0], :port => ARGV[1], :debug => false) do |ws|

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
          to = result[1].include?(".co.uk") ? -3 : -2
          parts         = result[1].split(".")

          accessed_host = parts.size > 2 ? parts[to..-1].join(".") : parts.join(".")
          name          = macs[mac]
          pages.has_key?(mac) ? pages[mac][accessed_host] = time : pages[mac] = {"#{accessed_host}" => time}
          if FILTERED.include?(accessed_host)
            delinquents[mac] = [accessed_host, ip, name, time]
            {type: "alert", ip: ip, mac: mac, name: name, host: accessed_host, time: time}
          else
            {type: "http", ip: ip, mac: mac, name: name, host: accessed_host, time: time}
          end
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



