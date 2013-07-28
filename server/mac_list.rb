require 'csv'

class MacList

  def self.get_addresses
    result = {}
    CSV.foreach("mac_addresses.csv") do |row|
      result[row[0]] = row[1]
    end

    result
  end


  def self.store_addresses hash
    CSV.open("mac_addresses.csv", "wb") do |csv|
      hash.each_pair do |k,v|
        csv << [k, v]
      end
    end
  end


  def self.get_pages
    result = {}
    CSV.foreach("mac_pages.csv") do |row|
      result[row[0]] = row[1]
    end

    result
  end


  def self.store_pages hash
    CSV.open("mac_pages.csv", "wb") do |csv|
      hash.each_pair do |k,v|
        csv << [k, v]
      end
    end
  end


end
