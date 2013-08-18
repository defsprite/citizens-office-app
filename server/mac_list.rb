require 'csv'
require 'json'

class MacList

  def self.load_addresses(result = {})
    CSV.foreach("mac_addresses.csv") do |row|
      result[row[0]] = row[1]
    end

    result
  end


  def self.store_addresses hash
    CSV.open("mac_addresses.csv", "wb") do |csv|
      hash.each_pair do |k, v|
        csv << [k, v]
      end
    end
  end


  def self.load_pages(result = {})
    File.open("pages.json", "r") do |f|
      result = JSON.parse(f.readlines(hash).join(" "))
    end

    result
  end


  def self.store_pages hash
    File.open("pages.json", "w") do |f|
      f.write(JSON.generate(hash))
    end
  end


end
